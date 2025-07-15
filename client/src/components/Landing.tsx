import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { Link } from "wouter";
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
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [activeRole, setActiveRole] = useState("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "24/7 AI Tutor",
      description: "Get instant explanations, solve doubts, and receive personalized learning recommendations anytime, anywhere.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Timed CBT Engine",
      description: "Practice with realistic exam conditions including countdown timers, auto-submit, and question randomization.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Track your progress with detailed performance insights, identify weak areas, and get improvement suggestions.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: GraduationCap,
      title: "Nigerian Curriculum",
      description: "Complete coverage of JAMB, WAEC, NECO, GCE, and Post-UTME syllabus with up-to-date question banks.",
      gradient: "from-blue-500 to-green-500"
    },
    {
      icon: Shield,
      title: "Anti-Cheating",
      description: "Advanced proctoring features including tab monitoring, focus detection, and optional webcam supervision.",
      gradient: "from-green-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Institutional Tools",
      description: "Custom exam builder, student management, performance tracking for schools and organizations.",
      gradient: "from-purple-500 to-blue-600"
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/auth/google"}
                className="hidden md:inline-flex border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Google Login
              </Button>
              
              <Link href="/login">
                <Button
                  size="sm"
                  className="hidden md:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Sign In
                </Button>
              </Link>

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
                <Link href="/login">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                CBT Platform
              </span>{" "}
              for Nigeria
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Master JAMB, WAEC, NECO and more with our intelligent Computer-Based Testing platform. 
              Get 24/7 AI tutoring, personalized feedback, and comprehensive exam preparation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Start Learning Free
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-lg px-8 py-4"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500 dark:text-gray-400">
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

          <div className="relative">
            {/* Glassmorphic Dashboard Preview */}
            <Card className="backdrop-blur-lg bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <span className="text-gray-800 dark:text-white font-semibold">Student Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 text-sm">JAMB Preparation</span>
                      <span className="text-green-500 font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 text-sm">WAEC Practice</span>
                      <span className="text-blue-500 font-semibold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 dark:bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">47</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Tests Taken</div>
                    </div>
                    <div className="bg-white/20 dark:bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">8.5</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Edrac?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive CBT platform designed specifically for Nigerian students and institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience Our Dashboard</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Explore different user roles and see how Edrac adapts to your needs
            </p>
            
            {/* Role Selector */}
            <div className="flex justify-center space-x-4 mb-8">
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
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-3 gap-4">
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
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start free and upgrade when you're ready. All plans include our core CBT features with premium AI tutoring available.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                
                <CardContent className="p-8">
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
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
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
