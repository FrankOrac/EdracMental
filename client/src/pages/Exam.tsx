import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ExamInterface from "@/components/exam/ExamInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen, Play, ArrowLeft } from "lucide-react";

export default function Exam() {
  const { examId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [examStarted, setExamStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Check for active session
  const { data: activeSession } = useQuery({
    queryKey: ["/api/exam-sessions/active"],
    retry: false,
  });

  // Get exam details if examId is provided
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["/api/exams", examId],
    enabled: !!examId,
    retry: false,
  });

  // Get available exams if no specific exam
  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
    enabled: !examId,
    retry: false,
  });

  // Create exam session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (examData: { examId: string }) => {
      return await apiRequest("POST", "/api/exam-sessions", examData);
    },
    onSuccess: (response) => {
      const session = response.json();
      setCurrentSession(session);
      setExamStarted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/exam-sessions/active"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to start exam",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // If there's an active session, start the exam interface
    if (activeSession && activeSession.status === "in_progress") {
      setCurrentSession(activeSession);
      setExamStarted(true);
    }
  }, [activeSession]);

  const startExam = (selectedExamId: string) => {
    createSessionMutation.mutate({ examId: selectedExamId });
  };

  const goBack = () => {
    window.history.back();
  };

  // If exam is started, show exam interface
  if (examStarted && currentSession) {
    return (
      <ExamInterface 
        session={currentSession}
        onExamComplete={() => {
          setExamStarted(false);
          setCurrentSession(null);
          // Redirect to results or home
          window.location.href = "/";
        }}
      />
    );
  }

  // If specific exam is selected, show exam details
  if (examId) {
    if (examLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!exam) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exam Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={goBack} 
            variant="ghost" 
            className="mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>

          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {exam.title}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {exam.examCategory.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{exam.duration}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">minutes</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {exam.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">{exam.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalQuestions}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.duration}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.passingScore || 70}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Passing Score</div>
                  </CardContent>
                </Card>
              </div>

              {exam.instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instructions</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{exam.instructions}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={() => startExam(exam.id)}
                  disabled={createSessionMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4"
                >
                  {createSessionMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="mr-2 h-5 w-5" />
                  )}
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show available exams
  if (examsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Available Exams</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Choose an exam to begin your practice session</p>
        </div>

        {exams?.length === 0 ? (
          <Card className="glass text-center">
            <CardContent className="p-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Exams Available</h3>
              <p className="text-gray-600 dark:text-gray-400">There are currently no exams available for practice.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams?.map((exam: any) => (
              <Card key={exam.id} className="glass hover:glass-strong transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href = `/exam/${exam.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {exam.examCategory.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={exam.type === "practice" ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}
                    >
                      {exam.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {exam.title}
                  </CardTitle>
                  {exam.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {exam.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{exam.totalQuestions}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{exam.duration}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Minutes</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/exam/${exam.id}`;
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
