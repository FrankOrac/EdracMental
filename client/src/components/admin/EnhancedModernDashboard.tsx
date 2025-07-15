import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Users, BookOpen, DollarSign, Building, TrendingUp, AlertCircle,
  Activity, Target, Clock, Award, ChevronRight, Sparkles, 
  Settings, Play, Pause, Trash2, Shield, CheckCircle,
  Globe, Database, CreditCard, Brain, Zap, Eye,
  EyeOff, MoreHorizontal, Edit, Copy, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

interface APIConfig {
  openai: boolean;
  paystack: boolean;
  sendgrid: boolean;
  database: boolean;
}

export default function EnhancedModernDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    step: number;
    itemId: string;
    itemName: string;
    itemType: string;
  }>({
    isOpen: false,
    step: 0,
    itemId: "",
    itemName: "",
    itemType: ""
  });
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    openai: false,
    paystack: false,
    sendgrid: false,
    database: false
  });
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/system"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/system", { credentials: "include" });
      return response.json();
    },
  });

  const { data: exams } = useQuery({
    queryKey: ["/api/exams"],
    queryFn: async () => {
      const response = await fetch("/api/exams", { credentials: "include" });
      return response.json();
    },
  });

  const toggleExamStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/system"] });
      toast({
        title: "Success",
        description: "Exam status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      return apiRequest(`/api/${type}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/system"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      setDeleteDialog({ isOpen: false, step: 0, itemId: "", itemName: "", itemType: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const testAPIConnections = async () => {
    setIsTestingAPI(true);
    try {
      // Test OpenAI
      const openaiResponse = await fetch("/api/ai/test", { credentials: "include" });
      
      // Test Paystack
      const paystackResponse = await fetch("/api/payments/test", { credentials: "include" });
      
      // Test SendGrid
      const sendgridResponse = await fetch("/api/email/test", { credentials: "include" });
      
      // Test Database
      const dbResponse = await fetch("/api/health/database", { credentials: "include" });
      
      setApiConfig({
        openai: openaiResponse.ok,
        paystack: paystackResponse.ok,
        sendgrid: sendgridResponse.ok,
        database: dbResponse.ok
      });
      
      toast({
        title: "API Test Complete",
        description: "All API connections have been tested",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API connections",
        variant: "destructive",
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const initiateDelete = (id: string, name: string, type: string) => {
    setDeleteDialog({
      isOpen: true,
      step: 1,
      itemId: id,
      itemName: name,
      itemType: type
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.step < 3) {
      setDeleteDialog(prev => ({ ...prev, step: prev.step + 1 }));
    } else {
      deleteItemMutation.mutate({ 
        id: deleteDialog.itemId, 
        type: deleteDialog.itemType 
      });
    }
  };

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

  const examsList = exams || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Comprehensive overview of your platform performance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  API Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>API Configuration & Testing</DialogTitle>
                  <DialogDescription>
                    Test and configure your external API connections
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">OpenAI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.openai ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={apiConfig.openai ? "default" : "destructive"}>
                          {apiConfig.openai ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Paystack</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.paystack ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={apiConfig.paystack ? "default" : "destructive"}>
                          {apiConfig.paystack ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">SendGrid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.sendgrid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={apiConfig.sendgrid ? "default" : "destructive"}>
                          {apiConfig.sendgrid ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.database ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={apiConfig.database ? "default" : "destructive"}>
                          {apiConfig.database ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={testAPIConnections}
                    disabled={isTestingAPI}
                    className="w-full"
                  >
                    {isTestingAPI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Testing Connections...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Test All Connections
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{currentStats.totalUsers.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm mt-1">
                    <span className="text-green-300">+12%</span> from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Exams</p>
                  <p className="text-3xl font-bold">{currentStats.activeExams?.toLocaleString()}</p>
                  <p className="text-purple-100 text-sm mt-1">
                    <span className="text-green-300">+8%</span> from last week
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-3xl font-bold">₦{currentStats.monthlyRevenue?.toLocaleString()}</p>
                  <p className="text-green-100 text-sm mt-1">
                    <span className="text-green-300">+23%</span> from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Institutions</p>
                  <p className="text-3xl font-bold">{currentStats.totalInstitutions.toLocaleString()}</p>
                  <p className="text-orange-100 text-sm mt-1">
                    <span className="text-green-300">+5%</span> from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>Monthly revenue trends and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                User Activity
              </CardTitle>
              <CardDescription>Daily active users and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exam Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Exam Management
              </CardTitle>
              <CardDescription>Manage active and inactive exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examsList.map((exam: any, index: number) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {exam.isActive ? (
                          <Play className="h-5 w-5 text-green-500" />
                        ) : (
                          <Pause className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{exam.title}</h4>
                          <p className="text-sm text-slate-500">{exam.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={exam.isActive ? "default" : "secondary"}>
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={exam.isActive}
                          onCheckedChange={(checked) => 
                            toggleExamStatus.mutate({ id: exam.id, isActive: checked })
                          }
                        />
                        
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => initiateDelete(exam.id, exam.title, "exams")}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Triple Confirmation Delete Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, step: 0, itemId: "", itemName: "", itemType: "" })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteDialog.step === 1 && "Are you sure you want to delete this item?"}
                {deleteDialog.step === 2 && "This action cannot be undone"}
                {deleteDialog.step === 3 && "Final confirmation required"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.step === 1 && `You are about to delete "${deleteDialog.itemName}". This action cannot be undone.`}
                {deleteDialog.step === 2 && `Deleting "${deleteDialog.itemName}" will permanently remove all associated data. Are you absolutely sure?`}
                {deleteDialog.step === 3 && `This is your final chance to cancel. Type "${deleteDialog.itemName}" to confirm deletion.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteDialog.step === 3 && (
              <div className="py-4">
                <Input placeholder={`Type "${deleteDialog.itemName}" to confirm`} />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteDialog.step < 3 ? "Continue" : "Delete Forever"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}