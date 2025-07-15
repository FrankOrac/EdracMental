import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  FileText,
  Eye,
  Edit3,
  Save
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  category: 'grammar' | 'spelling' | 'format' | 'content' | 'structure';
  message: string;
  originalText: string;
  suggestedFix: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  issues?: ValidationIssue[];
}

export default function QuestionValidator() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const { data: questionData } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions", { credentials: "include" });
      return response.json();
    },
  });

  useEffect(() => {
    if (questionData) {
      setQuestions(questionData);
    }
  }, [questionData]);

  const validateQuestionsMutation = useMutation({
    mutationFn: async (questionsToValidate: Question[]) => {
      return apiRequest('/api/ai/validate-questions', {
        method: 'POST',
        body: { questions: questionsToValidate }
      });
    },
    onSuccess: (data) => {
      setQuestions(data.validatedQuestions);
      setIsValidating(false);
      toast({
        title: "Validation Complete",
        description: `Found ${data.totalIssues} issues across ${data.questionsWithIssues} questions`,
      });
    },
    onError: () => {
      setIsValidating(false);
      toast({
        title: "Validation Failed",
        description: "Unable to validate questions. Please try again.",
        variant: "destructive",
      });
    }
  });

  const fixIssueMutation = useMutation({
    mutationFn: async ({ questionId, issueId, acceptedFix }: { 
      questionId: string, 
      issueId: string, 
      acceptedFix: string 
    }) => {
      return apiRequest(`/api/questions/${questionId}/fix-issue`, {
        method: 'PATCH',
        body: { issueId, acceptedFix }
      });
    },
    onSuccess: (data) => {
      setQuestions(prev => 
        prev.map(q => q.id === data.questionId ? data.updatedQuestion : q)
      );
      toast({
        title: "Issue Fixed",
        description: "The question has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Fix Failed",
        description: "Unable to apply the fix. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleValidateAll = () => {
    setIsValidating(true);
    validateQuestionsMutation.mutate(questions);
  };

  const handleFixIssue = (questionId: string, issueId: string, acceptedFix: string) => {
    fixIssueMutation.mutate({ questionId, issueId, acceptedFix });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getIssueBadgeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar':
        return 'G';
      case 'spelling':
        return 'S';
      case 'format':
        return 'F';
      case 'content':
        return 'C';
      case 'structure':
        return 'ST';
      default:
        return '?';
    }
  };

  const questionsWithIssues = questions.filter(q => q.issues && q.issues.length > 0);
  const totalIssues = questions.reduce((sum, q) => sum + (q.issues?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Question Validator & Typo Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {questions.length}
                </div>
                <div className="text-sm text-slate-500">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {questionsWithIssues.length}
                </div>
                <div className="text-sm text-slate-500">With Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalIssues}
                </div>
                <div className="text-sm text-slate-500">Total Issues</div>
              </div>
            </div>
            <Button
              onClick={handleValidateAll}
              disabled={isValidating || questions.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Validate All Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Questions ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-4">
                {questions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedQuestion?.id === question.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2">
                          {question.text.substring(0, 80)}...
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="secondary">{question.subject}</Badge>
                          <Badge variant="outline">{question.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {question.issues && question.issues.length > 0 && (
                          <Badge className={getIssueBadgeColor(question.issues[0].type)}>
                            {question.issues.length} issue{question.issues.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuestion(question);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Question Details & Issues */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              {selectedQuestion ? 'Question Details & Issues' : 'Select a Question'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuestion ? (
              <div className="space-y-6">
                {/* Question Content */}
                <div>
                  <h3 className="font-medium mb-2">Question Text</h3>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {selectedQuestion.text}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h3 className="font-medium mb-2">Options</h3>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border text-sm ${
                          option === selectedQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                        {option === selectedQuestion.correctAnswer && (
                          <Badge className="ml-2 bg-green-500 text-white">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                {selectedQuestion.issues && selectedQuestion.issues.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Issues Found</h3>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {selectedQuestion.issues.map((issue) => (
                          <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getIssueBadgeColor(issue.type)}>
                                    {issue.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {getCategoryIcon(issue.category)}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {Math.round(issue.confidence * 100)}% confidence
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                  {issue.message}
                                </p>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-slate-500">Original:</span>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm">
                                      {issue.originalText}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500">Suggested Fix:</span>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm">
                                      {issue.suggestedFix}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    onClick={() => handleFixIssue(selectedQuestion.id, issue.id, issue.suggestedFix)}
                                    disabled={fixIssueMutation.isPending}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Apply Fix
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Ignore this issue
                                      const updatedQuestion = {
                                        ...selectedQuestion,
                                        issues: selectedQuestion.issues?.filter(i => i.id !== issue.id)
                                      };
                                      setQuestions(prev => 
                                        prev.map(q => q.id === selectedQuestion.id ? updatedQuestion : q)
                                      );
                                      setSelectedQuestion(updatedQuestion);
                                    }}
                                  >
                                    Ignore
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                  No Question Selected
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Select a question from the list to view details and issues
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}