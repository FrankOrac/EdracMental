import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  Home,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  Building,
  Shield,
  Users,
  ChevronDown,
  Heart
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: "Dashboard", href: "/", active: location === "/" },
      { icon: BookOpen, label: "Subjects", href: "/subjects", active: location === "/subjects" },
      { icon: FileText, label: "Exams", href: "/exams", active: location === "/exams" },
      { icon: BarChart3, label: "Analytics", href: "/analytics", active: location === "/analytics" },
    ];

    if (user?.role === "admin") {
      baseItems.push(
        { icon: Users, label: "Users", href: "/admin/users", active: location === "/admin/users" },
        { icon: Building, label: "Institutions", href: "/admin/institutions", active: location === "/admin/institutions" },
        { icon: Shield, label: "System", href: "/admin/system", active: location === "/admin/system" }
      );
    }

    if (user?.role === "institution") {
      baseItems.push(
        { icon: Users, label: "Students", href: "/institution/students", active: location === "/institution/students" },
        { icon: FileText, label: "Manage Exams", href: "/institution/exams", active: location === "/institution/exams" }
      );
    }

    baseItems.push({ icon: Settings, label: "Settings", href: "/settings", active: location === "/settings" });

    return baseItems;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "institution":
        return <Building className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "institution":
        return <Badge variant="secondary">Institution</Badge>;
      default:
        return <Badge variant="default">Student</Badge>;
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center space-x-2 ml-4 lg:ml-0">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Edrac</span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    {getRoleBadge(user?.role || "student")}
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-700">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "block" : "hidden"} lg:block fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 mt-16 lg:mt-0`}>
          <div className="h-full flex flex-col">
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end p-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      item.active 
                        ? "bg-blue-500 text-white" 
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User info panel */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getRoleIcon(user?.role || "student")}
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role || "student"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Plan</span>
                    <Badge variant={user?.plan === "premium" ? "default" : "secondary"}>
                      {user?.plan || "free"}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Edrac CBT Platform</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>© 2025 Edrac. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-red-500 fill-current" />
                <span>for Nigerian students</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}