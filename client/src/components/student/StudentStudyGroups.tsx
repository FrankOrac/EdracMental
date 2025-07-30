import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Search, 
  MessageCircle, 
  Calendar,
  BookOpen,
  Target,
  Clock,
  MapPin,
  Crown,
  Star
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function StudentStudyGroups() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const myGroups = [
    {
      id: "1",
      name: "JAMB Mathematics Prep",
      subject: "Mathematics",
      members: isPremium ? 12 : 8,
      maxMembers: 15,
      nextSession: "2025-07-31 14:00",
      isAdmin: isPremium,
      level: "Advanced",
      activity: "High"
    },
    {
      id: "2",
      name: "English Grammar Masters",
      subject: "English",
      members: isPremium ? 9 : 6,
      maxMembers: 12,
      nextSession: "2025-08-01 16:00",
      isAdmin: false,
      level: "Intermediate",
      activity: "Medium"
    }
  ];

  const recommendedGroups = [
    {
      id: "3",
      name: "Physics Problem Solvers",
      subject: "Physics",
      members: 7,
      maxMembers: 10,
      rating: 4.8,
      level: "Beginner",
      description: "Perfect for those starting with physics concepts",
      meetingSchedule: "Tuesdays & Thursdays, 3:00 PM"
    },
    {
      id: "4",
      name: "WAEC All Subjects Hub",
      subject: "Mixed",
      members: 15,
      maxMembers: 20,
      rating: 4.9,
      level: "All Levels",
      description: "Comprehensive WAEC preparation across all subjects",
      meetingSchedule: "Daily study sessions, flexible timing"
    },
    {
      id: "5",
      name: "Chemistry Lab Sessions",
      subject: "Chemistry",
      members: 5,
      maxMembers: 8,
      rating: 4.7,
      level: "Advanced",
      description: "Focus on practical chemistry and lab techniques",
      meetingSchedule: "Weekends, 10:00 AM"
    }
  ];

  const studyTips = [
    {
      icon: Target,
      title: "Set Group Goals",
      description: "Work together towards common objectives like exam scores"
    },
    {
      icon: Calendar,
      title: "Regular Meetings",
      description: "Consistency is key - schedule regular study sessions"
    },
    {
      icon: MessageCircle,
      title: "Active Discussion",
      description: "Share knowledge and ask questions freely"
    },
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Pool study materials and past questions together"
    }
  ];

  const getSubjectColor = (subject: string) => {
    const colors = {
      Mathematics: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      English: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      Physics: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      Chemistry: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      Mixed: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    };
    return colors[subject as keyof typeof colors] || colors.Mixed;
  };

  const getActivityColor = (activity: string) => {
    const colors = {
      High: "text-green-600 dark:text-green-400",
      Medium: "text-yellow-600 dark:text-yellow-400",
      Low: "text-red-600 dark:text-red-400"
    };
    return colors[activity as keyof typeof colors] || colors.Medium;
  };

  return (
    <StudentDashboardLayout title="Study Groups" subtitle="Learn together with fellow students">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap items-center">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* My Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Study Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't joined any study groups yet</p>
                <Button>Find Study Groups</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myGroups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          {group.isAdmin && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <Badge className={getSubjectColor(group.subject)}>
                            {group.subject}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.members}/{group.maxMembers} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {group.level}
                          </span>
                          <span className={`flex items-center gap-1 ${getActivityColor(group.activity)}`}>
                            Activity: {group.activity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Next session: </span>
                        <span className="font-medium">
                          {new Date(group.nextSession).toLocaleDateString()} at{' '}
                          {new Date(group.nextSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{group.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{group.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {group.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <Badge className={getSubjectColor(group.subject)}>
                        {group.subject}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.members}/{group.maxMembers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {group.level}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {group.meetingSchedule}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Join Group
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Group Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Study Group Success Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {studyTips.map((tip, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <tip.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold">{tip.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}