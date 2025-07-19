import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Settings, 
  Users, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Key,
  UserCheck,
  Building
} from "lucide-react";

// Import all the enhanced components
import EnhancedDashboard from "@/components/admin/EnhancedDashboard";
import AdminQuestionBank from "@/components/admin/AdminQuestionBank";
import ApiConfigSettings from "@/components/admin/ApiConfigSettings";
import LiveChatSystem from "@/components/admin/LiveChatSystem";
import AiTutorEnhanced from "@/components/ai/AiTutorEnhanced";
import EnhancedUserProfile from "@/components/profile/EnhancedUserProfile";
import { UserDialog } from "@/components/admin/UserDialog";
import { InstitutionDialog } from "@/components/admin/InstitutionDialog";
import { ExamDialog } from "@/components/admin/ExamDialog";
import { SubjectDialog } from "@/components/admin/SubjectDialog";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              Edrac Admin Portal
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
              Comprehensive platform management and analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              System Online
            </Badge>
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="institutions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Building className="w-4 h-4 mr-2" />
              Institutions
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Key className="w-4 h-4 mr-2" />
              API Config
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EnhancedDashboard />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <AdminQuestionBank />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Management</span>
                  </div>
                  <UserDialog mode="add" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-500 mb-4">
                    Manage user accounts, roles, and permissions from this centralized dashboard.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <UserDialog mode="add" />
                    <Button variant="outline">Import Users</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Institution Management</span>
                  </div>
                  <InstitutionDialog mode="add" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Institution Management</h3>
                  <p className="text-gray-500 mb-4">
                    Manage educational institutions, their subscriptions, and administrative settings.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <InstitutionDialog mode="add" />
                    <Button variant="outline">View Reports</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <LiveChatSystem />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AiTutorEnhanced />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <ApiConfigSettings />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <EnhancedUserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}