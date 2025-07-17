import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Search, 
  Clock, 
  Calendar,
  MapPin,
  Star,
  Settings,
  UserPlus,
  MessageSquare,
  Video,
  Brain,
  Filter,
  ChevronRight,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Heart,
  BookOpen,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  subjects: string[];
  difficulty: string;
  maxMembers: number;
  currentMembers: number;
  isPrivate: boolean;
  joinCode?: string;
  status: string;
  studyGoals?: string[];
  tags?: string[];
  createdAt: string;
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number;
  sessionType: string;
  hostId: string;
  status: string;
}

export function StudyGroupsManager() {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available study groups
  const { data: studyGroups = [], isLoading } = useQuery({
    queryKey: ['/api/study-groups'],
    queryFn: () => apiRequest('/api/study-groups', {
      method: 'GET',
    }),
  });

  // Fetch user's study groups
  const { data: myGroups = [] } = useQuery({
    queryKey: ['/api/study-groups/my-groups'],
    queryFn: () => apiRequest('/api/study-groups/my-groups', {
      method: 'GET',
    }),
  });

  // Fetch AI matchmaking suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/ai-matchmaking/suggestions'],
    queryFn: () => apiRequest('/api/ai-matchmaking/suggestions', {
      method: 'GET',
    }),
  });

  // Fetch upcoming study sessions
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['/api/study-sessions/upcoming'],
    queryFn: () => apiRequest('/api/study-sessions/upcoming', {
      method: 'GET',
    }),
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: any) => apiRequest('/api/study-groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    }),
    onSuccess: () => {
      toast({
        title: "Study Group Created",
        description: "Your study group has been created successfully!",
      });
      setCreateGroupOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups/my-groups'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join study group mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => apiRequest(`/api/study-groups/${groupId}/join`, {
      method: 'POST',
    }),
    onSuccess: () => {
      toast({
        title: "Joined Study Group",
        description: "You've successfully joined the study group!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups/my-groups'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const groupData = {
      name: formData.get('name'),
      description: formData.get('description'),
      subjects: selectedSubjects,
      difficulty: formData.get('difficulty'),
      maxMembers: parseInt(formData.get('maxMembers') as string) || 8,
      isPrivate: formData.get('isPrivate') === 'on',
      studyGoals: (formData.get('studyGoals') as string)?.split(',').map(g => g.trim()) || [],
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()) || [],
    };

    createGroupMutation.mutate(groupData);
  };

  const filteredGroups = Array.isArray(studyGroups) ? studyGroups.filter((group: StudyGroup) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || group.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  }) : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'mixed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'group_study': return <BookOpen className="h-4 w-4" />;
      case 'quiz_session': return <Brain className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'presentation': return <Video className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Groups</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with peers and join collaborative learning sessions
          </p>
        </div>
        
        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Create a collaborative study group to learn together with peers
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Mathematics Study Circle"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select name="difficulty" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="mixed">Mixed Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your study group's goals and focus areas..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    name="maxMembers"
                    type="number"
                    min="2"
                    max="20"
                    defaultValue="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                  <Input
                    id="subjects"
                    placeholder="Mathematics, Physics, Chemistry"
                    onChange={(e) => setSelectedSubjects(e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyGoals">Study Goals (comma-separated)</Label>
                <Input
                  id="studyGoals"
                  name="studyGoals"
                  placeholder="JAMB preparation, Concept mastery, Problem solving"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="jamb, mathematics, group-study"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isPrivate" name="isPrivate" />
                <Label htmlFor="isPrivate">Private Group (requires join code)</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateGroupOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search groups by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group: StudyGroup) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {group.isPrivate ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        <span>{group.currentMembers}/{group.maxMembers} members</span>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(group.difficulty)}>
                      {group.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {group.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.subjects.slice(0, 3).map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {group.subjects.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{group.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {group.studyGoals && group.studyGoals.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Target className="h-3 w-3" />
                      <span>{group.studyGoals[0]}</span>
                      {group.studyGoals.length > 1 && (
                        <span>+{group.studyGoals.length - 1} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={
                        joinGroupMutation.isPending || 
                        group.currentMembers >= group.maxMembers ||
                        myGroups.some((mg: StudyGroup) => mg.id === group.id)
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {myGroups.some((mg: StudyGroup) => mg.id === group.id) ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Joined
                        </>
                      ) : group.currentMembers >= group.maxMembers ? (
                        "Full"
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No study groups found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria or create a new group to get started.
                </p>
                <Button onClick={() => setCreateGroupOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(myGroups) && myGroups.map((group: StudyGroup) => (
              <Card key={group.id} className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-3 w-3" />
                        <span>{group.currentMembers}/{group.maxMembers} members</span>
                        <Badge variant="outline" className="text-xs">
                          {group.createdBy === "demo-student-123" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(group.difficulty)}>
                      {group.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {group.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {group.status === 'active' ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          {group.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myGroups.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No study groups yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Join existing groups or create your own to start collaborating with peers.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI-Powered Recommendations
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Groups curated based on your learning preferences and performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.length > 0 ? suggestions.map((group: StudyGroup) => (
                  <Card key={group.id} className="border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{group.name}</h4>
                        <div className="flex items-center gap-1 text-purple-600">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">95% match</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {group.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {group.subjects.slice(0, 2).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => joinGroupMutation.mutate(group.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-2 text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No suggestions yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete your study preferences to get personalized group recommendations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session: StudySession) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSessionTypeIcon(session.sessionType)}
                        <h4 className="font-medium">{session.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {session.sessionType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {session.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.scheduledFor).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.scheduledFor).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {session.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm">
                        <Video className="h-3 w-3 mr-1" />
                        Join Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No upcoming sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Join study groups to see scheduled sessions and participate in collaborative learning.
                  </p>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}