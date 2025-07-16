import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Button3D } from "@/components/ui/button-3d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  GraduationCap, 
  Brain, 
  Clock, 
  TrendingUp, 
  Shield, 
  Users, 
  Play, 
  Star,
  CheckCircle,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  LogOut,
  Sparkles,
  Zap,
  Target,
  Award,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Calendar,
  PieChart
} from "lucide-react";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeRole, setActiveRole] = useState("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "24/7 AI Tutor",
      description: "Advanced AI tutoring with instant explanations, typo detection, and intelligent fallback responses even offline.",
      gradient: "from-blue-500 to-purple-600",
      stats: "Smart Fallback System"
    },
    {
      icon: Shield,
      title: "Advanced Proctoring",
      description: "Comprehensive proctoring with tab monitoring, focus detection, webcam supervision, and violation reporting.",
      gradient: "from-green-500 to-purple-600",
      stats: "Enterprise-Grade Security"
    },
    {
      icon: Sparkles,
      title: "AI Question Validation",
      description: "Automated question validation with grammar checking, typo correction, and content optimization.",
      gradient: "from-purple-500 to-pink-600",
      stats: "AI-Powered Validation"
    },
    {
      icon: Clock,
      title: "Timed CBT Engine",
      description: "Practice with realistic exam conditions including countdown timers, auto-submit, and question randomization.",
      gradient: "from-green-500 to-teal-600",
      stats: "Real Exam Conditions"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Track your progress with detailed performance insights, identify weak areas, and get improvement suggestions.",
      gradient: "from-orange-500 to-red-600",
      stats: "Advanced Performance Tracking"
    },
    {
      icon: GraduationCap,
      title: "Nigerian Curriculum",
      description: "Complete coverage of JAMB, WAEC, NECO, GCE, and Post-UTME syllabus with up-to-date question banks.",
      gradient: "from-blue-500 to-green-500",
      stats: "100% Curriculum Coverage"
    }
  ];

  const achievements = [
    {
      icon: Brain,
      title: "AI Tutor",
      description: "24/7 intelligent tutoring with fallback responses",
      number: "24/7"
    },
    {
      icon: Shield,
      title: "Proctoring",
      description: "Advanced monitoring with webcam supervision",
      number: "100%"
    },
    {
      icon: Sparkles,
      title: "AI Validation",
      description: "Automated question checking and typo correction",
      number: "Real-time"
    },
    {
      icon: Target,
      title: "Success Rate",
      description: "Students show significant improvement in scores",
      number: "95%"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₦0",
      period: "Forever free",
      features: [
        "5 practice tests per month",
        "Basic question bank access",
        "Performance tracking",
        "Community support"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Premium",
      price: "₦2,500",
      period: "per month",
      features: [
        "Unlimited practice tests",
        "Complete question bank",
        "24/7 AI tutor access",
        "Advanced analytics",
        "Priority support",
        "No advertisements"
      ],
      buttonText: "Upgrade to Premium",
      popular: true
    },
    {
      name: "Institution",
      price: "₦50,000",
      period: "per month",
      features: [
        "Everything in Premium",
        "Unlimited students",
        "Custom exam builder",
        "Institution dashboard",
        "White-label options",
        "Dedicated support"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const appSections = [
    {
      title: "AI Tutor Dashboard",
      description: "24/7 intelligent tutoring with instant explanations",
      icon: Brain,
      gradient: "from-blue-500 to-purple-600",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <span className="text-gray-800 dark:text-white font-semibold">AI Tutor</span>
            </div>
            <div className="text-green-500 text-sm">Online</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="text-blue-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  "Explain photosynthesis in plants"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI is typing detailed explanation...
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Question Validation",
      description: "AI-powered question checking and typo correction",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-600",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="text-white text-sm" />
              </div>
              <span className="text-gray-800 dark:text-white font-semibold">Question Validator</span>
            </div>
            <div className="text-green-500 text-sm">✓ Validated</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Grammar: Perfect</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Spelling: No errors</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Format: Optimized</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Exam Management",
      description: "Create, share, and monitor exams with advanced proctoring",
      icon: Shield,
      gradient: "from-green-500 to-teal-600",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <Shield className="text-white text-sm" />
              </div>
              <span className="text-gray-800 dark:text-white font-semibold">Exam Proctoring</span>
            </div>
            <div className="text-red-500 text-sm">● Live</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 dark:text-white">247</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 dark:text-white">0</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Violations</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Analytics Dashboard",
      description: "Track progress with detailed performance insights",
      icon: BarChart3,
      gradient: "from-orange-500 to-red-600",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <BarChart3 className="text-white text-sm" />
              </div>
              <span className="text-gray-800 dark:text-white font-semibold">Analytics</span>
            </div>
            <div className="text-blue-500 text-sm">Updated</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Average Score</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">87%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{ width: "87%" }}></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % appSections.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [appSections.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % appSections.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + appSections.length) % appSections.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Edrac
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:inline-flex text-gray-700 dark:text-gray-300"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden md:inline-flex text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:inline-flex text-gray-700 dark:text-gray-300"
                    >
                      Login
                    </Button>
                  </Link>
                  
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="hidden md:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection("features")} className="text-left text-gray-700 dark:text-gray-300">Features</button>
                <button onClick={() => scrollToSection("pricing")} className="text-left text-gray-700 dark:text-gray-300">Pricing</button>
                <button onClick={() => scrollToSection("about")} className="text-left text-gray-700 dark:text-gray-300">About</button>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-4 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-4 sm:right-20 w-16 h-16 sm:w-24 sm:h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-32 sm:w-40 sm:h-40 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
          <div className="text-center lg:text-left order-1 lg:order-1">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Nigeria's #1 CBT Platform
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Master Your{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Exams with AI
              </span>{" "}
              Intelligence
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Experience the future of learning with our <strong>24/7 AI Tutor</strong> and <strong>Advanced Proctoring System</strong>. 
              Get instant explanations, real-time monitoring, and comprehensive exam preparation for 
              JAMB, WAEC, NECO, and more - all powered by cutting-edge AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              {user ? (
                <Link href="/dashboard">
                  <Button3D variant="primary" size="lg">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button3D>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button3D variant="primary" size="lg">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Start Learning Free
                  </Button3D>
                </Link>
              )}
              <Button3D variant="outline" size="lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button3D>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl backdrop-blur-sm">
                  <achievement.icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{achievement.number}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.title}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Free Registration</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>24/7 AI Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>50,000+ Questions</span>
              </div>
            </div>
          </div>

          <div className="relative order-2 lg:order-2 mb-8 lg:mb-0">
            {/* Interactive App Sections Slider */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              
              <Card className="relative backdrop-blur-lg bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 transform perspective-1000 hover:rotateY-5">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Slider Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${appSections[currentSlide].gradient} rounded-full flex items-center justify-center`}>
                        {React.createElement(appSections[currentSlide].icon, { className: "text-white text-sm" })}
                      </div>
                      <span className="text-gray-800 dark:text-white font-semibold text-sm sm:text-base">
                        {appSections[currentSlide].title}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
                    </div>
                  </div>

                  {/* Slide Content */}
                  <div className="mb-6">
                    {appSections[currentSlide].content}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevSlide}
                      className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {appSections.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlide 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={nextSlide}
                      className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Section Description */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appSections[currentSlide].description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Highlight Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full mb-6">
              <Brain className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Advanced AI Technology
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Next-Generation AI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
              Experience the future of learning with our comprehensive AI-powered features designed to enhance your exam preparation journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {/* AI Tutor Feature */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="relative backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 transform hover:rotateY-5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">24/7 AI Tutor</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Get instant explanations for any question with our advanced AI tutor that provides detailed step-by-step solutions, even when offline with intelligent fallback responses.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Instant question explanations</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Typo detection & correction</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Smart fallback responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proctoring System */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="relative backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 transform hover:rotateY-5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Advanced Proctoring</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Comprehensive exam monitoring with tab detection, focus tracking, webcam supervision, and real-time violation reporting for secure testing environments.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Tab switch monitoring</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Focus detection system</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Webcam supervision</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Validation */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="relative backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 transform hover:rotateY-5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Question Validation</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Automated question validation with grammar checking, typo correction, and content optimization to ensure high-quality exam content.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Grammar & spelling checks</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Content optimization</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Real-time validation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer">
              <Sparkles className="h-5 w-5 mr-2" />
              Experience AI-Powered Learning Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Edrac?</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive CBT platform designed specifically for Nigerian students and institutions.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative group perspective-1000">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 transform hover:rotateY-5 group-hover:bg-white/90 dark:group-hover:bg-white/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {feature.stats}
                      </Badge>
                      <Zap className="h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience Our Dashboard</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Explore different user roles and see how Edrac adapts to your needs
            </p>
            
            {/* Role Selector */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
              {["student", "institution", "admin"].map((role) => (
                <Button
                  key={role}
                  variant={activeRole === role ? "default" : "outline"}
                  onClick={() => setActiveRole(role)}
                  className={activeRole === role 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }
                >
                  {role === "student" && <GraduationCap className="mr-2 h-4 w-4" />}
                  {role === "institution" && <Users className="mr-2 h-4 w-4" />}
                  {role === "admin" && <Shield className="mr-2 h-4 w-4" />}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Dashboard Content */}
          <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-white/20 shadow-2xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                    {activeRole === "student" && (
                      <>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">47</div>
                          <div className="text-sm opacity-90">Tests Completed</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">85%</div>
                          <div className="text-sm opacity-90">Average Score</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">24</div>
                          <div className="text-sm opacity-90">Study Hours</div>
                        </div>
                      </>
                    )}

                    {activeRole === "institution" && (
                      <>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">1,247</div>
                          <div className="text-sm opacity-90">Total Students</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">34</div>
                          <div className="text-sm opacity-90">Active Exams</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">89%</div>
                          <div className="text-sm opacity-90">Pass Rate</div>
                        </div>
                      </>
                    )}

                    {activeRole === "admin" && (
                      <>
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">15,432</div>
                          <div className="text-sm opacity-90">Total Users</div>
                        </div>
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">₦2.1M</div>
                          <div className="text-sm opacity-90">Revenue</div>
                        </div>
                        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">8,945</div>
                          <div className="text-sm opacity-90">Questions</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {activeRole === "student" ? "Completed JAMB Mathematics Practice" : 
                               activeRole === "institution" ? "New student registration" : 
                               "System backup completed"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          {activeRole === "student" ? "Take Practice Test" : 
                           activeRole === "institution" ? "Create New Exam" : 
                           "System Overview"}
                        </Button>
                        <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          {activeRole === "student" ? "Ask AI Tutor" : 
                           activeRole === "institution" ? "Manage Students" : 
                           "User Management"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start free and upgrade when you're ready. All plans include our core CBT features with premium AI tutoring available.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`backdrop-blur-lg ${plan.popular ? 'bg-white/90 dark:bg-white/15 border-2 border-blue-500 shadow-2xl' : 'bg-white/80 dark:bg-white/10 border-white/20 shadow-xl'} hover:shadow-2xl transition-all duration-300 relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{plan.price}</div>
                    <div className="text-gray-600 dark:text-gray-400">{plan.period}</div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                      : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => window.location.href = "/api/login"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="text-center mt-16">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Secure payments powered by</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-green-600">Paystack</div>
              <div className="text-2xl font-bold text-orange-500">Flutterwave</div>
              <div className="text-2xl font-bold text-blue-600">Stripe</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white text-lg" />
                </div>
                <span className="text-2xl font-bold">Edrac</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering Nigerian students with AI-powered CBT platform for JAMB, WAEC, NECO, and more. 
                Your success is our mission.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">T</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">F</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">I</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">L</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><button onClick={() => scrollToSection("features")} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">JAMB Practice</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">WAEC Practice</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">AI Tutor</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li>
                  <div className="text-gray-400">
                    <div>📧 support@edrac.com</div>
                    <div>📞 +234 808 123 4567</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Edrac. All rights reserved. Built with ❤️ for Nigerian students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
