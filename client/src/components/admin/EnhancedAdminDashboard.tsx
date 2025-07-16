import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserManagement from "./UserManagement";
import CategoryTopicManager from "./CategoryTopicManager";
import { 
  BarChart3, 
  Users, 
  Building, 
  BookOpen, 
  Settings as SettingsIcon,
  Database,
  Shield,
  Globe,
  Zap,
  Crown,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

export default function EnhancedAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/system"],
    retry: false,
  });

  const { data: institutions } = useQuery({
    queryKey: ["/api/institutions"],
    retry: false,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  const { data: exams } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  // Mutations for admin actions
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User status updated successfully" });
    },
  });

  const toggleInstitutionStatusMutation = useMutation({
    mutationFn: async ({ institutionId, isActive }: { institutionId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/institutions/${institutionId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions"] });
      toast({ title: "Institution status updated successfully" });
    },
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

  const stats = systemStats || {
    totalUsers: 0,
    totalInstitutions: 0,
    totalExams: 0,
    totalQuestions: 0,
    dailyActiveUsers: 0,
    recentSignups: 0,
    systemHealth: 100
  };

  // Calculate derived stats
  const studentUsers = users?.filter((user: any) => user.role === 'student') || [];
  const institutionUsers = users?.filter((user: any) => user.role === 'institution') || [];
  const activeInstitutions = institutions?.filter((inst: any) => inst.isActive) || [];
  const activeExams = exams?.filter((exam: any) => exam.isActive) || [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  System Administration
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete control and oversight of the EDRAC platform
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1">
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
                value="institutions" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4" />
                Institutions
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                Content Control
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

            {/* System Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Users</p>
                          <p className="text-3xl font-bold">{stats.totalUsers}</p>
                          <p className="text-blue-200 text-sm">+{stats.recentSignups} new today</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Institutions</p>
                          <p className="text-3xl font-bold">{activeInstitutions.length}</p>
                          <p className="text-purple-200 text-sm">of {stats.totalInstitutions} total</p>
                        </div>
                        <Building className="h-8 w-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Active Exams</p>
                          <p className="text-3xl font-bold">{activeExams.length}</p>
                          <p className="text-green-200 text-sm">of {stats.totalExams} total</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">System Health</p>
                          <p className="text-3xl font-bold">{stats.systemHealth}%</p>
                          <p className="text-orange-200 text-sm">All systems operational</p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* User Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Students</span>
                        <span className="text-sm text-gray-500">{studentUsers.length} users</span>
                      </div>
                      <Progress 
                        value={(studentUsers.length / (users?.length || 1)) * 100} 
                        className="h-3" 
                      />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Institutions</span>
                        <span className="text-sm text-gray-500">{institutionUsers.length} users</span>
                      </div>
                      <Progress 
                        value={(institutionUsers.length / (users?.length || 1)) * 100} 
                        className="h-3" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Platform Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.dailyActiveUsers}</div>
                        <div className="text-sm text-gray-600">Daily Active Users</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{subjects?.length || 0}</div>
                          <div className="text-xs text-gray-600">Subjects</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{stats.totalQuestions}</div>
                          <div className="text-xs text-gray-600">Questions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{stats.totalExams}</div>
                          <div className="text-xs text-gray-600">Exams</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users?.slice(0, 5).map((user: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">Joined as {user.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            {/* Institutions Tab */}
            <TabsContent value="institutions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Institution Management
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage all institutions and their access to the platform
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {institutions?.map((institution: any) => (
                      <div key={institution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-medium">{institution.name}</h3>
                              <p className="text-sm text-gray-600">{institution.description}</p>
                              <p className="text-xs text-gray-500">
                                {institution.location} • {institution.institutionType}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={institution.isActive ? "default" : "secondary"}>
                              {institution.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleInstitutionStatusMutation.mutate({
                                institutionId: institution.id,
                                isActive: !institution.isActive
                              })}
                            >
                              {institution.isActive ? "Suspend" : "Activate"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Control Tab */}
            <TabsContent value="content" className="space-y-6">
              <CategoryTopicManager />
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Health & Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-800 dark:text-green-200">Database</h3>
                      <p className="text-sm text-green-600">Operational</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-800 dark:text-green-200">API Services</h3>
                      <p className="text-sm text-green-600">Operational</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">AI Services</h3>
                      <p className="text-sm text-yellow-600">API Key Required</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Global Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Exam Settings</h3>
                        <div className="space-y-2">
                          <label className="text-sm">Default exam duration (minutes)</label>
                          <input 
                            type="number" 
                            defaultValue="60"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">Maximum questions per exam</label>
                          <input 
                            type="number" 
                            defaultValue="100"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">Security Settings</h3>
                        <div className="space-y-2">
                          <label className="text-sm">Session timeout (minutes)</label>
                          <input 
                            type="number" 
                            defaultValue="30"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">Max login attempts</label>
                          <input 
                            type="number" 
                            defaultValue="5"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">
                      Save Global Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}