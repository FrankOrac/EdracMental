import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings as SettingsIcon,
  GraduationCap,
  Building,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Trash2,
  UserPlus,
  FileText,
  Award,
  Clock,
  Target,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

export default function EnhancedInstitutionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const { data: institutionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/institution", user?.institutionId],
    retry: false,
  });

  const { data: students } = useQuery({
    queryKey: ["/api/institutions", user?.institutionId, "students"],
    retry: false,
  });

  const { data: exams } = useQuery({
    queryKey: ["/api/institutions", user?.institutionId, "exams"],
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return await apiRequest("POST", "/api/exams", {
        ...examData,
        institutionId: user?.institutionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions", user?.institutionId, "exams"] });
      toast({ title: "Exam created successfully" });
    },
  });

  // Invite student mutation
  const inviteStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return await apiRequest("POST", "/api/institutions/invite-student", {
        ...studentData,
        institutionId: user?.institutionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions", user?.institutionId, "students"] });
      toast({ title: "Student invitation sent successfully" });
    },
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = institutionStats || {
    totalStudents: 0,
    totalExams: 0,
    averageScore: 0,
    recentActivity: []
  };

  const institutionExams = exams || [];
  const institutionStudents = students || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Institution Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Comprehensive student and exam management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Institution Manager
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to your Institution Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Manage students, create exams, and track performance across your institution
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Student Management
            </TabsTrigger>
            <TabsTrigger 
              value="exams" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Exam Management
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Students</p>
                        <p className="text-3xl font-bold">{stats.totalStudents}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Active Exams</p>
                        <p className="text-3xl font-bold">{institutionExams.filter((exam: any) => exam.isActive).length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-200" />
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
                        <p className="text-green-100">Average Score</p>
                        <p className="text-3xl font-bold">{stats.averageScore || 0}%</p>
                      </div>
                      <Target className="h-8 w-8 text-green-200" />
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
                        <p className="text-orange-100">This Month</p>
                        <p className="text-3xl font-bold">{institutionExams.length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Invite Students</h3>
                  <p className="text-gray-600 mb-4">Add new students to your institution</p>
                  <Button className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Students
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Create Exam</h3>
                  <p className="text-gray-600 mb-4">Design custom exams for your students</p>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">View Analytics</h3>
                  <p className="text-gray-600 mb-4">Track student performance and trends</p>
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Institution Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity found.</p>
                    <p className="text-sm text-gray-400 mt-2">Start managing students and exams to see activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Management Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Management
                  </CardTitle>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutionStudents.length > 0 ? (
                    institutionStudents.map((student: any) => (
                      <div key={student.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <p className="text-xs text-gray-500">
                                Joined: {new Date(student.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={student.isActive ? "default" : "secondary"}>
                              {student.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No students enrolled</h3>
                      <p className="text-gray-600 mb-4">
                        Start inviting students to your institution to manage their learning journey.
                      </p>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Your First Student
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exam Management Tab */}
          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Institution Exams
                  </CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institutionExams.length > 0 ? (
                    institutionExams.map((exam: any, index: number) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{exam.title}</CardTitle>
                              <Badge variant={exam.isActive ? "default" : "secondary"}>
                                {exam.isActive ? "Active" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {exam.description}
                            </p>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>{exam.duration} minutes</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>{exam.totalQuestions} questions</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {exam.subjects?.map((subject: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                          <div className="p-6 pt-0">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No exams created</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first exam to start testing your students' knowledge.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Exam
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.averageScore || 0}%</div>
                      <div className="text-sm text-gray-600">Institution Average</div>
                    </div>
                    <Progress value={stats.averageScore || 0} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {institutionStudents.filter((s: any) => s.averageScore >= 70).length}
                        </div>
                        <div className="text-xs text-gray-600">Above 70%</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {institutionStudents.filter((s: any) => s.averageScore >= 50 && s.averageScore < 70).length}
                        </div>
                        <div className="text-xs text-gray-600">50-70%</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {institutionStudents.filter((s: any) => s.averageScore < 50).length}
                        </div>
                        <div className="text-xs text-gray-600">Below 50%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {institutionStudents.slice(0, 5).map((student: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                          </div>
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                        </div>
                        <span className="font-bold">{student.averageScore || 0}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Institution Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Exam Defaults</h3>
                      <div className="space-y-2">
                        <label className="text-sm">Default exam duration (minutes)</label>
                        <input 
                          type="number" 
                          defaultValue="90"
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Auto-grade exams</label>
                        <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium">Student Management</h3>
                      <div className="space-y-2">
                        <label className="text-sm">Allow student self-registration</label>
                        <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                          <option value="false">Disabled</option>
                          <option value="true">Enabled</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Require approval for new students</label>
                        <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                          <option value="true">Required</option>
                          <option value="false">Not Required</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">
                    Save Institution Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}