import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Send, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Zap,
  MessageCircle,
  FileText,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Upload,
  Share,
  Settings,
  Sparkles,
  GraduationCap,
  Calculator,
  Globe,
  Atom,
  Beaker,
  History,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface AiMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  confidence?: number;
  examples?: string[];
  relatedTopics?: string[];
  attachments?: string[];
}

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  questionsAsked: number;
  accuracy: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'paused';
}

export default function AiTutorEnhanced() {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [studyMode, setStudyMode] = useState('interactive');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [chatHistory, setChatHistory] = useState<AiMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch subjects and topics
  const { data: subjects } = useQuery({ queryKey: ['/api/subjects'] });
  const { data: topics } = useQuery({ queryKey: ['/api/topics'] });

  // AI tutoring mutation
  const aiTutoringMutation = useMutation({
    mutationFn: async (data: {
      question: string;
      subject?: string;
      topic?: string;
      context?: string;
      difficulty?: string;
    }) => {
      const response = await apiRequest('/api/ai/tutoring', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: AiMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.explanation,
        timestamp: new Date().toISOString(),
        confidence: data.confidence,
        examples: data.examples,
        relatedTopics: data.relatedTopics
      };
      setChatHistory(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Question generation mutation
  const generateQuestionMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      topic?: string;
      difficulty: string;
      examType: string;
      count: number;
    }) => {
      const response = await apiRequest('/api/ai/generate-questions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: AiMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `I've generated ${data.questions.length} questions for you to practice with:`,
        timestamp: new Date().toISOString(),
        attachments: data.questions.map((q: any) => q.text)
      };
      setChatHistory(prev => [...prev, aiMessage]);
    }
  });

  // Study plan generation mutation
  const generateStudyPlanMutation = useMutation({
    mutationFn: async (data: {
      subjects: string[];
      examType: string;
      timeFrame: number;
      currentLevel: string;
    }) => {
      const response = await apiRequest('/api/ai/study-plan', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: AiMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Here's your personalized study plan:\n\n${data.plan}`,
        timestamp: new Date().toISOString(),
        confidence: data.confidence
      };
      setChatHistory(prev => [...prev, aiMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: AiMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);

    aiTutoringMutation.mutate({
      question: message,
      subject: selectedSubject,
      topic: selectedTopic,
      difficulty: difficulty,
      context: studyMode
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateQuestions = () => {
    if (!selectedSubject) {
      toast({
        title: "Please select a subject",
        variant: "destructive"
      });
      return;
    }

    generateQuestionMutation.mutate({
      subject: selectedSubject,
      topic: selectedTopic,
      difficulty: difficulty,
      examType: 'jamb',
      count: 5
    });
  };

  const handleStartStudySession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      subject: selectedSubject,
      topic: selectedTopic,
      duration: 0,
      questionsAsked: 0,
      accuracy: 0,
      startTime: new Date().toISOString(),
      status: 'active'
    };
    setCurrentSession(session);
    toast({ title: "Study session started!" });
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition failed",
          description: "Please try typing your question instead.",
          variant: "destructive"
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice recognition not supported",
        description: "Please use a modern browser with voice recognition support.",
        variant: "destructive"
      });
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return <Calculator className="w-4 h-4" />;
      case 'physics': return <Atom className="w-4 h-4" />;
      case 'chemistry': return <Beaker className="w-4 h-4" />;
      case 'biology': return <GraduationCap className="w-4 h-4" />;
      case 'english': return <BookOpen className="w-4 h-4" />;
      case 'geography': return <Globe className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const mockStudySessions = [
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Algebra',
      duration: 45,
      questionsAsked: 12,
      accuracy: 85,
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T10:45:00Z',
      status: 'completed' as const
    },
    {
      id: '2',
      subject: 'Physics',
      topic: 'Mechanics',
      duration: 30,
      questionsAsked: 8,
      accuracy: 92,
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T14:30:00Z',
      status: 'completed' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            AI Tutor
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your intelligent study companion
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {currentSession && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Clock className="w-3 h-3 mr-1" />
              Session Active
            </Badge>
          )}
          <Button variant="outline" onClick={() => setChatHistory([])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Target className="w-4 h-4 mr-2" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="study-plan">
            <BookOpen className="w-4 h-4 mr-2" />
            Study Plan
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          <div className="flex items-center space-x-2">
                            {getSubjectIcon(subject.name)}
                            <span>{subject.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics?.filter((topic: any) => 
                        subjects?.find((s: any) => s.name === selectedSubject)?.id === topic.subjectId
                      ).map((topic: any) => (
                        <SelectItem key={topic.id} value={topic.name}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
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
                  <label className="text-sm font-medium">Study Mode</label>
                  <Select value={studyMode} onValueChange={setStudyMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interactive">Interactive</SelectItem>
                      <SelectItem value="explanatory">Explanatory</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleStartStudySession} 
                  className="w-full" 
                  disabled={!selectedSubject}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Study Session
                </Button>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Tutor Chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speechSynthesis.cancel()}
                      disabled={!isSpeaking}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-4">
                  <div className="space-y-4 py-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Tutor!</h3>
                        <p className="text-gray-500 mb-4">Ask me anything about your studies. I'm here to help explain concepts, solve problems, and guide your learning.</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setMessage("Explain quadratic equations")}>
                            Explain quadratic equations
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setMessage("Help with physics mechanics")}>
                            Help with physics mechanics
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setMessage("Create a study plan")}>
                            Create a study plan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                            <div className={`p-4 rounded-lg ${
                              msg.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              
                              {msg.confidence && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <span className="text-xs opacity-70">Confidence:</span>
                                  <Badge variant="outline" className={getConfidenceColor(msg.confidence)}>
                                    {Math.round(msg.confidence * 100)}%
                                  </Badge>
                                </div>
                              )}
                              
                              {msg.examples && msg.examples.length > 0 && (
                                <div className="mt-3 p-2 bg-blue-50 rounded border">
                                  <p className="text-xs font-medium text-blue-800 mb-1">Examples:</p>
                                  <ul className="text-xs text-blue-700 space-y-1">
                                    {msg.examples.map((example, index) => (
                                      <li key={index}>• {example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {msg.relatedTopics.map((topic, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {msg.attachments.map((attachment, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                                      <p className="text-xs font-medium">Question {index + 1}:</p>
                                      <p className="text-sm">{attachment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center mt-1 space-x-2 ${
                              msg.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                              {msg.type === 'ai' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTextToSpeech(msg.content)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <Avatar className={`w-8 h-8 ${msg.type === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                            {msg.type === 'user' ? (
                              <AvatarFallback className="bg-blue-500 text-white">U</AvatarFallback>
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white">
                                <Brain className="w-4 h-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      ))
                    )}
                    
                    {aiTutoringMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="text-sm text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Textarea
                      placeholder="Ask me anything about your studies..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[60px] resize-none"
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || aiTutoringMutation.isPending}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleVoiceInput}
                        disabled={isListening}
                        size="sm"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Generate Practice Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
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
                </div>
                
                <Button 
                  onClick={handleGenerateQuestions} 
                  className="w-full" 
                  disabled={!selectedSubject || generateQuestionMutation.isPending}
                >
                  {generateQuestionMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSubjectIcon(session.subject)}
                        <div>
                          <p className="font-medium text-sm">{session.subject} - {session.topic}</p>
                          <p className="text-xs text-gray-500">{session.duration} min • {session.questionsAsked} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {session.accuracy}% accuracy
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="study-plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Generate Study Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Target Subjects</label>
                    <div className="mt-2 space-y-2">
                      {subjects?.slice(0, 6).map((subject: any) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`subject-${subject.id}`}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`subject-${subject.id}`} className="text-sm flex items-center space-x-2">
                            {getSubjectIcon(subject.name)}
                            <span>{subject.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Study Duration (weeks)</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 weeks</SelectItem>
                        <SelectItem value="8">8 weeks</SelectItem>
                        <SelectItem value="12">12 weeks</SelectItem>
                        <SelectItem value="16">16 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Exam Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jamb">JAMB</SelectItem>
                        <SelectItem value="waec">WAEC</SelectItem>
                        <SelectItem value="neco">NECO</SelectItem>
                        <SelectItem value="gce">GCE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={() => generateStudyPlanMutation.mutate({
                      subjects: ['Mathematics', 'English', 'Physics'],
                      examType: 'jamb',
                      timeFrame: 12,
                      currentLevel: 'intermediate'
                    })}
                    className="w-full"
                    disabled={generateStudyPlanMutation.isPending}
                  >
                    {generateStudyPlanMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Study Plan
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span>Study Tips</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Set specific, measurable goals for each study session</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Use active recall techniques instead of just re-reading</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Take regular breaks to maintain focus and retention</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Practice with past questions and mock exams</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Review and adjust your plan based on progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">24.5</p>
                    <p className="text-sm text-gray-600">Hours Studied</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-gray-600">Questions Asked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">+15%</p>
                    <p className="text-sm text-gray-600">Progress This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Study Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects?.slice(0, 5).map((subject: any) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center space-x-2">
                        {getSubjectIcon(subject.name)}
                        <span>{subject.name}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 40) + 60}%
                      </span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 40) + 60} className="h-2" />
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