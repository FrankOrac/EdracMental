import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  institution?: string;
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  subjects: string[];
  instructions: string;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  institutionId?: string;
}

export default function ExamShare() {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: "",
    email: "",
    phone: "",
    institution: ""
  });
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const response = await fetch(`/api/exams/shared/${examId}`);
      if (!response.ok) {
        throw new Error("Exam not found or not accessible");
      }
      const examData = await response.json();
      setExam(examData);
      
      // Check if user has already submitted details (from localStorage)
      const storedDetails = localStorage.getItem(`exam_${examId}_user`);
      if (storedDetails) {
        setUserDetails(JSON.parse(storedDetails));
        setHasSubmittedDetails(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save user details and create exam session
      const response = await fetch(`/api/exams/shared/${examId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails)
      });

      if (!response.ok) {
        throw new Error("Failed to register for exam");
      }

      // Store details locally
      localStorage.setItem(`exam_${examId}_user`, JSON.stringify(userDetails));
      setHasSubmittedDetails(true);
      
      toast({
        title: "Registration Successful",
        description: "You can now start the exam. Good luck!",
      });
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleStartExam = () => {
    // Navigate to exam interface with shared exam session
    window.location.href = `/exam/${examId}?shared=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Exam Not Found
            </h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {exam?.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {exam?.description}
            </p>
          </div>

          {/* Exam Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Duration: {exam?.duration} minutes
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Questions: {exam?.totalQuestions}
                  </span>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary">
                    {exam?.subjects && Array.isArray(exam.subjects) ? exam.subjects.join(", ") : "No subjects"}
                  </Badge>
                </div>
              </div>
              
              {exam?.instructions && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Instructions:
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {exam.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Details Form or Start Exam */}
          {!hasSubmittedDetails ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Please provide your details to access the exam
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={userDetails.fullName}
                        onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution (Optional)</Label>
                      <Input
                        id="institution"
                        type="text"
                        value={userDetails.institution}
                        onChange={(e) => setUserDetails({...userDetails, institution: e.target.value})}
                        placeholder="Your school or organization"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Register for Exam
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome, {userDetails.fullName}!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You are registered for this exam. Click below to start.
                  </p>
                </div>
                
                <Button 
                  onClick={handleStartExam}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Start Exam
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}