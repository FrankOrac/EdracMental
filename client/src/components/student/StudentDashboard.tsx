import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Trophy, 
  Play, 
  Brain,
  ChevronRight,
  Calendar,
  Target
} from "lucide-react";

interface UserStats {
  totalExams: number;
  averageScore: number;
  studyTime: number;
  recentSessions: any[];
}

export default function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/analytics/user"],
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: exams } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
  });

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    {
      title: "Take JAMB Practice",
      description: "Start a timed JAMB practice test",
      icon: Play,
      color: "from-blue-500 to-blue-600",
      action: () => window.location.href = "/exam/jamb-practice"
    },
    {
      title: "Ask AI Tutor",
      description: "Get help from our AI tutor",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      action: () => {} // Will open AI tutor modal
    },
    {
      title: "Study Plan",
      description: "View your personalized study plan",
      icon: Target,
      color: "from-green-500 to-green-600",
      action: () => {}
    }
  ];

  const upcomingExams = [
    {
      title: "WAEC Mock Exam",
      date: "Tomorrow, 10:00 AM",
      subjects: ["Mathematics", "English", "Physics"],
      type: "mock"
    },
    {
      title: "JAMB Practice Test",
      date: "Friday, 2:00 PM",
      subjects: ["Mathematics", "English", "Physics", "Chemistry"],
      type: "practice"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Ready to continue your learning journey?</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Play className="mr-2 h-4 w-4" />
              Quick Practice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats?.totalExams || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  +3 this week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round(userStats?.averageScore || 0)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  +5% improvement
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Time</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats?.studyTime || 24}h
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  This month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  3 new
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Quick Start</CardTitle>
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

            {/* Subject Progress */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Subject Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mathematics</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">English Language</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Physics</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chemistry</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats?.recentSessions?.slice(0, 5).map((session, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Completed exam session
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Score: {session.percentage?.toFixed(0)}% • {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Start taking tests to see your progress here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Exams */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingExams.map((exam, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      exam.type === "mock" 
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500" 
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    }`}>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{exam.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{exam.date}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exam.subjects.map((subject, subjectIndex) => (
                          <Badge key={subjectIndex} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Study Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">7</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days in a row</p>
                  <div className="grid grid-cols-7 gap-1 mt-4">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications?.slice(0, 3).map((notification: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
