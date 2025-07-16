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
import { BookOpen, FileText, Plus, Upload, Download, ChevronLeft, ChevronRight, Save, Sparkles, X, Image as ImageIcon } from "lucide-react";
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
  
  const [step, setStep] = useState<'select-target' | 'select-method' | 'select-count' | 'create'>('select-target');
  const [targetType, setTargetType] = useState<'subject' | 'exam' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{id: string, name: string, type: 'subject' | 'exam'} | null>(null);
  const [creationMethod, setCreationMethod] = useState<'online' | 'bulk' | null>(null);
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
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subjects, topics, and exams
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects']
  });

  const { data: topics } = useQuery<Topic[]>({
    queryKey: ['/api/topics']
  });

  const { data: exams } = useQuery({
    queryKey: ['/api/exams']
  });

  // Create questions mutation
  const createQuestionsMutation = useMutation({
    mutationFn: async (questionsData: Question[]) => {
      const results = [];
      for (const question of questionsData) {
        const result = await apiRequest('/api/questions', {
          method: 'POST',
          body: JSON.stringify(question),
          headers: {
            'Content-Type': 'application/json'
          }
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
    
    // Topic is now optional
    
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
        examType: currentQuestion.examType,
        points: 1
      });
      setQuestionImage(null);
      setImagePreview(null);
    } else {
      // All questions completed - prepare data for API
      const questionsForAPI = updatedQuestions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topicId: q.topicId || null,
        subjectId: q.subjectId,
        examType: q.examType,
        points: q.points
      }));
      createQuestionsMutation.mutate(questionsForAPI);
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
        examType: currentQuestion.examType,
        points: 1
      });
    }
  };

  const handleReset = () => {
    setStep('select-target');
    setTargetType(null);
    setSelectedTarget(null);
    setCreationMethod(null);
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
    setQuestionImage(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleStartCreating = () => {
    setStep('create');
    setQuestions(new Array(questionCount).fill(null));
    // Set the subject if adding to subject
    if (targetType === 'subject' && selectedTarget) {
      setCurrentQuestion(prev => ({
        ...prev,
        subjectId: parseInt(selectedTarget.id)
      }));
    }
    // Set exam type based on target type
    if (targetType === 'exam') {
      setCurrentQuestion(prev => ({
        ...prev,
        examType: 'custom'
      }));
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = `Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Subject,Topic,Difficulty,Type
"What is 2 + 2?","3","4","5","6","B","Basic addition: 2 + 2 = 4","Mathematics","Arithmetic","easy","multiple_choice"
"What is the capital of Nigeria?","Lagos","Abuja","Kano","Port Harcourt","B","Abuja is the capital city of Nigeria","General Knowledge","Geography","easy","multiple_choice"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Upload",
        description: "Bulk upload functionality will be implemented soon.",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setQuestionImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, GIF, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = () => {
    setQuestionImage(null);
    setImagePreview(null);
  };

  const filteredTopics = topics?.filter(topic => topic.subjectId === currentQuestion.subjectId) || [];

  const renderStepContent = () => {
    switch (step) {
      case 'select-target':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Where do you want to add questions?</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose whether to add questions to a subject or exam</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setTargetType('subject');
              }}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">To Subject</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add questions to a specific subject for general use</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setTargetType('exam');
              }}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">To Exam</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add questions directly to a specific exam</p>
                </CardContent>
              </Card>
            </div>

            {targetType && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Select {targetType === 'subject' ? 'Subject' : 'Exam'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {(targetType === 'subject' ? subjects : exams)?.map((item: any) => (
                        <Button
                          key={item.id}
                          variant={selectedTarget?.id === item.id.toString() ? "default" : "outline"}
                          className="w-full justify-start h-auto p-4"
                          onClick={() => {
                            setSelectedTarget({
                              id: item.id.toString(),
                              name: item.name || item.title,
                              type: targetType
                            });
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium">{item.name || item.title}</div>
                            {targetType === 'subject' && (
                              <div className="text-xs text-gray-500">{item.code}</div>
                            )}
                            {targetType === 'exam' && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    {selectedTarget && (
                      <div className="flex justify-end">
                        <Button onClick={() => setStep('select-method')}>
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'select-method':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Add Questions</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose where to add your questions and how you want to add them.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-semibold">Adding to:</span> {selectedTarget?.name} ({targetType === 'subject' ? 'Subject' : 'Exam'})
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-center">How would you like to add questions?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setCreationMethod('online');
                  setStep('select-count');
                }}>
                  <CardContent className="p-6 text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h4 className="text-lg font-semibold mb-2">Online</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create manually</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setCreationMethod('bulk');
                  document.getElementById('file-upload')?.click();
                }}>
                  <CardContent className="p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h4 className="text-lg font-semibold mb-2">Bulk Upload</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Excel/CSV file</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-6">
                <Button variant="outline" onClick={downloadSampleTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample Template
                </Button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={() => setStep('select-target')}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        );

      case 'select-count':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">How many questions?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select the number of questions you want to create for <span className="font-semibold">{selectedTarget?.name}</span>
              </p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
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
                  
                  <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={() => setStep('select-method')}>
                      Back
                    </Button>
                    <Button onClick={handleStartCreating}>
                      Start Creating
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (step !== 'create') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Questions</h1>
              <p className="text-gray-600 dark:text-gray-400">Add questions to your question bank</p>
            </div>

            {renderStepContent()}

            {/* Hidden file input for bulk upload */}
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
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

              {/* Question Image */}
              <div className="space-y-2">
                <Label>Question Image (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Question preview" 
                          className="max-w-full h-auto max-h-40 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {questionImage?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="question-image"
                      />
                      <label
                        htmlFor="question-image"
                        className="cursor-pointer flex flex-col items-center gap-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                      >
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload question image
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
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