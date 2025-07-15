import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  AlertTriangle,
  CheckCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  corrections?: string[];
  isTyping?: boolean;
}

interface TypoCorrection {
  original: string;
  corrected: string;
  confidence: number;
}

const FAQ_RESPONSES = {
  'how to create exam': 'To create an exam: 1) Go to the Exams tab in your dashboard, 2) Click "Create New Exam", 3) Set exam title, duration, and questions, 4) Choose subjects and difficulty levels, 5) Enable anti-cheating features if needed, 6) Save and activate your exam.',
  'user management': 'User Management: You can create and manage three types of users - Students (take exams), Institutions (create exams for their students), and Admins (full system access). Go to Users tab to add, edit, or delete user accounts.',
  'question bank': 'Question Bank: Add questions through bulk CSV/Excel upload or create them individually. Each question needs text, 4 options, correct answer, explanation, subject, and difficulty level. Use the Question Validator to check for errors.',
  'exam sharing': 'Exam Sharing: Toggle exams to "Public" to generate shareable links. Share these links for institutional interviews or assessments. Guest users can register to take shared exams.',
  'analytics dashboard': 'Analytics: View exam performance, user engagement, revenue metrics, and system statistics. Track student progress, exam completion rates, and platform usage patterns.',
  'anti-cheating': 'Anti-Cheating Features: Enable tab switch detection, focus monitoring, time limits, and question randomization. The system logs suspicious activities during exams.',
  'payment system': 'Payment Integration: Uses Paystack for Nigerian market. Supports subscriptions, one-time payments, and institutional billing. Configure in Settings > API Configuration.',
  'ai features': 'AI Features: Auto-generate questions by subject/topic, get real-time explanations, 24/7 tutoring support, and question validation with typo checking.',
  'technical support': 'Technical Support: Check system status in Settings, test API connections, view logs, and contact support for issues. All external integrations are monitored.',
  'mobile access': 'Mobile Access: The platform is fully responsive and works on all devices. Students can take exams on phones/tablets with the same features as desktop.',
  'grading system': 'Grading: Automatic scoring for multiple choice questions. Results show correct/incorrect answers, explanations, and percentage scores. Export results to CSV/Excel.',
  'subjects topics': 'Subjects & Topics: Manage curriculum through Categories tab. Add subjects, create topics, and organize question banks by academic standards.',
  'institution setup': 'Institution Setup: Create institutional accounts, add students, manage exams, and track performance. Institutions can create custom exams for their students.',
  'backup security': 'Backup & Security: Data is backed up regularly, user sessions are secure, and all communications use HTTPS. Role-based access controls protect sensitive data.',
  'api integration': 'API Integration: Connect external systems through our REST API. Test connections in Settings and configure webhooks for real-time updates.'
};

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your assistant for the Edrac CBT platform. I can help you with questions about exams, subjects, user management, and platform features. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not capture your voice. Please try again.",
          variant: "destructive",
        });
      };
      
      setRecognition(recognitionInstance);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, [toast]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkTyposMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('/api/ai/check-typos', {
        method: 'POST',
        body: { text }
      });
    },
    onSuccess: (data) => {
      if (data.corrections && data.corrections.length > 0) {
        const correctionMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: `I found ${data.corrections.length} potential typo(s). Would you like me to correct them?`,
          timestamp: new Date(),
          corrections: data.corrections.map((c: TypoCorrection) => 
            `"${c.original}" → "${c.corrected}" (${Math.round(c.confidence * 100)}% confidence)`
          )
        };
        setMessages(prev => [...prev, correctionMessage]);
      }
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/ai/chat', {
        method: 'POST',
        body: { 
          message, 
          context: 'edrac-cbt-platform',
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Text-to-speech for bot response
      if (synthesis && isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synthesis.speak(utterance);
      }
    },
    onError: () => {
      // Fallback to FAQ system when AI is unavailable
      const response = findFAQResponse(inputMessage);
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Text-to-speech for bot response
      if (synthesis && isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synthesis.speak(utterance);
      }
    }
  });

  const findFAQResponse = (message: string): string => {
    const normalizedMessage = message.toLowerCase();
    
    // Check for keyword matches in FAQ
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (normalizedMessage.includes(key) || key.split(' ').some(word => normalizedMessage.includes(word))) {
        return response;
      }
    }
    
    // Default response when no match found
    return "I'm here to help with the Edrac CBT platform. You can ask me about exam creation, user management, question banks, analytics, AI features, payment systems, or technical support. Type 'help' to see common questions.";
  };

  const showFAQOptions = () => {
    const faqMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "Here are some common questions I can help with:\n\n" + 
               "• How to create exam\n" +
               "• User management\n" +
               "• Question bank\n" +
               "• Exam sharing\n" +
               "• Analytics dashboard\n" +
               "• Anti-cheating features\n" +
               "• Payment system\n" +
               "• AI features\n" +
               "• Technical support\n" +
               "• Mobile access\n\n" +
               "Just type any of these topics or ask your question!",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, faqMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check for special commands
    if (inputMessage.toLowerCase().includes('help') || inputMessage.toLowerCase().includes('faq')) {
      showFAQOptions();
      setInputMessage('');
      return;
    }
    
    // Check for typos first
    checkTyposMutation.mutate(inputMessage);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'bot',
      content: 'Assistant is typing...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);
    
    // Try AI first, fallback to FAQ if it fails
    try {
      sendMessageMutation.mutate(inputMessage);
    } catch (error) {
      // Immediate fallback to FAQ
      const response = findFAQResponse(inputMessage);
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
    
    setInputMessage('');
    
    // Remove typing indicator after response
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    }, 2000);
  };

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking && synthesis) {
      synthesis.cancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'bot':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className={`w-96 shadow-2xl border-0 ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300`}>
        <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Edrac AI Assistant
              <Badge variant="secondary" className="text-xs bg-white/20">
                Online
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={showFAQOptions}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Show FAQ"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeech}
                className="h-8 w-8 text-white hover:bg-white/20"
                title={isSpeaking ? "Disable voice" : "Enable voice"}
              >
                {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <CardContent className="p-0 flex flex-col h-[436px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : message.type === 'system'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getMessageIcon(message.type)}
                            <span className="text-xs opacity-75">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className={`text-sm ${message.isTyping ? 'animate-pulse' : ''}`}>
                            {message.content}
                          </div>
                          {message.corrections && (
                            <div className="mt-2 space-y-1">
                              {message.corrections.map((correction, index) => (
                                <div
                                  key={index}
                                  className="text-xs bg-white/20 rounded p-1 flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  {correction}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the CBT platform..."
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleVoiceInput}
                      className={`${isListening ? 'bg-red-500 text-white' : ''}`}
                      disabled={!recognition}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}