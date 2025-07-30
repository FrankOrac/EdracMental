import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Clock, CheckCircle, PlayCircle } from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Subject {
  id: number;
  name: string;
  code: string;
  category: string;
  description: string;
  isActive: boolean;
}

export default function StudentSubjects() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const subjectProgress = [
    { subjectId: 1, progress: isPremium ? 85 : 65, questionsCompleted: isPremium ? 25 : 18, totalQuestions: 30 },
    { subjectId: 2, progress: isPremium ? 92 : 72, questionsCompleted: isPremium ? 28 : 22, totalQuestions: 30 },
    { subjectId: 3, progress: isPremium ? 78 : 58, questionsCompleted: isPremium ? 20 : 15, totalQuestions: 26 }
  ];

  const getSubjectProgress = (subjectId: number) => {
    return subjectProgress.find(p => p.subjectId === subjectId) || 
           { progress: 0, questionsCompleted: 0, totalQuestions: 0 };
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      jamb: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      waec: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      neco: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      gce: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
    };
    return colors[category as keyof typeof colors] || colors.jamb;
  };

  if (isLoading) {
    return (
      <StudentDashboardLayout title="Study Materials" subtitle="Explore subjects and topics">
        <div className="text-center py-8">Loading subjects...</div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Study Materials" subtitle="Explore subjects and build your knowledge">
      <div className="space-y-6">
        {/* Subject Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Subjects
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {subjects.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Progress
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(subjectProgress.reduce((sum, p) => sum + p.progress, 0) / subjectProgress.length)}%
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
                    Questions Completed
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {subjectProgress.reduce((sum, p) => sum + p.questionsCompleted, 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const progress = getSubjectProgress(subject.id);
            return (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {subject.code}
                      </p>
                    </div>
                    <Badge className={getCategoryColor(subject.category)}>
                      {subject.category.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subject.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium">{progress.progress}%</span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{progress.questionsCompleted} completed</span>
                      <span>{progress.totalQuestions} total questions</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Practice
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Study
                    </Button>
                  </div>

                  {/* Study Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {Math.floor(Math.random() * 20) + 10}h
                      </p>
                      <p className="text-xs text-gray-500">Study Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {Math.floor(Math.random() * 5) + 3}
                      </p>
                      <p className="text-xs text-gray-500">Topics Mastered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Study Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Study Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  Effective Study Strategies
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Start with subjects you find challenging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Take regular breaks every 45 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Practice with past questions frequently
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Review concepts before moving to new topics
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  Time Management
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Allocate more time to weaker subjects
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Set daily study goals and track progress
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Use active recall instead of passive reading
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Schedule regular review sessions
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}