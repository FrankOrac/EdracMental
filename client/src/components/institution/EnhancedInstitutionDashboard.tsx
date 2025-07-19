import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "wouter";
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
  Filter,
  Mail,
  Phone,
  Calendar,
  Globe,
  Brain,
  MessageSquare,
  Share2,
  Download,
  Upload,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Zap,
  PlayCircle,
  StopCircle,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";

// Import existing components
import ExamManager from "@/components/admin/ExamManager";
import QuestionManager from "@/components/admin/QuestionManager";
import CategoryTopicManager from "@/components/admin/CategoryTopicManager";
import EnhancedAITutor from "@/components/ai/EnhancedAITutor";
import { StudyGroupsManager } from "@/components/student/StudyGroupsManager";
import ProfileManager from "@/components/profile/ProfileManager";
import MultiQuestionCreator from "@/components/admin/MultiQuestionCreator";


export default function EnhancedInstitutionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [examDialog, setExamDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch data
  const { data: institutionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/institution"],
    retry: false,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/institutions/students"],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/institutions/exams"],
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/questions"],
    retry: false,
  });

  // New institution-specific queries
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/institutions/packages"],
    retry: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/institutions/settings"],
    retry: false,
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/institutions/performance"],
    retry: false,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/institutions/groups"],
    retry: false,
  });

  // Mutations
  const inviteStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return await apiRequest("POST", "/api/institutions/invite-student", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/students"] });
      toast({ title: "Student invitation sent successfully" });
      setInviteEmail("");
      setInviteName("");
    },
    onError: () => {
      toast({ title: "Failed to send invitation", variant: "destructive" });
    }
  });

  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return await apiRequest("POST", "/api/exams", {
        ...examData,
        institutionId: user?.institutionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/exams"] });
      toast({ title: "Exam created successfully" });
      setExamDialog(false);
    },
  });

  const toggleExamStatusMutation = useMutation({
    mutationFn: async ({ examId, isActive }: { examId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/exams/${examId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/exams"] });
      toast({ title: "Exam status updated successfully" });
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      return await apiRequest("DELETE", `/api/exams/${examId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/exams"] });
      toast({ title: "Exam deleted successfully" });
    },
  });

  const handleInviteStudent = () => {
    if (!inviteEmail || !inviteName) {
      toast({ title: "Please provide both email and name", variant: "destructive" });
      return;
    }
    
    inviteStudentMutation.mutate({
      email: inviteEmail,
      firstName: inviteName.split(' ')[0],
      lastName: inviteName.split(' ').slice(1).join(' ') || "",
    });
  };

  const handleCreateExam = (examData: any) => {
    createExamMutation.mutate(examData);
  };

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = institutionStats || { totalStudents: 0, totalExams: 0, averageScore: 0 };
  const institutionExams = exams || [];
  const institutionStudents = students || [];
  const institutionQuestions = questions || [];

  // Filter functions
  const filteredExams = institutionExams.filter((exam: any) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && exam.isActive) ||
      (filterStatus === "inactive" && !exam.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institution Management</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete management system for {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Packages
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="exams" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Exams
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Tutor
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Students</p>
                        <p className="text-3xl font-bold">{institutionStudents.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Active Exams</p>
                        <p className="text-3xl font-bold">{institutionExams.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Questions Bank</p>
                        <p className="text-3xl font-bold">{institutionQuestions.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Average Score</p>
                        <p className="text-3xl font-bold">{stats.averageScore || 0}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="h-12" onClick={() => setActiveTab("students")}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Student
                      </Button>
                      <Button variant="outline" className="h-12" onClick={() => setActiveTab("exams")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Exam
                      </Button>
                      <Button variant="outline" className="h-12" onClick={() => setActiveTab("questions")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Add Questions
                      </Button>
                      <Button variant="outline" className="h-12" onClick={() => setActiveTab("ai-tutor")}>
                        <Brain className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {institutionStudents.length > 0 ? (
                      <div className="space-y-3">
                        {institutionStudents.slice(0, 4).map((student: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {student.firstName?.[0] || student.email?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{student.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">Active</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Student Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage your institution's students</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Student name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-48"
                  />
                  <Button 
                    onClick={handleInviteStudent}
                    disabled={inviteStudentMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Badge variant="outline">
                    {institutionStudents.length} Students
                  </Badge>
                </div>

                {institutionStudents.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No students enrolled</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                        Start by inviting students to your institution using the invite form above.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {institutionStudents.map((student, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{student.name || student.email}</h3>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Student</Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Exam Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create and manage exams for your students</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={examDialog} onOpenChange={setExamDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Exam</DialogTitle>
                        <DialogDescription>Create a new exam for your students</DialogDescription>
                      </DialogHeader>
                      <ExamManager onExamCreated={() => setExamDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  {examsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : filteredExams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredExams.map((exam: any, index: number) => (
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
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4" />
                                  <span>{exam.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="h-4 w-4" />
                                  <span>{exam.totalQuestions} questions</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toggleExamStatusMutation.mutate({ 
                                      examId: exam.id, 
                                      isActive: !exam.isActive 
                                    })}
                                  >
                                    {exam.isActive ? <StopCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No exams found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm ? "No exams match your search criteria" : "Create your first exam to start testing your students"}
                      </p>
                      <Button onClick={() => setExamDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Exam
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Question Bank Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage questions for your exams</p>
                </div>
                <Link to="/create-questions">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Questions
                  </Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Question Bank</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You have {institutionQuestions.length} questions in your bank
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Link to="/create-questions">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Questions
                          </Button>
                        </Link>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Bulk Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Subject & Topic Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Organize your curriculum structure</p>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Subjects & Topics</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Manage your curriculum structure and academic subjects
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Student Performance Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">Track and analyze student progress and scores</p>
                </div>
              </div>
              
              {performanceLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {performance && performance.length > 0 ? (
                        <div className="space-y-4">
                          {performance.slice(0, 5).map((perf: any) => (
                            <div key={perf.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">Student {perf.userId}</p>
                                <p className="text-sm text-gray-600">Subject {perf.subjectId}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{Math.round(perf.averageScore)}%</p>
                                <p className="text-sm text-gray-600">{perf.totalExams} exams</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No performance data available yet</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {performance && performance.length > 0 ? (
                        <div className="space-y-3">
                          {subjects?.slice(0, 5).map((subject: any) => {
                            const subjectPerf = performance.filter((p: any) => p.subjectId === subject.id);
                            const avgScore = subjectPerf.length > 0 
                              ? subjectPerf.reduce((sum: number, p: any) => sum + p.averageScore, 0) / subjectPerf.length
                              : 0;
                            
                            return (
                              <div key={subject.id} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">{subject.name}</span>
                                  <span className="text-sm">{Math.round(avgScore)}%</span>
                                </div>
                                <Progress value={avgScore} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No subject data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Student Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Student Groups Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create and manage student groups for better organization</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Student Group</DialogTitle>
                      <DialogDescription>Organize students into groups for better management</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Group name (e.g., Grade 10A)" />
                      <Input placeholder="Description (optional)" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Class Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jss1">JSS 1</SelectItem>
                          <SelectItem value="jss2">JSS 2</SelectItem>
                          <SelectItem value="jss3">JSS 3</SelectItem>
                          <SelectItem value="ss1">SS 1</SelectItem>
                          <SelectItem value="ss2">SS 2</SelectItem>
                          <SelectItem value="ss3">SS 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">Create Group</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {groupsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups && groups.length > 0 ? (
                    groups.map((group: any) => (
                      <Card key={group.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {group.name}
                            <Badge variant="outline">{group.classLevel}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">{group.description}</p>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">{group.studentIds?.length || 0} students</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-full">
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No student groups yet</h3>
                        <p className="text-gray-600 mb-4">Create your first student group to organize your students</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Institution Packages</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage your subscription packages and student access</p>
                </div>
              </div>
              
              {packagesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {packages && packages.length > 0 ? (
                    packages.map((pkg: any) => (
                      <Card key={pkg.id} className="relative">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1)} Package
                            <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                              {pkg.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Student Capacity:</span>
                              <span className="font-medium">{pkg.studentCapacity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Duration:</span>
                              <span className="font-medium">{pkg.duration} months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Price:</span>
                              <span className="font-medium">{pkg.currency} {pkg.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Payment Method:</span>
                              <span className="font-medium">{pkg.paymentMethod}</span>
                            </div>
                            {pkg.expiryDate && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Expires:</span>
                                <span className="font-medium">
                                  {new Date(pkg.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="pt-3">
                              <Button variant="outline" className="w-full">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-full">
                      <CardContent className="text-center py-12">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                        <p className="text-gray-600 mb-4">Contact support to set up your institution package</p>
                        <Button onClick={() => setActiveTab("payments")}>
                          <Star className="h-4 w-4 mr-2" />
                          View Payment Options
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Payment Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Handle payments and billing for your institution</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Online Payment Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Online Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">Pay securely using Paystack or Stripe</p>
                      <div className="space-y-3">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Package - ₦50,000/year</SelectItem>
                            <SelectItem value="premium">Premium Package - ₦100,000/year</SelectItem>
                            <SelectItem value="enterprise">Enterprise Package - ₦200,000/year</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Number of students" />
                        <Button className="w-full">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Pay Online
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Offline Payment Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Offline Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">Bank transfer or cash payment</p>
                      <div className="space-y-3">
                        <Input placeholder="Payment reference" />
                        <Input placeholder="Invoice number" />
                        <Input type="number" placeholder="Amount paid" />
                        <Button className="w-full" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Offline Payment
                        </Button>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Bank Details:</strong><br />
                          Account Name: Edrac Education Ltd<br />
                          Account Number: 1234567890<br />
                          Bank: First Bank Nigeria
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Tutor Tab */}
            <TabsContent value="ai-tutor" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">AI Teaching Assistant</h3>
                  <p className="text-gray-600 dark:text-gray-400">Get AI assistance for content creation and student support</p>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <EnhancedAITutor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Institution Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400">Configure your institution preferences</p>
                </div>
              </div>
              <ProfileManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}