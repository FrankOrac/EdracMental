import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: institutionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/institution", user?.institutionId],
    enabled: !!user?.institutionId,
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams/institution", user?.institutionId],
    enabled: !!user?.institutionId,
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = institutionStats || {
    totalStudents: 1247,
    totalExams: 34,
    averageScore: 89,
    recentActivity: []
  };

  const mockExams = [
    {
      id: "1",
      title: "SS3 Mathematics Mock Exam",
      type: "mock",
      totalQuestions: 40,
      duration: 90,
      participants: 156,
      averageScore: 78,
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "2", 
      title: "SS2 English Language Practice",
      type: "practice",
      totalQuestions: 50,
      duration: 120,
      participants: 98,
      averageScore: 82,
      status: "completed",
      createdAt: new Date().toISOString()
    }
  ];

  const quickActions = [
    {
      title: "Create New Exam",
      description: "Build a custom exam for your students",
      icon: Plus,
      color: "from-blue-500 to-blue-600",
      action: () => {}
    },
    {
      title: "Manage Students",
      description: "View and manage student accounts",
      icon: Users,
      color: "from-green-500 to-green-600", 
      action: () => {}
    },
    {
      title: "View Reports",
      description: "Access detailed performance analytics",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institution Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your students and exams</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  +15 this month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Exams</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  5 scheduled
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  +3% improvement
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  12 pending
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

            {/* Exams Management */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Manage Exams</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExams.map((exam) => (
                    <Card key={exam.id} className="border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h3>
                              <Badge 
                                variant="outline"
                                className={exam.status === "active" ? "border-green-500 text-green-600" : "border-gray-500 text-gray-600"}
                              >
                                {exam.status}
                              </Badge>
                              <Badge variant="secondary">
                                {exam.type}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">{exam.totalQuestions}</span> questions
                              </div>
                              <div>
                                <span className="font-medium">{exam.duration}</span> minutes
                              </div>
                              <div>
                                <span className="font-medium">{exam.participants}</span> participants
                              </div>
                              <div>
                                <span className="font-medium">{exam.averageScore}%</span> avg score
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performing Students */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Adebayo", score: 95, subject: "Mathematics" },
                    { name: "Sarah Ibrahim", score: 92, subject: "English" },
                    { name: "David Okafor", score: 89, subject: "Physics" }
                  ].map((student, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{student.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{student.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{student.score}%</p>
                      </div>
                    </div>
                  ))}
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
                    { action: "New student registration", time: "2 hours ago", type: "user" },
                    { action: "Exam completed by 25 students", time: "4 hours ago", type: "exam" },
                    { action: "New exam created", time: "1 day ago", type: "create" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === "user" ? "bg-blue-500" : 
                        activity.type === "exam" ? "bg-green-500" : "bg-purple-500"
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
