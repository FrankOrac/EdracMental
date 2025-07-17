import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  BookOpen, 
  Target, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Timer,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import EnhancedAITutor from "@/components/ai/EnhancedAITutor";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  subjects: string[];
  difficulty: string;
  questions: Question[];
}

interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<number, number>;
  score?: number;
  status: 'active' | 'completed' | 'paused';
  timeRemaining: number;
}

export default function CBTExamInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch available exams
  const { data: exams = [], isLoading: loadingExams } = useQuery({
    queryKey: ['/api/exams'],
  });

  // Fetch practice questions for exams
  const { data: practiceQuestions = [] } = useQuery({
    queryKey: ['/api/questions/practice'],
    enabled: !!selectedExam
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examStarted && !examCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, examCompleted, timeRemaining]);

  // Start exam mutation
  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await apiRequest('POST', `/api/exams/${examId}/start`, {});
      return response.json();
    },
    onSuccess: (session: ExamSession) => {
      setCurrentSession(session);
      setExamStarted(true);
      setTimeRemaining(selectedExam?.duration ? selectedExam.duration * 60 : 3600);
      toast({
        title: "Exam Started",
        description: `You have ${selectedExam?.duration} minutes to complete this exam.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start exam. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/exam-sessions/${sessionId}/submit`, {
        answers: userAnswers,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setExamCompleted(true);
      setShowResults(true);
      toast({
        title: "Exam Submitted",
        description: `Your score: ${result.score}/${selectedExam?.totalQuestions}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    // For demo purposes, we'll create mock questions
    const mockQuestions: Question[] = Array.from({ length: exam.totalQuestions }, (_, index) => ({
      id: index + 1,
      text: `Sample question ${index + 1} for ${exam.title}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${index + 1}`,
      subject: (exam.subjects && exam.subjects.length > 0) ? exam.subjects[0] : "General",
      topic: "Sample Topic",
      difficulty: exam.difficulty,
    }));
    
    setSelectedExam({ ...exam, questions: mockQuestions });
    startExamMutation.mutate(exam.id);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitExam = () => {
    if (currentSession) {
      submitExamMutation.mutate(currentSession.id);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedExam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  const getProgressPercentage = () => {
    if (!selectedExam) return 0;
    return (getAnsweredCount() / selectedExam.totalQuestions) * 100;
  };

  if (loadingExams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">CBT Exam Center</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select an exam to begin your computer-based test
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam: Exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {exam.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{exam.type}</Badge>
                  <Badge variant="outline">{exam.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {exam.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    <span>{exam.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Pass: {exam.passingScore}%</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {exam.subjects && exam.subjects.length > 0 ? (
                      exam.subjects.map((subject: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        General
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => handleStartExam(exam)}
                  className="w-full"
                  disabled={startExamMutation.isPending}
                >
                  {startExamMutation.isPending ? "Starting..." : "Start Exam"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {exams.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No exams available at the moment. Please check back later.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (examCompleted && showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Exam Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-green-600">
                {Math.round((getAnsweredCount() / (selectedExam?.totalQuestions || 1)) * 100)}%
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                You answered {getAnsweredCount()} out of {selectedExam?.totalQuestions} questions
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700 dark:text-green-400">Correct</p>
                <p className="text-lg font-semibold">{getAnsweredCount()}</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-700 dark:text-red-400">Incorrect</p>
                <p className="text-lg font-semibold">{(selectedExam?.totalQuestions || 0) - getAnsweredCount()}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setSelectedExam(null);
                  setExamStarted(false);
                  setExamCompleted(false);
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setUserAnswers({});
                }}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Another Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = selectedExam?.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Exam Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedExam?.title}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Badge variant="outline">
                {currentQuestionIndex + 1} of {selectedExam?.totalQuestions}
              </Badge>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{currentQuestion?.text}</p>
          
          <div className="space-y-2">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                variant={userAnswers[currentQuestion.id] === index ? "default" : "outline"}
                className="w-full text-left justify-start h-auto p-4"
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Answered: {getAnsweredCount()}/{selectedExam?.totalQuestions}
          </span>
        </div>

        <div className="flex gap-2">
          {currentQuestionIndex < (selectedExam?.questions.length || 0) - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitExam}
              disabled={submitExamMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitExamMutation.isPending ? "Submitting..." : "Submit Exam"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}