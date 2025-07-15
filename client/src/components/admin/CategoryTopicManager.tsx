import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  BookOpen, Plus, Edit, Trash2, Search, FolderOpen, FileText,
  ChevronRight, ChevronDown, Grid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  topics?: Topic[];
  questionCount?: number;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  subjectId: number;
  difficulty: string;
  questionCount?: number;
}

export default function CategoryTopicManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'subject' | 'topic', item: Subject | Topic } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, type: '', itemId: 0, itemName: "" });
  
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    category: ''
  });
  
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    subjectId: 0,
    difficulty: 'medium'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await fetch("/api/subjects", { credentials: "include" });
      const data = await response.json();
      
      // Fetch topics for each subject
      const subjectsWithTopics = await Promise.all(
        data.map(async (subject: Subject) => {
          const topicsResponse = await fetch(`/api/topics/subject/${subject.id}`, { credentials: "include" });
          const topics = await topicsResponse.json();
          return { ...subject, topics };
        })
      );
      
      return subjectsWithTopics;
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (subject: any) => {
      return apiRequest('/api/subjects', {
        method: 'POST',
        body: JSON.stringify(subject),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsAddingSubject(false);
      setNewSubject({ name: '', code: '', description: '', category: '' });
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive",
      });
    },
  });

  const addTopicMutation = useMutation({
    mutationFn: async (topic: any) => {
      return apiRequest('/api/topics', {
        method: 'POST',
        body: JSON.stringify(topic),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsAddingTopic(false);
      setNewTopic({ name: '', description: '', subjectId: 0, difficulty: 'medium' });
      toast({
        title: "Success",
        description: "Topic added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add topic",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      return apiRequest(`/api/${type}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setDeleteDialog({ isOpen: false, type: '', itemId: 0, itemName: "" });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const toggleSubjectExpansion = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const filteredSubjects = subjects?.filter((subject: Subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const totalSubjects = subjects?.length || 0;
  const totalTopics = subjects?.reduce((sum: number, subject: Subject) => sum + (subject.topics?.length || 0), 0) || 0;
  const totalQuestions = subjects?.reduce((sum: number, subject: Subject) => sum + (subject.questionCount || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading subjects and topics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Category & Topic Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage subjects, categories, and topics for your examination system
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={() => setIsAddingSubject(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
          <Button 
            onClick={() => setIsAddingTopic(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Subjects</p>
                <p className="text-2xl font-bold text-blue-600">{totalSubjects}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Topics</p>
                <p className="text-2xl font-bold text-green-600">{totalTopics}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Questions</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuestions}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject and Topic List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Subjects & Topics
          </CardTitle>
          <CardDescription>Manage your educational content structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubjects.map((subject: Subject) => (
              <motion.div 
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg"
              >
                <div 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                  onClick={() => toggleSubjectExpansion(subject.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {expandedSubjects.has(subject.id) ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {subject.code}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{subject.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subject.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">{subject.category}</Badge>
                        <span className="text-xs text-slate-500">
                          {subject.topics?.length || 0} topics
                        </span>
                        <span className="text-xs text-slate-500">
                          {subject.questionCount || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingItem({ type: 'subject', item: subject })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        type: 'subjects', 
                        itemId: subject.id, 
                        itemName: subject.name 
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSubjects.has(subject.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 pl-16 border-t bg-slate-50 dark:bg-slate-800">
                        <div className="space-y-3">
                          {subject.topics?.map((topic: Topic) => (
                            <div 
                              key={topic.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h5 className="font-medium">{topic.name}</h5>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {topic.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={getDifficultyColor(topic.difficulty)}>
                                  {topic.difficulty}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {topic.questionCount || 0} questions
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => setEditingItem({ type: 'topic', item: topic })}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500"
                                  onClick={() => setDeleteDialog({ 
                                    isOpen: true, 
                                    type: 'topics', 
                                    itemId: topic.id, 
                                    itemName: topic.name 
                                  })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {(!subject.topics || subject.topics.length === 0) && (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No topics available for this subject</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredSubjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  No subjects found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first subject to get started"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Subject Dialog */}
      <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
        <DialogContent aria-describedby="add-subject-description">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription id="add-subject-description">
              Create a new subject for your examination system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                value={newSubject.name}
                onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mathematics"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subjectCode">Subject Code</Label>
              <Input
                id="subjectCode"
                value={newSubject.code}
                onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., MTH"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subjectCategory">Category</Label>
              <Input
                id="subjectCategory"
                value={newSubject.category}
                onChange={(e) => setNewSubject(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Science"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subjectDescription">Description</Label>
              <Textarea
                id="subjectDescription"
                value={newSubject.description}
                onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the subject..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingSubject(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addSubjectMutation.mutate(newSubject)}
              disabled={addSubjectMutation.isPending}
            >
              {addSubjectMutation.isPending ? "Adding..." : "Add Subject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={isAddingTopic} onOpenChange={setIsAddingTopic}>
        <DialogContent aria-describedby="add-topic-description">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription id="add-topic-description">
              Create a new topic under an existing subject
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topicSubject">Subject</Label>
              <select
                id="topicSubject"
                value={newTopic.subjectId}
                onChange={(e) => setNewTopic(prev => ({ ...prev, subjectId: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
              >
                <option value={0}>Select Subject</option>
                {subjects?.map((subject: Subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topicName">Topic Name</Label>
              <Input
                id="topicName"
                value={newTopic.name}
                onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Algebra"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topicDifficulty">Difficulty</Label>
              <select
                id="topicDifficulty"
                value={newTopic.difficulty}
                onChange={(e) => setNewTopic(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topicDescription">Description</Label>
              <Textarea
                id="topicDescription"
                value={newTopic.description}
                onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the topic..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingTopic(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addTopicMutation.mutate(newTopic)}
              disabled={addTopicMutation.isPending}
            >
              {addTopicMutation.isPending ? "Adding..." : "Add Topic"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, type: '', itemId: 0, itemName: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.itemName}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteItemMutation.mutate({ type: deleteDialog.type, id: deleteDialog.itemId })}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}