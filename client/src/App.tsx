import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/components/Landing";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Exam from "@/pages/Exam";
import Practice from "@/pages/Practice";
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
import LiveChat from "@/components/LiveChat";
import QuestionValidator from "@/components/QuestionValidator";
import Profile from "@/pages/Profile";
import CreateQuestions from "@/pages/CreateQuestions";
import EdracPreloader from "@/components/EdracPreloader";
import StudentAITutor from "@/components/ai/StudentAITutor";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Show preloader only on first app load
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  // Show preloader on initial app load
  if (showPreloader && isInitialLoad) {
    return <EdracPreloader onComplete={handlePreloaderComplete} duration={2500} />;
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
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/home" component={Home} />
          <Route path="/exam/:examId?" component={Exam} />
          <Route path="/practice/:subjectId?" component={Practice} />
          <Route path="/profile" component={Profile} />
          
          {/* Admin-only routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/settings" component={AdminSettings} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/questions" component={QuestionManager} />
              <Route path="/admin/question-validator" component={QuestionValidator} />
              <Route path="/admin/institutions" component={AdminInstitutions} />
              <Route path="/admin/system" component={AdminSystem} />
            </>
          )}
          
          {/* Institution-only routes */}
          {user?.role === 'institution' && (
            <>
              <Route path="/exams" component={ExamManager} />
              <Route path="/create-questions" component={CreateQuestions} />
              <Route path="/students" component={AdminUsers} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={AdminSettings} />
            </>
          )}
          
          {/* Student-only routes */}
          {user?.role === 'student' && (
            <>
              <Route path="/exams" component={ExamManager} />
              <Route path="/subjects" component={AdminSubjects} />
              <Route path="/progress" component={Analytics} />
              <Route path="/tutor" component={StudentAITutor} />
            </>
          )}
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
          <LiveChat />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
