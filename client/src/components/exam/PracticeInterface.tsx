import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RobustAITutor from "../ai/RobustAITutor";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  Lightbulb,
  Target,
  BookOpen,
  Zap,
  RotateCcw
} from "lucide-react";

interface PracticeInterfaceProps {
  subjectId: string;
  mode: "instant" | "ai";
  onComplete?: () => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
}

export default function PracticeInterface({ subjectId, mode, onComplete }: PracticeInterfaceProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [showAITutor, setShowAITutor] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [practiceComplete, setPracticeComplete] = useState(false);

  // Get practice questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ["/api/questions/practice", subjectId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/practice/${subjectId}?limit=20`, { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
    retry: false,
  });

  // AI explanation mutation
  const explainQuestionMutation = useMutation({
    mutationFn: async ({ questionText, correctAnswer, userAnswer }: {
      questionText: string;
      correctAnswer: string;
      userAnswer?: string;
    }) => {
      return await apiRequest("POST", "/api/ai/explain", {
        questionText,
        correctAnswer,
        userAnswer
      });
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const isAnswered = currentQuestionIndex in answers;
  const isCorrect = answers[currentQuestionIndex] === currentQuestion?.correctAnswer;
  const hasShownAnswer = showAnswer[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    
    if (mode === "instant") {
      // Show answer immediately in instant mode
      setShowAnswer(prev => ({ ...prev, [currentQuestionIndex]: true }));
      
      // Update score
      const correct = answer === currentQuestion?.correctAnswer;
      setScore(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1
      }));

      if (correct) {
        toast({
          title: "Correct! ✅",
          description: "Well done! You got it right.",
        });
      } else {
        toast({
          title: "Incorrect ❌",
          description: `The correct answer is: ${currentQuestion?.correctAnswer}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleShowAnswer = () => {
    if (!isAnswered) {
      toast({
        title: "Select an answer",
        description: "Please select an answer before viewing the explanation.",
        variant: "destructive",
      });
      return;
    }

    setShowAnswer(prev => ({ ...prev, [currentQuestionIndex]: true }));
    
    if (!hasShownAnswer) {
      const correct = answers[currentQuestionIndex] === currentQuestion?.correctAnswer;
      setScore(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPracticeComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestartPractice = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowAnswer({});
    setScore({ correct: 0, total: 0 });
    setPracticeComplete(false);
  };

  const handleAskAI = () => {
    if (currentQuestion) {
      explainQuestionMutation.mutate({
        questionText: currentQuestion.text,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: answers[currentQuestionIndex]
      });
    }
    setShowAITutor(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions available</h3>
            <p className="text-gray-600 mb-4">
              No practice questions found for this subject.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (practiceComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Target className="h-6 w-6" />
              Practice Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{score.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{score.total - score.correct}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span>{score.correct}/{score.total}</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestartPractice} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button onClick={() => window.history.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                {mode === "instant" ? (
                  <Zap className="h-5 w-5 text-white" />
                ) : (
                  <Brain className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {mode === "instant" ? "Instant Feedback Practice" : "AI Tutor Practice"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Score: {score.correct}/{score.total}
              </Badge>
              <Badge variant={currentQuestion?.difficulty === "hard" ? "destructive" : 
                             currentQuestion?.difficulty === "medium" ? "default" : "secondary"}>
                {currentQuestion?.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentQuestion?.topic}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {currentQuestion?.text}
                </p>

                <RadioGroup
                  value={answers[currentQuestionIndex] || ""}
                  onValueChange={handleAnswerSelect}
                  disabled={hasShownAnswer && mode === "instant"}
                >
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option: string, index: number) => {
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = answers[currentQuestionIndex] === option;
                      const isCorrectOption = option === currentQuestion?.correctAnswer;
                      
                      let optionClass = "flex items-center space-x-3 p-4 rounded-lg border transition-colors";
                      
                      if (hasShownAnswer) {
                        if (isCorrectOption) {
                          optionClass += " bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400";
                        } else if (isSelected && !isCorrectOption) {
                          optionClass += " bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400";
                        } else {
                          optionClass += " bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600";
                        }
                      } else {
                        optionClass += isSelected 
                          ? " bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400"
                          : " hover:bg-gray-50 border-gray-200 dark:hover:bg-gray-700 dark:border-gray-600";
                      }

                      return (
                        <div key={index} className={optionClass}>
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            <span className="font-medium mr-2">{optionLetter}.</span>
                            {option}
                          </Label>
                          {hasShownAnswer && isCorrectOption && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {hasShownAnswer && isSelected && !isCorrectOption && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {mode === "ai" && !hasShownAnswer && (
                    <Button 
                      onClick={handleShowAnswer}
                      disabled={!isAnswered}
                      variant="outline"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Show Answer
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleAskAI}
                    disabled={!isAnswered}
                    variant="outline"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Ask AI Tutor
                  </Button>
                </div>

                {/* Explanation */}
                {hasShownAnswer && currentQuestion?.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Explanation
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Questions</span>
                    <span>{currentQuestionIndex + 1}/{questions.length}</span>
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / questions.length) * 100} 
                    className="h-2" 
                  />
                  
                  {score.total > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span>{Math.round((score.correct / score.total) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(score.correct / score.total) * 100} 
                        className="h-2" 
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={!isAnswered || (mode === "ai" && !hasShownAnswer)}
                    className="flex-1"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                    <div className="text-xs text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
                    <div className="text-xs text-gray-600">Incorrect</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Tutor Modal */}
      {showAITutor && currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Tutor Explanation
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAITutor(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <RobustAITutor
                initialQuestion={`Explain this question: ${currentQuestion.text}`}
                context={`Question: ${currentQuestion.text}\nCorrect Answer: ${currentQuestion.correctAnswer}\nUser's Answer: ${answers[currentQuestionIndex] || "Not answered"}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}