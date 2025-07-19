import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit2, Eye, Trash2, Filter, Download, Upload, Share2 } from "lucide-react";

const questionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters"),
  type: z.enum(["multiple_choice", "essay", "true_false"]),
  options: z.array(z.string()).min(2, "At least 2 options required").optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  subjectId: z.number().min(1, "Subject is required"),
  topicId: z.number().min(1, "Topic is required").optional(),
  examType: z.enum(["jamb", "waec", "neco", "gce", "custom"]),
  points: z.number().min(1).default(1),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export default function AdminQuestionBank() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [filters, setFilters] = useState({
    subject: "",
    difficulty: "",
    examType: "",
    search: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: "multiple_choice",
      difficulty: "medium",
      examType: "jamb",
      points: 1,
    },
  });

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/questions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/questions');
      return response.json();
    },
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subjects');
      return response.json();
    },
  });

  // Fetch topics based on selected subject
  const selectedSubjectId = form.watch("subjectId");
  const { data: topics = [] } = useQuery({
    queryKey: ['/api/topics', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      const response = await apiRequest('GET', `/api/subjects/${selectedSubjectId}/topics`);
      return response.json();
    },
    enabled: !!selectedSubjectId,
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const response = await apiRequest('POST', '/api/questions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Question created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<QuestionFormData> }) => {
      const response = await apiRequest('PATCH', `/api/questions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setEditingQuestion(null);
      form.reset();
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/questions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    form.reset({
      ...question,
      options: question.options || [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const filteredQuestions = questions.filter((question: any) => {
    return (
      (!filters.subject || question.subjectId?.toString() === filters.subject) &&
      (!filters.difficulty || question.difficulty === filters.difficulty) &&
      (!filters.examType || question.examType === filters.examType) &&
      (!filters.search || question.text.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const questionsByTab = {
    all: filteredQuestions,
    jamb: filteredQuestions.filter((q: any) => q.examType === 'jamb'),
    waec: filteredQuestions.filter((q: any) => q.examType === 'waec'),
    neco: filteredQuestions.filter((q: any) => q.examType === 'neco'),
    custom: filteredQuestions.filter((q: any) => q.examType === 'custom'),
  };

  const stats = {
    total: questions.length,
    jamb: questions.filter((q: any) => q.examType === 'jamb').length,
    waec: questions.filter((q: any) => q.examType === 'waec').length,
    neco: questions.filter((q: any) => q.examType === 'neco').length,
    custom: questions.filter((q: any) => q.examType === 'custom').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Bank Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage questions for students and institutions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Questions
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Questions
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingQuestion(null); form.reset(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
                <DialogDescription>
                  {editingQuestion ? "Update question details" : "Add a new question to the bank"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the question text..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject: any) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="jamb">JAMB</SelectItem>
                              <SelectItem value="waec">WAEC</SelectItem>
                              <SelectItem value="neco">NECO</SelectItem>
                              <SelectItem value="gce">GCE</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("type") === "multiple_choice" && (
                    <div className="space-y-2">
                      <FormLabel>Answer Options</FormLabel>
                      {[0, 1, 2, 3].map((index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={`options.${index}` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the correct answer..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explain why this is the correct answer..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}>
                      {editingQuestion ? "Update Question" : "Create Question"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.jamb}</div>
            <p className="text-xs text-muted-foreground">JAMB Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.waec}</div>
            <p className="text-xs text-muted-foreground">WAEC Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.neco}</div>
            <p className="text-xs text-muted-foreground">NECO Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.custom}</div>
            <p className="text-xs text-muted-foreground">Custom Questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={filters.subject} onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All subjects</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Exam Type</label>
              <Select value={filters.examType} onValueChange={(value) => setFilters(prev => ({ ...prev, examType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All exam types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All exam types</SelectItem>
                  <SelectItem value="jamb">JAMB</SelectItem>
                  <SelectItem value="waec">WAEC</SelectItem>
                  <SelectItem value="neco">NECO</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="jamb">JAMB ({stats.jamb})</TabsTrigger>
          <TabsTrigger value="waec">WAEC ({stats.waec})</TabsTrigger>
          <TabsTrigger value="neco">NECO ({stats.neco})</TabsTrigger>
          <TabsTrigger value="custom">Custom ({stats.custom})</TabsTrigger>
        </TabsList>

        {Object.entries(questionsByTab).map(([tab, tabQuestions]) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>Questions ({(tabQuestions as any[]).length})</CardTitle>
                <CardDescription>
                  Manage questions available to students and institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="text-center py-8">Loading questions...</div>
                ) : (tabQuestions as any[]).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions found. Create your first question!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Exam Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tabQuestions as any[]).map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <div className="font-medium truncate">{question.text}</div>
                              {question.explanation && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {question.explanation}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {subjects.find((s: any) => s.id === question.subjectId)?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                question.difficulty === 'easy' ? 'secondary' : 
                                question.difficulty === 'medium' ? 'default' : 
                                'destructive'
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.examType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(question)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(question.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}