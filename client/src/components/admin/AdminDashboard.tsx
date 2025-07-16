import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardOverview from "./DashboardOverview";
import DashboardExamManagement from "./DashboardExamManagement";
import DashboardSettings from "./DashboardSettings";
import UserManagement from "./UserManagement";
import AdNetworkManager from "./AdNetworkManager";
import CategoryTopicManager from "./CategoryTopicManager";
import { 
  BarChart3, 
  BookOpen, 
  Settings as SettingsIcon,
  Users,
  Database,
  DollarSign,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/system"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  System Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  User Management
                </TabsTrigger>
                <TabsTrigger 
                  value="categories" 
                  className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                >
                  <FolderOpen className="h-4 w-4" />
                  Content Management
                </TabsTrigger>
                <TabsTrigger 
                  value="system" 
                  className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  <Database className="h-4 w-4" />
                  System Health
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Global Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <DashboardOverview />
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <UserManagement />
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <CategoryTopicManager />
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <AdNetworkManager />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <DashboardSettings />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}