import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { 
  GraduationCap, 
  Building, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Chrome,
  Sun,
  Moon
} from "lucide-react";

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState("student");
  const { theme, toggleTheme } = useTheme();

  const handleReplitSignup = () => {
    window.location.href = "/api/login";
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <Card className="w-full max-w-md backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Join Edrac
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Create your account to start learning
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="institution" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Institution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Student Registration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Access thousands of practice questions and AI tutoring
                </p>
              </div>

              {/* Sign up options */}
              <div className="space-y-3">
                <Button
                  onClick={handleReplitSignup}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Sign up with Replit
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Sign up with Google
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

              {/* Manual signup form */}
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Create Student Account
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="institution" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Institution Registration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage students and create custom exams
                </p>
              </div>

              {/* Sign up options */}
              <div className="space-y-3">
                <Button
                  onClick={handleReplitSignup}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Sign up with Replit
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Sign up with Google
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

              {/* Manual signup form */}
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    type="text"
                    placeholder="Enter institution name"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Administrator Name</Label>
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="Enter your name"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionEmail">Email</Label>
                  <Input
                    id="institutionEmail"
                    type="email"
                    placeholder="Enter institution email"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionPassword">Password</Label>
                  <Input
                    id="institutionPassword"
                    type="password"
                    placeholder="Create a password"
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Create Institution Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Benefits */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                What you get:
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">Free Registration</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">AI Tutoring</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">Mock Exams</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">Progress Tracking</span>
              </div>
            </div>
          </div>

          {/* Already have account */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}