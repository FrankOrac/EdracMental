import { useAuth } from "@/hooks/useAuth";
import EnhancedAdminDashboard from "@/components/admin/EnhancedAdminDashboard";
import EnhancedInstitutionDashboard from "@/components/institution/EnhancedInstitutionDashboard";
import EnhancedStudentDashboard from "@/components/student/EnhancedStudentDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Route to appropriate enhanced dashboard based on user role
  if (user?.role === 'admin') {
    return <EnhancedAdminDashboard />;
  }
  
  if (user?.role === 'institution') {
    return <EnhancedInstitutionDashboard />;
  }
  
  // Default to enhanced student dashboard
  return <EnhancedStudentDashboard />;
}