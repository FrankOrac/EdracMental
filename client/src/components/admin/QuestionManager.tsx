import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "../layout/DashboardLayout";

import { 
  Upload, 
  Plus, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  X,
  Bot,
  Sparkles,
  Zap,
  ArrowLeft,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Question {
  id: number;
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
  isActive: boolean;
  createdAt: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  processed: number;
  failed: number;
  errors: string[];
}

export default function QuestionManager() {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'manage'>('select');

  // Fetch subjects for selection
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await fetch('/api/subjects', {
        method: 'GET',
        credentials: 'include'
      });
      return response.json();
    },
  });

  // Fetch exams for selection
  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
    queryFn: async () => {
      const response = await fetch('/api/exams', {
        method: 'GET',
        credentials: 'include'
      });
      return response.json();
    },
  });

  if (step === 'select') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Question Bank Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              First, select a subject or exam to manage questions for
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Select Subject
                </CardTitle>
                <CardDescription>
                  Choose a subject to manage its question bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subjects.map((subject: any) => (
                    <Button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setStep('manage');
                      }}
                      className="w-full justify-start h-auto p-4"
                      variant="outline"
                    >
                      <div className="text-left">
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-gray-500">{subject.code}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exam Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Select Exam
                </CardTitle>
                <CardDescription>
                  Choose an exam to manage its questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {exams.map((exam: any) => (
                    <Button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setStep('manage');
                      }}
                      className="w-full justify-start h-auto p-4"
                      variant="outline"
                    >
                      <div className="text-left">
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-xs text-gray-500">
                          {exam.duration} mins • {exam.totalQuestions} questions
                        </p>
                      </div>
                    </Button>
                  ))}
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setStep('select');
                setSelectedSubject(null);
                setSelectedExam(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedSubject ? selectedSubject.name : selectedExam?.title} Questions
              </h1>
              <p className="text-gray-600">
                Managing questions for {selectedSubject ? 'subject' : 'exam'}
              </p>
            </div>
          </div>
        </div>
        <QuestionManagerContent 
          selectedSubject={selectedSubject}
          selectedExam={selectedExam}
        />
      </div>
    </DashboardLayout>
  );
}

function QuestionManagerContent({ selectedSubject, selectedExam }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate questions using AI mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Questions Generated!",
        description: `Successfully generated ${data.count || 0} questions.`,
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please check your OpenAI API key.",
        variant: "destructive",
      });
    },
  });

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const response = await apiRequest("/api/questions", { method: "GET" });
      return response.json();
    },
  });

  // Fetch subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await apiRequest("/api/subjects", { method: "GET" });
      return response.json();
    },
  });

  // Fetch topics for dropdown
  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"],
    queryFn: async () => {
      const response = await apiRequest("/api/topics", { method: "GET" });
      return response.json();
    },
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await apiRequest("/api/questions", {
        method: "POST",
        body: JSON.stringify(questionData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Question Created",
        description: "Question has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create question. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest(`/api/questions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setEditingQuestion(null);
      toast({
        title: "Question Updated",
        description: "Question has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update question. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest(`/api/questions/${questionId}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question Deleted",
        description: "Question has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(0);
      setUploadResults(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/questions/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      setUploadResults(result);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
        toast({
          title: "Upload Successful",
          description: `Processed ${result.processed} questions successfully.`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download template (Excel format)
  const downloadTemplate = () => {
    const csvContent = "Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Difficulty,Subject,Topic,Exam Type,Points\n" +
      "What is 2+2?,2,3,4,5,C,2+2 equals 4,easy,Mathematics,Basic Arithmetic,jamb,1\n" +
      "Capital of Nigeria?,Lagos,Abuja,Port Harcourt,Kano,B,Abuja is the capital of Nigeria,easy,Geography,West Africa,waec,1";
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter questions
  const filteredQuestions = questions.filter((question: Question) => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || question.subjectId.toString() === filterSubject;
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty;
    const matchesSelectedSubject = selectedSubject ? question.subjectId === selectedSubject.id : true;
    const matchesSelectedExam = selectedExam ? question.examId === selectedExam.id : true;
    return matchesSearch && matchesSubject && matchesDifficulty && matchesSelectedSubject && matchesSelectedExam;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Question Bank
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage and organize your exam questions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isAiGeneratorOpen} onOpenChange={setIsAiGeneratorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="ai-generator-description">
              <DialogHeader>
                <DialogTitle>AI Question Generator</DialogTitle>
                <p id="ai-generator-description" className="text-sm text-gray-600 dark:text-gray-300">
                  Generate questions automatically using AI for any subject and topic.
                </p>
              </DialogHeader>
              <AiQuestionGenerator 
                subjects={subjects}
                topics={topics}
                onSubmit={(data) => generateQuestionsMutation.mutate(data)}
                isLoading={generateQuestionsMutation.isPending}
                onSuccess={() => setIsAiGeneratorOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Questions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby="add-question-options-description">
              <DialogHeader>
                <DialogTitle>Add Questions</DialogTitle>
                <p id="add-question-options-description" className="text-sm text-gray-600 dark:text-gray-300">
                  Choose how you want to add questions to your bank.
                </p>
              </DialogHeader>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsAddQuestionOpen(false);
                    document.getElementById('file-upload')?.click();
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload (CSV/Excel)
                </Button>
                <Button
                  onClick={() => {
                    setIsAddQuestionOpen(false);
                    setIsCreateDialogOpen(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Online
                </Button>
                <Button
                  onClick={() => {
                    setIsAddQuestionOpen(false);
                    downloadTemplate();
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="create-question-description">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
                <p id="create-question-description" className="text-sm text-gray-600 dark:text-gray-300">
                  Create a new question manually with options and explanations.
                </p>
              </DialogHeader>
              <CreateQuestionForm 
                subjects={subjects}
                topics={topics}
                onSubmit={(data) => createQuestionMutation.mutate(data)}
                isLoading={createQuestionMutation.isPending}
                onSuccess={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Questions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{questions.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Easy Questions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {questions.filter((q: Question) => q.difficulty === 'easy').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Medium Questions</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {questions.filter((q: Question) => q.difficulty === 'medium').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Hard Questions</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {questions.filter((q: Question) => q.difficulty === 'hard').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question: Question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-md">
                          <div className="truncate">{question.text}</div>
                        </TableCell>
                        <TableCell>
                          {subjects.find((s: any) => s.id === question.subjectId)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.type}</TableCell>
                        <TableCell>{question.points}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingQuestion(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteQuestionMutation.mutate(question.id)}
                              disabled={deleteQuestionMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload CSV or Excel file</p>
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button className="mt-4" asChild>
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Upload Progress</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {uploadResults && (
                <Alert className={uploadResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center">
                    {uploadResults.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mr-2" />
                    )}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{uploadResults.message}</p>
                        <p className="text-sm">
                          Processed: {uploadResults.processed} | Failed: {uploadResults.failed}
                        </p>
                        {uploadResults.errors.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">
                              View Errors ({uploadResults.errors.length})
                            </summary>
                            <ul className="mt-1 text-sm space-y-1">
                              {uploadResults.errors.map((error, index) => (
                                <li key={index} className="text-red-600">• {error}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Upload Instructions:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Download the template file first</li>
                  <li>• Fill in your questions following the format</li>
                  <li>• Ensure all required fields are populated</li>
                  <li>• Use correct subject and topic names</li>
                  <li>• Save as CSV or Excel format</li>
                  <li>• Upload your completed file</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-purple-600" />
                AI Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AiQuestionGenerator 
                subjects={subjects}
                topics={topics}
                onSubmit={(data) => generateQuestionsMutation.mutate(data)}
                isLoading={generateQuestionsMutation.isPending}
                onSuccess={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="edit-question-description">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <p id="edit-question-description" className="text-sm text-gray-600 dark:text-gray-300">
              Modify the question details and options.
            </p>
          </DialogHeader>
          {editingQuestion && (
            <EditQuestionForm 
              question={editingQuestion}
              subjects={subjects}
              topics={topics}
              onSubmit={(data) => updateQuestionMutation.mutate({ id: editingQuestion.id, data })}
              isLoading={updateQuestionMutation.isPending}
              onSuccess={() => setEditingQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        id="file-upload"
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}

// Edit Question Form Component
function EditQuestionForm({ question, subjects, topics, onSubmit, isLoading, onSuccess }: any) {
  const [formData, setFormData] = useState({
    text: question.text || '',
    type: question.type || 'multiple_choice',
    options: question.options || ['', '', '', ''],
    correctAnswer: question.correctAnswer || '',
    explanation: question.explanation || '',
    difficulty: question.difficulty || 'medium',
    subjectId: question.subjectId || '',
    topicId: question.topicId || '',
    examType: question.examType || 'jamb',
    points: question.points || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="text">Question Text</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {formData.options.map((option, index) => (
          <div key={index}>
            <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
            <Input
              id={`option-${index}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              required
            />
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="correctAnswer">Correct Answer</Label>
        <Select value={formData.correctAnswer} onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why this is the correct answer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
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
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subjectId">Subject</Label>
          <Select value={formData.subjectId.toString()} onValueChange={(value) => setFormData({ ...formData, subjectId: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="topicId">Topic (Optional)</Label>
          <Select value={formData.topicId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, topicId: value ? parseInt(value) : undefined })}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific topic</SelectItem>
              {topics.filter((topic: any) => topic.subjectId === formData.subjectId).map((topic: any) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="examType">Exam Type</Label>
        <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Question'}
      </Button>
    </form>
  );
}

// Create Question Form Component
function CreateQuestionForm({ subjects, topics, onSubmit, isLoading, onSuccess }: any) {
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    subjectId: '',
    topicId: '',
    examType: 'jamb',
    points: 1
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      subjectId: parseInt(formData.subjectId),
      topicId: formData.topicId && formData.topicId !== "none" ? parseInt(formData.topicId) : undefined,
      points: parseInt(formData.points.toString())
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="text">Question Text</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Enter the question text..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="topic">Topic (Optional)</Label>
          <Select value={formData.topicId} onValueChange={(value) => setFormData({ ...formData, topicId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific topic</SelectItem>
              {topics.filter((topic: any) => topic.subjectId === parseInt(formData.subjectId)).map((topic: any) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Options</Label>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label className="w-8">{String.fromCharCode(65 + index)}.</Label>
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="correctAnswer">Correct Answer</Label>
          <Select value={formData.correctAnswer} onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
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
      </div>

      <div>
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain the correct answer..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </form>
  );
}

// AI Question Generator Component
function AiQuestionGenerator({ subjects, topics, onSubmit, isLoading, onSuccess }: any) {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    customTopic: '',
    useCustomTopic: false,
    difficulty: 'medium',
    examType: 'jamb',
    count: 10
  });
  
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine topic value
    let topicValue = '';
    if (formData.useCustomTopic) {
      topicValue = formData.customTopic || 'General';
    } else {
      topicValue = formData.topic || 'General';
    }

    const submitData = {
      subject: formData.subject,
      topic: topicValue,
      difficulty: formData.difficulty,
      examType: formData.examType,
      count: formData.count
    };

    onSubmit(submitData);
    onSuccess();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          AI-Powered Question Generation
        </h3>
        <p className="text-sm text-purple-800 dark:text-purple-200">
          Generate high-quality questions using AI. Questions are automatically fact-checked and saved to your database.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="topic">Topic</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="system-topic"
                  name="topicType"
                  checked={!formData.useCustomTopic}
                  onChange={() => setFormData({ ...formData, useCustomTopic: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="system-topic" className="text-sm">Select from system</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-topic"
                  name="topicType"
                  checked={formData.useCustomTopic}
                  onChange={() => setFormData({ ...formData, useCustomTopic: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="custom-topic" className="text-sm">Enter custom topic</Label>
              </div>
              
              {formData.useCustomTopic ? (
                <Input
                  type="text"
                  value={formData.customTopic}
                  onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
                  placeholder="Enter custom topic (e.g., 'Quadratic Equations')"
                  className="mt-1"
                />
              ) : (
                <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Generate for entire subject</SelectItem>
                    {topics.filter((topic: any) => topic.subjectId === parseInt(formData.subject)).map((topic: any) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
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

          <div>
            <Label htmlFor="examType">Exam Type</Label>
            <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
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

          <div>
            <Label htmlFor="count">Question Count</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
              placeholder="Number of questions"
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for Better Generation:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Specific topics generate more focused questions</li>
            <li>• Start with smaller counts (5-10) for testing</li>
            <li>• Custom topics allow for very specific content</li>
            <li>• Generated questions are automatically saved</li>
          </ul>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !formData.subject || (!formData.topic && !formData.useCustomTopic) || (formData.useCustomTopic && !formData.customTopic)} 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {formData.count} Questions
            </>
          )}
        </Button>
      </form>


    </div>
  );
}