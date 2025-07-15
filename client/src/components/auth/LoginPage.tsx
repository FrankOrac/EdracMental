import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "wouter";
import {
  BookOpen,
  User,
  Building,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Home,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Chrome
} from "lucide-react";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const demoAccounts = [
    {
      role: "student",
      icon: User,
      email: "student@edrac.com",
      name: "Test Student",
      plan: "Free Plan",
      description: "Access practice tests, basic analytics, and community support",
      color: "bg-blue-500",
      badge: "default"
    },
    {
      role: "student",
      icon: User,
      email: "jane.student@edrac.com",
      name: "Jane Doe",
      plan: "Premium Plan",
      description: "Unlimited tests, AI tutor, advanced analytics, and priority support",
      color: "bg-purple-500",
      badge: "secondary"
    },
    {
      role: "institution",
      icon: Building,
      email: "institution@edrac.com",
      name: "Institution Manager",
      plan: "Premium Plan",
      description: "Manage students, create custom exams, and track performance",
      color: "bg-green-500",
      badge: "secondary"
    },
    {
      role: "admin",
      icon: Shield,
      email: "admin@edrac.com",
      name: "System Administrator",
      plan: "Admin Access",
      description: "Full system access, user management, and system configuration",
      color: "bg-red-500",
      badge: "destructive"
    }
  ];

  const handleDemoLogin = (email: string) => {
    // For demo purposes, we'll redirect to the regular login
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Edrac</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Edrac
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Nigeria's leading AI-powered CBT platform for JAMB, WAEC, NECO, and institutional exams
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Login Card */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sign In to Your Account
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Choose your preferred sign-in method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Replit Auth */}
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Continue with Replit
                </Button>

                {/* Google Auth */}
                <Button 
                  onClick={() => window.location.href = "/api/auth/google"}
                  variant="outline"
                  size="lg"
                  className="w-full border-gray-300 dark:border-gray-600"
                >
                  <Chrome className="h-5 w-5 mr-2" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      or for testing
                    </span>
                  </div>
                </div>

                {/* Demo Accounts Toggle */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full border-dashed border-gray-300 dark:border-gray-600"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Demo Accounts
                  <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${showDemoAccounts ? 'rotate-90' : ''}`} />
                </Button>
              </CardContent>
            </Card>

            {/* Demo Accounts Card */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Demo Accounts
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Test different user roles and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showDemoAccounts ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                      <EyeOff className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click "View Demo Accounts" to see available test accounts
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {demoAccounts.map((account) => (
                      <Card key={account.email} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`${account.color} text-white p-2 rounded-lg`}>
                              <account.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {account.name}
                                </span>
                                <Badge variant={account.badge as any}>
                                  {account.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {account.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {account.description}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDemoLogin(account.email)}
                                className="w-full"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Login as {account.name}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Edrac?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Curriculum
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Full coverage of JAMB, WAEC, NECO, and GCE syllabus
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  24/7 AI Tutor
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get instant explanations and personalized learning
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Secure Testing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Advanced anti-cheating and proctoring features
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}