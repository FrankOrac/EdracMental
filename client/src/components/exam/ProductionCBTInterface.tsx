import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Clock, Flag, HelpCircle, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
  subjectId: number;
  topicId?: number;
}

interface Exam {
  id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  instructions?: string;
}

interface ExamSession {
  id: string;
  examId: string;
  questions: Question[];
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: Record<number, string>;
  flaggedQuestions: number[];
  isCompleted: boolean;
}

interface ProductionCBTInterfaceProps {
  examId: string;
  practiceMode?: boolean;
}

export default function ProductionCBTInterface({ examId, practiceMode = false }: ProductionCBTInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Component state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery<Exam>({
    queryKey: ['/api/exams', examId],
  });

  // Fetch exam questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/exams', examId, 'questions'],
    enabled: !!examId,
  });

  // Start exam session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exams/${examId}/start`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to start exam session');
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setTimeRemaining(data.timeRemaining || (exam?.duration || 60) * 60);
      setIsTimerActive(!practiceMode);
      if (!practiceMode) {
        toast({
          title: "Exam Started",
          description: "Good luck with your exam!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start exam session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('No active session');
      
      const response = await fetch(`/api/exam-sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          answers,
          flaggedQuestions,
          timeSpent: (exam?.duration || 60) * 60 - timeRemaining,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit exam');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Exam Submitted",
        description: `Your score: ${data.score}/${questions.length}`,
      });
      navigate(`/dashboard`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI explanation mutation
  const explainQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');
      
      const response = await fetch('/api/ai/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionText: question.text,
          correctAnswer: question.correctAnswer,
          studentAnswer: answers[questionId],
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get explanation');
      return response.json();
    },
  });

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          if (!practiceMode) {
            handleSubmitExam();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining, practiceMode]);

  // Initialize exam session
  useEffect(() => {
    if (exam && !sessionId && !practiceMode) {
      startSessionMutation.mutate();
    } else if (exam && practiceMode) {
      setTimeRemaining((exam.duration || 60) * 60);
    }
  }, [exam, sessionId, practiceMode]);

  // Navigation handlers
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmitExam = () => {
    if (practiceMode) {
      // In practice mode, just show results
      navigate('/dashboard');
      return;
    }
    
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    submitExamMutation.mutate();
  };

  // Loading state
  if (examLoading || questionsLoading || startSessionMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading exam...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Exam Not Available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested exam could not be loaded or has no questions.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.length;

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{exam.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {practiceMode ? 'Practice Mode' : 'Exam Mode'} | Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {!practiceMode && (
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="h-5 w-5" />
                  <span className={timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : ''}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <Badge variant="outline">
                {answeredCount}/{questions.length} answered
              </Badge>
              
              {flaggedCount > 0 && (
                <Badge variant="secondary">
                  <Flag className="h-3 w-3 mr-1" />
                  {flaggedCount} flagged
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={currentQuestion.difficulty === 'hard' ? 'destructive' : currentQuestion.difficulty === 'medium' ? 'default' : 'secondary'}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFlagQuestion(currentQuestion.id)}
                      className={flaggedQuestions.includes(currentQuestion.id) ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20' : ''}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-base leading-relaxed">
                  {currentQuestion.text}
                </div>
                
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                          <RadioGroupItem value={optionLetter} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            <span className="font-medium mr-2">{optionLetter}.</span>
                            {option.replace(/^[A-D]\.\s*/, '')}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Show explanation in practice mode */}
                {practiceMode && answers[currentQuestion.id] && (
                  <div className="mt-6">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Explanation</h4>
                        {!showExplanation && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowExplanation(true);
                              explainQuestionMutation.mutate(currentQuestion.id);
                            }}
                            disabled={explainQuestionMutation.isPending}
                          >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            {explainQuestionMutation.isPending ? 'Getting AI Help...' : 'Get AI Explanation'}
                          </Button>
                        )}
                      </div>
                      
                      {showExplanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          {explainQuestionMutation.data ? (
                            <div className="space-y-2">
                              <p className="text-sm">{explainQuestionMutation.data.explanation}</p>
                              {explainQuestionMutation.data.examples?.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm">Study Tips:</p>
                                  <ul className="text-sm list-disc list-inside space-y-1">
                                    {explainQuestionMutation.data.examples.map((example: string, idx: number) => (
                                      <li key={idx}>{example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : currentQuestion.explanation ? (
                            <p className="text-sm">{currentQuestion.explanation}</p>
                          ) : (
                            <p className="text-sm">The correct answer is {currentQuestion.correctAnswer}.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {practiceMode ? 'Finish Practice' : 'Submit Exam'}
                </Button>
              ) : (
                <Button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => {
                      const isAnswered = answers[questions[index].id];
                      const isFlagged = flaggedQuestions.includes(questions[index].id);
                      const isCurrent = index === currentQuestionIndex;
                      
                      return (
                        <Button
                          key={index}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToQuestion(index)}
                          className={`
                            relative h-10 w-10 p-0
                            ${isAnswered ? 'bg-green-100 border-green-300 dark:bg-green-900/20' : ''}
                            ${isFlagged ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20' : ''}
                            ${isCurrent ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          {index + 1}
                          {isFlagged && (
                            <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    <span>Not answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {questions.length - answeredCount > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {' '}You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
              {' '}Once submitted, you cannot make any changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSubmit}
              disabled={submitExamMutation.isPending}
            >
              {submitExamMutation.isPending ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}