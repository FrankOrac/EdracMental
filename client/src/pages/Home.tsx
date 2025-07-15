import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "@/components/student/StudentDashboard";
import InstitutionDashboard from "@/components/institution/InstitutionDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case "student":
      return <StudentDashboard />;
    case "institution":
      return <InstitutionDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <StudentDashboard />; // Default to student dashboard
  }
}
