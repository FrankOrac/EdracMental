import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookOpen, FileText, Plus, Upload, Download, ChevronLeft, ChevronRight, Save, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Question {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topicId: number;
  subjectId: number;
  examType: string;
  points: number;
}

interface Subject {
  id: number;
  name: string;
  category: string;
}

interface Topic {
  id: number;
  name: string;
  subjectId: number;
}

export default function CreateQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'select-count' | 'create'>('select-count');
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    topicId: 0,
    subjectId: 0,
    examType: 'jamb',
    points: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subjects and topics
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects']
  });

  const { data: topics } = useQuery<Topic[]>({
    queryKey: ['/api/topics']
  });

  // Create questions mutation
  const createQuestionsMutation = useMutation({
    mutationFn: async (questionsData: Question[]) => {
      const results = [];
      for (const question of questionsData) {
        const result = await apiRequest('/api/questions', {
          method: 'POST',
          body: question
        });
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({
        title: "Questions Created",
        description: `Successfully created ${questions.length} questions.`,
      });
      handleReset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create questions",
        variant: "destructive",
      });
    }
  });

  const validateQuestion = (question: Question): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!question.text.trim()) {
      errors.text = "Question text is required";
    }
    
    if (!question.subjectId) {
      errors.subjectId = "Subject is required";
    }
    
    if (!question.topicId) {
      errors.topicId = "Topic is required";
    }
    
    if (question.type === 'multiple_choice') {
      const filledOptions = question.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        errors.options = "At least 2 options are required";
      }
      
      if (!question.correctAnswer) {
        errors.correctAnswer = "Correct answer is required";
      }
    }
    
    if (!question.explanation.trim()) {
      errors.explanation = "Explanation is required";
    }
    
    return errors;
  };

  const handleSaveQuestion = () => {
    const validationErrors = validateQuestion(currentQuestion);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = currentQuestion;
    setQuestions(updatedQuestions);
    
    if (currentQuestionIndex < questionCount - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion({
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        topicId: currentQuestion.topicId,
        subjectId: currentQuestion.subjectId,
        examType: 'jamb',
        points: 1
      });
    } else {
      // All questions completed
      createQuestionsMutation.mutate([...updatedQuestions]);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setQuestions(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex] = currentQuestion;
        return updated;
      });
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentQuestion(questions[currentQuestionIndex - 1] || {
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        topicId: currentQuestion.topicId,
        subjectId: currentQuestion.subjectId,
        examType: 'jamb',
        points: 1
      });
    }
  };

  const handleReset = () => {
    setStep('select-count');
    setQuestionCount(5);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setCurrentQuestion({
      text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      topicId: 0,
      subjectId: 0,
      examType: 'jamb',
      points: 1
    });
    setErrors({});
  };

  const handleStartCreating = () => {
    setStep('create');
    setQuestions(new Array(questionCount).fill(null));
  };

  const filteredTopics = topics?.filter(topic => topic.subjectId === currentQuestion.subjectId) || [];

  if (step === 'select-count') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Questions</h1>
              <p className="text-gray-600 dark:text-gray-400">How many questions would you like to create?</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Select Question Count</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <Select
                    value={questionCount.toString()}
                    onValueChange={(value) => setQuestionCount(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Question</SelectItem>
                      <SelectItem value="2">2 Questions</SelectItem>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="4">4 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                      <SelectItem value="30">30 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={handleStartCreating} className="w-full">
                    Start Creating Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Question {currentQuestionIndex + 1} of {questionCount}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in the details for your question
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            <Progress 
              value={((currentQuestionIndex + 1) / questionCount) * 100} 
              className="mb-6"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Question Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject and Topic Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={currentQuestion.subjectId.toString()}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ 
                      ...prev, 
                      subjectId: parseInt(value),
                      topicId: 0 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600">{errors.subjectId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Select
                    value={currentQuestion.topicId.toString()}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ 
                      ...prev, 
                      topicId: parseInt(value) 
                    }))}
                    disabled={!currentQuestion.subjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTopics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.topicId && (
                    <p className="text-sm text-red-600">{errors.topicId}</p>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question">Question Text *</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question here..."
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion(prev => ({ 
                    ...prev, 
                    text: e.target.value 
                  }))}
                  rows={3}
                />
                {errors.text && (
                  <p className="text-sm text-red-600">{errors.text}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4">
                <Label>Answer Options *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                      <Input
                        id={`option-${index}`}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion(prev => ({ 
                            ...prev, 
                            options: newOptions 
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-sm text-red-600">{errors.options}</p>
                )}
              </div>

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label htmlFor="correct-answer">Correct Answer *</Label>
                <Select
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) => setCurrentQuestion(prev => ({ 
                    ...prev, 
                    correctAnswer: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option, index) => {
                      if (!option.trim()) return null;
                      const letter = String.fromCharCode(65 + index);
                      return (
                        <SelectItem key={letter} value={letter}>
                          {letter}: {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.correctAnswer && (
                  <p className="text-sm text-red-600">{errors.correctAnswer}</p>
                )}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation *</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain why this is the correct answer..."
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({ 
                    ...prev, 
                    explanation: e.target.value 
                  }))}
                  rows={3}
                />
                {errors.explanation && (
                  <p className="text-sm text-red-600">{errors.explanation}</p>
                )}
              </div>

              {/* Difficulty and Exam Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={currentQuestion.difficulty}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ 
                      ...prev, 
                      difficulty: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-type">Exam Type</Label>
                  <Select
                    value={currentQuestion.examType}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ 
                      ...prev, 
                      examType: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jamb">JAMB</SelectItem>
                      <SelectItem value="waec">WAEC</SelectItem>
                      <SelectItem value="neco">NECO</SelectItem>
                      <SelectItem value="gce">GCE</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSaveQuestion}
                disabled={createQuestionsMutation.isPending}
              >
                {createQuestionsMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <>
                    {currentQuestionIndex === questionCount - 1 ? (
                      <><Save className="h-4 w-4 mr-2" />Save All</>
                    ) : (
                      <>Next<ChevronRight className="h-4 w-4 ml-2" /></>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}