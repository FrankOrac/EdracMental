import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import StudentDashboardLayout from "./StudentDashboardLayout";
import ProductionCBTInterface from "../exam/ProductionCBTInterface";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  PlayCircle,
  Star,
  Crown,
  ChevronRight,
  Calendar,
  Users,
  Brain,
  Award,
  Zap,
  BarChart3
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  isActive: boolean;
}

interface Exam {
  id: string;
  title: string;
  subjectId: number;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
}

interface StudentStats {
  totalExamsCompleted: number;
  averageScore: number;
  streakDays: number;
  totalStudyTime: number;
  strongSubjects: string[];
  weakSubjects: string[];
  rank: number;
  totalStudents: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export default function CleanStudentDashboard() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<'practice' | 'exam'>('practice');

  // Check if user has premium access
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  // Fetch available subjects - students can only view content created by admin/institutions
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  // Fetch available exams - students can only view public exams created by admin/institutions
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
    weakSubjects: isPremium ? ["English Language"] : ["English Language", "Chemistry"],
    rank: isPremium ? 15 : 45,
    totalStudents: 500
  };

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first practice exam",
      icon: "trophy",
      earned: true,
      earnedDate: "2025-07-20"
    },
    {
      id: "2", 
      title: "Study Streak",
      description: "Study for 7 consecutive days",
      icon: "fire",
      earned: isPremium,
      earnedDate: isPremium ? "2025-07-25" : undefined
    },
    {
      id: "3",
      title: "Math Master",
      description: "Score 90% or higher in Mathematics",
      icon: "brain",
      earned: isPremium,
      earnedDate: isPremium ? "2025-07-28" : undefined
    },
    {
      id: "4",
      title: "Speed Runner", 
      description: "Complete an exam in under 30 minutes",
      icon: "zap",
      earned: false
    }
  ];

  const getSubjectColor = (category: string) => {
    const colors = {
      jamb: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      waec: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", 
      neco: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      gce: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      custom: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    };
    return colors[category as keyof typeof colors] || colors.custom;
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
      <StudentDashboardLayout 
        title={examMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
        subtitle="Complete your exam below"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {examMode === 'practice' ? 'Practice Session' : 'Live Exam'}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setActiveExamId(null)}
            >
              Back to Dashboard
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <ProductionCBTInterface 
              examId={activeExamId} 
              practiceMode={examMode === 'practice'}
              onComplete={() => setActiveExamId(null)}
            />
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout 
      title={`Welcome back, ${user?.firstName || 'Student'}!`}
      subtitle="Ready to continue your learning journey?"
    >
      <div className="space-y-6">
        {/* Premium Banner */}
        {isPremium && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-yellow-800" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Premium Member
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Unlimited access to all features, advanced analytics, and priority support
                  </p>
                </div>
                <Badge className="bg-yellow-400 text-yellow-800 hover:bg-yellow-500">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Exams Completed
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {studentStats.totalExamsCompleted}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {studentStats.averageScore}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {studentStats.streakDays} days
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Class Rank
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    #{studentStats.rank}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Mathematics Practice</p>
                        <p className="text-sm text-gray-500">Scored 92%</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">2h ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">AI Tutor Session</p>
                        <p className="text-sm text-gray-500">Physics concepts</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">1d ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Study Group</p>
                        <p className="text-sm text-gray-500">Chemistry discussion</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">3d ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-between h-12" variant="outline">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-5 w-5" />
                      Start Practice Test
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button className="w-full justify-between h-12" variant="outline">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5" />
                      Chat with AI Tutor
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button className="w-full justify-between h-12" variant="outline">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      Schedule Study Time
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button className="w-full justify-between h-12" variant="outline">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      Join Study Group
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examsLoading ? (
                <p>Loading exams...</p>
              ) : exams.length === 0 ? (
                <p>No exams available</p>
              ) : (
                exams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{exam.title}</h3>
                          <Badge className={getDifficultyColor(exam.difficulty)}>
                            {exam.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {exam.duration} minutes
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {exam.totalQuestions} questions
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setActiveExamId(exam.id);
                              setExamMode('practice');
                            }}
                          >
                            Practice
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setActiveExamId(exam.id);
                              setExamMode('exam');
                            }}
                          >
                            Take Exam
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studentStats.strongSubjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm text-green-600">Strong</span>
                      </div>
                      <Progress value={85 + index * 5} className="h-2" />
                    </div>
                  ))}
                  
                  {studentStats.weakSubjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm text-orange-600">Needs work</span>
                      </div>
                      <Progress value={65 - index * 5} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study Time Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Study Time</span>
                      <span className="font-bold">{studentStats.totalStudyTime}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weekly Average</span>
                      <span className="font-bold">{Math.round(studentStats.totalStudyTime / 4)}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Streak</span>
                      <span className="font-bold">{studentStats.streakDays} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                      : 'opacity-60'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                        achievement.earned 
                          ? 'bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                      
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                      
                      {achievement.earned && (
                        <Badge className="bg-green-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentDashboardLayout>
  );
}