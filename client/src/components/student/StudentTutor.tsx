import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Target,
  Send,
  Mic,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  History,
  Lightbulb
} from "lucide-react";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function StudentTutor() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai",
      message: "Hello! I'm your AI tutor. I can help you with Mathematics, English, Physics, and exam preparation. What would you like to learn today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickTopics = [
    { title: "Algebra Help", icon: Target, subject: "Mathematics" },
    { title: "Grammar Rules", icon: BookOpen, subject: "English" },
    { title: "Physics Laws", icon: Brain, subject: "Physics" },
    { title: "JAMB Tips", icon: Lightbulb, subject: "Exam Prep" }
  ];

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const userMessage = {
      id: chatHistory.length + 1,
      type: "user",
      message: question,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: data.explanation || "I understand your question. Let me help you with that concept step by step.",
        examples: data.examples || [],
        relatedTopics: data.relatedTopics || [],
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Tutor error:', error);
      
      // Intelligent fallback based on question content
      const lowerQuestion = question.toLowerCase();
      let fallbackResponse = "I'm here to help! While my advanced AI is temporarily unavailable, I can still provide guidance.";
      
      if (lowerQuestion.includes('math') || lowerQuestion.includes('algebra') || lowerQuestion.includes('solve')) {
        fallbackResponse = "For mathematics: Break down the problem step by step, identify what you know and what you need to find, then apply the appropriate formulas. Practice similar problems to build confidence.";
      } else if (lowerQuestion.includes('english') || lowerQuestion.includes('grammar') || lowerQuestion.includes('essay')) {
        fallbackResponse = "For English: Focus on understanding the context, read questions carefully, and practice grammar rules daily. For essays, plan your structure before writing.";
      } else if (lowerQuestion.includes('physics') || lowerQuestion.includes('force') || lowerQuestion.includes('motion')) {
        fallbackResponse = "For Physics: Understand the fundamental concepts first, then practice applying formulas. Draw diagrams to visualize problems and identify the physics principles involved.";
      }

      const fallbackMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: fallbackResponse,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  const handleQuickTopic = (topic: string) => {
    setQuestion(`Help me understand ${topic}`);
  };

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard",
      description: "Message copied successfully!",
    });
  };

  return (
    <StudentDashboardLayout title="AI Tutor" subtitle="Get personalized help with your studies">
      <div className="space-y-6">
        {/* Quick Topic Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Quick Help Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickTopics.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleQuickTopic(topic.title)}
                >
                  <topic.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{topic.title}</div>
                    <div className="text-xs text-gray-500">{topic.subject}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="h-96">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Chat with AI Tutor
              <Badge className="ml-auto bg-green-100 text-green-800">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    
                    {message.examples && message.examples.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-medium mb-1">Examples:</p>
                        <ul className="text-xs space-y-1">
                          {message.examples.map((example, idx) => (
                            <li key={idx}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {message.type === 'ai' && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyMessage(message.message)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Ask me anything about your studies..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] pr-24"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!question.trim() || isLoading}
                  className="h-[60px]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutor Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">24/7 Availability</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get instant help anytime, anywhere with our AI tutor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Personalized Learning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tailored explanations based on your learning style
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold mb-2">All Subjects Covered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mathematics, English, Physics, and exam preparation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}