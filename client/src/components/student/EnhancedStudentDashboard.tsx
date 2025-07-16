import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  BarChart3, 
  Brain, 
  Target,
  Play,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Star,
  Plus,
  FileText,
  Zap,
  Users,
  Building,
  GraduationCap,
  Settings,
  PlusCircle,
  Filter,
  Search
} from "lucide-react";

export default function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  const { data: institutions } = useQuery({
    queryKey: ["/api/institutions"],
    retry: false,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return await apiRequest("POST", "/api/exams", examData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Exam Created",
        description: "Your custom exam has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (statsLoading || subjectsLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = {
    totalExams: 0,
    averageScore: 0,
    studyTime: 0,
    recentSessions: [],
    ...userStats
  };

  const availableExams = exams?.filter(exam => exam.isActive && (exam.isPublic || exam.createdBy === user?.id || exam.institutionId === user?.institutionId)) || [];
  const completedExams = stats.recentSessions?.length || 0;
  const progressPercentage = Math.min((completedExams / Math.max(availableExams.length, 1)) * 100, 100);

  // Filter exams based on selection
  const filteredExams = availableExams.filter(exam => {
    if (selectedSubject !== "all" && !exam.subjects?.includes(selectedSubject)) return false;
    if (selectedDifficulty !== "all" && exam.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleCreateCustomExam = async (subjectId: string, topicIds: string[], difficulty: string) => {
    try {
      const examData = {
        title: `Custom ${subjects?.find(s => s.id === parseInt(subjectId))?.name} Exam`,
        description: `Custom practice exam created by ${user?.firstName}`,
        duration: 60, // 1 hour default
        totalQuestions: 20,
        subjects: [subjects?.find(s => s.id === parseInt(subjectId))?.name],
        difficulty,
        examCategory: "custom",
        instructions: "Answer all questions to the best of your ability. Good luck!",
        isPublic: false,
        isActive: true,
        institutionId: user?.institutionId || null,
      };

      await createExamMutation.mutateAsync(examData);
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EDRAC CBT Platform</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student Dashboard
                  {user?.institutionId && (
                    <>
                      <span className="text-gray-300">•</span>
                      <Building className="h-4 w-4" />
                      <span>Institution Member</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.institutionId ? "Institution Connected" : "Direct Access"}
                </span>
              </div>
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {user?.subscriptionPlan || 'Free'} Plan
                  </div>
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
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Ready to continue your learning journey? Let's ace those exams! 🚀
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="exams" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Available Exams
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Create Exam
            </TabsTrigger>
            <TabsTrigger 
              value="practice" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Brain className="h-4 w-4" />
              CBT Practice
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              My Progress
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                        <p className="text-blue-100">Total Exams Taken</p>
                        <p className="text-3xl font-bold">{completedExams}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
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
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Study Time</p>
                        <p className="text-3xl font-bold">{Math.round((stats.studyTime || 0) / 60)}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-200" />
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
                        <p className="text-orange-100">Available Exams</p>
                        <p className="text-3xl font-bold">{availableExams.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Exam Completion Progress</span>
                    <span className="text-sm text-gray-500">{completedExams}/{availableExams.length} exams</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've completed {progressPercentage.toFixed(1)}% of available exams. Keep going!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentSessions?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSessions.slice(0, 5).map((session: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{session.examTitle || "Exam"}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.startTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{session.score || 0}%</p>
                          <Badge variant={session.score >= 70 ? "default" : "secondary"}>
                            {session.score >= 70 ? "Passed" : "Review"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent exam sessions found.</p>
                    <p className="text-sm text-gray-400 mt-2">Start taking exams to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters:</span>
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Exam Grid */}
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
                        <Badge variant={exam.difficulty === "hard" ? "destructive" : exam.difficulty === "medium" ? "default" : "secondary"}>
                          {exam.difficulty}
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
                      <Link href={`/exam/${exam.id}`}>
                        <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No exams found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No exams match your current filters. Try adjusting your criteria.
                  </p>
                  <Button onClick={() => {
                    setSelectedSubject("all");
                    setSelectedDifficulty("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Exam Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Custom Exam
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your own practice exams from available subjects and topics.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects?.map((subject: any) => (
                    <Card key={subject.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <p className="text-sm text-gray-600">{subject.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Select
                            onValueChange={(difficulty) => 
                              handleCreateCustomExam(subject.id.toString(), [], difficulty)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy (20 questions)</SelectItem>
                              <SelectItem value="medium">Medium (30 questions)</SelectItem>
                              <SelectItem value="hard">Hard (40 questions)</SelectItem>
                              <SelectItem value="mixed">Mixed (50 questions)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CBT Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  CBT Practice Mode
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Practice with instant feedback, explanations, and AI assistance.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjects?.slice(0, 6).map((subject: any) => (
                    <Card key={subject.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {subject.name} Practice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Practice with immediate feedback and AI explanations
                          </p>
                          <div className="flex gap-2">
                            <Link href={`/practice/${subject.id}?mode=instant`} className="flex-1">
                              <Button className="w-full" variant="outline">
                                <Zap className="h-4 w-4 mr-2" />
                                Instant Feedback
                              </Button>
                            </Link>
                            <Link href={`/practice/${subject.id}?mode=ai`} className="flex-1">
                              <Button className="w-full">
                                <Brain className="h-4 w-4 mr-2" />
                                AI Tutor
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievement Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "First Exam", description: "Complete your first exam", earned: completedExams > 0 },
                      { name: "High Scorer", description: "Score above 80% in an exam", earned: stats.averageScore > 80 },
                      { name: "Study Streak", description: "Study for 5 consecutive days", earned: false },
                      { name: "Subject Master", description: "Excel in all subjects", earned: false },
                    ].map((achievement, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.earned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {achievement.earned ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects?.slice(0, 5).map((subject: any) => {
                      const performance = Math.floor(Math.random() * 40) + 60; // Mock data
                      return (
                        <div key={subject.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{subject.name}</span>
                            <span className="text-sm text-gray-600">{performance}%</span>
                          </div>
                          <Progress value={performance} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}