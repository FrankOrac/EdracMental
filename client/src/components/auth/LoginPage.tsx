import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "wouter";
import {
  BookOpen,
  User,
  Building,
  Shield,
  Sun,
  Moon,
  Home,
  Mail,
  Lock,
  LogIn,
  Chrome,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
    // For demo purposes, redirect to Replit auth
    window.location.href = "/api/login";
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Back to Home */}
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Edrac
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Nigeria's leading AI-powered CBT platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Login Card */}
            <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sign In
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Choose your preferred sign-in method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OAuth Options */}
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = "/api/login"}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Continue with Replit
                  </Button>

                  <Button
                    onClick={() => window.location.href = "/api/auth/google"}
                    variant="outline"
                    size="lg"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Chrome className="mr-2 h-5 w-5" />
                    Continue with Google
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Username/Password Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <Link href="#" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Demo Access</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full"
                >
                  {showDemoAccounts ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
                  {showDemoAccounts ? "Hide Demo Accounts" : "View Demo Accounts"}
                </Button>
              </CardContent>
            </Card>

            {/* Demo Accounts Panel */}
            <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Demo Accounts
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Try the platform with pre-configured test accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showDemoAccounts ? (
                  <div className="text-center py-8">
                    <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-6 mb-4">
                      <User className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
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
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Email: {account.email}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                Password: demo123
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

          {/* Sign up link */}
          <div className="text-center pt-8">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}