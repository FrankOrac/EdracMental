import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
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
} from "@/components/ui/alert-dialog";
import { 
  Users, UserPlus, Shield, Edit, Trash2, Search, Filter,
  Building, GraduationCap, Crown, Eye, Mail, Phone, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'institution' | 'student';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  institution?: string;
  phone?: string;
  examsTaken?: number;
  averageScore?: number;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: "", userName: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", { credentials: "include" });
      return response.json();
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/analytics/users"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/users", { credentials: "include" });
      return response.json();
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setDeleteDialog({ isOpen: false, userId: "", userName: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user: User) => {
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'institution':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'student':
        return <GraduationCap className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'institution':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const userCounts = {
    total: users?.length || 0,
    admin: users?.filter((u: User) => u.role === 'admin').length || 0,
    institution: users?.filter((u: User) => u.role === 'institution').length || 0,
    student: users?.filter((u: User) => u.role === 'student').length || 0,
    active: users?.filter((u: User) => u.isActive).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="institution">Institution</option>
            <option value="student">Student</option>
          </select>
          <Button 
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Users</p>
                <p className="text-2xl font-bold">{userCounts.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Admins</p>
                <p className="text-2xl font-bold">{userCounts.admin}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Institutions</p>
                <p className="text-2xl font-bold">{userCounts.institution}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Students</p>
                <p className="text-2xl font-bold">{userCounts.student}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active</p>
                <p className="text-2xl font-bold">{userCounts.active}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            User List
          </CardTitle>
          <CardDescription>Manage all platform users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user: User) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {(user.fullName || user.email) ? (user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : user.email?.charAt(0).toUpperCase()) : 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg group-hover:text-blue-600 transition-colors">
                        {user.fullName || user.email || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        {user.institution && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {user.institution}
                            </span>
                          </div>
                        )}
                        {user.examsTaken && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {user.examsTaken} exams
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) => 
                        toggleUserStatus.mutate({ id: user.id, isActive: checked })
                      }
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditingUser(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        userId: user.id, 
                        userName: user.fullName 
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  No users found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {searchTerm ? "Try adjusting your search terms" : "No users match the current filter"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !isEditingUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl" aria-describedby="user-details-description">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription id="user-details-description">
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(selectedUser.fullName || selectedUser.email) ? (selectedUser.fullName ? selectedUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : selectedUser.email?.charAt(0).toUpperCase()) : 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.fullName || selectedUser.email || 'Unknown User'}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{selectedUser.email}</p>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                </div>
                
                {selectedUser.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{selectedUser.phone}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    {getRoleIcon(selectedUser.role)}
                    <span className="text-sm capitalize">{selectedUser.role}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className={`h-2 w-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">{selectedUser.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Created At</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {selectedUser.lastLogin && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Login</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, userId: "", userName: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{deleteDialog.userName}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUserMutation.mutate(deleteDialog.userId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}