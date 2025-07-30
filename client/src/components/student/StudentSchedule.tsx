import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Bell, 
  Book, 
  Target,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function StudentSchedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const studySchedule = [
    {
      id: "1",
      title: "Mathematics Practice",
      subject: "Mathematics",
      type: "study",
      date: "2025-07-30",
      time: "09:00",
      duration: "2 hours",
      status: "upcoming",
      priority: "high"
    },
    {
      id: "2",
      title: "English Grammar Review",
      subject: "English",
      type: "review",
      date: "2025-07-30",
      time: "14:00",
      duration: "1 hour",
      status: "upcoming",
      priority: "medium"
    },
    {
      id: "3",
      title: "JAMB Mock Exam",
      subject: "Mixed",
      type: "exam",
      date: "2025-07-31",
      time: "10:00",
      duration: "3 hours",
      status: "scheduled",
      priority: "high"
    },
    {
      id: "4",
      title: "Physics Practice Test",
      subject: "Physics",
      type: "practice",
      date: "2025-08-01",
      time: "11:00",
      duration: "1.5 hours",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: "5",
      title: "Study Group Session",
      subject: "Mathematics",
      type: "group",
      date: "2025-08-02",
      time: "16:00",
      duration: "2 hours",
      status: "scheduled",
      priority: "low"
    }
  ];

  const weeklyGoals = [
    {
      title: "Complete 5 practice tests",
      progress: isPremium ? 80 : 60,
      target: 5,
      completed: isPremium ? 4 : 3
    },
    {
      title: "Study 10 hours this week",
      progress: isPremium ? 70 : 50,
      target: 10,
      completed: isPremium ? 7 : 5
    },
    {
      title: "Review 3 subjects",
      progress: isPremium ? 100 : 67,
      target: 3,
      completed: isPremium ? 3 : 2
    }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      study: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      review: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      exam: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      practice: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      group: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
    };
    return colors[type as keyof typeof colors] || colors.study;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "border-l-red-400",
      medium: "border-l-yellow-400",
      low: "border-l-green-400"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      study: Book,
      review: Target,
      exam: CalendarDays,
      practice: Clock,
      group: Calendar
    };
    const Icon = icons[type as keyof typeof icons] || Book;
    return <Icon className="h-4 w-4" />;
  };

  const todaySchedule = studySchedule.filter(item => item.date === "2025-07-30");
  const upcomingSchedule = studySchedule.filter(item => item.date > "2025-07-30");

  return (
    <StudentDashboardLayout title="Study Schedule" subtitle="Plan and track your learning sessions">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Study Session
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Set Reminder
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No sessions scheduled for today</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Study Session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((session) => (
                  <div 
                    key={session.id} 
                    className={`border-l-4 ${getPriorityColor(session.priority)} bg-white dark:bg-gray-800 p-4 rounded-lg border`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(session.type)}
                          <h3 className="font-semibold">{session.title}</h3>
                          <Badge className={getTypeColor(session.type)}>
                            {session.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Subject: {session.subject}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.time}
                          </span>
                          <span>{session.duration}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">Start</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.completed}/{goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {goal.progress}% complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedule.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {new Date(session.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(session.type)}
                        <h4 className="font-semibold">{session.title}</h4>
                        <Badge className={getTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.subject} • {session.time} • {session.duration}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Study Tips for Better Scheduling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Best Practices</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Schedule study sessions during your peak energy hours</li>
                  <li>• Take 15-minute breaks every hour</li>
                  <li>• Review difficult topics multiple times</li>
                  <li>• Set realistic daily goals</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Time Management</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Use the Pomodoro Technique (25-min focus sessions)</li>
                  <li>• Prioritize high-importance subjects</li>
                  <li>• Plan exam practice closer to test dates</li>
                  <li>• Allow buffer time for unexpected delays</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}