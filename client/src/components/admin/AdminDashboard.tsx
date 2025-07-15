import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Database, 
  DollarSign, 
  Building,
  TrendingUp,
  AlertCircle,
  Settings,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/system"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = systemStats || {
    totalUsers: 15432,
    totalExams: 8945,
    totalQuestions: 12345,
    totalInstitutions: 127,
    dailyActiveUsers: 3247
  };

  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      action: () => {}
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "from-purple-500 to-purple-600",
      action: () => {}
    },
    {
      title: "Database Admin",
      description: "Monitor and manage database",
      icon: Database,
      color: "from-red-500 to-red-600",
      action: () => {}
    }
  ];

  const recentUsers = [
    { id: "1", name: "John Adebayo", email: "john@example.com", role: "student", joinDate: "2024-01-15", status: "active" },
    { id: "2", name: "Lagos State College", email: "admin@lsc.edu.ng", role: "institution", joinDate: "2024-01-14", status: "active" },
    { id: "3", name: "Sarah Ibrahim", email: "sarah@example.com", role: "student", joinDate: "2024-01-13", status: "pending" }
  ];

  const systemAlerts = [
    { type: "warning", message: "High server load detected", time: "5 min ago" },
    { type: "info", message: "Scheduled maintenance at 2 AM", time: "1 hour ago" },
    { type: "error", message: "Payment gateway timeout", time: "2 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">System overview and management</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  +12% this month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">₦2.1M</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  +8% this month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  +145 this week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Institutions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalInstitutions}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  +3 this month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Active</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.dailyActiveUsers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  +5% today
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700"
                      onClick={action.action}
                    >
                      <CardContent className="p-4">
                        <div className={`h-12 w-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Management Tabs */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">System Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="institutions">Institutions</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {recentUsers.map((user) => (
                        <Card key={user.id} className="border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge 
                                  variant="outline"
                                  className={user.role === "admin" ? "border-red-500 text-red-600" : 
                                            user.role === "institution" ? "border-blue-500 text-blue-600" : 
                                            "border-green-500 text-green-600"}
                                >
                                  {user.role}
                                </Badge>
                                <Badge 
                                  variant="secondary"
                                  className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                >
                                  {user.status}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="institutions" className="space-y-4">
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Institution management panel</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payments" className="space-y-4">
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Payment transactions and analytics</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "error" ? "bg-red-50 dark:bg-red-900/20 border-red-500" :
                      alert.type === "warning" ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500" :
                      "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    }`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{alert.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Response Time</span>
                    <span className="font-semibold text-blue-600">145ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Database Size</span>
                    <span className="font-semibold text-purple-600">2.4GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage Used</span>
                    <span className="font-semibold text-orange-600">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "User login spike detected", time: "5 min ago", type: "info" },
                    { action: "New institution registered", time: "1 hour ago", type: "success" },
                    { action: "Payment processed", time: "2 hours ago", type: "success" },
                    { action: "Database backup completed", time: "4 hours ago", type: "info" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === "success" ? "bg-green-500" : 
                        activity.type === "warning" ? "bg-yellow-500" : 
                        activity.type === "error" ? "bg-red-500" : "bg-blue-500"
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
