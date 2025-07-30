import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  Search,
  Filter,
  Target,
  CheckCircle,
  Calendar,
  Users
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Exam {
  id: string;
  title: string;
  description: string;
  subjectId: number;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  difficulty: string;
  examType: string;
  isPublic: boolean;
  isActive: boolean;
}

export default function StudentExams() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || exam.subjectId.toString() === filterSubject;
    const matchesDifficulty = filterDifficulty === "all" || exam.difficulty === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty && exam.isPublic && exam.isActive;
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      hard: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      mixed: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  const getExamTypeColor = (examType: string) => {
    const colors = {
      jamb: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      waec: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      neco: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      practice: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    };
    return colors[examType as keyof typeof colors] || colors.practice;
  };

  if (isLoading) {
    return (
      <StudentDashboardLayout title="Available Exams" subtitle="Practice and test your knowledge">
        <div className="text-center py-8">Loading exams...</div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Available Exams" subtitle="Practice and test your knowledge">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="1">Mathematics</SelectItem>
                  <SelectItem value="2">English</SelectItem>
                  <SelectItem value="3">Physics</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exam Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Exams
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredExams.length}
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
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.floor(filteredExams.length * 0.6)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
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
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {user?.email === 'jane.student@edrac.com' ? '92%' : '76%'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Study Time
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {user?.email === 'jane.student@edrac.com' ? '45h' : '28h'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Exams Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterSubject !== "all" || filterDifficulty !== "all" 
                  ? "Try adjusting your search filters"
                  : "No exams are currently available"
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterSubject("all");
                  setFilterDifficulty("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {exam.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getDifficultyColor(exam.difficulty)}>
                      {exam.difficulty}
                    </Badge>
                    <Badge className={getExamTypeColor(exam.examType)}>
                      {exam.examType.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{exam.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span>{exam.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Public</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Practice
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Take Exam
                    </Button>
                  </div>

                  {/* Previous Attempts */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Best Score:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {user?.email === 'jane.student@edrac.com' ? '95%' : '82%'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Attempts:</span>
                      <span className="font-medium">
                        {Math.floor(Math.random() * 3) + 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold">Time Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allocate time wisely across all questions
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold">Stay Focused</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read questions carefully before answering
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold">Practice First</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use practice mode to familiarize yourself
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}