import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Users, 
  Clock, 
  Target,
  Star,
  Sparkles,
  ChevronRight,
  Heart,
  Zap,
  BookOpen,
  Globe,
  TrendingUp,
  UserCheck,
  Calendar,
  MessageSquare,
  Settings,
  CheckCircle
} from "lucide-react";

interface StudyPreferences {
  preferredSubjects: string[];
  studyTimeSlots: string[];
  timezone: string;
  studyStyle: string[];
  difficultyLevel: string;
  goalType: string[];
  availabilityDays: string[];
  maxGroupSize: number;
  preferredLanguage: string;
  isOpenToMentoring: boolean;
  isLookingForMentor: boolean;
  academicLevel: string;
}

interface MatchingSuggestion {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  difficulty: string;
  currentMembers: number;
  maxMembers: number;
  compatibilityScore: number;
  matchingReasons: string[];
  tags: string[];
}

export function AIStudyMatchmaker() {
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Partial<StudyPreferences>>({
    preferredSubjects: [],
    studyTimeSlots: [],
    studyStyle: [],
    goalType: [],
    availabilityDays: [],
    maxGroupSize: 6,
    difficultyLevel: 'intermediate',
    timezone: 'Africa/Lagos',
    preferredLanguage: 'english',
    isOpenToMentoring: false,
    isLookingForMentor: false,
    academicLevel: 'secondary',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current study preferences
  const { data: currentPreferences } = useQuery({
    queryKey: ['/api/study-preferences'],
    queryFn: () => apiRequest('/api/study-preferences', {
      method: 'GET',
    }),
  });

  // Fetch AI matchmaking suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['/api/ai-matchmaking/suggestions'],
    queryFn: () => apiRequest('/api/ai-matchmaking/suggestions', {
      method: 'GET',
    }),
  });

  // Create or update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<StudyPreferences>) => {
      const method = currentPreferences ? 'PUT' : 'POST';
      return apiRequest('/api/study-preferences', {
        method,
        body: JSON.stringify(prefs),
      });
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your study preferences have been saved successfully!",
      });
      setShowPreferences(false);
      queryClient.invalidateQueries({ queryKey: ['/api/study-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-matchmaking/suggestions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
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

  const handleUpdatePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleSubjectToggle = (subject: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects?.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...(prev.preferredSubjects || []), subject]
    }));
  };

  const handleArrayToggle = (key: keyof StudyPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: (prev[key] as string[])?.includes(value)
        ? (prev[key] as string[]).filter(v => v !== value)
        : [...((prev[key] as string[]) || []), value]
    }));
  };

  const subjects = [
    'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
    'Economics', 'Government', 'Literature', 'History', 'Geography'
  ];

  const timeSlots = ['morning', 'afternoon', 'evening', 'night'];
  const studyStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
  const goalTypes = ['exam_prep', 'skill_building', 'homework_help', 'concept_review'];
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900 border-green-300';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 border-blue-300';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 border-yellow-300';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300';
  };

  const mockSuggestions: MatchingSuggestion[] = [
    {
      id: '1',
      name: 'JAMB Mathematics Masters',
      description: 'Focused group for JAMB mathematics preparation with weekly practice sessions',
      subjects: ['Mathematics'],
      difficulty: 'intermediate',
      currentMembers: 6,
      maxMembers: 8,
      compatibilityScore: 95,
      matchingReasons: ['Subject preference match', 'Study time compatibility', 'Similar academic level'],
      tags: ['jamb', 'mathematics', 'intensive']
    },
    {
      id: '2',
      name: 'Science Trio Study Circle',
      description: 'Comprehensive science study group covering Physics, Chemistry, and Biology',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      difficulty: 'advanced',
      currentMembers: 4,
      maxMembers: 6,
      compatibilityScore: 88,
      matchingReasons: ['Multiple subject overlap', 'Advanced difficulty level', 'Group study preference'],
      tags: ['science', 'comprehensive', 'advanced']
    },
    {
      id: '3',
      name: 'English Literature Enthusiasts',
      description: 'Dive deep into literature analysis and improve essay writing skills',
      subjects: ['English', 'Literature'],
      difficulty: 'intermediate',
      currentMembers: 5,
      maxMembers: 7,
      compatibilityScore: 82,
      matchingReasons: ['Language preference', 'Study style match', 'Evening availability'],
      tags: ['english', 'literature', 'writing']
    }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

  if (showPreferences) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Study Preferences
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help our AI find the perfect study groups for you
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">Preferred Subjects</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={preferences.preferredSubjects?.includes(subject)}
                      onCheckedChange={() => handleSubjectToggle(subject)}
                    />
                    <Label htmlFor={subject} className="text-sm">{subject}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Study Time Slots</Label>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={slot}
                        checked={preferences.studyTimeSlots?.includes(slot)}
                        onCheckedChange={() => handleArrayToggle('studyTimeSlots', slot)}
                      />
                      <Label htmlFor={slot} className="text-sm capitalize">{slot}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Learning Style</Label>
                <div className="space-y-2">
                  {studyStyles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox
                        id={style}
                        checked={preferences.studyStyle?.includes(style)}
                        onCheckedChange={() => handleArrayToggle('studyStyle', style)}
                      />
                      <Label htmlFor={style} className="text-sm capitalize">{style}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Study Goals</Label>
              <div className="grid grid-cols-2 gap-2">
                {goalTypes.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={preferences.goalType?.includes(goal)}
                      onCheckedChange={() => handleArrayToggle('goalType', goal)}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Available Days</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={preferences.availabilityDays?.includes(day)}
                      onCheckedChange={() => handleArrayToggle('availabilityDays', day)}
                    />
                    <Label htmlFor={day} className="text-sm capitalize">{day.slice(0, 3)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Maximum Group Size: {preferences.maxGroupSize}
                </Label>
                <Slider
                  value={[preferences.maxGroupSize || 6]}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, maxGroupSize: value[0] }))}
                  max={12}
                  min={3}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
                <Select 
                  value={preferences.difficultyLevel} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, difficultyLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="mentoring">Open to mentoring others</Label>
                <Switch
                  id="mentoring"
                  checked={preferences.isOpenToMentoring}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, isOpenToMentoring: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="seeking-mentor">Looking for a mentor</Label>
                <Switch
                  id="seeking-mentor"
                  checked={preferences.isLookingForMentor}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, isLookingForMentor: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreferences(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePreferences}
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Study Matchmaker
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Get personalized study group recommendations based on your learning style and preferences
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setShowPreferences(true)}
              variant="outline"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              {currentPreferences ? 'Update Preferences' : 'Set Study Preferences'}
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Get New Matches
            </Button>
          </div>
        </CardContent>
      </Card>

      {!currentPreferences && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Complete Your Profile
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Set your study preferences to get AI-powered group recommendations
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowPreferences(true)}
                className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recommended Groups</h3>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            {displaySuggestions.length} matches found
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {displaySuggestions.map((suggestion: MatchingSuggestion) => (
              <Card key={suggestion.id} className="hover:shadow-lg transition-shadow border-purple-100 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium">{suggestion.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCompatibilityColor(suggestion.compatibilityScore)}`}>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {suggestion.compatibilityScore}% match
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {suggestion.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestion.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {suggestion.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {suggestion.currentMembers}/{suggestion.maxMembers} members
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {suggestion.difficulty}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Why this is a great match:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.matchingReasons.map((reason, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => joinGroupMutation.mutate(suggestion.id)}
                        disabled={joinGroupMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Join Group
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {displaySuggestions.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No matches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try updating your study preferences or check back later for new groups.
              </p>
              <Button onClick={() => setShowPreferences(true)}>
                <Target className="h-4 w-4 mr-2" />
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}