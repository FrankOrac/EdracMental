import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Play, Target, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PracticeInterface from "@/components/exam/PracticeInterface";

export default function Practice() {
  const [location] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<"instant" | "ai">("instant");
  
  // Extract subject ID from URL if provided
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const subjectFromUrl = urlParams.get('subject');
  
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  // If we have a subject selected (either from URL or state), show practice interface
  const currentSubject = selectedSubject || subjectFromUrl;
  
  if (currentSubject) {
    return (
      <PracticeInterface 
        subjectId={currentSubject}
        mode={practiceMode}
        onComplete={() => {
          setSelectedSubject(null);
          window.history.pushState({}, '', '/practice');
        }}
      />
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice Questions</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Choose a subject and practice mode to start improving your skills
              </p>
            </div>
          </div>

          {/* Practice Mode Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    practiceMode === "instant" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setPracticeMode("instant")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Play className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Instant Feedback</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get immediate answers and explanations after each question
                  </p>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    practiceMode === "ai" 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setPracticeMode("ai")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">AI Tutor Mode</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Practice with AI explanations and personalized guidance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Choose Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(subjects) ? subjects.map((subject: any) => (
                  <Card 
                    key={subject.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer border"
                    onClick={() => setSelectedSubject(subject.id.toString())}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-sm text-gray-500">{subject.code}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {subject.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{subject.category}</Badge>
                        <Button size="sm">
                          Start Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-3 text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500">No subjects available</h3>
                    <p className="text-gray-400">Please check back later or contact your administrator.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}