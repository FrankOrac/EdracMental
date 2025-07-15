import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Activity,
  Clock,
  Star,
  Zap,
  Globe,
  Shield,
  Database,
  Settings,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart
} from "recharts";

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function EnhancedDashboard() {
  const [activeMetric, setActiveMetric] = useState('users');
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/analytics/system'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mock data for enhanced visualization
  const userGrowthData = [
    { name: 'Jan', students: 1200, institutions: 45, premium: 340 },
    { name: 'Feb', students: 1800, institutions: 67, premium: 520 },
    { name: 'Mar', students: 2400, institutions: 89, premium: 780 },
    { name: 'Apr', students: 3200, institutions: 112, premium: 1020 },
    { name: 'May', students: 4100, institutions: 134, premium: 1350 },
    { name: 'Jun', students: 5200, institutions: 156, premium: 1680 },
    { name: 'Jul', students: 6800, institutions: 178, premium: 2150 }
  ];

  const examPerformanceData = [
    { subject: 'Mathematics', average: 78, sessions: 2340 },
    { subject: 'English', average: 82, sessions: 2100 },
    { subject: 'Physics', average: 71, sessions: 1890 },
    { subject: 'Chemistry', average: 76, sessions: 1750 },
    { subject: 'Biology', average: 84, sessions: 1980 },
    { subject: 'Economics', average: 79, sessions: 1560 }
  ];

  const revenueData = [
    { name: 'Subscriptions', value: 68, amount: 142800 },
    { name: 'Institutions', value: 24, amount: 50400 },
    { name: 'Premium Features', value: 8, amount: 16800 }
  ];

  const realTimeData = [
    { time: '00:00', active: 1240, exams: 89 },
    { time: '04:00', active: 890, exams: 45 },
    { time: '08:00', active: 2340, exams: 156 },
    { time: '12:00', active: 3200, exams: 234 },
    { time: '16:00', active: 2890, exams: 189 },
    { time: '20:00', active: 1950, exams: 123 }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time platform analytics and management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            System Online
          </Badge>
          <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{systemStats?.totalUsers || '8,429'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm opacity-80">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Active Exams</CardTitle>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{systemStats?.totalExams || '2,341'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm opacity-80">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+8.2% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">₦2.4M</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm opacity-80">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+24.8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Success Rate</CardTitle>
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">84.2%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm opacity-80">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+3.1% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="exams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Growth Trends</span>
                  <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stackId="1" 
                      stroke="#8B5CF6" 
                      fill="url(#gradientStudents)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="institutions" 
                      stackId="1" 
                      stroke="#06B6D4" 
                      fill="url(#gradientInstitutions)" 
                    />
                    <defs>
                      <linearGradient id="gradientStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="gradientInstitutions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}% (₦${revenueData.find(d => d.name === name)?.amount?.toLocaleString()})`,
                        name
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">₦{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>User Activity & Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exams" 
                    stroke="#06B6D4" 
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Exam Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={examPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="url(#gradientBar)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Revenue</span>
                  <DollarSign className="w-6 h-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦2,400,000</div>
                <p className="text-sm opacity-80">+24.8% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Premium Users</span>
                  <Star className="w-6 h-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,150</div>
                <p className="text-sm opacity-80">+18.3% conversion rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Institutions</span>
                  <Building className="w-6 h-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">178</div>
                <p className="text-sm opacity-80">+12.5% this quarter</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  98ms
                </Badge>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Healthy
                </Badge>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                  67%
                </Badge>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  99.9%
                </Badge>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}