import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building, Plus, Search, Edit, Trash2, Eye, Filter, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminInstitutions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock institution data
  const mockInstitutions = [
    { 
      id: "inst-001", 
      name: "University of Lagos", 
      type: "school", 
      contactEmail: "admin@unilag.edu.ng",
      contactPhone: "+234-1-123-4567",
      subscriptionPlan: "premium",
      students: 25000,
      createdAt: "2024-01-10"
    },
    { 
      id: "inst-002", 
      name: "JAMB CBT Center", 
      type: "training_center", 
      contactEmail: "info@jambcbt.com",
      contactPhone: "+234-8-123-4567",
      subscriptionPlan: "enterprise",
      students: 5000,
      createdAt: "2024-02-15"
    },
    { 
      id: "inst-003", 
      name: "Tech Solutions Ltd", 
      type: "corporate", 
      contactEmail: "hr@techsolutions.com",
      contactPhone: "+234-9-123-4567",
      subscriptionPlan: "basic",
      students: 500,
      createdAt: "2024-03-20"
    }
  ];

  const filteredInstitutions = mockInstitutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || institution.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleEdit = (institution: any) => {
    toast({
      title: "Edit Institution",
      description: `Editing ${institution.name}`,
      variant: "default",
    });
  };

  const handleDelete = (institution: any) => {
    toast({
      title: "Delete Institution",
      description: `${institution.name} will be removed`,
      variant: "destructive",
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "school": return "default";
      case "training_center": return "secondary";
      case "corporate": return "outline";
      default: return "secondary";
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise": return "destructive";
      case "premium": return "default";
      case "basic": return "outline";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Institution Management</h1>
            <p className="text-muted-foreground">Manage institutional accounts and settings</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Institution
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              All Institutions
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="training_center">Training Center</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstitutions.map((institution) => (
                  <TableRow key={institution.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        {institution.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(institution.type)}>
                        {institution.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{institution.contactEmail}</div>
                        <div className="text-xs text-muted-foreground">{institution.contactPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(institution.subscriptionPlan)}>
                        {institution.subscriptionPlan.charAt(0).toUpperCase() + institution.subscriptionPlan.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{institution.students.toLocaleString()}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(institution.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(institution)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(institution)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}