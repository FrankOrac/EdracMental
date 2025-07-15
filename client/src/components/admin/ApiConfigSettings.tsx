import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Key, 
  Database, 
  Mail, 
  MessageSquare, 
  Brain, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  Zap,
  Shield,
  Globe,
  Cloud
} from "lucide-react";

interface ApiConfig {
  id: string;
  name: string;
  description: string;
  required: boolean;
  configured: boolean;
  lastTested: string | null;
  status: 'connected' | 'error' | 'untested';
  category: 'ai' | 'payment' | 'email' | 'database' | 'auth' | 'storage';
}

export default function ApiConfigSettings() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [testingApi, setTestingApi] = useState<string | null>(null);

  const { toast } = useToast();

  // Mock API configurations
  const apiConfigs: ApiConfig[] = [
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'AI-powered question generation and tutoring',
      required: true,
      configured: false,
      lastTested: null,
      status: 'untested',
      category: 'ai'
    },
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Payment processing for subscriptions',
      required: true,
      configured: false,
      lastTested: null,
      status: 'untested',
      category: 'payment'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Email delivery service',
      required: true,
      configured: false,
      lastTested: null,
      status: 'untested',
      category: 'email'
    },
    {
      id: 'google_oauth',
      name: 'Google OAuth',
      description: 'Google authentication integration',
      required: false,
      configured: false,
      lastTested: null,
      status: 'untested',
      category: 'auth'
    },
    {
      id: 'database',
      name: 'PostgreSQL Database',
      description: 'Primary database connection',
      required: true,
      configured: true,
      lastTested: new Date().toISOString(),
      status: 'connected',
      category: 'database'
    },
    {
      id: 'redis',
      name: 'Redis Cache',
      description: 'Session storage and caching',
      required: false,
      configured: false,
      lastTested: null,
      status: 'untested',
      category: 'storage'
    }
  ];

  const testConnectionMutation = useMutation({
    mutationFn: async (apiId: string) => {
      return apiRequest(`/api/config/test/${apiId}`, { method: 'POST' });
    },
    onSuccess: (data, apiId) => {
      toast({ 
        title: "Connection successful", 
        description: `${apiConfigs.find(c => c.id === apiId)?.name} is working properly` 
      });
    },
    onError: (error, apiId) => {
      toast({ 
        title: "Connection failed", 
        description: `Unable to connect to ${apiConfigs.find(c => c.id === apiId)?.name}`,
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setTestingApi(null);
    }
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: { apiId: string; config: Record<string, string> }) => {
      return apiRequest('/api/config/save', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast({ title: "Configuration saved successfully" });
    },
    onError: () => {
      toast({ title: "Error saving configuration", variant: "destructive" });
    }
  });

  const handleTestConnection = (apiId: string) => {
    setTestingApi(apiId);
    testConnectionMutation.mutate(apiId);
  };

  const handleSaveConfig = (apiId: string) => {
    const config = getConfigFields(apiId).reduce((acc, field) => {
      acc[field.key] = configs[`${apiId}_${field.key}`] || '';
      return acc;
    }, {} as Record<string, string>);
    
    saveConfigMutation.mutate({ apiId, config });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getConfigFields = (apiId: string) => {
    const fields: Record<string, Array<{key: string; label: string; type: string; required: boolean}>> = {
      openai: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'organization', label: 'Organization ID', type: 'text', required: false },
        { key: 'model', label: 'Default Model', type: 'text', required: false }
      ],
      paystack: [
        { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
        { key: 'public_key', label: 'Public Key', type: 'text', required: true },
        { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: false }
      ],
      sendgrid: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'from_email', label: 'From Email', type: 'email', required: true },
        { key: 'from_name', label: 'From Name', type: 'text', required: false }
      ],
      google_oauth: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
        { key: 'redirect_uri', label: 'Redirect URI', type: 'url', required: true }
      ],
      redis: [
        { key: 'url', label: 'Redis URL', type: 'url', required: true },
        { key: 'password', label: 'Password', type: 'password', required: false }
      ]
    };
    return fields[apiId] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'untested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return <Brain className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'auth': return <Shield className="w-5 h-5" />;
      case 'storage': return <Cloud className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getCategoryConfigs = (category: string) => {
    return apiConfigs.filter(config => config.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            API Configuration
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Configure external services and test connections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {apiConfigs.filter(c => c.status === 'connected').length} Connected
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {apiConfigs.filter(c => c.status === 'error').length} Errors
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiConfigs.map((config) => (
              <Card key={config.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(config.category)}
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(config.status)}>
                      {config.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {config.required && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Required
                        </Badge>
                      )}
                      {config.configured && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Configured
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={testingApi === config.id}
                    >
                      {testingApi === config.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {config.lastTested && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last tested: {new Date(config.lastTested).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {getCategoryConfigs('ai').map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>{config.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(config.status)}>
                    {config.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getConfigFields(config.id).map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={`${config.id}_${field.key}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}_${field.key}`}
                          type={field.type === 'password' && !showSecrets[`${config.id}_${field.key}`] ? 'password' : 'text'}
                          value={configs[`${config.id}_${field.key}`] || ''}
                          onChange={(e) => setConfigs(prev => ({ 
                            ...prev, 
                            [`${config.id}_${field.key}`]: e.target.value 
                          }))}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(`${config.id}_${field.key}`)}
                          >
                            {showSecrets[`${config.id}_${field.key}`] ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleSaveConfig(config.id)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection(config.id)}
                    disabled={testingApi === config.id}
                  >
                    {testingApi === config.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {getCategoryConfigs('payment').map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>{config.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(config.status)}>
                    {config.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getConfigFields(config.id).map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={`${config.id}_${field.key}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}_${field.key}`}
                          type={field.type === 'password' && !showSecrets[`${config.id}_${field.key}`] ? 'password' : field.type}
                          value={configs[`${config.id}_${field.key}`] || ''}
                          onChange={(e) => setConfigs(prev => ({ 
                            ...prev, 
                            [`${config.id}_${field.key}`]: e.target.value 
                          }))}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(`${config.id}_${field.key}`)}
                          >
                            {showSecrets[`${config.id}_${field.key}`] ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleSaveConfig(config.id)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection(config.id)}
                    disabled={testingApi === config.id}
                  >
                    {testingApi === config.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          {getCategoryConfigs('email').map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>{config.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(config.status)}>
                    {config.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getConfigFields(config.id).map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={`${config.id}_${field.key}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}_${field.key}`}
                          type={field.type === 'password' && !showSecrets[`${config.id}_${field.key}`] ? 'password' : field.type}
                          value={configs[`${config.id}_${field.key}`] || ''}
                          onChange={(e) => setConfigs(prev => ({ 
                            ...prev, 
                            [`${config.id}_${field.key}`]: e.target.value 
                          }))}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(`${config.id}_${field.key}`)}
                          >
                            {showSecrets[`${config.id}_${field.key}`] ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleSaveConfig(config.id)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection(config.id)}
                    disabled={testingApi === config.id}
                  >
                    {testingApi === config.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="auth" className="space-y-6">
          {getCategoryConfigs('auth').map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>{config.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(config.status)}>
                    {config.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {getConfigFields(config.id).map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={`${config.id}_${field.key}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}_${field.key}`}
                          type={field.type === 'password' && !showSecrets[`${config.id}_${field.key}`] ? 'password' : field.type}
                          value={configs[`${config.id}_${field.key}`] || ''}
                          onChange={(e) => setConfigs(prev => ({ 
                            ...prev, 
                            [`${config.id}_${field.key}`]: e.target.value 
                          }))}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(`${config.id}_${field.key}`)}
                          >
                            {showSecrets[`${config.id}_${field.key}`] ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleSaveConfig(config.id)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection(config.id)}
                    disabled={testingApi === config.id}
                  >
                    {testingApi === config.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}