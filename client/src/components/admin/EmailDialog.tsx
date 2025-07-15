import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send } from "lucide-react";

interface EmailDialogProps {
  trigger?: React.ReactNode;
}

export function EmailDialog({ trigger }: EmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
    recipient_type: "individual",
    role_filter: "all",
    send_to_all: false,
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/send-email", { 
        method: "POST", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: () => {
      setOpen(false);
      setFormData({
        to: "",
        subject: "",
        message: "",
        recipient_type: "individual",
        role_filter: "all",
        send_to_all: false,
      });
      toast({
        title: "Email Sent",
        description: "Email has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
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
    <Button>
      <Mail className="mr-2 h-4 w-4" />
      Send Email
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email to Users
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient_type">Recipient Type</Label>
            <Select value={formData.recipient_type} onValueChange={(value) => handleChange("recipient_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Email</SelectItem>
                <SelectItem value="role">By Role</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recipient_type === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="to">To Email</Label>
              <Input
                id="to"
                type="email"
                value={formData.to}
                onChange={(e) => handleChange("to", e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          )}

          {formData.recipient_type === "role" && (
            <div className="space-y-2">
              <Label htmlFor="role_filter">User Role</Label>
              <Select value={formData.role_filter} onValueChange={(value) => handleChange("role_filter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="institution">Institutions</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Email message content"
              rows={8}
              required
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">SMTP Settings</h4>
            <p className="text-sm text-muted-foreground">
              Email functionality requires SMTP configuration in system settings.
              Please configure your SMTP server details in the Settings page.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}