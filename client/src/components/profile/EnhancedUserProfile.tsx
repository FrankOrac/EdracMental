import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Target,
  Bell,
  Shield,
  Settings,
  Upload,
  Edit,
  Save,
  X,
  Check,
  Star,
  Trophy,
  Clock,
  BookOpen,
  BarChart3,
  TrendingUp,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Trash2,
  Download
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  bio?: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  institution?: string;
  grade?: string;
  subjects?: string[];
  achievements?: Achievement[];
  stats?: UserStats;
  preferences?: UserPreferences;
  security?: SecuritySettings;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserStats {
  totalStudyHours: number;
  examsCompleted: number;
  averageScore: number;
  streak: number;
  questionsAnswered: number;
  subjectProgress: Record<string, number>;
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    studyReminders: boolean;
    examAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showAchievements: boolean;
    showStats: boolean;
  };
  study: {
    preferredDifficulty: 'easy' | 'medium' | 'hard';
    studyGoal: number;
    reminderTime: string;
    subjects: string[];
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

export default function EnhancedUserProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    select: (data) => ({
      ...data,
      achievements: mockAchievements,
      stats: mockStats,
      preferences: mockPreferences,
      security: mockSecurity
    })
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest('/api/profile/update', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profile image updated successfully" });
      setImageFile(null);
      setPreviewImage(null);
    },
    onError: () => {
      toast({ title: "Error uploading image", variant: "destructive" });
    }
  });

  // Mock data
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first exam',
      icon: '🎯',
      unlockedAt: '2024-01-10T10:00:00Z',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Study Streak',
      description: 'Studied for 7 consecutive days',
      icon: '🔥',
      unlockedAt: '2024-01-15T14:30:00Z',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Math Genius',
      description: 'Scored 95% in Mathematics',
      icon: '🧮',
      unlockedAt: '2024-01-20T16:45:00Z',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Knowledge Seeker',
      description: 'Answered 1000 questions',
      icon: '📚',
      unlockedAt: '2024-01-25T09:15:00Z',
      rarity: 'legendary'
    }
  ];

  const mockStats: UserStats = {
    totalStudyHours: 124,
    examsCompleted: 45,
    averageScore: 87.5,
    streak: 12,
    questionsAnswered: 1247,
    subjectProgress: {
      'Mathematics': 92,
      'English': 78,
      'Physics': 85,
      'Chemistry': 73,
      'Biology': 89
    }
  };

  const mockPreferences: UserPreferences = {
    notifications: {
      email: true,
      push: true,
      sms: false,
      studyReminders: true,
      examAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      showAchievements: true,
      showStats: true
    },
    study: {
      preferredDifficulty: 'medium',
      studyGoal: 2,
      reminderTime: '19:00',
      subjects: ['Mathematics', 'Physics', 'Chemistry']
    }
  };

  const mockSecurity: SecuritySettings = {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-01T00:00:00Z',
    activeSessions: [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'Lagos, Nigeria',
        lastActive: '2024-01-15T10:30:00Z',
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Lagos, Nigeria',
        lastActive: '2024-01-14T18:45:00Z',
        current: false
      }
    ]
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Image too large", description: "Please select an image smaller than 5MB", variant: "destructive" });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (imageFile) {
      uploadImageMutation.mutate(imageFile);
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            My Profile
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {profile?.role}
          </Badge>
          <Button 
            variant={isEditing ? "destructive" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-4 h-4 mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={previewImage || profile?.profileImageUrl} />
                    <AvatarFallback className="text-2xl">
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </label>
                    </div>
                  )}
                </div>
                {imageFile && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Ready to upload: {imageFile.name}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleUploadImage} disabled={uploadImageMutation.isPending}>
                        {uploadImageMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setImageFile(null);
                        setPreviewImage(null);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={isEditing ? formData.firstName || profile?.firstName || '' : profile?.firstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={isEditing ? formData.lastName || profile?.lastName || '' : profile?.lastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? formData.bio || profile?.bio || '' : profile?.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone || profile?.phone || '' : profile?.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={isEditing ? formData.location || profile?.location || '' : profile?.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={isEditing ? formData.institution || profile?.institution || '' : profile?.institution || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Your school or university"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade/Level</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ss1">SS1</SelectItem>
                        <SelectItem value="ss2">SS2</SelectItem>
                        <SelectItem value="ss3">SS3</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile?.stats?.totalStudyHours || 0}</p>
                    <p className="text-sm text-gray-600">Hours Studied</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile?.stats?.examsCompleted || 0}</p>
                    <p className="text-sm text-gray-600">Exams Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile?.stats?.averageScore || 0}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile?.stats?.streak || 0}</p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(profile?.stats?.subjectProgress || {}).map(([subject, progress]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject}</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile?.achievements?.map((achievement) => (
              <Card key={achievement.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch checked={profile?.preferences?.notifications.email} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications</p>
                  </div>
                  <Switch checked={profile?.preferences?.notifications.push} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Study Reminders</p>
                    <p className="text-sm text-gray-600">Daily study reminders</p>
                  </div>
                  <Switch checked={profile?.preferences?.notifications.studyReminders} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Exam Alerts</p>
                    <p className="text-sm text-gray-600">Upcoming exam notifications</p>
                  </div>
                  <Switch checked={profile?.preferences?.notifications.examAlerts} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select value={profile?.preferences?.privacy.profileVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Achievements</p>
                    <p className="text-sm text-gray-600">Display achievements on profile</p>
                  </div>
                  <Switch checked={profile?.preferences?.privacy.showAchievements} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Statistics</p>
                    <p className="text-sm text-gray-600">Display study statistics</p>
                  </div>
                  <Switch checked={profile?.preferences?.privacy.showStats} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Study Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Difficulty</Label>
                  <Select value={profile?.preferences?.study.preferredDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Daily Study Goal (hours)</Label>
                  <Input
                    type="number"
                    value={profile?.preferences?.study.studyGoal}
                    min="1"
                    max="12"
                  />
                </div>
              </div>
              <div>
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={profile?.preferences?.study.reminderTime}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Password & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add extra security to your account</p>
                </div>
                <Switch checked={profile?.security?.twoFactorEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-600">
                    Last changed: {new Date(profile?.security?.lastPasswordChange || '').toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Active Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile?.security?.activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {session.device.includes('iPhone') ? (
                          <Smartphone className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Laptop className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.device}</p>
                        <p className="text-xs text-gray-500">{session.location}</p>
                        <p className="text-xs text-gray-500">
                          Last active: {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Current
                        </Badge>
                      )}
                      {!session.current && (
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}