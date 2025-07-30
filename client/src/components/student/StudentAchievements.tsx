import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Crown, Zap, Target, BookOpen } from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function StudentAchievements() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const achievements = [
    {
      id: "1",
      title: "First Exam Completed",
      description: "Successfully complete your first exam",
      icon: "trophy",
      earned: true,
      earnedDate: "2025-07-20"
    },
    {
      id: "2", 
      title: "Perfect Score",
      description: "Score 100% on any exam",
      icon: "crown",
      earned: isPremium,
      earnedDate: isPremium ? "2025-07-25" : undefined
    },
    {
      id: "3",
      title: "Math Master",
      description: "Score 90% or higher in Mathematics",
      icon: "target",
      earned: isPremium,
      earnedDate: isPremium ? "2025-07-28" : undefined
    },
    {
      id: "4",
      title: "Speed Runner",
      description: "Complete an exam in under 30 minutes",
      icon: "zap",
      earned: false
    },
    {
      id: "5",
      title: "Study Streak",
      description: "Practice for 7 consecutive days",
      icon: "book",
      earned: isPremium,
      earnedDate: isPremium ? "2025-07-22" : undefined
    },
    {
      id: "6",
      title: "English Excellence",
      description: "Score 85% or higher in English",
      icon: "award",
      earned: true,
      earnedDate: "2025-07-26"
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      trophy: Trophy,
      crown: Crown,
      target: Target,
      zap: Zap,
      book: BookOpen,
      award: Award
    };
    const Icon = icons[iconName as keyof typeof icons] || Trophy;
    return <Icon className="h-8 w-8 text-white" />;
  };

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <StudentDashboardLayout title="Achievements" subtitle="Track your learning milestones">
      <div className="space-y-6">
        {/* Achievement Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {earnedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Achievements Earned
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((earnedCount / achievements.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {achievements.length - earnedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining Goals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
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
                    {getIcon(achievement.icon)}
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
      </div>
    </StudentDashboardLayout>
  );
}