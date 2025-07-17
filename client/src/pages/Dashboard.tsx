import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "@/components/student/StudentDashboard";
import EnhancedInstitutionDashboard from "@/components/institution/EnhancedInstitutionDashboard";
import EnhancedAdminDashboard from "@/components/admin/EnhancedAdminDashboard";

export default function Dashboard() {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to access the dashboard.</div>;
  }

  // Route users to appropriate dashboards based on their role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'institution':
      return <EnhancedInstitutionDashboard />;
    case 'admin':
      return <EnhancedAdminDashboard />;
    default:
      return <StudentDashboard />; // Default to student dashboard
  }
}