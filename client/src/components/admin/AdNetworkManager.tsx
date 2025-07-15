import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  DollarSign, Globe, Settings, Code, BarChart3, Eye, 
  Plus, Edit, Trash2, CheckCircle, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdNetwork {
  id: string;
  name: string;
  type: 'adsense' | 'media-net' | 'adnimation' | 'propeller' | 'custom';
  isActive: boolean;
  publisherId: string;
  slotIds: string[];
  revenue: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface AdPlacement {
  id: string;
  name: string;
  location: 'header' | 'sidebar' | 'content' | 'footer' | 'popup';
  networkId: string;
  adCode: string;
  isActive: boolean;
  performance: {
    revenue: number;
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export default function AdNetworkManager() {
  const [adNetworks, setAdNetworks] = useState<AdNetwork[]>([
    {
      id: '1',
      name: 'Google AdSense',
      type: 'adsense',
      isActive: true,
      publisherId: 'ca-pub-1234567890123456',
      slotIds: ['1234567890', '0987654321'],
      revenue: 2450.50,
      impressions: 125000,
      clicks: 1250,
      ctr: 1.0
    },
    {
      id: '2',
      name: 'Media.net',
      type: 'media-net',
      isActive: false,
      publisherId: 'pub-123456789',
      slotIds: ['abcd1234', 'efgh5678'],
      revenue: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0
    }
  ]);

  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([
    {
      id: '1',
      name: 'Header Banner',
      location: 'header',
      networkId: '1',
      adCode: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="1234567890" data-ad-format="auto"></ins>',
      isActive: true,
      performance: {
        revenue: 850.25,
        impressions: 45000,
        clicks: 450,
        ctr: 1.0
      }
    },
    {
      id: '2',
      name: 'Sidebar Ad',
      location: 'sidebar',
      networkId: '1',
      adCode: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="0987654321" data-ad-format="rectangle"></ins>',
      isActive: true,
      performance: {
        revenue: 1600.25,
        impressions: 80000,
        clicks: 800,
        ctr: 1.0
      }
    }
  ]);

  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [isAddingPlacement, setIsAddingPlacement] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    type: 'adsense' as const,
    publisherId: '',
    slotIds: ''
  });
  const [newPlacement, setNewPlacement] = useState({
    name: '',
    location: 'header' as const,
    networkId: '',
    adCode: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addNetworkMutation = useMutation({
    mutationFn: async (network: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return network;
    },
    onSuccess: (network) => {
      const newId = (adNetworks.length + 1).toString();
      setAdNetworks(prev => [...prev, {
        ...network,
        id: newId,
        isActive: true,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        slotIds: network.slotIds.split(',').map((s: string) => s.trim())
      }]);
      setIsAddingNetwork(false);
      setNewNetwork({ name: '', type: 'adsense', publisherId: '', slotIds: '' });
      toast({
        title: "Success",
        description: "Ad network added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add ad network",
        variant: "destructive",
      });
    },
  });

  const addPlacementMutation = useMutation({
    mutationFn: async (placement: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return placement;
    },
    onSuccess: (placement) => {
      const newId = (adPlacements.length + 1).toString();
      setAdPlacements(prev => [...prev, {
        ...placement,
        id: newId,
        isActive: true,
        performance: {
          revenue: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0
        }
      }]);
      setIsAddingPlacement(false);
      setNewPlacement({ name: '', location: 'header', networkId: '', adCode: '' });
      toast({
        title: "Success",
        description: "Ad placement added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add ad placement",
        variant: "destructive",
      });
    },
  });

  const toggleNetworkStatus = (id: string) => {
    setAdNetworks(prev => prev.map(network => 
      network.id === id ? { ...network, isActive: !network.isActive } : network
    ));
  };

  const togglePlacementStatus = (id: string) => {
    setAdPlacements(prev => prev.map(placement => 
      placement.id === id ? { ...placement, isActive: !placement.isActive } : placement
    ));
  };

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case 'adsense':
        return <Globe className="h-5 w-5 text-blue-500" />;
      case 'media-net':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Code className="h-5 w-5 text-purple-500" />;
    }
  };

  const totalRevenue = adNetworks.reduce((sum, network) => sum + network.revenue, 0);
  const totalImpressions = adNetworks.reduce((sum, network) => sum + network.impressions, 0);
  const totalClicks = adNetworks.reduce((sum, network) => sum + network.clicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Ad Network Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage advertising networks and revenue optimization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsAddingNetwork(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Network
          </Button>
          <Button 
            onClick={() => setIsAddingPlacement(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Placement
          </Button>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Impressions</p>
                <p className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Clicks</p>
                <p className="text-2xl font-bold text-purple-600">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Average CTR</p>
                <p className="text-2xl font-bold text-orange-600">{averageCTR.toFixed(2)}%</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="networks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="networks">Ad Networks</TabsTrigger>
          <TabsTrigger value="placements">Ad Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="networks" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Ad Networks
              </CardTitle>
              <CardDescription>Manage your advertising network integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adNetworks.map((network) => (
                  <div 
                    key={network.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {getNetworkIcon(network.type)}
                      <div>
                        <h4 className="font-medium text-lg">{network.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Publisher ID: {network.publisherId}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500">
                            Revenue: ₦{network.revenue.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            CTR: {network.ctr}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={network.isActive ? "default" : "secondary"}>
                        {network.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={network.isActive}
                        onCheckedChange={() => toggleNetworkStatus(network.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Ad Placements
              </CardTitle>
              <CardDescription>Manage ad placement locations and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adPlacements.map((placement) => (
                  <div 
                    key={placement.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{placement.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Location: {placement.location}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500">
                            Revenue: ₦{placement.performance.revenue.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            CTR: {placement.performance.ctr}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={placement.isActive ? "default" : "secondary"}>
                        {placement.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={placement.isActive}
                        onCheckedChange={() => togglePlacementStatus(placement.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Network Dialog */}
      <Dialog open={isAddingNetwork} onOpenChange={setIsAddingNetwork}>
        <DialogContent aria-describedby="add-network-description">
          <DialogHeader>
            <DialogTitle>Add New Ad Network</DialogTitle>
            <DialogDescription id="add-network-description">
              Configure a new advertising network integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="networkName">Network Name</Label>
              <Input
                id="networkName"
                value={newNetwork.name}
                onChange={(e) => setNewNetwork(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Google AdSense"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="networkType">Network Type</Label>
              <select
                id="networkType"
                value={newNetwork.type}
                onChange={(e) => setNewNetwork(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="adsense">Google AdSense</option>
                <option value="media-net">Media.net</option>
                <option value="adnimation">Adnimation</option>
                <option value="propeller">PropellerAds</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publisherId">Publisher ID</Label>
              <Input
                id="publisherId"
                value={newNetwork.publisherId}
                onChange={(e) => setNewNetwork(prev => ({ ...prev, publisherId: e.target.value }))}
                placeholder="e.g., ca-pub-1234567890123456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slotIds">Slot IDs (comma-separated)</Label>
              <Input
                id="slotIds"
                value={newNetwork.slotIds}
                onChange={(e) => setNewNetwork(prev => ({ ...prev, slotIds: e.target.value }))}
                placeholder="e.g., 1234567890, 0987654321"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingNetwork(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addNetworkMutation.mutate(newNetwork)}
              disabled={addNetworkMutation.isPending}
            >
              {addNetworkMutation.isPending ? "Adding..." : "Add Network"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Placement Dialog */}
      <Dialog open={isAddingPlacement} onOpenChange={setIsAddingPlacement}>
        <DialogContent aria-describedby="add-placement-description">
          <DialogHeader>
            <DialogTitle>Add New Ad Placement</DialogTitle>
            <DialogDescription id="add-placement-description">
              Create a new ad placement for your website
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placementName">Placement Name</Label>
              <Input
                id="placementName"
                value={newPlacement.name}
                onChange={(e) => setNewPlacement(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Header Banner"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <select
                id="location"
                value={newPlacement.location}
                onChange={(e) => setNewPlacement(prev => ({ ...prev, location: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="header">Header</option>
                <option value="sidebar">Sidebar</option>
                <option value="content">Content</option>
                <option value="footer">Footer</option>
                <option value="popup">Popup</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="networkId">Ad Network</Label>
              <select
                id="networkId"
                value={newPlacement.networkId}
                onChange={(e) => setNewPlacement(prev => ({ ...prev, networkId: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Network</option>
                {adNetworks.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adCode">Ad Code</Label>
              <Textarea
                id="adCode"
                value={newPlacement.adCode}
                onChange={(e) => setNewPlacement(prev => ({ ...prev, adCode: e.target.value }))}
                placeholder="Paste your ad code here..."
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingPlacement(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addPlacementMutation.mutate(newPlacement)}
              disabled={addPlacementMutation.isPending}
            >
              {addPlacementMutation.isPending ? "Adding..." : "Add Placement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}