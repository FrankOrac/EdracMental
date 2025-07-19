import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit2, Trash2, Eye, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";

const packageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(["jamb", "waec", "neco", "gce", "custom"]),
  subjectIds: z.array(z.number()).min(1, "At least one subject is required"),
  price: z.string().min(1, "Price is required"),
  currency: z.string().default("NGN"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "mixed"]),
  isActive: z.boolean().default(true),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function AdminPackageManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      category: "jamb",
      currency: "NGN",
      duration: 30,
      difficulty: "mixed",
      isActive: true,
      subjectIds: [],
    },
  });

  // Fetch packages
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/admin/packages'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/packages');
      return response.json();
    },
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subjects');
      return response.json();
    },
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const response = await apiRequest('POST', '/api/admin/packages', {
        ...data,
        price: parseFloat(data.price),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Package created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PackageFormData> }) => {
      const response = await apiRequest('PATCH', `/api/admin/packages/${id}`, {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      setEditingPackage(null);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/packages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PackageFormData) => {
    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  const handleEdit = (packageItem: any) => {
    setEditingPackage(packageItem);
    form.reset({
      ...packageItem,
      price: packageItem.price?.toString() || "0",
      subjectIds: packageItem.subjectIds || [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deletePackageMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    updatePackageMutation.mutate({ id, data: { isActive } });
  };

  const stats = {
    total: packages.length,
    active: packages.filter((p: any) => p.isActive).length,
    inactive: packages.filter((p: any) => !p.isActive).length,
    totalRevenue: packages.reduce((sum: number, p: any) => sum + (parseFloat(p.price) || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage learning packages for students and institutions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPackage(null); form.reset(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
              <DialogDescription>
                {editingPackage ? "Update package details" : "Create a new learning package"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter package title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this package includes..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="jamb">JAMB</SelectItem>
                            <SelectItem value="waec">WAEC</SelectItem>
                            <SelectItem value="neco">NECO</SelectItem>
                            <SelectItem value="gce">GCE</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subjectIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <FormDescription>Select subjects included in this package</FormDescription>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {subjects.map((subject: any) => (
                          <div key={subject.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`subject-${subject.id}`}
                              checked={field.value?.includes(subject.id) || false}
                              onChange={(e) => {
                                const currentIds = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentIds, subject.id]);
                                } else {
                                  field.onChange(currentIds.filter((id: number) => id !== subject.id));
                                }
                              }}
                            />
                            <label htmlFor={`subject-${subject.id}`} className="text-sm">
                              {subject.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Duration (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Make this package available for purchase
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPackageMutation.isPending || updatePackageMutation.isPending}>
                    {editingPackage ? "Update Package" : "Create Package"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="w-4 h-4 text-muted-foreground" />
              <div className="ml-2">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div className="ml-2">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Active Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div className="ml-2">
                <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">Inactive Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div className="ml-2">
                <div className="text-2xl font-bold text-blue-600">₦{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Packages ({packages.length})</CardTitle>
          <CardDescription>
            Manage learning packages available for purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packagesLoading ? (
            <div className="text-center py-8">Loading packages...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No packages found. Create your first package!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((packageItem: any) => (
                  <TableRow key={packageItem.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium">{packageItem.title}</div>
                        {packageItem.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {packageItem.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              packageItem.difficulty === 'beginner' ? 'secondary' : 
                              packageItem.difficulty === 'intermediate' ? 'default' : 
                              packageItem.difficulty === 'advanced' ? 'destructive' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {packageItem.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {packageItem.category?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {packageItem.subjectIds?.length || 0} subjects
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₦{parseFloat(packageItem.price || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {packageItem.duration} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={packageItem.isActive}
                          onCheckedChange={(checked) => handleToggleStatus(packageItem.id, checked)}
                          disabled={updatePackageMutation.isPending}
                        />
                        <Badge variant={packageItem.isActive ? "default" : "secondary"}>
                          {packageItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPackage(packageItem)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(packageItem)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(packageItem.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Package Details Dialog */}
      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPackage?.title}</DialogTitle>
            <DialogDescription>Package Details</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPackage.description || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Category</h4>
                  <Badge variant="outline">{selectedPackage.category?.toUpperCase()}</Badge>
                </div>
                <div>
                  <h4 className="font-medium">Difficulty</h4>
                  <Badge variant="secondary">{selectedPackage.difficulty}</Badge>
                </div>
                <div>
                  <h4 className="font-medium">Price</h4>
                  <p className="text-lg font-bold">₦{parseFloat(selectedPackage.price || 0).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium">Duration</h4>
                  <p>{selectedPackage.duration} days</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Included Subjects</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPackage.subjectIds?.map((subjectId: number) => {
                    const subject = subjects.find((s: any) => s.id === subjectId);
                    return subject ? (
                      <Badge key={subjectId} variant="secondary">
                        {subject.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedPackage.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPackage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}