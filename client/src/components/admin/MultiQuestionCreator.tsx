import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  BookOpen, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

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

interface MultiQuestionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  questionCount: number;
  selectedSubject?: Subject;
  selectedTopic?: Topic;
}

export default function MultiQuestionCreator({
  isOpen,
  onClose,
  questionCount,
  selectedSubject,
  selectedTopic
}: MultiQuestionCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    topicId: selectedTopic?.id || 0,
    subjectId: selectedSubject?.id || 0,
    examType: 'jamb',
    points: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subjects and topics
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
    enabled: !selectedSubject
  });

  const { data: topics } = useQuery<Topic[]>({
    queryKey: ['/api/topics'],
    enabled: !!currentQuestion.subjectId || !!selectedSubject
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
      handleClose();
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
    
    if (question.type === 'multiple-choice') {
      if (question.options.some(opt => !opt.trim())) {
        errors.options = "All options must be filled";
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

  const handleAddQuestion = () => {
    const validationErrors = validateQuestion(currentQuestion);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex] = { ...currentQuestion };
    setQuestions(newQuestions);
    setErrors({});
    
    if (currentQuestionIndex < questionCount - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion({
        text: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        topicId: selectedTopic?.id || currentQuestion.topicId,
        subjectId: selectedSubject?.id || currentQuestion.subjectId,
        examType: currentQuestion.examType,
        points: 1
      });
    } else {
      // All questions completed
      toast({
        title: "Questions Ready",
        description: "All questions have been prepared. Click 'Complete All Questions' to save.",
      });
    }
  };

  const handleCompleteAllQuestions = () => {
    if (questions.length !== questionCount) {
      toast({
        title: "Error",
        description: "Please complete all questions before saving",
        variant: "destructive",
      });
      return;
    }
    
    createQuestionsMutation.mutate(questions);
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      topicId: selectedTopic?.id || 0,
      subjectId: selectedSubject?.id || 0,
      examType: 'jamb',
      points: 1
    });
    setErrors({});
    onClose();
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentQuestion(questions[currentQuestionIndex - 1] || {
        text: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        topicId: selectedTopic?.id || 0,
        subjectId: selectedSubject?.id || 0,
        examType: 'jamb',
        points: 1
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const filteredTopics = topics?.filter(topic => 
    topic.subjectId === (selectedSubject?.id || currentQuestion.subjectId)
  ) || [];

  const progress = ((currentQuestionIndex + (questions[currentQuestionIndex] ? 1 : 0)) / questionCount) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Questions - Question {currentQuestionIndex + 1} of {questionCount}
          </DialogTitle>
          <DialogDescription>
            Fill out each question completely before moving to the next one.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question Status Pills */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: questionCount }, (_, index) => {
            const isCompleted = questions[index];
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <Badge
                key={index}
                variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                className={`flex items-center gap-1 ${
                  isCurrent ? "bg-blue-600" : isCompleted ? "bg-green-600" : ""
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : isCurrent ? (
                  <Target className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                Q{index + 1}
              </Badge>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* Subject and Topic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={currentQuestion.subjectId.toString()}
                onValueChange={(value) => setCurrentQuestion({
                  ...currentQuestion,
                  subjectId: parseInt(value),
                  topicId: 0
                })}
                disabled={!!selectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {(subjects || [selectedSubject]).filter(Boolean).map((subject) => (
                    <SelectItem key={subject!.id} value={subject!.id.toString()}>
                      {subject!.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && (
                <p className="text-sm text-red-500">{errors.subjectId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={currentQuestion.topicId.toString()}
                onValueChange={(value) => setCurrentQuestion({
                  ...currentQuestion,
                  topicId: parseInt(value)
                })}
                disabled={!!selectedTopic || !currentQuestion.subjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {(filteredTopics.length ? filteredTopics : [selectedTopic]).filter(Boolean).map((topic) => (
                    <SelectItem key={topic!.id} value={topic!.id.toString()}>
                      {topic!.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topicId && (
                <p className="text-sm text-red-500">{errors.topicId}</p>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              value={currentQuestion.text}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
            />
            {errors.text && (
              <p className="text-sm text-red-500">{errors.text}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Answer Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="text-sm text-red-500">{errors.options}</p>
            )}
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct-answer">Correct Answer</Label>
            <Select
              value={currentQuestion.correctAnswer}
              onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion.options.map((option, index) => (
                  <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                    {String.fromCharCode(65 + index)} - {option || `Option ${String.fromCharCode(65 + index)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.correctAnswer && (
              <p className="text-sm text-red-500">{errors.correctAnswer}</p>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
              placeholder="Explain why this answer is correct..."
              rows={2}
            />
            {errors.explanation && (
              <p className="text-sm text-red-500">{errors.explanation}</p>
            )}
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={currentQuestion.difficulty}
                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, examType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="10"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {currentQuestionIndex < questionCount - 1 ? (
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question {currentQuestionIndex + 1}
              </Button>
            ) : (
              <Button
                onClick={handleCompleteAllQuestions}
                disabled={createQuestionsMutation.isPending || questions.length !== questionCount}
                className="bg-green-600 hover:bg-green-700"
              >
                {createQuestionsMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete All Questions
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}