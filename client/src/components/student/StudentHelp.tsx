import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  Target,
  Users
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function StudentHelp() {
  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    message: "",
    priority: "medium"
  });
  const { toast } = useToast();

  const faqs = [
    {
      question: "How do I start taking an exam?",
      answer: "Go to your dashboard, click on 'View Exams', then select an exam and click 'Take Exam' or 'Practice' for practice mode."
    },
    {
      question: "Can I retake an exam?",
      answer: "Yes, most practice exams can be retaken multiple times. Check the exam details for retake policies."
    },
    {
      question: "How does the AI tutor work?",
      answer: "Our AI tutor provides instant explanations for questions and helps with study guidance. Click on 'AI Tutor' to start a conversation."
    },
    {
      question: "What happens if I lose internet connection during an exam?",
      answer: "The system automatically saves your progress. When you reconnect, you can resume from where you left off."
    },
    {
      question: "How can I track my progress?",
      answer: "Visit the 'My Progress' section to see detailed analytics, performance trends, and subject-wise improvements."
    },
    {
      question: "How do I join study groups?",
      answer: "Go to 'Study Groups' to find groups matching your interests or create your own study group."
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "support@edrac.com",
      hours: "24/7 Response",
      color: "blue"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant messaging support",
      hours: "Mon-Fri, 9AM-6PM",
      color: "green"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "+234 (0) 123 456 7890",
      hours: "Mon-Fri, 9AM-5PM",
      color: "purple"
    }
  ];

  const handleSubmitTicket = () => {
    if (!supportTicket.subject || !supportTicket.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Support Ticket Submitted",
      description: "We'll respond to your inquiry within 24 hours.",
      variant: "default"
    });

    setSupportTicket({ subject: "", message: "", priority: "medium" });
  };

  return (
    <StudentDashboardLayout title="Help & Support" subtitle="Get assistance with your learning journey">
      <div className="space-y-6">
        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Book className="h-8 w-8 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Study Guide</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Learn how to use the platform effectively
              </p>
              <Button variant="outline" size="sm">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Exam Tips</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Strategies for better exam performance
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Connect with other students
              </p>
              <Button variant="outline" size="sm">
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full bg-${method.color}-100 dark:bg-${method.color}-900/20`}>
                    <method.icon className={`h-5 w-5 text-${method.color}-600 dark:text-${method.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{method.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {method.hours}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  placeholder="Brief description of your issue"
                  value={supportTicket.subject}
                  onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={supportTicket.priority}
                  onChange={(e) => setSupportTicket(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  value={supportTicket.message}
                  onChange={(e) => setSupportTicket(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleSubmitTicket} className="w-full">
                Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}