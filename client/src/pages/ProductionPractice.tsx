import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProductionCBTInterface from "@/components/exam/ProductionCBTInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, PlayCircle } from "lucide-react";
import { useState } from "react";

interface Exam {
  id: string;
  title: string;
  description: string;
  type: string;
  examCategory: string;
  duration: number;
  totalQuestions: number;
  difficulty: string;
  isPublic: boolean;
  subjects: number[];
}

export default function ProductionPractice() {
  const params = useParams();
  const subjectId = params.subjectId;
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Get URL parameters for exam selection
  const urlParams = new URLSearchParams(window.location.search);
  const examFromUrl = urlParams.get('exam');
  const difficultyFromUrl = urlParams.get('difficulty');

  // Fetch available practice exams
  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  // If exam ID provided via URL, start practice immediately
  if (examFromUrl && !selectedExamId) {
    return <ProductionCBTInterface examId={examFromUrl} practiceMode={true} />;
  }

  // If exam selected, start practice
  if (selectedExamId) {
    return <ProductionCBTInterface examId={selectedExamId} practiceMode={true} />;
  }

  // Filter exams based on criteria
  const filteredExams = exams.filter(exam => {
    if (!exam.isPublic) return false;
    if (subjectId && !exam.subjects.includes(parseInt(subjectId))) return false;
    if (difficultyFromUrl && exam.difficulty !== difficultyFromUrl) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      hard: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      mixed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      jamb: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      waec: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      neco: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      gce: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Practice Mode 🎯
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose a practice exam to improve your skills. No time pressure, get instant explanations!
          </p>
        </div>

        {/* Practice Exams */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Available Practice Exams
                {difficultyFromUrl && (
                  <Badge className={getDifficultyColor(difficultyFromUrl)}>
                    {difficultyFromUrl} difficulty
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Practice Exams Available</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {difficultyFromUrl || subjectId 
                      ? "No exams match your current filters."
                      : "There are no practice exams available at the moment."
                    }
                  </p>
                  <Button asChild variant="outline">
                    <a href="/dashboard">Return to Dashboard</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold">{exam.title}</h3>
                              <Badge className={getCategoryColor(exam.examCategory)}>
                                {exam.examCategory.toUpperCase()}
                              </Badge>
                              <Badge className={getDifficultyColor(exam.difficulty)}>
                                {exam.difficulty}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400">
                              {exam.description}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {exam.duration} minutes
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {exam.totalQuestions} questions
                              </span>
                              <Badge variant="outline">
                                Practice Mode
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => setSelectedExamId(exam.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Practice
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Mode Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium">No Time Pressure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Take your time to think through each question
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium">Instant Explanations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get AI-powered explanations for every question
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium">Track Progress</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor your improvement over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}