import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Brain,
  Target,
  Zap
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  examType: string;
  createdAt: string;
}

export default function QuestionBankManager() {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for single question
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    subjectId: '',
    topicId: '',
    examType: 'jamb'
  });

  // Fetch questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/questions'],
    select: (data) => data?.filter((q: Question) => 
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterSubject === 'all' || q.subject === filterSubject) &&
      (filterDifficulty === 'all' || q.difficulty === filterDifficulty)
    )
  });

  // Fetch subjects and topics
  const { data: subjects } = useQuery({ queryKey: ['/api/subjects'] });
  const { data: topics } = useQuery({ queryKey: ['/api/topics'] });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/questions', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ title: "Question created successfully" });
      setQuestionForm({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        subjectId: '',
        topicId: '',
        examType: 'jamb'
      });
    },
    onError: () => {
      toast({ title: "Error creating question", variant: "destructive" });
    }
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/questions/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ 
        title: "Bulk upload successful", 
        description: `${data.count} questions uploaded successfully` 
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: () => {
      toast({ title: "Error uploading questions", variant: "destructive" });
      setIsUploading(false);
    }
  });

  const handleSingleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.text || !questionForm.correctAnswer) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createQuestionMutation.mutate(questionForm);
  };

  const handleBulkUpload = () => {
    if (!selectedFile) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    bulkUploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        toast({ title: "Please select a CSV or Excel file", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const downloadTemplate = () => {
    const template = `Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Difficulty,Subject,Topic,Exam Type
"What is the capital of Nigeria?","Lagos","Abuja","Kano","Port Harcourt","Abuja","Abuja is the capital city of Nigeria since 1991","easy","Geography","Nigerian Geography","jamb"
"Solve: 2x + 5 = 15","x = 5","x = 10","x = 15","x = 20","x = 5","Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5","medium","Mathematics","Algebra","jamb"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            Question Bank Manager
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create, import, and manage exam questions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {questions?.length || 0} Questions
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">
            <Plus className="w-4 h-4 mr-2" />
            Single Question
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="manage">
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Create New Question</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleQuestionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={questionForm.subjectId} onValueChange={(value) => 
                      setQuestionForm(prev => ({ ...prev, subjectId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select value={questionForm.topicId} onValueChange={(value) => 
                      setQuestionForm(prev => ({ ...prev, topicId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics?.filter((topic: any) => topic.subjectId.toString() === questionForm.subjectId)
                          .map((topic: any) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="question">Question Text</Label>
                  <Textarea
                    id="question"
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter your question here..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Select value={questionForm.correctAnswer} onValueChange={(value) => 
                      setQuestionForm(prev => ({ ...prev, correctAnswer: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionForm.options.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={questionForm.difficulty} onValueChange={(value) => 
                      setQuestionForm(prev => ({ ...prev, difficulty: value }))
                    }>
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
                  <div>
                    <Label htmlFor="examType">Exam Type</Label>
                    <Select value={questionForm.examType} onValueChange={(value) => 
                      setQuestionForm(prev => ({ ...prev, examType: value }))
                    }>
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
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain why this is the correct answer..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createQuestionMutation.isPending}>
                  {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Bulk Upload Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Upload CSV or Excel files with questions
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading questions...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={!selectedFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload Questions'}
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">File Format Requirements:</p>
                    <ul className="mt-1 text-yellow-700 space-y-1">
                      <li>• CSV or Excel format (.csv, .xlsx, .xls)</li>
                      <li>• Required columns: Question Text, Options A-D, Correct Answer, Explanation</li>
                      <li>• Optional columns: Difficulty, Subject, Topic, Exam Type</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Question Library</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionsLoading ? (
                  <div className="text-center py-8">Loading questions...</div>
                ) : questions?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No questions found. Create your first question or upload a bulk file.
                  </div>
                ) : (
                  questions?.map((question: Question) => (
                    <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {question.subject}
                            </Badge>
                            <Badge variant="outline">
                              {question.examType.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-lg mb-2">{question.text}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            {question.options.map((option, index) => (
                              <div key={index} className={`flex items-center space-x-2 ${option === question.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                <span>{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                {option === question.correctAnswer && <CheckCircle className="w-4 h-4" />}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}