import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Download,
  Eye,
  BarChart3
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function StudentResults() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionPlan === 'premium' || 
                   user?.subscriptionPlan === 'basic' || 
                   user?.email === 'jane.student@edrac.com';

  const examResults = [
    {
      id: "1",
      examTitle: "JAMB Mathematics Practice Test",
      subject: "Mathematics",
      score: isPremium ? 85 : 72,
      totalQuestions: 20,
      correctAnswers: isPremium ? 17 : 14,
      timeTaken: isPremium ? "25 mins" : "32 mins",
      date: "2025-07-28",
      status: isPremium ? "excellent" : "good",
      grade: isPremium ? "A" : "B"
    },
    {
      id: "2", 
      examTitle: "English Language Practice Test",
      subject: "English",
      score: isPremium ? 92 : 78,
      totalQuestions: 15,
      correctAnswers: isPremium ? 14 : 12,
      timeTaken: isPremium ? "18 mins" : "24 mins",
      date: "2025-07-26",
      status: isPremium ? "excellent" : "good",
      grade: isPremium ? "A+" : "B+"
    },
    {
      id: "3",
      examTitle: "JAMB Mock Examination",
      subject: "Mixed",
      score: isPremium ? 88 : 69,
      totalQuestions: 40,
      correctAnswers: isPremium ? 35 : 28,
      timeTaken: isPremium ? "55 mins" : "58 mins", 
      date: "2025-07-24",
      status: isPremium ? "excellent" : "fair",
      grade: isPremium ? "A" : "C+"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      good: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      poor: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
    };
    return colors[status as keyof typeof colors] || colors.fair;
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "text-green-600 dark:text-green-400";
    if (grade.startsWith('B')) return "text-blue-600 dark:text-blue-400";
    if (grade.startsWith('C')) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const averageScore = Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length);
  const totalExams = examResults.length;
  const excellentCount = examResults.filter(r => r.status === 'excellent').length;

  return (
    <StudentDashboardLayout title="My Results" subtitle="Track your exam performance and progress">
      <div className="space-y-6">
        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Exams
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalExams}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {averageScore}%
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
                    Excellent Results
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {excellentCount}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Best Score
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {Math.max(...examResults.map(r => r.score))}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Exam Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{result.examTitle}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                      <p className="font-semibold text-lg">{result.score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                      <p className="font-semibold text-lg">{result.correctAnswers}/{result.totalQuestions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                      <p className="font-semibold text-lg">{result.timeTaken}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                      <p className="font-semibold text-lg">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium">{result.score}%</span>
                    </div>
                    <Progress value={result.score} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                      Retake Exam
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Subject Performance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Mathematics</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">English</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Mixed Subjects</span>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recent Improvement</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Math scores improved by 13%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Faster completion times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Consistent performance across subjects</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}