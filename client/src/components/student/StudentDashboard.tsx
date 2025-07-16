import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RobustAITutor from "@/components/ai/RobustAITutor";
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
  MessageSquare
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAITutor, setShowAITutor] = useState(false);

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

  if (statsLoading || subjectsLoading || examsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    totalExams: 0,
    averageScore: 0,
    studyTime: 0,
    recentSessions: [],
    ...(userStats || {})
  };

  const availableExams = (exams || []).filter((exam: any) => exam.isActive && exam.isPublic) || [];
  const completedExams = stats.recentSessions?.length || 0;
  const progressPercentage = Math.min((completedExams / Math.max(availableExams.length, 1)) * 100, 100);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {(user as any)?.firstName || 'Student'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ready to continue your learning journey? Let's ace those exams!
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
                Exams
              </TabsTrigger>
              <TabsTrigger 
                value="subjects" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Brain className="h-4 w-4" />
                Subjects
              </TabsTrigger>
              <TabsTrigger 
                value="practice" 
                className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Target className="h-4 w-4" />
                Practice
              </TabsTrigger>
              <TabsTrigger 
                value="ai-tutor" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                AI Tutor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Exams</p>
                          <p className="text-3xl font-bold">{availableExams.length}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Completed</p>
                          <p className="text-3xl font-bold">{completedExams}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Average Score</p>
                          <p className="text-3xl font-bold">{stats.averageScore}%</p>
                        </div>
                        <Trophy className="h-8 w-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Study Time</p>
                          <p className="text-3xl font-bold">{stats.studyTime}h</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Progress Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Exam Completion</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      {stats.recentSessions && stats.recentSessions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Recent Sessions</h4>
                          <div className="space-y-2">
                            {stats.recentSessions.slice(0, 5).map((session: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <p className="font-medium">{session.examTitle}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(session.completedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant={session.score >= 70 ? "default" : "destructive"}>
                                  {session.score}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/practice">
                        <Button className="w-full justify-start" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Practice Questions
                        </Button>
                      </Link>
                      <Link href="/exam">
                        <Button className="w-full justify-start" variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Take Exam
                        </Button>
                      </Link>
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Study
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setActiveTab("ai-tutor")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        AI Tutor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="exams" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableExams.map((exam: any) => (
                      <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{exam.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {exam.description}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline">{exam.duration} min</Badge>
                            <span className="text-sm text-gray-500">
                              {exam.questionCount} questions
                            </span>
                          </div>
                          <Link href={`/exam/${exam.id}`}>
                            <Button className="w-full" size="sm">
                              Start Exam
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(subjects || []).map((subject: any) => (
                      <Card key={subject.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{subject.name}</h3>
                              <p className="text-sm text-gray-500">{subject.code}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {subject.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{subject.category}</Badge>
                            <Link href={`/practice?subject=${subject.id}`}>
                              <Button size="sm" variant="outline">
                                Practice
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Practice Questions</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Sharpen your skills with practice questions across various subjects
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/practice">
                        <Button size="lg">
                          <Play className="h-5 w-5 mr-2" />
                          Start Practice Session
                        </Button>
                      </Link>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => setActiveTab("ai-tutor")}
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Chat with AI Tutor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-tutor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-500" />
                    AI Tutor - 24/7 Learning Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get instant help with your studies! Ask questions about any topic, get explanations, 
                      examples, and personalized guidance from our AI tutor.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4 text-center">
                          <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Smart Explanations</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get step-by-step explanations for complex topics
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="p-4 text-center">
                          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Practice Guidance</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive hints and tips for solving problems
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">24/7 Available</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Study anytime with instant responses
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <RobustAITutor
                    context="Student dashboard - general tutoring"
                    userId={(user as any)?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}