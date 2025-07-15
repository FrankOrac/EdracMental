import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QuestionNavigator from "./QuestionNavigator";
import AiTutor from "../ai/AiTutor";
import { 
  Clock, 
  Flag, 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Send
} from "lucide-react";

interface ExamInterfaceProps {
  session: any;
  onExamComplete: () => void;
}

export default function ExamInterface({ session, onExamComplete }: ExamInterfaceProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(session.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState(session.answers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState(session.flaggedQuestions || []);
  const [timeRemaining, setTimeRemaining] = useState(session.remainingTime || session.exam?.duration * 60);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Get exam details
  const { data: exam } = useQuery({
    queryKey: ["/api/exams", session.examId],
    retry: false,
  });

  // Get exam questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/exams", session.examId, "questions"],
    retry: false,
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/exam-sessions/${session.id}`, data);
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
      console.error("Failed to update session:", error);
    },
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      const score = calculateScore();
      return await apiRequest("PATCH", `/api/exam-sessions/${session.id}`, {
        status: "completed",
        endTime: new Date().toISOString(),
        answers,
        score: score.total,
        percentage: score.percentage,
        isGraded: true,
        antiCheatData: {
          tabSwitches: tabSwitchCount,
          focusLosses: focusLossCount,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Exam Submitted",
        description: "Your exam has been submitted successfully!",
      });
      onExamComplete();
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
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      submitExamMutation.mutate();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          submitExamMutation.mutate();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitExamMutation]);

  // Anti-cheating measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        
        toast({
          title: "Warning: Tab Switch Detected",
          description: "Switching tabs during the exam is not allowed and has been logged.",
          variant: "destructive",
        });
      }
    };

    const handleBlur = () => {
      setFocusLossCount(prev => prev + 1);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [toast]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      updateSessionMutation.mutate({
        currentQuestionIndex,
        answers,
        flaggedQuestions,
        remainingTime: timeRemaining,
      });
    }, 30000);

    return () => clearInterval(autoSave);
  }, [currentQuestionIndex, answers, flaggedQuestions, timeRemaining, updateSessionMutation]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeRemaining < 300) return "timer-critical"; // Last 5 minutes
    if (timeRemaining < 900) return "timer-warning"; // Last 15 minutes
    return "timer-normal";
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const calculateScore = () => {
    if (!questions) return { total: 0, percentage: 0 };
    
    let correct = 0;
    questions.forEach((question: any) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return {
      total: correct,
      percentage: (correct / questions.length) * 100
    };
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit your exam? This action cannot be undone.")) {
      submitExamMutation.mutate();
    }
  };

  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Questions Available</h2>
            <p className="text-gray-600 dark:text-gray-300">This exam doesn't have any questions yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Anti-cheating warning */}
      {showWarning && (
        <div className="tab-switch-warning">
          <AlertTriangle className="inline mr-2 h-4 w-4" />
          Tab switching detected and logged. Please stay on this page during the exam.
        </div>
      )}

      {/* Exam Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{exam?.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTimerClass()}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Time Remaining</div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitExamMutation.isPending}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Exam
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              
              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Question Content */}
            <Card className="glass-strong">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.text}
                </div>

                {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value={option.charAt(0)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-900 dark:text-white">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flaggedQuestions.includes(currentQuestion.id) ? "border-orange-500 text-orange-600" : ""}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    {flaggedQuestions.includes(currentQuestion.id) ? "Unflag" : "Flag for Review"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowAiTutor(true)}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Ask AI Tutor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onQuestionSelect={goToQuestion}
              onSubmit={handleSubmit}
              timeRemaining={timeRemaining}
              isSubmitting={submitExamMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* AI Tutor Modal */}
      {showAiTutor && (
        <AiTutor
          question={currentQuestion}
          isOpen={showAiTutor}
          onClose={() => setShowAiTutor(false)}
        />
      )}
    </div>
  );
}
