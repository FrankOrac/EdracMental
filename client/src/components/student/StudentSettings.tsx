import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Eye, 
  Shield, 
  Globe, 
  Palette,
  Clock,
  Volume2,
  Monitor,
  Smartphone,
  Crown
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/system/ThemeProvider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function StudentSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const [settings, setSettings] = useState({
    notifications: {
      examReminders: true,
      achievementAlerts: true,
      studyReminders: false,
      weeklyReports: true
    },
    accessibility: {
      fontSize: "medium",
      highContrast: false,
      screenReader: false,
      keyboardNav: false
    },
    study: {
      autoSave: true,
      showTimer: true,
      soundEffects: true,
      practiceMode: "standard"
    },
    privacy: {
      profileVisibility: "friends",
      shareProgress: true,
      allowMessages: true
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
      variant: "default"
    });
  };

  return (
    <StudentDashboardLayout title="Settings" subtitle="Customize your learning experience">
      <div className="space-y-6">
        {/* Premium Status */}
        {isPremium && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-yellow-800" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Premium Account Active
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Enjoy unlimited access to all premium features
                  </p>
                </div>
                <Badge className="bg-yellow-400 text-yellow-800 hover:bg-yellow-500">
                  Premium
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred color scheme
                </p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <Monitor className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Monitor className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Font Size</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adjust text size for better readability
                </p>
              </div>
              <Select 
                value={settings.accessibility.fontSize}
                onValueChange={(value) => updateSetting('accessibility', 'fontSize', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Exam Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about upcoming exams
                </p>
              </div>
              <Switch 
                checked={settings.notifications.examReminders}
                onCheckedChange={(checked) => updateSetting('notifications', 'examReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Achievement Alerts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Celebrate when you unlock achievements
                </p>
              </div>
              <Switch 
                checked={settings.notifications.achievementAlerts}
                onCheckedChange={(checked) => updateSetting('notifications', 'achievementAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Study Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Daily reminders to keep studying
                </p>
              </div>
              <Switch 
                checked={settings.notifications.studyReminders}
                onCheckedChange={(checked) => updateSetting('notifications', 'studyReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get weekly progress summaries
                </p>
              </div>
              <Switch 
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-save Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically save your exam progress
                </p>
              </div>
              <Switch 
                checked={settings.study.autoSave}
                onCheckedChange={(checked) => updateSetting('study', 'autoSave', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show Timer</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display countdown timer during exams
                </p>
              </div>
              <Switch 
                checked={settings.study.showTimer}
                onCheckedChange={(checked) => updateSetting('study', 'showTimer', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sound Effects</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play sounds for actions and notifications
                </p>
              </div>
              <Switch 
                checked={settings.study.soundEffects}
                onCheckedChange={(checked) => updateSetting('study', 'soundEffects', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Practice Mode</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred practice style
                </p>
              </div>
              <Select 
                value={settings.study.practiceMode}
                onValueChange={(value) => updateSetting('study', 'practiceMode', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="timed">Timed</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Profile Visibility</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control who can see your profile
                </p>
              </div>
              <Select 
                value={settings.privacy.profileVisibility}
                onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Share Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow others to see your achievements
                </p>
              </div>
              <Switch 
                checked={settings.privacy.shareProgress}
                onCheckedChange={(checked) => updateSetting('privacy', 'shareProgress', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Messages</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive messages from other students
                </p>
              </div>
              <Switch 
                checked={settings.privacy.allowMessages}
                onCheckedChange={(checked) => updateSetting('privacy', 'allowMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}