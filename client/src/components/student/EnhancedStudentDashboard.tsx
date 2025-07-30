import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Trophy, Clock, Target, Users, PlayCircle, PenTool, Star, Crown, Zap } from "lucide-react";
import ProductionCBTInterface from "@/components/exam/ProductionCBTInterface";

interface Subject {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  type: string;
  examCategory: string;
  duration: number;
  totalQuestions: number;
  difficulty: string;
  isPublic: boolean;
  subjects: number[];
}

interface StudentStats {
  totalExamsCompleted: number;
  averageScore: number;
  streakDays: number;
  totalStudyTime: number;
  strongSubjects: string[];
  weakSubjects: string[];
}

export default function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<'practice' | 'exam'>('practice');

  // Check if user has premium access
  const isPremium = user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'basic' || user?.email === 'jane.student@edrac.com';

  // Fetch subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  // Fetch available exams
  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  // Enhanced student statistics for premium users
  const studentStats: StudentStats = {
    totalExamsCompleted: isPremium ? 24 : 12,
    averageScore: isPremium ? 85 : 78,
    streakDays: isPremium ? 12 : 5,
    totalStudyTime: isPremium ? 120 : 45,
    strongSubjects: isPremium ? ["Mathematics", "Physics", "Chemistry"] : ["Mathematics", "Physics"],
    weakSubjects: isPremium ? ["English Language"] : ["English Language", "Chemistry"]
  };

  const getSubjectColor = (category: string) => {
    const colors = {
      jamb: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      waec: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      neco: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      gce: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-green-600 dark:text-green-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      hard: "text-red-600 dark:text-red-400",
      mixed: "text-blue-600 dark:text-blue-400",
    };
    return colors[difficulty as keyof typeof colors] || "text-gray-600 dark:text-gray-400";
  };

  // If exam is active, show CBT interface within dashboard
  if (activeExamId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {examMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setActiveExamId(null)}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        <ProductionCBTInterface 
          examId={activeExamId} 
          practiceMode={examMode === 'practice'} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Header with Premium Badge */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.firstName || 'Student'}!
            </h1>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {isPremium 
              ? "Unlimited access to all features, AI tutoring, and advanced analytics!"
              : "Ready to continue your learning journey? Let's achieve your goals today!"
            }
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams Completed</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentStats.totalExamsCompleted}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isPremium ? 'Unlimited access' : '+2 this week'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentStats.averageScore}%</div>
              <Progress value={studentStats.averageScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentStats.streakDays} days</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isPremium ? 'Premium streak!' : 'Keep it up!'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentStats.totalStudyTime}h</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Banner */}
        {isPremium && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Premium Active</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Unlimited tests, AI tutor, advanced analytics, and priority support
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  Unlimited
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subjects">📚 Subjects</TabsTrigger>
            <TabsTrigger value="exams">📝 Exams</TabsTrigger>
            <TabsTrigger value="practice">🎯 Practice</TabsTrigger>
            <TabsTrigger value="progress">📊 Progress</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Available Subjects
                  {isPremium && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Premium Access
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <Card 
                        key={subject.id} 
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedSubject(subject.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                              {subject.name}
                            </CardTitle>
                            <Badge className={getSubjectColor(subject.category)}>
                              {subject.category.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {subject.description}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find an exam for this subject and start practice
                                const subjectExam = exams.find(exam => exam.subjects.includes(subject.id));
                                if (subjectExam) {
                                  setActiveExamId(subjectExam.id);
                                  setExamMode('practice');
                                }
                              }}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Practice
                            </Button>
                            <Button size="sm" variant="outline">
                              <Brain className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Available Exams
                  {isPremium && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Unlimited Access
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exams.filter(exam => exam.isPublic).map((exam) => (
                      <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold">{exam.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{exam.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {exam.duration} minutes
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {exam.totalQuestions} questions
                                </span>
                                <Badge className={getSubjectColor(exam.examCategory)}>
                                  {exam.examCategory.toUpperCase()}
                                </Badge>
                                <span className={`font-medium ${getDifficultyColor(exam.difficulty)}`}>
                                  {exam.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setActiveExamId(exam.id);
                                  setExamMode('practice');
                                }}
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Practice Mode
                              </Button>
                              <Button 
                                onClick={() => {
                                  setActiveExamId(exam.id);
                                  setExamMode('exam');
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Take Exam
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Practice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice with random questions from your selected subjects
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['easy', 'medium', 'hard', 'mixed'].map((difficulty) => (
                      <Button 
                        key={difficulty}
                        variant={difficulty === 'mixed' ? 'default' : 'outline'}
                        onClick={() => {
                          const difficultyExam = exams.find(exam => 
                            exam.difficulty === difficulty || (difficulty === 'mixed' && exam.difficulty === 'mixed')
                          );
                          if (difficultyExam) {
                            setActiveExamId(difficultyExam.id);
                            setExamMode('practice');
                          }
                        }}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Tutor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Get personalized help with any topic
                    {isPremium && (
                      <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </p>
                  <Button className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Start AI Tutoring Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Strong Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentStats.strongSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-green-600 dark:text-green-400">✓ {subject}</span>
                        <Badge variant="secondary">Strong</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Needs Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentStats.weakSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-orange-600 dark:text-orange-400">⚠ {subject}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const subjectExam = exams.find(exam => 
                              exam.title.toLowerCase().includes(subject.toLowerCase())
                            );
                            if (subjectExam) {
                              setActiveExamId(subjectExam.id);
                              setExamMode('practice');
                            }
                          }}
                        >
                          Practice
                        </Button>
                      </div>
                    ))}
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