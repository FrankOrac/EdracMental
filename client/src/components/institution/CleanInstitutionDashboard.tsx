import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  GraduationCap,
  Building,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Trash2,
  UserPlus,
  FileText,
  Clock,
  Target,
  Search,
  Filter,
  Share2,
  Play,
  Pause,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  subjects: string[];
  difficulty: string;
  examCategory: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function CleanInstitutionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examPreviewOpen, setExamPreviewOpen] = useState(false);
  const [createExamOpen, setCreateExamOpen] = useState(false);

  // Queries
  const { data: institutionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/institution"],
    retry: false,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/institutions/students"],
    retry: false,
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["/api/institutions/exams"],
    retry: false,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: allExams = [] } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  // Filter exams
  const filteredExams = (allExams as Exam[]).filter((exam: Exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && exam.isActive) ||
      (filterStatus === "inactive" && !exam.isActive);
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = institutionStats || { totalStudents: 0, totalExams: 0, averageScore: 0 };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Institution Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Welcome back, {(user as any)?.firstName} {(user as any)?.lastName}
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {(user as any)?.subscriptionPlan || 'Free'} Plan
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Students</p>
                  <p className="text-2xl font-bold">{(students as any[]).length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Exams</p>
                  <p className="text-2xl font-bold">{(allExams as any[]).length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Exams</p>
                  <p className="text-2xl font-bold">{(allExams as Exam[]).filter((e: Exam) => e.isActive).length}</p>
                </div>
                <Play className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Subjects</p>
                  <p className="text-2xl font-bold">{(subjects as any[]).length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Exams */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recent Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(allExams as Exam[]).slice(0, 5).map((exam: Exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{exam.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {exam.duration} min • {exam.totalQuestions} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={exam.isActive ? "default" : "secondary"}>
                            {exam.isActive ? "Active" : "Draft"}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedExam(exam);
                              setExamPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(allExams as any[]).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No exams created yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setCreateExamOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Exam
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Students
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Questions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            {/* Exam Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Exam Management</h3>
                <p className="text-slate-600 dark:text-slate-400">Create and manage exams for your students</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreateExamOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              </div>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam: Exam, index: number) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{exam.title}</CardTitle>
                        <Badge variant={exam.isActive ? "default" : "secondary"}>
                          {exam.isActive ? "Active" : "Draft"}
                        </Badge>
                      </div>
                      {exam.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span>{exam.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-slate-500" />
                            <span className="capitalize">{exam.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-500" />
                            <span className="uppercase">{exam.examCategory}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedExam(exam);
                              setExamPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No exams found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchTerm ? "No exams match your search criteria" : "Create your first exam to start testing students"}
                  </p>
                  <Button onClick={() => setCreateExamOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Exam
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  Student management features coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  Analytics features coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Exam Preview Dialog */}
        <ExamPreviewDialog 
          exam={selectedExam}
          open={examPreviewOpen}
          onOpenChange={setExamPreviewOpen}
        />

        {/* Create Exam Dialog */}
        <CreateExamDialog 
          open={createExamOpen}
          onOpenChange={setCreateExamOpen}
          subjects={subjects}
        />
      </div>
    </DashboardLayout>
  );
}

// Exam Preview Dialog Component
function ExamPreviewDialog({ exam, open, onOpenChange }: { 
  exam: Exam | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) {
  if (!exam) return null;

  const shareUrl = `${window.location.origin}/share/exam/${exam.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Exam Preview
          </DialogTitle>
          <DialogDescription>
            Preview exam details and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{exam.title}</h3>
                {exam.description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-2">{exam.description}</p>
                )}
              </div>
              <Badge variant={exam.isActive ? "default" : "secondary"}>
                {exam.isActive ? "Active" : "Draft"}
              </Badge>
            </div>
          </div>

          {/* Exam Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-semibold">{exam.duration}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Minutes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-semibold">{exam.totalQuestions}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-semibold capitalize">{exam.difficulty}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Difficulty</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-semibold uppercase">{exam.examCategory}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Category</div>
            </div>
          </div>

          {/* Subjects */}
          {exam.subjects && exam.subjects.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Subjects Covered</h4>
              <div className="flex flex-wrap gap-2">
                {exam.subjects.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline">{subject}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Share Options */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Share Exam</h4>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyShareLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Exam
            </Button>
            <Button variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            {exam.isActive ? (
              <Button variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            ) : (
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Exam Dialog Component
function CreateExamDialog({ open, onOpenChange, subjects }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  subjects: any[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    totalQuestions: 20,
    difficulty: "medium",
    examCategory: "jamb",
    subjectIds: [] as string[],
    isActive: true,
    isPublic: true,
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/exams", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/exams"] });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        duration: 60,
        totalQuestions: 20,
        difficulty: "medium",
        examCategory: "jamb",
        subjectIds: [],
        isActive: true,
        isPublic: true,
      });
      toast({
        title: "Exam Created",
        description: "Your exam has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExamMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Set up a new examination for your students
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., JAMB Mathematics Practice Test"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the exam"
                rows={3}
              />
            </div>
          </div>

          {/* Exam Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="1"
                max="300"
                required
              />
            </div>

            <div>
              <Label htmlFor="totalQuestions">Number of Questions</Label>
              <Input
                id="totalQuestions"
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                min="1"
                max="200"
                required
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="examCategory">Exam Category</Label>
              <Select 
                value={formData.examCategory} 
                onValueChange={(value) => setFormData({ ...formData, examCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamb">JAMB</SelectItem>
                  <SelectItem value="waec">WAEC</SelectItem>
                  <SelectItem value="neco">NECO</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subjects Selection */}
          <div>
            <Label>Subjects (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {(subjects as any[]).map((subject: any) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={formData.subjectIds.includes(subject.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          subjectIds: [...formData.subjectIds, subject.id.toString()]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          subjectIds: formData.subjectIds.filter(id => id !== subject.id.toString())
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Activate Immediately</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Students can take this exam right after creation
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublic">Make Public</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Allow sharing via public link
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createExamMutation.isPending} className="flex-1">
              {createExamMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Exam
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}