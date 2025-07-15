import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Users, BookOpen, DollarSign, Building, TrendingUp, AlertCircle,
  Activity, Target, Clock, Award, ChevronRight, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function ModernDashboard() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const currentStats = stats || {
    totalUsers: 15432,
    totalExams: 8945,
    totalQuestions: 12345,
    totalInstitutions: 127,
    dailyActiveUsers: 3247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Welcome back to your admin dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { title: "Total Users", value: currentStats.totalUsers.toLocaleString(), change: "+12%", icon: Users, color: "from-blue-500 to-blue-600" },
            { title: "Active Exams", value: currentStats.totalExams.toLocaleString(), change: "+8%", icon: BookOpen, color: "from-green-500 to-green-600" },
            { title: "Questions", value: currentStats.totalQuestions.toLocaleString(), change: "+15%", icon: Target, color: "from-purple-500 to-purple-600" },
            { title: "Institutions", value: currentStats.totalInstitutions.toLocaleString(), change: "+3%", icon: Building, color: "from-orange-500 to-orange-600" },
            { title: "Daily Active", value: currentStats.dailyActiveUsers.toLocaleString(), change: "+5%", icon: Activity, color: "from-pink-500 to-pink-600" }
          ].map((metric, index) => (
            <motion.div 
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {metric.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{metric.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                User Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Performance */}
          <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {subject.subject.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{subject.subject}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Average Score</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{subject.score}%</div>
                      <div className={`p-1 rounded-full ${
                        subject.trend === 'up' ? 'bg-green-100 text-green-600' :
                        subject.trend === 'down' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Manage Questions", desc: "Add and organize questions", color: "from-blue-500 to-blue-600", href: "/admin/questions" },
                  { title: "Create New Exam", desc: "Set up a new examination", color: "from-green-500 to-green-600", href: "/admin/exams" },
                  { title: "Manage Users", desc: "View and edit user accounts", color: "from-purple-500 to-purple-600", href: "/admin/users" },
                  { title: "System Settings", desc: "Configure platform settings", color: "from-orange-500 to-orange-600", href: "/admin/settings" }
                ].map((action, index) => (
                  <Link key={action.title} href={action.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto p-4 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white mr-3`}>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{action.title}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{action.desc}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}