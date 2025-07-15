import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, FunnelChart,
  Funnel, LabelList
} from "recharts";
import { 
  TrendingUp, Users, BookOpen, DollarSign, Building, Activity,
  Calendar, Clock, Award, Target, Zap, Globe, Brain, Eye,
  ArrowUpRight, ArrowDownRight, Minus, Filter, Download
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function EnhancedAnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/enhanced", selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/enhanced?range=${selectedTimeRange}`, { 
        credentials: "include" 
      });
      return response.json();
    },
  });

  // Enhanced mock data with realistic patterns
  const revenueData = [
    { name: 'Jan', revenue: 45000, subscriptions: 120, oneTime: 25000, ads: 8000, growth: 12.5 },
    { name: 'Feb', revenue: 52000, subscriptions: 145, oneTime: 30000, ads: 9500, growth: 15.6 },
    { name: 'Mar', revenue: 48000, subscriptions: 138, oneTime: 28000, ads: 8800, growth: 6.7 },
    { name: 'Apr', revenue: 61000, subscriptions: 165, oneTime: 35000, ads: 11000, growth: 27.1 },
    { name: 'May', revenue: 58000, subscriptions: 158, oneTime: 33000, ads: 10200, growth: 20.8 },
    { name: 'Jun', revenue: 69000, subscriptions: 182, oneTime: 40000, ads: 12500, growth: 31.4 },
    { name: 'Jul', revenue: 74000, subscriptions: 195, oneTime: 43000, ads: 13800, growth: 38.2 },
  ];

  const userEngagementData = [
    { name: 'Mon', activeUsers: 1200, newUsers: 45, examsTaken: 89, avgScore: 78 },
    { name: 'Tue', activeUsers: 1350, newUsers: 52, examsTaken: 95, avgScore: 82 },
    { name: 'Wed', activeUsers: 1180, newUsers: 38, examsTaken: 78, avgScore: 76 },
    { name: 'Thu', activeUsers: 1420, newUsers: 63, examsTaken: 112, avgScore: 85 },
    { name: 'Fri', activeUsers: 1650, newUsers: 78, examsTaken: 134, avgScore: 88 },
    { name: 'Sat', activeUsers: 980, newUsers: 41, examsTaken: 67, avgScore: 74 },
    { name: 'Sun', activeUsers: 850, newUsers: 28, examsTaken: 52, avgScore: 71 },
  ];

  const subjectPerformanceData = [
    { subject: 'Mathematics', attempted: 856, passed: 634, avgScore: 74, difficulty: 'medium' },
    { subject: 'English', attempted: 923, passed: 751, avgScore: 81, difficulty: 'easy' },
    { subject: 'Physics', attempted: 645, passed: 432, avgScore: 67, difficulty: 'hard' },
    { subject: 'Chemistry', attempted: 721, passed: 523, avgScore: 72, difficulty: 'medium' },
    { subject: 'Biology', attempted: 598, passed: 467, avgScore: 78, difficulty: 'easy' },
    { subject: 'Economics', attempted: 445, passed: 312, avgScore: 70, difficulty: 'medium' },
  ];

  const institutionData = [
    { name: 'Premium', value: 45, color: '#6366f1', revenue: 28000 },
    { name: 'Standard', value: 35, color: '#8b5cf6', revenue: 18000 },
    { name: 'Basic', value: 20, color: '#06b6d4', revenue: 8000 },
  ];

  const examTypeData = [
    { type: 'JAMB', count: 245, revenue: 18500, avgScore: 68 },
    { type: 'WAEC', count: 198, revenue: 14850, avgScore: 72 },
    { type: 'NECO', count: 156, revenue: 11700, avgScore: 70 },
    { type: 'Custom', count: 89, revenue: 8900, avgScore: 75 },
  ];

  const geographicData = [
    { state: 'Lagos', users: 2341, revenue: 18600, growth: 23.4 },
    { state: 'Abuja', users: 1876, revenue: 15200, growth: 18.9 },
    { state: 'Kano', users: 1543, revenue: 12100, growth: 15.2 },
    { state: 'Rivers', users: 1234, revenue: 9800, growth: 12.8 },
    { state: 'Ogun', users: 1098, revenue: 8500, growth: 11.3 },
    { state: 'Kaduna', users: 987, revenue: 7600, growth: 9.8 },
  ];

  const conversionFunnelData = [
    { name: 'Visitors', value: 10000, fill: '#6366f1' },
    { name: 'Signups', value: 3500, fill: '#8b5cf6' },
    { name: 'Trial Users', value: 1800, fill: '#06b6d4' },
    { name: 'Paying Users', value: 720, fill: '#10b981' },
    { name: 'Premium Users', value: 180, fill: '#f59e0b' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
            Comprehensive insights and performance metrics for your CBT platform
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 shadow-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold">₦74,000</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+38.2%</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">15,432</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+12.5%</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Exams Taken</p>
                <p className="text-3xl font-bold">8,945</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+24.8%</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-500 to-orange-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Score</p>
                <p className="text-3xl font-bold">78.5%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+3.2%</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Analytics Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Monthly revenue breakdown and growth patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#6366f1" 
                        fill="url(#colorRevenue)" 
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Revenue Sources
                  </CardTitle>
                  <CardDescription>Breakdown of revenue by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="subscriptions" stackId="a" fill="#6366f1" />
                      <Bar dataKey="oneTime" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="ads" stackId="a" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    User Activity
                  </CardTitle>
                  <CardDescription>Daily user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={userEngagementData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="newUsers" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-500" />
                    User Types
                  </CardTitle>
                  <CardDescription>Distribution of user subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={institutionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {institutionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Subject Performance Analysis
                </CardTitle>
                <CardDescription>Detailed performance metrics by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformanceData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        <div>
                          <span className="font-medium text-lg">{item.subject}</span>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {item.attempted} attempted • {item.passed} passed
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{item.avgScore}%</div>
                        <div className="text-sm text-slate-500">
                          {Math.round((item.passed / item.attempted) * 100)}% pass rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>User distribution and revenue by state</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={geographicData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="state" type="category" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="users" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription>User journey from visitor to premium subscriber</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Funnel
                      dataKey="value"
                      data={conversionFunnelData}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}