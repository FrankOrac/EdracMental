import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Send, 
  Copy, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Sparkles,
  MessageCircle,
  Clock,
  Target,
  Star,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Zap
} from "lucide-react";
import AIConfidenceIndicator from "./AIConfidenceIndicator";
import AIResponseActions from "./AIResponseActions";

interface AiMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  examples?: string[];
  relatedTopics?: string[];
  isAnimating?: boolean;
}

interface TutorResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
  confidence: number;
}

interface EnhancedAITutorProps {
  context?: string;
  userId?: string;
  questionData?: any;
}

export default function EnhancedAITutor({ context, userId, questionData }: EnhancedAITutorProps) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to your Enhanced AI Tutor! I\'m here to help you with any questions about your studies. Ask me anything about Mathematics, Physics, Chemistry, Biology, English, or any other subject!',
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
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

  // AI tutoring mutation
  const aiTutoringMutation = useMutation({
    mutationFn: async (question: string) => {
      setConnectionStatus('connecting');
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question, 
          context,
          questionData
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('AI tutoring request failed');
      }
      
      return response.json();
    },
    onSuccess: (data: TutorResponse) => {
      setConnectionStatus('connected');
      const aiMessage: AiMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.explanation,
        timestamp: new Date(),
        confidence: data.confidence,
        examples: data.examples,
        relatedTopics: data.relatedTopics,
        isAnimating: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled && synthRef.current) {
        speakText(data.explanation);
      }
      
      // Remove animation flag after animation completes
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id ? { ...msg, isAnimating: false } : msg
        ));
      }, 1000);
    },
    onError: (error) => {
      setConnectionStatus('error');
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AiMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    aiTutoringMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
      });
    });
  };



  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="h-6 w-6 text-purple-500" />
              </motion.div>
              <span>Enhanced AI Tutor</span>
              <Badge variant="secondary" className="ml-2">
                24/7 Available
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Status: {connectionStatus}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={voiceEnabled ? 'text-blue-500' : 'text-gray-500'}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle voice responses</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Smart Explanations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get step-by-step explanations with confidence indicators
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <Volume2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Voice Synthesis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Listen to AI responses with natural speech
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <Copy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Copy Responses</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Easily copy AI responses to your clipboard
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
                              {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className={`rounded-lg p-3 ${
                              message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : message.type === 'system'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                : 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                            }`}>
                              <motion.div
                                initial={message.isAnimating ? { opacity: 0 } : {}}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <p className="text-sm">{message.content}</p>
                              </motion.div>
                              
                              {message.type === 'ai' && (
                                <div className="mt-3 space-y-2">
                                  {/* Confidence Indicator */}
                                  {message.confidence && (
                                    <AIConfidenceIndicator 
                                      confidence={message.confidence} 
                                      className="mb-2"
                                    />
                                  )}
                                  
                                  {/* Examples */}
                                  {message.examples && message.examples.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium opacity-70">Examples:</p>
                                      <ul className="text-xs space-y-1">
                                        {message.examples.map((example, idx) => (
                                          <li key={idx} className="flex items-start gap-1">
                                            <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-60" />
                                            <span>{example}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Related Topics */}
                                  {message.relatedTopics && message.relatedTopics.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium opacity-70">Related Topics:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {message.relatedTopics.map((topic, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  <AIResponseActions
                                    content={message.content}
                                    messageId={message.id}
                                    onSpeak={speakText}
                                    onFeedback={(messageId, rating) => {
                                      toast({
                                        title: "Thanks for your feedback!",
                                        description: `Your ${rating} feedback helps improve the AI tutor.`,
                                      });
                                    }}
                                    className="mt-2"
                                  />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="h-4 w-4 text-purple-500" />
                          </motion.div>
                          <span className="text-sm text-purple-700 dark:text-purple-300">
                            AI is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="pr-12"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 ${isListening ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Help Tooltip */}
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Need help?
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">AI Tutor Help:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Ask questions about any subject</li>
                      <li>• Use voice input with the microphone</li>
                      <li>• Copy responses to your clipboard</li>
                      <li>• Enable voice responses for audio feedback</li>
                      <li>• Check confidence levels for response accuracy</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}