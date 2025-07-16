import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  BookOpen,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TutorMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  confidence?: number;
  examples?: string[];
  relatedTopics?: string[];
}

interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface RobustAITutorProps {
  questionData?: QuestionData;
  context?: string;
  examId?: string;
  userId?: string;
  onClose?: () => void;
}

export default function RobustAITutor({ 
  questionData, 
  context, 
  examId, 
  userId, 
  onClose 
}: RobustAITutorProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const [aiAvailable, setAiAvailable] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive"
        });
      };
    }
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, [toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with question explanation if provided
  useEffect(() => {
    if (questionData && messages.length === 0) {
      const initialMessage: TutorMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `I'm here to help you understand this ${questionData.subject} question about ${questionData.topic}. Feel free to ask me anything about the question, the topic, or request examples and explanations.`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [questionData, messages.length]);

  // Fallback responses when AI is unavailable
  const fallbackResponses = {
    general: [
      "I'm here to help you learn! While I'm having trouble connecting to advanced AI features, I can still provide basic explanations and guidance.",
      "Let me help you understand this concept. Even though some features are limited, I can break down the topic for you.",
      "I want to assist your learning journey. Though my advanced features are temporarily unavailable, I can still offer explanations."
    ],
    math: [
      "For math problems, try breaking them down into smaller steps. Identify what you know and what you need to find.",
      "Mathematical concepts often build on each other. Make sure you understand the fundamentals before moving to complex problems.",
      "Practice is key in mathematics. Try similar problems to reinforce your understanding."
    ],
    science: [
      "Science concepts are easier to understand when you connect them to real-world examples. Can you think of how this applies to everyday life?",
      "Try to understand the 'why' behind scientific phenomena, not just memorize facts.",
      "Drawing diagrams or visualizing processes can help you grasp complex scientific concepts."
    ],
    english: [
      "Reading comprehension improves with practice. Try to identify key themes and main ideas in texts.",
      "For grammar questions, consider the rules and patterns you've learned. Context often provides clues.",
      "Building vocabulary takes time. Try to learn words in context rather than isolation."
    ]
  };

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !voiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        toast({
          title: "Voice Recognition Error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [isListening, toast]);

  const getFallbackResponse = useCallback((userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (questionData) {
      const subject = questionData.subject.toLowerCase();
      if (subject.includes('math') || subject.includes('physic') || subject.includes('chemistry')) {
        return fallbackResponses.math[Math.floor(Math.random() * fallbackResponses.math.length)];
      } else if (subject.includes('biology') || subject.includes('science')) {
        return fallbackResponses.science[Math.floor(Math.random() * fallbackResponses.science.length)];
      } else if (subject.includes('english') || subject.includes('literature')) {
        return fallbackResponses.english[Math.floor(Math.random() * fallbackResponses.english.length)];
      }
    }
    
    return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)];
  }, [questionData]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;
    
    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response;
      let isAIResponse = false;
      
      // Try AI tutoring first
      if (aiAvailable && retryCount < 3) {
        try {
          const aiResponse = await apiRequest('/api/ai/tutor', {
            method: 'POST',
            body: JSON.stringify({
              question: messageText,
              context: context || (questionData ? `Question: ${questionData.text}\nSubject: ${questionData.subject}\nTopic: ${questionData.topic}` : undefined),
              questionData
            })
          });
          
          const data = await aiResponse.json();
          response = data.explanation;
          isAIResponse = true;
          setConnectionStatus('connected');
          setRetryCount(0);
        } catch (error) {
          console.error('AI tutoring failed:', error);
          setRetryCount(prev => prev + 1);
          
          if (retryCount >= 2) {
            setAiAvailable(false);
            setConnectionStatus('error');
          }
          
          // Fall back to basic response
          response = getFallbackResponse(messageText);
        }
      } else {
        // Use fallback response
        response = getFallbackResponse(messageText);
        setConnectionStatus('disconnected');
      }
      
      const aiMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        confidence: isAIResponse ? 0.8 : 0.4
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(response);
      }
      
    } catch (error) {
      console.error('Tutoring error:', error);
      const errorMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: "I'm having trouble right now, but I'm still here to help! Please try rephrasing your question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [aiAvailable, retryCount, context, questionData, voiceEnabled, speak, getFallbackResponse]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-3 w-3" />;
      case 'disconnected': return <Clock className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-500" />
          AI Tutor
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-normal text-gray-600">
              {connectionStatus === 'connected' ? 'AI Active' : 
               connectionStatus === 'disconnected' ? 'Basic Mode' : 'Limited Mode'}
            </span>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center gap-2"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Voice
          </Button>
          {recognitionRef.current && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceRecognition}
              className="flex items-center gap-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? 'Stop' : 'Speak'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Connection Status Alert */}
        {connectionStatus !== 'connected' && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {connectionStatus === 'disconnected' 
                ? "AI features are limited. Basic tutoring is available."
                : "AI connection issues detected. Using fallback responses."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Messages */}
        <div className="h-80 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'ai'
                    ? 'bg-white dark:bg-gray-700 border'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.type === 'ai' && <Brain className="h-4 w-4" />}
                  {message.type === 'user' && <span className="font-medium">You</span>}
                  {message.type === 'system' && <AlertTriangle className="h-4 w-4" />}
                  {message.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(message.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 border rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about this topic..."
              className="flex-1"
              rows={2}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("Explain this concept in simple terms")}
              disabled={isLoading}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Explain
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("Give me examples")}
              disabled={isLoading}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Examples
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("What should I study next?")}
              disabled={isLoading}
            >
              <Target className="h-4 w-4 mr-1" />
              Study Guide
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}