import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ExamDialog } from "@/components/admin/ExamDialog";
import { FileText, Plus, Search, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminExams() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: exams, isLoading } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      return apiRequest(`/api/exams/${examId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Exam Deleted",
        description: "Exam has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredExams = exams?.filter((exam: any) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examCategory.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (exam: any) => {
    if (confirm(`Are you sure you want to delete ${exam.title}?`)) {
      deleteExamMutation.mutate(exam.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground">Create and manage exams</p>
          </div>
          <ExamDialog mode="add" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Exams
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam: any) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.examCategory?.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell>{exam.totalQuestions}</TableCell>
                    <TableCell>
                      <Badge variant={exam.isActive ? "default" : "secondary"}>
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ExamDialog mode="edit" exam={exam} />
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(exam)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}