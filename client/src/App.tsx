import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/system/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/components/system/Landing";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import CleanStudentDashboard from "@/components/student/CleanStudentDashboard";
import ProductionExam from "@/pages/ProductionExam";
import ProductionPractice from "@/pages/ProductionPractice";
import AdminSettings from "@/pages/admin/Settings";
import AdminSubjects from "@/pages/admin/Subjects";
import AdminExams from "@/pages/admin/Exams";
import Analytics from "@/components/system/Analytics";
import AdminUsers from "@/pages/admin/Users";
import AdminInstitutions from "@/pages/admin/Institutions";
import AdminSystem from "@/pages/admin/System";
import AdminQuestionBank from "@/components/admin/AdminQuestionBank";
import ExamManager from "@/components/admin/ExamManager";
import ExamShare from "@/components/system/ExamShare";
import LiveChat from "@/components/system/LiveChat";
import QuestionValidator from "@/components/admin/QuestionValidator";
import Profile from "@/pages/system/Profile";
import CreateQuestions from "@/pages/institution/CreateQuestions";
import EdracPreloader from "@/components/system/EdracPreloader";
import StudentAITutor from "@/components/ai/StudentAITutor";
import StudentAchievements from "@/components/student/StudentAchievements";
import StudentHelp from "@/components/student/StudentHelp";
import StudentSettings from "@/components/student/StudentSettings";
import StudentResults from "@/components/student/StudentResults";
import StudentSchedule from "@/components/student/StudentSchedule";
import StudentStudyGroups from "@/components/student/StudentStudyGroups";
import StudentSubjects from "@/components/student/StudentSubjects";
import StudentProgress from "@/components/student/StudentProgress";
import StudentExams from "@/components/student/StudentExams";
import StudentTutor from "@/components/student/StudentTutor";
import StudentProfile from "@/components/student/StudentProfile";

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
          <Route path="/" component={user?.role === 'student' ? CleanStudentDashboard : Dashboard} />
          <Route path="/dashboard" component={user?.role === 'student' ? CleanStudentDashboard : Dashboard} />
          <Route path="/home" component={Home} />
          <Route path="/exam/:examId?" component={ProductionExam} />
          <Route path="/practice/:subjectId?" component={ProductionPractice} />
          
          {/* Admin-only routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/settings" component={AdminSettings} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/questions" component={AdminQuestionBank} />
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
            </>
          )}
          
          {/* Student-only routes - all using consistent StudentDashboardLayout */}
          {user?.role === 'student' && (
            <>
              <Route path="/achievements" component={StudentAchievements} />
              <Route path="/help" component={StudentHelp} />
              <Route path="/settings" component={StudentSettings} />
              <Route path="/results" component={StudentResults} />
              <Route path="/schedule" component={StudentSchedule} />
              <Route path="/study-groups" component={StudentStudyGroups} />
              <Route path="/exams" component={StudentExams} />
              <Route path="/subjects" component={StudentSubjects} />
              <Route path="/progress" component={StudentProgress} />
              <Route path="/tutor" component={StudentTutor} />
              <Route path="/practice" component={ProductionPractice} />
              <Route path="/profile" component={StudentProfile} />
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
