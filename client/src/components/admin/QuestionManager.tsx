import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "../layout/DashboardLayout";
import { Search, Plus, Edit, Trash2, BookOpen, FileSpreadsheet, Upload, FileText, X, Download, Image, Camera } from "lucide-react";
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

export default function QuestionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [addMode, setAddMode] = useState<'subject' | 'exam' | null>(null);
  const [uploadType, setUploadType] = useState<'online' | 'bulk' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{id: string, name: string, type: 'subject' | 'exam'} | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionCountDialog, setShowQuestionCountDialog] = useState(false);

  // Download sample template function
  const downloadSampleTemplate = () => {
    const sampleData = [
      ['Question Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Difficulty', 'Subject', 'Topic', 'Exam Type', 'Points'],
      ['What is 2 + 2?', '3', '4', '5', '6', 'B', 'Basic addition: 2 + 2 equals 4', 'easy', 'Mathematics', 'Basic Arithmetic', 'jamb', '1'],
      ['Choose the correct sentence', 'I are going', 'I am going', 'I is going', 'I be going', 'B', 'Correct subject-verb agreement with "I am"', 'easy', 'English', 'Grammar', 'waec', '1'],
      ['What is the capital of Nigeria?', 'Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'B', 'Abuja is the federal capital territory of Nigeria', 'easy', 'Geography', 'Countries and Capitals', 'neco', '1']
    ];

    const csvContent = sampleData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_sample_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected for bulk upload:', file.name);
    console.log('Target:', selectedTarget);
    
    // TODO: Implement bulk upload functionality
    alert(`Bulk upload selected: ${file.name}\nTarget: ${selectedTarget?.name} (${selectedTarget?.type})\n\nThis feature will process Excel/CSV files and add questions to the selected ${selectedTarget?.type}.`);
    
    // Reset file input
    event.target.value = '';
  };

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["/api/questions"],
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  // Fetch topics
  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"],
  });

  // Fetch exams
  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/questions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({ title: "Question created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create question", variant: "destructive" });
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({ title: "Question updated successfully" });
      setEditingQuestion(null);
    },
    onError: () => {
      toast({ title: "Failed to update question", variant: "destructive" });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({ title: "Question deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete question", variant: "destructive" });
    },
  });

  const filteredQuestions = questions.filter((question: Question) =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Question Manager</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your question bank and create new questions
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowAddOptions(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Questions
          </Button>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question: Question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={question.text}>
                          {question.text}
                        </div>
                      </TableCell>
                      <TableCell>
                        {subjects.find((s: any) => s.id === question.subjectId)?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          question.difficulty === "easy" ? "bg-green-100 text-green-800" :
                          question.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {question.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>{question.type}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
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

        {/* Add Options Dialog */}
        <Dialog open={showAddOptions} onOpenChange={setShowAddOptions}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Questions</DialogTitle>
              <DialogDescription>
                Choose where to add your questions and how you want to add them.
              </DialogDescription>
            </DialogHeader>
            
            {!addMode ? (
              <div className="space-y-4">
                <div className="text-sm font-medium mb-3">Where do you want to add questions?</div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setAddMode('subject')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span>To Subject</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setAddMode('exam')}
                  >
                    <FileText className="h-6 w-6" />
                    <span>To Exam</span>
                  </Button>
                </div>
              </div>
            ) : !selectedTarget ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    Select {addMode === 'subject' ? 'Subject' : 'Exam'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddMode(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(addMode === 'subject' ? subjects : exams).map((item: any) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedTarget({
                        id: item.id,
                        name: item.name || item.title,
                        type: addMode as 'subject' | 'exam'
                      })}
                    >
                      <div className="text-left">
                        <div className="font-medium">{item.name || item.title}</div>
                        {addMode === 'subject' && (
                          <div className="text-xs text-gray-500">{item.code}</div>
                        )}
                        {addMode === 'exam' && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : !uploadType ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      Adding to: {selectedTarget.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedTarget.type === 'subject' ? 'Subject' : 'Exam'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTarget(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  How would you like to add questions?
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => {
                      setUploadType('online');
                      setShowAddOptions(false);
                      setShowQuestionCountDialog(true);
                    }}
                  >
                    <Edit className="h-6 w-6" />
                    <span>Online</span>
                    <span className="text-xs text-gray-500">Create manually</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => {
                      setUploadType('bulk');
                      setShowAddOptions(false);
                    }}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Bulk Upload</span>
                    <span className="text-xs text-gray-500">Excel/CSV file</span>
                  </Button>
                </div>
                
                {/* Download Sample Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={downloadSampleTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample Template
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Add Question Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            // Don't reset selectedTarget - keep it persistent
            setUploadType(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Add Question {currentQuestionIndex + 1} of {questionCount} {selectedTarget && `to ${selectedTarget.name}`}
              </DialogTitle>
              <DialogDescription>
                Create question {currentQuestionIndex + 1} for your question bank. {questionCount > 1 && `${questionCount - currentQuestionIndex - 1} more to go.`}
              </DialogDescription>
            </DialogHeader>
            <QuestionForm
              subjects={subjects}
              topics={topics}
              exams={exams}
              onSubmit={(data) => {
                // When we have a selected target, we need to handle subject/topic IDs
                let questionData = { ...data };
                
                if (selectedTarget?.type === 'subject') {
                  // For subjects, use the selected subject and first available topic
                  questionData.subjectId = parseInt(selectedTarget.id);
                  questionData.topicId = topics.find((t: any) => t.subjectId === parseInt(selectedTarget.id))?.id || 1;
                } else if (selectedTarget?.type === 'exam') {
                  // For exams, use default values or first available
                  questionData.subjectId = subjects[0]?.id || 1;
                  questionData.topicId = topics[0]?.id || 1;
                } else {
                  // No target selected, use form values
                  questionData.subjectId = parseInt(data.subjectId) || subjects[0]?.id || 1;
                  questionData.topicId = parseInt(data.topicId) || topics[0]?.id || 1;
                }
                
                // Ensure all required fields have valid values
                questionData = {
                  ...questionData,
                  targetId: selectedTarget?.id,
                  targetType: selectedTarget?.type,
                  difficulty: questionData.difficulty || 'medium',
                  examType: questionData.examType || 'jamb',
                  points: questionData.points || 1
                };
                
                createQuestionMutation.mutate(questionData, {
                  onSuccess: () => {
                    if (currentQuestionIndex < questionCount - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                      toast({
                        title: "Question Added!",
                        description: `Question ${currentQuestionIndex + 1} of ${questionCount} created. Continue with the next one.`,
                      });
                    } else {
                      setIsAddDialogOpen(false);
                      setCurrentQuestionIndex(0);
                      toast({
                        title: "Success!",
                        description: `All ${questionCount} questions have been created successfully.`,
                      });
                    }
                  },
                  onError: (error) => {
                    toast({
                      title: "Error",
                      description: "Failed to create question. Please try again.",
                      variant: "destructive",
                    });
                  }
                });
              }}
              isLoading={createQuestionMutation.isPending}
              selectedTarget={selectedTarget}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questionCount}
            />
          </DialogContent>
        </Dialog>

        {/* Question Count Dialog */}
        <Dialog open={showQuestionCountDialog} onOpenChange={setShowQuestionCountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>How many questions?</DialogTitle>
              <DialogDescription>
                How many questions would you like to add to {selectedTarget?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="questionCount">Number of questions:</Label>
                <Select 
                  value={questionCount.toString()} 
                  onValueChange={(value) => setQuestionCount(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,10,15,20,25,30].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionCountDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowQuestionCountDialog(false);
                    setCurrentQuestionIndex(0);
                    setIsAddDialogOpen(true);
                  }}
                >
                  Start Adding Questions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={uploadType === 'bulk'} onOpenChange={(open) => {
          if (!open) setUploadType(null);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Upload Questions</DialogTitle>
              <DialogDescription>
                Upload questions to {selectedTarget?.name} using Excel or CSV file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Select your file containing questions. Make sure it follows the sample template format.
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={downloadSampleTemplate}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample Template
                </Button>
                
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File to Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Modify the question details and options.
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <QuestionForm
                question={editingQuestion}
                subjects={subjects}
                topics={topics}
                onSubmit={(data) => updateQuestionMutation.mutate({ id: editingQuestion.id, data })}
                isLoading={updateQuestionMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Hidden file input for bulk upload */}
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Clear Selection Button */}
        {selectedTarget && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="font-medium">Adding to: {selectedTarget.name}</div>
                <div className="text-xs text-gray-500">{selectedTarget.type}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTarget(null);
                  setAddMode(null);
                  setUploadType(null);
                  setShowAddOptions(false);
                  setIsAddDialogOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Question Form Component
function QuestionForm({ question, subjects, topics, exams, onSubmit, isLoading, selectedTarget, questionNumber, totalQuestions }: any) {
  const [formData, setFormData] = useState({
    text: question?.text || '',
    type: question?.type || 'multiple_choice',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || '',
    explanation: question?.explanation || '',
    difficulty: question?.difficulty || 'medium',
    subjectId: question?.subjectId || (selectedTarget?.type === 'subject' ? parseInt(selectedTarget.id) : (subjects[0]?.id || 1)),
    topicId: question?.topicId || (topics[0]?.id || 1),
    examType: question?.examType || 'jamb',
    points: question?.points || 1,
    imageUrl: question?.imageUrl || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(question?.imageUrl || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form for next question
    if (questionNumber < totalQuestions) {
      setFormData({
        text: '',
        type: 'multiple_choice',
        subjectId: selectedTarget?.type === 'subject' ? parseInt(selectedTarget.id) : (subjects[0]?.id || 1),
        topicId: selectedTarget?.type === 'subject' ? (topics.find((t: any) => t.subjectId === parseInt(selectedTarget.id))?.id || 1) : (topics[0]?.id || 1),
        difficulty: formData.difficulty,
        examType: formData.examType,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1,
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedTarget && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Adding question to: {selectedTarget.name}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {selectedTarget.type === 'subject' 
              ? 'This question will be added to the selected subject\'s question bank'
              : 'This question will be added directly to the selected exam'
            }
          </div>
        </div>
      )}
      
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

      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label>Question Image (Optional)</Label>
        
        {imagePreview ? (
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Question preview" 
              className="max-w-full h-40 object-contain border rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
        
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Only show these fields when no target is selected */}
      {!selectedTarget && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
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
              <Label htmlFor="topic">Topic</Label>
              <Select value={formData.topicId.toString()} onValueChange={(value) => setFormData({ ...formData, topicId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic: any) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </>
      )}

      <div>
        <Label>Options</Label>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <Input
              key={index}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              required
            />
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="correctAnswer">Correct Answer</Label>
        <Select value={formData.correctAnswer} onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            {formData.options.map((option, index) => 
              option.trim() ? (
                <SelectItem key={index} value={option}>
                  {String.fromCharCode(65 + index)}: {option}
                </SelectItem>
              ) : null
            )}
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

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : 
           questionNumber < totalQuestions ? `Add Question ${questionNumber}` : 
           totalQuestions > 1 ? "Complete All Questions" : "Create Question"}
        </Button>
        {questionNumber < totalQuestions && (
          <div className="text-sm text-gray-500 self-center">
            {totalQuestions - questionNumber} more
          </div>
        )}
      </div>
    </form>
  );
}