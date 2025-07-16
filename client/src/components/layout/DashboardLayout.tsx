import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Menu, 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  BarChart3, 
  FileText,
  Shield,
  Building,
  LogOut,
  Bell,
  Search,
  MessageCircle,
  CheckCircle2,
  Sun,
  Moon,
  User,
  Plus,
  Brain
} from "lucide-react";

const getSidebarItems = (userRole: string) => {
  const commonItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  if (userRole === 'admin') {
    return [
      ...commonItems,
      { icon: BarChart3, label: "System Analytics", path: "/analytics" },
      { icon: Users, label: "User Management", path: "/admin/users" },
      { icon: Building, label: "Institutions", path: "/admin/institutions" },
      { icon: FileText, label: "Content Management", path: "/admin/questions" },
      { icon: CheckCircle2, label: "Question Validator", path: "/admin/question-validator" },
      { icon: Shield, label: "System Health", path: "/admin/system" },
      { icon: Settings, label: "Global Settings", path: "/settings" },
    ];
  }

  if (userRole === 'institution') {
    return [
      ...commonItems,
      { icon: BookOpen, label: "Exam Management", path: "/exams" },
      { icon: FileText, label: "Question Bank", path: "/create-questions" },
      { icon: Users, label: "Student Management", path: "/students" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: Settings, label: "Institution Settings", path: "/settings" },
    ];
  }

  // Student role
  return [
    ...commonItems,
    { icon: BookOpen, label: "Available Exams", path: "/exams" },
    { icon: Brain, label: "Study Materials", path: "/subjects" },
    { icon: BarChart3, label: "My Progress", path: "/progress" },
    { icon: MessageCircle, label: "AI Tutor", path: "/tutor" },
  ];
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;
  const sidebarItems = getSidebarItems(user?.role || 'student');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="font-semibold text-lg">Edrac CBT</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Home button that goes to landing page */}
        <a href="/" className="block">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </div>
        </a>
        
        {sidebarItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                isActive(item.path)
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-slate-500">{user?.role}</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:dark:bg-slate-800 lg:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-800 shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 ml-12 lg:ml-0">
                {sidebarItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <Button variant="ghost" size="icon" onClick={() => {}} className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {}} className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {}} className="hidden sm:flex">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-140px)]">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t px-4 py-6 md:px-6">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2025 Edrac CBT Platform. All rights reserved.</p>
            <p className="mt-1">Empowering education through innovative technology.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}