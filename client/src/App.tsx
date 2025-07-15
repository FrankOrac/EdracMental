import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/components/Landing";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import Home from "@/pages/Home";
import Exam from "@/pages/Exam";
import AdminSettings from "@/pages/admin/Settings";
import AdminSubjects from "@/pages/admin/Subjects";
import AdminExams from "@/pages/admin/Exams";
import Analytics from "@/components/Analytics";
import AdminUsers from "@/pages/admin/Users";
import AdminInstitutions from "@/pages/admin/Institutions";
import AdminSystem from "@/pages/admin/System";
import QuestionManager from "@/components/admin/QuestionManager";
import ExamManager from "@/components/admin/ExamManager";
import ExamShare from "@/components/ExamShare";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/exam/:examId?" component={Exam} />
          <Route path="/settings" component={AdminSettings} />
          <Route path="/subjects" component={AdminSubjects} />
          <Route path="/exams" component={ExamManager} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/questions" component={QuestionManager} />
          <Route path="/admin/institutions" component={AdminInstitutions} />
          <Route path="/admin/system" component={AdminSystem} />
        </>
      )}
      {/* Public exam sharing routes */}
      <Route path="/share/exam/:examId" component={ExamShare} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
