import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Camera,
  Trophy,
  Target,
  BookOpen,
  Clock,
  Crown,
  Star
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function StudentProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const profileStats = {
    totalExams: isPremium ? 24 : 12,
    averageScore: isPremium ? 92 : 78,
    studyHours: isPremium ? 156 : 89,
    rank: isPremium ? 3 : 15,
    achievements: isPremium ? 8 : 4,
    streakDays: isPremium ? 15 : 7
  };

  const recentAchievements = [
    {
      title: "Math Master",
      description: "Scored 90%+ in Mathematics",
      icon: Target,
      earned: isPremium,
      date: "2025-07-25"
    },
    {
      title: "Perfect Score",
      description: "100% on English exam",
      icon: Trophy,
      earned: isPremium,
      date: "2025-07-22"
    },
    {
      title: "Study Streak",
      description: "7 consecutive days",
      icon: Calendar,
      earned: true,
      date: "2025-07-20"
    },
    {
      title: "Speed Runner",
      description: "Completed exam in record time",
      icon: Clock,
      earned: isPremium,
      date: "2025-07-18"
    }
  ];

  const subjectProgress = [
    { subject: "Mathematics", progress: isPremium ? 92 : 75, color: "bg-blue-500" },
    { subject: "English", progress: isPremium ? 88 : 70, color: "bg-green-500" },
    { subject: "Physics", progress: isPremium ? 79 : 62, color: "bg-purple-500" },
    { subject: "Chemistry", progress: isPremium ? 85 : 68, color: "bg-red-500" }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <StudentDashboardLayout title="My Profile" subtitle="View and manage your account information">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl">
                    {getInitials(user?.name || 'Student User')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{user?.name || 'Student User'}</h2>
                      {isPremium && (
                        <Badge className="bg-yellow-400 text-yellow-800 hover:bg-yellow-500">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <p className="text-sm text-gray-500">Member since July 2025</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Input placeholder="Full Name" defaultValue={user?.name} />
                    <Input placeholder="Email" defaultValue={user?.email} />
                    <Input placeholder="Phone Number" />
                    <Input placeholder="Location" />
                    <div className="md:col-span-2 flex gap-2">
                      <Button size="sm">Save Changes</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{profileStats.totalExams}</div>
              <div className="text-xs text-gray-500">Exams Taken</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">{profileStats.averageScore}%</div>
              <div className="text-xs text-gray-500">Average Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">{profileStats.studyHours}h</div>
              <div className="text-xs text-gray-500">Study Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold">#{profileStats.rank}</div>
              <div className="text-xs text-gray-500">Class Rank</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold">{profileStats.achievements}</div>
              <div className="text-xs text-gray-500">Achievements</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold">{profileStats.streakDays}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <span className="text-sm font-medium">{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAchievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border flex items-center gap-4 ${
                    achievement.earned 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <achievement.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Account Type</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isPremium ? 'Premium Student' : 'Free Student'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">July 2025</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-4">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Privacy Settings</Button>
                <Button variant="outline">Download Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}