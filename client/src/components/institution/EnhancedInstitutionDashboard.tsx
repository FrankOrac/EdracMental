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
import UserManagement from "@/components/admin/UserManagement";
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
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="exams" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Exams
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Subjects
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Study Groups
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

              <UserManagement />
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
              <QuestionManager />
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Subject & Topic Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Organize your curriculum structure</p>
                </div>
              </div>
              <CategoryTopicManager />
            </TabsContent>

            {/* Study Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Study Groups Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage collaborative study groups for your students</p>
                </div>
              </div>
              <StudyGroupsManager />
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