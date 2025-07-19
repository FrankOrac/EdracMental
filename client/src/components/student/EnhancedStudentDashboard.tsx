import { useState } from "react";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  BarChart3, 
  Brain, 
  Target,
  Play,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Star,
  Plus,
  FileText,
  Zap,
  Users,
  Building,
  GraduationCap,
  Settings,
  PlusCircle,
  Filter,
  Search,
  MessageSquare,
  Sparkles,
  Menu,
  User,
  LogOut,
  Home,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Sun,
  Moon
} from "lucide-react";

// Import the components from the old dashboard
import { StudyGroupsManager } from "./StudyGroupsManager";
import { AIStudyMatchmaker } from "./AIStudyMatchmaker";
import EnhancedAITutor from "@/components/ai/EnhancedAITutor";
import CBTExamInterface from "./CBTExamInterface";
import { useTheme } from "@/components/system/ThemeProvider";

export default function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || ''
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const tabVariants = {
    inactive: {
      scale: 1,
      opacity: 0.7
    },
    active: {
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  const { data: institutions } = useQuery({
    queryKey: ["/api/institutions"],
    retry: false,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return await apiRequest("POST", "/api/exams", examData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Exam Created",
        description: "Your custom exam has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (statsLoading || subjectsLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const stats = {
    totalExams: 0,
    averageScore: 0,
    studyTime: 0,
    recentSessions: [],
    ...userStats
  };

  const availableExams = exams?.filter(exam => exam.isActive && (exam.isPublic || exam.createdBy === user?.id || exam.institutionId === user?.institutionId)) || [];
  const completedExams = stats.recentSessions?.length || 0;
  const progressPercentage = Math.min((completedExams / Math.max(availableExams.length, 1)) * 100, 100);

  // Filter exams based on selection
  const filteredExams = availableExams.filter(exam => {
    if (selectedSubject !== "all" && !exam.subjects?.includes(selectedSubject)) return false;
    if (selectedDifficulty !== "all" && exam.difficulty !== selectedDifficulty) return false;
    return true;
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      });
      // Redirect to login
      window.location.href = '/login';
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCustomExam = async (subjectId: string, topicIds: string[], difficulty: string) => {
    try {
      const examData = {
        title: `Custom ${subjects?.find(s => s.id === parseInt(subjectId))?.name} Exam`,
        description: `Custom practice exam created by ${user?.firstName}`,
        duration: 60, // 1 hour default
        totalQuestions: 20,
        subjects: [subjects?.find(s => s.id === parseInt(subjectId))?.name],
        difficulty,
        examCategory: "custom",
        instructions: "Answer all questions to the best of your ability. Good luck!",
        isPublic: false,
        isActive: true,
        institutionId: user?.institutionId || null,
      };

      await createExamMutation.mutateAsync(examData);
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">E</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Edrac
                        </h2>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex-1 p-4">
                      <nav className="space-y-2">
                        {[
                          { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
                          { id: "exams", label: "Exams", icon: BookOpen, color: "text-green-500" },
                          { id: "practice", label: "Practice", icon: Brain, color: "text-orange-500" },
                          { id: "study-groups", label: "Study Groups", icon: Users, color: "text-indigo-500" },
                          { id: "ai-matchmaker", label: "AI Matcher", icon: Sparkles, color: "text-pink-500" },
                          { id: "ai-tutor", label: "AI Tutor", icon: MessageSquare, color: "text-purple-600" },
                          { id: "progress", label: "Progress", icon: TrendingUp, color: "text-teal-500" },
                          { id: "profile", label: "Profile", icon: User, color: "text-gray-500" }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.id}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant={activeTab === item.id ? "default" : "ghost"}
                                className={`w-full justify-start gap-3 h-12 transition-all duration-200 ${
                                  activeTab === item.id 
                                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg" 
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                                }`}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  setSidebarOpen(false);
                                }}
                              >
                                <motion.div
                                  animate={activeTab === item.id ? { rotate: [0, 10, 0] } : {}}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Icon className={`h-5 w-5 ${activeTab === item.id ? "text-white" : item.color}`} />
                                </motion.div>
                                {item.label}
                              </Button>
                            </motion.div>
                          );
                        })}
                      </nav>
                    </div>

                    {/* Profile Section in Sidebar */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setActiveTab("profile");
                            setSidebarOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Manage Profile
                        </Button>
                        
                        {/* Theme Toggle in Sidebar */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={toggleTheme}
                          >
                            {theme === 'dark' ? (
                              <>
                                <Sun className="h-4 w-4 mr-2" />
                                Light Mode
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4 mr-2" />
                                Dark Mode
                              </>
                            )}
                          </Button>
                        </motion.div>
                        
                        {/* Logout Button in Sidebar */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EDRAC CBT Platform</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student Dashboard
                  {user?.institutionId && (
                    <>
                      <span className="text-gray-300">•</span>
                      <Building className="h-4 w-4" />
                      <span>Institution Member</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Connection Status - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.institutionId ? "Institution Connected" : "Direct Access"}
                </span>
              </div>
              {/* User Profile - Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {user?.subscriptionPlan || 'Free'} Plan
                  </div>
                </div>
                {/* Theme Toggle Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="relative"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
                
                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Logout Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Ready to continue your learning journey? Let's ace those exams! 🚀
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TabsList className="hidden lg:grid w-full grid-cols-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1">
              {[
                { value: "overview", icon: BarChart3, label: "Overview", color: "blue" },
                { value: "exams", icon: BookOpen, label: "Exams", color: "green" },
                { value: "practice", icon: Brain, label: "Practice", color: "orange" },
                { value: "study-groups", icon: Users, label: "Groups", color: "indigo" },
                { value: "ai-matchmaker", icon: Sparkles, label: "AI Match", color: "pink" },
                { value: "ai-tutor", icon: MessageSquare, label: "AI Tutor", color: "purple" },
                { value: "progress", icon: TrendingUp, label: "Progress", color: "teal" },
                { value: "profile", icon: User, label: "Profile", color: "gray" }
              ].map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.div
                    key={tab.value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TabsTrigger 
                      value={tab.value}
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        activeTab === tab.value 
                          ? `bg-${tab.color}-500 text-white shadow-lg transform scale-105` 
                          : "hover:shadow-md hover:scale-102"
                      }`}
                    >
                      <motion.div
                        animate={activeTab === tab.value ? { 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <span className="hidden xl:inline">{tab.label}</span>
                    </TabsTrigger>
                  </motion.div>
                );
              })}
            </TabsList>
          </motion.div>

          {/* Mobile Navigation Indicator */}
          <div className="lg:hidden bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {activeTab === "overview" && <><BarChart3 className="h-5 w-5 text-blue-500" /><span>Overview</span></>}
                {activeTab === "exams" && <><BookOpen className="h-5 w-5 text-green-500" /><span>Exams</span></>}
                {activeTab === "practice" && <><Brain className="h-5 w-5 text-orange-500" /><span>Practice</span></>}
                {activeTab === "study-groups" && <><Users className="h-5 w-5 text-indigo-500" /><span>Study Groups</span></>}
                {activeTab === "ai-matchmaker" && <><Sparkles className="h-5 w-5 text-pink-500" /><span>AI Matcher</span></>}
                {activeTab === "ai-tutor" && <><MessageSquare className="h-5 w-5 text-purple-600" /><span>AI Tutor</span></>}
                {activeTab === "progress" && <><TrendingUp className="h-5 w-5 text-teal-500" /><span>Progress</span></>}
                {activeTab === "profile" && <><User className="h-5 w-5 text-gray-500" /><span>Profile</span></>}
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Exams Taken</p>
                        <p className="text-3xl font-bold">{completedExams}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Average Score</p>
                        <p className="text-3xl font-bold">{stats.averageScore || 0}%</p>
                      </div>
                      <Target className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Study Time</p>
                        <p className="text-3xl font-bold">{Math.round((stats.studyTime || 0) / 60)}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Available Exams</p>
                        <p className="text-3xl font-bold">{availableExams.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Exam Completion Progress</span>
                    <span className="text-sm text-gray-500">{completedExams}/{availableExams.length} exams</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've completed {progressPercentage.toFixed(1)}% of available exams. Keep going!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentSessions?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSessions.slice(0, 5).map((session: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{session.examTitle || "Exam"}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.startTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{session.score || 0}%</p>
                          <Badge variant={session.score >= 70 ? "default" : "secondary"}>
                            {session.score >= 70 ? "Passed" : "Review"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent exam sessions found.</p>
                    <p className="text-sm text-gray-400 mt-2">Start taking exams to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters:</span>
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Exam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam: any, index: number) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <Badge variant={exam.difficulty === "hard" ? "destructive" : exam.difficulty === "medium" ? "default" : "secondary"}>
                          {exam.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {exam.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{exam.totalQuestions} questions</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {exam.subjects?.map((subject: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Link href={`/exam/${exam.id}`}>
                        <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No exams found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No exams match your current filters. Try adjusting your criteria.
                  </p>
                  <Button onClick={() => {
                    setSelectedSubject("all");
                    setSelectedDifficulty("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Exam Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Custom Exam
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your own practice exams from available subjects and topics.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects?.map((subject: any) => (
                    <Card key={subject.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <p className="text-sm text-gray-600">{subject.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Select
                              onValueChange={(difficulty) => 
                                handleCreateCustomExam(subject.id.toString(), [], difficulty)
                              }
                            >
                              <SelectTrigger className="transition-all duration-200 hover:shadow-md">
                                <SelectValue placeholder="Choose difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy (20 questions)</SelectItem>
                                <SelectItem value="medium">Medium (30 questions)</SelectItem>
                                <SelectItem value="hard">Hard (40 questions)</SelectItem>
                                <SelectItem value="mixed">Mixed (50 questions)</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CBT Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  CBT Practice Mode
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Practice with instant feedback, explanations, and AI assistance.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjects?.slice(0, 6).map((subject: any) => (
                    <Card key={subject.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {subject.name} Practice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Practice with immediate feedback and AI explanations
                          </p>
                          <div className="flex gap-2">
                            <Link href={`/practice/${subject.id}?mode=instant`} className="flex-1">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button className="w-full transition-all duration-200 hover:shadow-md" variant="outline">
                                  <motion.div 
                                    className="flex items-center"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Instant Feedback
                                  </motion.div>
                                </Button>
                              </motion.div>
                            </Link>
                            <Link href={`/practice/${subject.id}?mode=ai`} className="flex-1">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button className="w-full transition-all duration-200 hover:shadow-md">
                                  <motion.div 
                                    className="flex items-center"
                                    animate={{ y: [0, -2, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                  >
                                    <Brain className="h-4 w-4 mr-2" />
                                    AI Tutor
                                  </motion.div>
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievement Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "First Exam", description: "Complete your first exam", earned: completedExams > 0 },
                      { name: "High Scorer", description: "Score above 80% in an exam", earned: stats.averageScore > 80 },
                      { name: "Study Streak", description: "Study for 5 consecutive days", earned: false },
                      { name: "Subject Master", description: "Excel in all subjects", earned: false },
                    ].map((achievement, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.earned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {achievement.earned ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects?.slice(0, 5).map((subject: any) => {
                      const performance = Math.floor(Math.random() * 40) + 60; // Mock data
                      return (
                        <div key={subject.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{subject.name}</span>
                            <span className="text-sm text-gray-600">{performance}%</span>
                          </div>
                          <Progress value={performance} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="study-groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500" />
                  Collaborative Study Groups
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Join or create study groups with fellow students for collaborative learning.
                </p>
              </CardHeader>
              <CardContent>
                <StudyGroupsManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Study Matchmaker Tab */}
          <TabsContent value="ai-matchmaker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-pink-500" />
                  AI Study Matchmaker
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Get AI-powered recommendations for study groups based on your preferences and learning style.
                </p>
              </CardHeader>
              <CardContent>
                <AIStudyMatchmaker />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tutor Tab */}
          <TabsContent value="ai-tutor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  AI Tutor Assistant
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Get instant help, explanations, and tutoring from our advanced AI assistant.
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedAITutor />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingProfile ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">First Name</label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Name</label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Button onClick={updateProfile} className="w-full transition-all duration-200 hover:shadow-md">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button variant="outline" onClick={() => setEditingProfile(false)} className="transition-all duration-200 hover:shadow-md">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{user?.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>{user?.institution || 'Direct Access'}</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button onClick={() => setEditingProfile(true)} className="w-full transition-all duration-200 hover:shadow-md">
                          <motion.div 
                            className="flex items-center"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </motion.div>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">Subscription Plan</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.subscriptionPlan || 'Free'} Plan
                        </p>
                      </div>
                      <Badge variant="outline">
                        {user?.subscriptionPlan || 'Free'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">Institution Status</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.institutionId ? 'Connected' : 'Independent'}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Preferences
                    </Button>
                    <Button variant="outline" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edrac</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Smart CBT Learning Platform</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Empowering students across Nigeria and West Africa with AI-powered learning, 
                comprehensive exam preparation, and collaborative study experiences.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><button onClick={() => setActiveTab("overview")} className="hover:text-blue-600">Dashboard</button></li>
                <li><button onClick={() => setActiveTab("exams")} className="hover:text-blue-600">Exams</button></li>
                <li><button onClick={() => setActiveTab("practice")} className="hover:text-blue-600">Practice</button></li>
                <li><button onClick={() => setActiveTab("study-groups")} className="hover:text-blue-600">Study Groups</button></li>
                <li><button onClick={() => setActiveTab("ai-tutor")} className="hover:text-blue-600">AI Tutor</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-600">Community</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Edrac. All rights reserved. Made with ❤️ for Nigerian students.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Logged in as: {user?.firstName} {user?.lastName}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}