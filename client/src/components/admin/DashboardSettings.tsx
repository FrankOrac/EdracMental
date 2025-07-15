import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Settings, Brain, CreditCard, Globe, Database, Shield,
  CheckCircle, AlertCircle, Zap, Save, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface APIConfig {
  openai: boolean;
  paystack: boolean;
  sendgrid: boolean;
  database: boolean;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxQuestionsPerExam: number;
  defaultExamDuration: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
}

export default function DashboardSettings() {
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    openai: false,
    paystack: false,
    sendgrid: false,
    database: false
  });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "Edrac CBT Platform",
    siteDescription: "AI-powered Computer-Based Testing platform for West Africa",
    contactEmail: "admin@edrac.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxQuestionsPerExam: 50,
    defaultExamDuration: 60,
    enableNotifications: true,
    enableAnalytics: true
  });
  
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    paystack: '',
    sendgrid: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testAPIConnections = async () => {
    setIsTestingAPI(true);
    try {
      const endpoints = [
        { name: 'openai', url: '/api/ai/test' },
        { name: 'paystack', url: '/api/payments/test' },
        { name: 'sendgrid', url: '/api/email/test' },
        { name: 'database', url: '/api/health/database' }
      ];
      
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint.url, { credentials: "include" });
            const data = await response.json();
            return { name: endpoint.name, status: data.status === 'connected' };
          } catch {
            return { name: endpoint.name, status: false };
          }
        })
      );
      
      const newConfig = results.reduce((acc, result) => {
        acc[result.name as keyof APIConfig] = result.status;
        return acc;
      }, {} as APIConfig);
      
      setApiConfig(newConfig);
      
      toast({
        title: "API Test Complete",
        description: "All API connections have been tested",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API connections",
        variant: "destructive",
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: SystemSettings) => {
      return apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(systemSettings);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Configure your platform settings and API integrations
          </p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="flex items-center gap-2"
        >
          {saveSettingsMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  General Settings
                </CardTitle>
                <CardDescription>Configure basic platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={systemSettings.contactEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={systemSettings.siteDescription}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxQuestions">Max Questions per Exam</Label>
                    <Input
                      id="maxQuestions"
                      type="number"
                      value={systemSettings.maxQuestionsPerExam}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxQuestionsPerExam: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Exam Duration (minutes)</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      value={systemSettings.defaultExamDuration}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultExamDuration: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  API Configuration & Testing
                </CardTitle>
                <CardDescription>Manage external API integrations and test connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="font-medium">OpenAI</span>
                        <p className="text-sm text-slate-500">AI question generation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiConfig.openai ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={apiConfig.openai ? "default" : "destructive"}>
                        {apiConfig.openai ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-green-500" />
                      <div>
                        <span className="font-medium">Paystack</span>
                        <p className="text-sm text-slate-500">Payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiConfig.paystack ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={apiConfig.paystack ? "default" : "destructive"}>
                        {apiConfig.paystack ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="font-medium">SendGrid</span>
                        <p className="text-sm text-slate-500">Email delivery</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiConfig.sendgrid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={apiConfig.sendgrid ? "default" : "destructive"}>
                        {apiConfig.sendgrid ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-500" />
                      <div>
                        <span className="font-medium">Database</span>
                        <p className="text-sm text-slate-500">PostgreSQL connection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiConfig.database ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={apiConfig.database ? "default" : "destructive"}>
                        {apiConfig.database ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={testAPIConnections}
                  disabled={isTestingAPI}
                  className="w-full"
                >
                  {isTestingAPI ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Testing Connections...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test All Connections
                    </>
                  )}
                </Button>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showApiKeys">Show API Keys</Label>
                    <Switch
                      id="showApiKeys"
                      checked={showApiKeys}
                      onCheckedChange={setShowApiKeys}
                    />
                  </div>
                  
                  {showApiKeys && (
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-4 w-4" />
                        These are sensitive values. Only show when configuring.
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="openaiKey">OpenAI API Key</Label>
                          <Input
                            id="openaiKey"
                            type="password"
                            placeholder="sk-..."
                            value={apiKeys.openai}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="paystackKey">Paystack Secret Key</Label>
                          <Input
                            id="paystackKey"
                            type="password"
                            placeholder="sk_..."
                            value={apiKeys.paystack}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, paystack: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="sendgridKey">SendGrid API Key</Label>
                          <Input
                            id="sendgridKey"
                            type="password"
                            placeholder="SG..."
                            value={apiKeys.sendgrid}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, sendgrid: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-slate-500">Temporarily disable the platform</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Allow Registration</h4>
                      <p className="text-sm text-slate-500">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={systemSettings.allowRegistration}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Verification</h4>
                      <p className="text-sm text-slate-500">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={systemSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Enable Notifications</h4>
                      <p className="text-sm text-slate-500">Allow system to send notifications</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Analytics Tracking</h4>
                      <p className="text-sm text-slate-500">Enable usage analytics and tracking</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableAnalytics}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableAnalytics: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}