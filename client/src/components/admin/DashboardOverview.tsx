import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Users, BookOpen, DollarSign, Building, TrendingUp, AlertCircle,
  Activity, Target, Clock, Award, ChevronRight, Sparkles, 
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface SystemStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  totalInstitutions: number;
  dailyActiveUsers: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  activeExams?: number;
  inactiveExams?: number;
}

export default function DashboardOverview() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/system"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/system", { credentials: "include" });
      return response.json();
    },
  });

  const mockChartData = [
    { name: 'Jan', users: 1200, exams: 450, revenue: 32000 },
    { name: 'Feb', users: 1900, exams: 680, revenue: 45000 },
    { name: 'Mar', users: 1500, exams: 520, revenue: 38000 },
    { name: 'Apr', users: 2100, exams: 780, revenue: 52000 },
    { name: 'May', users: 1800, exams: 640, revenue: 41000 },
    { name: 'Jun', users: 2400, exams: 920, revenue: 68000 },
    { name: 'Jul', users: 2200, exams: 840, revenue: 59000 },
  ];

  const pieData = [
    { name: 'Students', value: 65, color: '#6366f1' },
    { name: 'Institutions', value: 20, color: '#8b5cf6' },
    { name: 'Premium', value: 15, color: '#06b6d4' },
  ];

  const performanceData = [
    { subject: 'Mathematics', score: 78, trend: 'up' },
    { subject: 'English', score: 85, trend: 'up' },
    { subject: 'Physics', score: 72, trend: 'down' },
    { subject: 'Chemistry', score: 80, trend: 'up' },
    { subject: 'Biology', score: 76, trend: 'stable' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading overview...</div>
        </div>
      </div>
    );
  }

  const currentStats: SystemStats = stats || {
    totalUsers: 15432,
    totalExams: 8945,
    totalQuestions: 12345,
    totalInstitutions: 127,
    dailyActiveUsers: 3247,
    totalRevenue: 2850000,
    monthlyRevenue: 450000,
    activeExams: 156,
    inactiveExams: 43
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={selectedTimeRange === "24h" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("24h")}
          >
            24h
          </Button>
          <Button 
            variant={selectedTimeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("7d")}
          >
            7d
          </Button>
          <Button 
            variant={selectedTimeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("30d")}
          >
            30d
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{currentStats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+12%</span>
                  <span className="text-blue-100 text-sm">from last month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Exams</p>
                <p className="text-3xl font-bold">{currentStats.activeExams?.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+8%</span>
                  <span className="text-purple-100 text-sm">from last week</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold">₦{currentStats.monthlyRevenue?.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+23%</span>
                  <span className="text-green-100 text-sm">from last month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-500 to-orange-600 text-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Institutions</p>
                <p className="text-3xl font-bold">{currentStats.totalInstitutions.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-300" />
                  <span className="text-green-300 text-sm">+5%</span>
                  <span className="text-orange-100 text-sm">from last month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>Monthly revenue trends and growth patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              User Activity
            </CardTitle>
            <CardDescription>Daily active users and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average performance across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{item.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{item.score}%</span>
                    {getTrendIcon(item.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              User Distribution
            </CardTitle>
            <CardDescription>User types and subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}