import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Save, Shield, Bell, Database, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Edrac CBT Platform",
    siteDescription: "AI-powered Computer-Based Testing platform",
    maintenanceMode: false,
    
    // Email Settings
    smtpServer: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    senderEmail: "",
    senderName: "Edrac Support",
    
    // Security Settings
    enableTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // AI Settings
    openaiApiKey: "",
    aiTutoringEnabled: true,
    questionGenerationEnabled: true,
    
    // Payment Settings
    paystackPublicKey: "",
    paystackSecretKey: "",
    enablePayments: true,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/settings", { 
        method: "PUT", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure platform settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email SMTP</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input 
                      id="platform-name" 
                      value={settings.siteName}
                      onChange={(e) => handleChange("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input 
                      id="support-email" 
                      value={settings.senderEmail}
                      onChange={(e) => handleChange("senderEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Site Description</Label>
                  <Input 
                    id="welcome-message" 
                    value={settings.siteDescription}
                    onChange={(e) => handleChange("siteDescription", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Disable access for maintenance</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SMTP Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input 
                      id="smtp-server" 
                      placeholder="smtp.gmail.com"
                      value={settings.smtpServer}
                      onChange={(e) => handleChange("smtpServer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input 
                      id="smtp-port" 
                      type="number"
                      placeholder="587"
                      value={settings.smtpPort}
                      onChange={(e) => handleChange("smtpPort", parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input 
                      id="smtp-username" 
                      placeholder="your-email@gmail.com"
                      value={settings.smtpUsername}
                      onChange={(e) => handleChange("smtpUsername", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input 
                      id="smtp-password" 
                      type="password"
                      placeholder="App-specific password"
                      value={settings.smtpPassword}
                      onChange={(e) => handleChange("smtpPassword", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input 
                      id="sender-email" 
                      placeholder="noreply@edrac.com"
                      value={settings.senderEmail}
                      onChange={(e) => handleChange("senderEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Sender Name</Label>
                    <Input 
                      id="sender-name" 
                      placeholder="Edrac Support"
                      value={settings.senderName}
                      onChange={(e) => handleChange("senderName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Setup Instructions</h4>
                  <div className="text-sm space-y-1">
                    <p>• For Gmail: Use smtp.gmail.com, port 587, and an app-specific password</p>
                    <p>• For Outlook: Use smtp-mail.outlook.com, port 587</p>
                    <p>• For Yahoo: Use smtp.mail.yahoo.com, port 587</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch 
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => handleChange("enableTwoFactor", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity (minutes)</p>
                  </div>
                  <Input 
                    className="w-32" 
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Min Length</h4>
                    <p className="text-sm text-muted-foreground">Minimum password length</p>
                  </div>
                  <Input 
                    className="w-32" 
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleChange("passwordMinLength", parseInt(e.target.value))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Max Login Attempts</h4>
                    <p className="text-sm text-muted-foreground">Account lockout after failed attempts</p>
                  </div>
                  <Input 
                    className="w-32" 
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  AI & OpenAI Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input 
                    id="openai-key" 
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={(e) => handleChange("openaiApiKey", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Required for AI tutoring and question generation</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">AI Tutoring</h4>
                    <p className="text-sm text-muted-foreground">Enable AI-powered tutoring features</p>
                  </div>
                  <Switch 
                    checked={settings.aiTutoringEnabled}
                    onCheckedChange={(checked) => handleChange("aiTutoringEnabled", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Question Generation</h4>
                    <p className="text-sm text-muted-foreground">AI-powered question generation</p>
                  </div>
                  <Switch 
                    checked={settings.questionGenerationEnabled}
                    onCheckedChange={(checked) => handleChange("questionGenerationEnabled", checked)}
                  />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paystack-public">Paystack Public Key</Label>
                      <Input 
                        id="paystack-public" 
                        placeholder="pk_..."
                        value={settings.paystackPublicKey}
                        onChange={(e) => handleChange("paystackPublicKey", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paystack-secret">Paystack Secret Key</Label>
                      <Input 
                        id="paystack-secret" 
                        type="password"
                        placeholder="sk_..."
                        value={settings.paystackSecretKey}
                        onChange={(e) => handleChange("paystackSecretKey", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h4 className="font-medium">Enable Payments</h4>
                      <p className="text-sm text-muted-foreground">Allow subscription payments</p>
                    </div>
                    <Switch 
                      checked={settings.enablePayments}
                      onCheckedChange={(checked) => handleChange("enablePayments", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}