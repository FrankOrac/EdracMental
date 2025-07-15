import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '../layout/DashboardLayout';
import { 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Share2,
  Eye,
  Settings
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  subjects: string[];
  difficulty: string;
  examCategory: string;
  instructions: string;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  institutionId?: string;
}

export default function ExamManager() {
  return (
    <DashboardLayout>
      <ExamManagerContent />
    </DashboardLayout>
  );
}

function ExamManagerContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateOptionsOpen, setIsCreateOptionsOpen] = useState(false);
  const [isSelectExamOpen, setIsSelectExamOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedExamToCopy, setSelectedExamToCopy] = useState<Exam | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['/api/exams'],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(examData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Exam Created",
        description: "Exam has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      toast({
        title: "Exam Deleted",
        description: "Exam has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyShareLink = (examId: string) => {
    const shareUrl = `${window.location.origin}/share/exam/${examId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Exam share link has been copied to clipboard.",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exam Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Create, manage, and share exams for your institution
          </p>
        </div>
        <Dialog open={isCreateOptionsOpen} onOpenChange={setIsCreateOptionsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby="create-exam-options-description">
            <DialogHeader>
              <DialogTitle>Create Exam</DialogTitle>
              <p id="create-exam-options-description" className="text-sm text-gray-600 dark:text-gray-300">
                Choose how you want to create your exam.
              </p>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsCreateOptionsOpen(false);
                  setIsCreateDialogOpen(true);
                }}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Exam
              </Button>
              <Button
                onClick={() => {
                  setIsCreateOptionsOpen(false);
                  setIsSelectExamOpen(true);
                }}
                className="w-full justify-start"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Existing Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="create-exam-description">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <p id="create-exam-description" className="text-sm text-gray-600 dark:text-gray-300">
                Create a new exam with questions from your question bank.
              </p>
            </DialogHeader>
            <CreateExamForm 
              subjects={subjects}
              examToCopy={selectedExamToCopy}
              onSubmit={(data) => {
                createExamMutation.mutate(data);
                setSelectedExamToCopy(null);
              }}
              isLoading={createExamMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isSelectExamOpen} onOpenChange={setIsSelectExamOpen}>
          <DialogContent className="max-w-md" aria-describedby="select-exam-description">
            <DialogHeader>
              <DialogTitle>Select Exam to Copy</DialogTitle>
              <p id="select-exam-description" className="text-sm text-gray-600 dark:text-gray-300">
                Choose an existing exam to copy and modify.
              </p>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {exams.map((exam: Exam) => (
                <Button
                  key={exam.id}
                  onClick={() => {
                    setSelectedExamToCopy(exam);
                    setIsSelectExamOpen(false);
                    setIsCreateDialogOpen(true);
                  }}
                  className="w-full justify-start p-3 h-auto"
                  variant="outline"
                >
                  <div className="text-left">
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-gray-500">{exam.duration} mins • {exam.totalQuestions} questions</p>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Exams</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{exams.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Exams</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {exams.filter((exam: Exam) => exam.isActive).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Public Exams</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {exams.filter((exam: Exam) => exam.isPublic).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Subjects</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{subjects.length}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exams created yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam: Exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{exam.title}</h3>
                          <Badge className={getStatusColor(exam.isActive)}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={getDifficultyColor(exam.difficulty)}>
                            {exam.difficulty}
                          </Badge>
                          {exam.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{exam.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {exam.duration} mins
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {exam.totalQuestions} questions
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedExam(exam);
                            setShareDialogOpen(true);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareLink(exam.id)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/share/exam/${exam.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteExamMutation.mutate(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="share-exam-description">
          <DialogHeader>
            <DialogTitle>Share Exam</DialogTitle>
            <p id="share-exam-description" className="text-sm text-gray-600 dark:text-gray-300">
              Share this exam with candidates or students using the link below.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={selectedExam ? `${window.location.origin}/share/exam/${selectedExam.id}` : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => selectedExam && copyShareLink(selectedExam.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>For interviews:</strong> Share this link with candidates. They'll provide their details before starting the exam.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateExamForm({ subjects, onSubmit, isLoading, examToCopy }: any) {
  const [formData, setFormData] = useState({
    title: examToCopy?.title ? `${examToCopy.title} (Copy)` : '',
    description: examToCopy?.description || '',
    duration: examToCopy?.duration || 60,
    totalQuestions: examToCopy?.totalQuestions || 20,
    subjects: examToCopy?.subjects || [],
    difficulty: examToCopy?.difficulty || 'medium',
    examCategory: examToCopy?.examCategory || 'jamb',
    instructions: examToCopy?.instructions || '',
    isPublic: examToCopy?.isPublic ?? true,
    isActive: examToCopy?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Exam Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter exam title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter exam description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="totalQuestions">Total Questions</Label>
          <Input
            id="totalQuestions"
            type="number"
            min="1"
            value={formData.totalQuestions}
            onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
            required
          />
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
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="examCategory">Exam Type</Label>
          <Select value={formData.examCategory} onValueChange={(value) => setFormData({ ...formData, examCategory: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jamb">JAMB</SelectItem>
              <SelectItem value="waec">WAEC</SelectItem>
              <SelectItem value="neco">NECO</SelectItem>
              <SelectItem value="gce">GCE</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Enter exam instructions"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
          />
          <Label htmlFor="isPublic">Public Access</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Exam'}
      </Button>
    </form>
  );
}