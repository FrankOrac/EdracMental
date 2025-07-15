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
  VolumeX
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

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant for the Edrac CBT platform. I can help you with questions about exams, subjects, user management, and platform features. How can I assist you today?',
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
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check for typos first
    checkTyposMutation.mutate(inputMessage);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'bot',
      content: 'AI is typing...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);
    
    // Send message to AI
    sendMessageMutation.mutate(inputMessage);
    
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
                onClick={toggleSpeech}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
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