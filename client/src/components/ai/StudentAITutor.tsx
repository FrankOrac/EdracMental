import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Brain, Lightbulb, BookOpen, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface TutorResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
  confidence: number;
}

export default function StudentAITutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to your AI Tutor! I\'m here to help you with any questions about your studies. Ask me anything about Mathematics, Physics, Chemistry, Biology, English, or any other subject!',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Get available subjects for quick topics
  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const tutorMutation = useMutation({
    mutationFn: (question: string) => apiRequest("/api/ai/tutor", "POST", { question }),
    onSuccess: (data: TutorResponse) => {
      setIsLoading(false);
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.explanation,
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(m => !m.isTyping).concat([aiMessage]));
    },
    onError: () => {
      setIsLoading(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'I\'m having trouble connecting right now. Please try asking your question again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(m => !m.isTyping).concat([errorMessage]));
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      content: 'AI Tutor is thinking...',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsLoading(true);
    
    tutorMutation.mutate(inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const quickQuestions = [
    "Explain the concept of photosynthesis",
    "How do I solve quadratic equations?",
    "What is Newton's first law of motion?",
    "Help me understand chemical bonding",
    "Explain the structure of an essay",
    "What are the parts of a cell?"
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Tutor</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get instant help with your studies! Ask questions, get explanations, and master any subject with your personal AI tutor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <Target className="h-3 w-3 mr-2 shrink-0" />
                    {question}
                  </Button>
                ))}
              </CardContent>
              </Card>

              {/* Subjects Quick Access */}
              {Array.isArray(subjects) && subjects.length > 0 && (
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subjects.slice(0, 6).map((subject: any) => (
                    <Button
                      key={subject.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickQuestion(`Help me with ${subject.name}`)}
                    >
                      <Badge variant="secondary" className="mr-2">
                        {subject.code}
                      </Badge>
                      {subject.name}
                    </Button>
                  ))}
                </CardContent>
                </Card>
              )}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Chat with AI Tutor
                  </CardTitle>
                </CardHeader>
              
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : message.type === 'system'
                            ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <div className="space-y-2">
                            <p className={`text-sm ${
                              message.type === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {message.content}
                            </p>
                            <p className={`text-xs ${
                              message.type === 'user' 
                                ? 'text-blue-100' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {message.isTyping && (
                            <div className="flex space-x-1 mt-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about your studies..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !inputMessage.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send • AI Tutor is here to help with all subjects
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}