import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  BookOpen, Play, Pause, Edit, Copy, Share2, Trash2, Search,
  Plus, Filter, MoreHorizontal, Eye, Users, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DeleteDialog {
  isOpen: boolean;
  step: number;
  itemId: string;
  itemName: string;
  itemType: string;
}

export default function DashboardExamManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    isOpen: false,
    step: 0,
    itemId: "",
    itemName: "",
    itemType: ""
  });
  const [confirmationText, setConfirmationText] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exams, isLoading } = useQuery({
    queryKey: ["/api/exams"],
    queryFn: async () => {
      const response = await fetch("/api/exams", { credentials: "include" });
      return response.json();
    },
  });

  const toggleExamStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/system"] });
      toast({
        title: "Success",
        description: "Exam status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      return apiRequest(`/api/${type}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/system"] });
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
      setDeleteDialog({ isOpen: false, step: 0, itemId: "", itemName: "", itemType: "" });
      setConfirmationText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    },
  });

  const initiateDelete = (id: string, name: string, type: string) => {
    setDeleteDialog({
      isOpen: true,
      step: 1,
      itemId: id,
      itemName: name,
      itemType: type
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.step < 3) {
      setDeleteDialog(prev => ({ ...prev, step: prev.step + 1 }));
    } else {
      if (confirmationText === deleteDialog.itemName) {
        deleteItemMutation.mutate({ 
          id: deleteDialog.itemId, 
          type: deleteDialog.itemType 
        });
      } else {
        toast({
          title: "Error",
          description: "Confirmation text does not match",
          variant: "destructive",
        });
      }
    }
  };

  const filteredExams = exams?.filter((exam: any) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading exams...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exam Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage and monitor your examination system
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Exam
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Exams</p>
                <p className="text-2xl font-bold">{exams?.length || 0}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Exams</p>
                <p className="text-2xl font-bold">{exams?.filter((exam: any) => exam.isActive).length || 0}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Inactive Exams</p>
                <p className="text-2xl font-bold">{exams?.filter((exam: any) => !exam.isActive).length || 0}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Exam List */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Examination List
            </CardTitle>
            <CardDescription>Manage all your exams and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExams.map((exam: any) => (
                <motion.div 
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {exam.isActive ? (
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-lg group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {exam.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {exam.duration} min
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {exam.totalQuestions} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={exam.isActive ? "default" : "secondary"}>
                      {exam.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Switch
                        checked={exam.isActive}
                        onCheckedChange={(checked) => 
                          toggleExamStatus.mutate({ id: exam.id, isActive: checked })
                        }
                      />
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                        onClick={() => initiateDelete(exam.id, exam.title, "exams")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredExams.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                    No exams found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first exam to get started"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Triple Confirmation Delete Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, step: 0, itemId: "", itemName: "", itemType: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.step === 1 && "Are you sure you want to delete this exam?"}
              {deleteDialog.step === 2 && "This action cannot be undone"}
              {deleteDialog.step === 3 && "Final confirmation required"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.step === 1 && `You are about to delete "${deleteDialog.itemName}". This action cannot be undone.`}
              {deleteDialog.step === 2 && `Deleting "${deleteDialog.itemName}" will permanently remove all associated data including questions, sessions, and results. Are you absolutely sure?`}
              {deleteDialog.step === 3 && `This is your final chance to cancel. Type "${deleteDialog.itemName}" below to confirm deletion.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteDialog.step === 3 && (
            <div className="py-4">
              <Input 
                placeholder={`Type "${deleteDialog.itemName}" to confirm`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialog({ isOpen: false, step: 0, itemId: "", itemName: "", itemType: "" });
              setConfirmationText("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteDialog.step < 3 ? "Continue" : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}