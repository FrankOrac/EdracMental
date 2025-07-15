import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit } from "lucide-react";

interface ExamDialogProps {
  exam?: any;
  trigger?: React.ReactNode;
  mode?: "add" | "edit";
}

export function ExamDialog({ exam, trigger, mode = "add" }: ExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: exam?.title || "",
    description: exam?.description || "",
    examCategory: exam?.examCategory || "",
    duration: exam?.duration || 60,
    totalQuestions: exam?.totalQuestions || 50,
    passingScore: exam?.passingScore || 50,
    isActive: exam?.isActive ?? true,
    isPublic: exam?.isPublic ?? true,
    subjectIds: exam?.subjectIds || [],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = mode === "edit" ? `/api/exams/${exam.id}` : "/api/exams";
      const method = mode === "edit" ? "PATCH" : "POST";
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setOpen(false);
      toast({
        title: mode === "edit" ? "Exam Updated" : "Exam Created",
        description: `${formData.title} has been ${mode === "edit" ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "create"} exam. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const defaultTrigger = (
    <Button variant={mode === "edit" ? "ghost" : "default"} size={mode === "edit" ? "sm" : "default"}>
      {mode === "edit" ? <Edit className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
      {mode === "edit" ? "" : "Create Exam"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Exam" : "Create New Exam"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Exam Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., JAMB Mathematics Mock Exam"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the exam"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examCategory">Exam Category</Label>
              <Select value={formData.examCategory} onValueChange={(value) => handleChange("examCategory", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                placeholder="60"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalQuestions">Total Questions</Label>
              <Input
                id="totalQuestions"
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => handleChange("totalQuestions", parseInt(e.target.value))}
                placeholder="50"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={formData.passingScore}
                onChange={(e) => handleChange("passingScore", parseInt(e.target.value))}
                placeholder="50"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleChange("isPublic", checked)}
              />
              <Label htmlFor="isPublic">Public</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}