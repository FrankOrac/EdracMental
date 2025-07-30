import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  BookOpen,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function StudentProgress() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const progressData = {
    overall: isPremium ? 85 : 68,
    mathematics: isPremium ? 92 : 75,
    english: isPremium ? 88 : 70,
    physics: isPremium ? 79 : 62,
    weeklyGoal: isPremium ? 95 : 80,
    monthlyTarget: isPremium ? 88 : 72
  };

  const weeklyStats = [
    { day: "Mon", score: isPremium ? 85 : 70, time: isPremium ? 120 : 90 },
    { day: "Tue", score: isPremium ? 78 : 65, time: isPremium ? 100 : 75 },
    { day: "Wed", score: isPremium ? 92 : 80, time: isPremium ? 140 : 110 },
    { day: "Thu", score: isPremium ? 89 : 72, time: isPremium ? 130 : 95 },
    { day: "Fri", score: isPremium ? 95 : 85, time: isPremium ? 150 : 120 },
    { day: "Sat", score: isPremium ? 87 : 68, time: isPremium ? 180 : 140 },
    { day: "Sun", score: isPremium ? 90 : 75, time: isPremium ? 160 : 125 }
  ];

  const achievements = [
    {
      title: "Study Streak",
      description: "7 days in a row",
      achieved: isPremium,
      icon: Calendar,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Math Master", 
      description: "90% average in Math",
      achieved: isPremium,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Speed Runner",
      description: "Completed 50 questions",
      achieved: true,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Perfect Score",
      description: "100% on any exam",
      achieved: isPremium,
      icon: Award,
      color: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  const improvementAreas = [
    {
      subject: "Physics",
      currentScore: isPremium ? 79 : 62,
      improvement: isPremium ? "+15%" : "+8%",
      recommendation: "Focus on mechanics and thermodynamics"
    },
    {
      subject: "Mathematics",
      currentScore: isPremium ? 92 : 75,
      improvement: isPremium ? "+12%" : "+5%",
      recommendation: "Continue practicing calculus problems"
    },
    {
      subject: "English",
      currentScore: isPremium ? 88 : 70,
      improvement: isPremium ? "+8%" : "+3%",
      recommendation: "Work on comprehension and vocabulary"
    }
  ];

  return (
    <StudentDashboardLayout title="My Progress" subtitle="Track your learning journey and achievements">
      <div className="space-y-6">
        {/* Overall Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {progressData.overall}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Weekly Goal
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {progressData.weeklyGoal}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {progressData.monthlyTarget}%
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Study Hours
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {isPremium ? 42 : 28}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mathematics</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {progressData.mathematics}%
                  </span>
                </div>
                <Progress value={progressData.mathematics} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Excellent performance</span>
                  <span className="text-green-600 dark:text-green-400">↗ +12%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">English Language</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {progressData.english}%
                  </span>
                </div>
                <Progress value={progressData.english} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Good progress</span>
                  <span className="text-green-600 dark:text-green-400">↗ +8%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Physics</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {progressData.physics}%
                  </span>
                </div>
                <Progress value={progressData.physics} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Needs improvement</span>
                  <span className="text-green-600 dark:text-green-400">↗ +15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weeklyStats.map((day, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day.day}
                  </div>
                  <div 
                    className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                    style={{ height: `${Math.max(day.score, 30)}px` }}
                  >
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {day.score}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.time}min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border text-center ${
                    achievement.achieved 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    achievement.achieved ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <achievement.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  {achievement.achieved && (
                    <Badge className="mt-2 bg-green-500 text-white">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{area.subject}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {area.recommendation}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{area.currentScore}%</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {area.improvement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}