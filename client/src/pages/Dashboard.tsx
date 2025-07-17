import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const { data: learningPackages } = useQuery({
    queryKey: ['/api/learning-packages'],
  });

  const { data: aiTutorSessions } = useQuery({
    queryKey: ['/api/ai-tutor/sessions'],
  });

  const { data: monthlyReviews } = useQuery({
    queryKey: ['/api/monthly-reviews'],
  });

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your personalized learning dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Packages</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learningPackages?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tutor Sessions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aiTutorSessions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyReviews?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get personalized tutoring with our AI assistant
              </p>
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Start AI Tutor Session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore our curated learning packages
              </p>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Packages
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/api/logout'}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}