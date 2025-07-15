import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Send, 
  Lightbulb, 
  BookOpen, 
  MessageSquare,
  Sparkles
} from "lucide-react";

interface AiTutorProps {
  question?: any;
  isOpen: boolean;
  onClose: () => void;
}

interface TutorResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
  confidence: number;
}

export default function AiTutor({ question, isOpen, onClose }: AiTutorProps) {
  const { toast } = useToast();
  const [userQuestion, setUserQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: "user" | "ai";
    content: string;
    examples?: string[];
    relatedTopics?: string[];
    confidence?: number;
  }>>([]);

  // Explain current question mutation
  const explainQuestionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/ai/explain", {
        questionText: question.text,
        correctAnswer: question.correctAnswer,
      });
    },
    onSuccess: async (response) => {
      const data: TutorResponse = await response.json();
      setConversationHistory(prev => [
        ...prev,
        {
          type: "user",
          content: `Please explain this question: ${question.text}`
        },
        {
          type: "ai",
          content: data.explanation,
          examples: data.examples,
          relatedTopics: data.relatedTopics,
          confidence: data.confidence
        }
      ]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get explanation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // General tutoring mutation
  const askTutorMutation = useMutation({
    mutationFn: async (questionText: string) => {
      return await apiRequest("POST", "/api/ai/tutor", {
        question: questionText,
        context: question ? `Current exam question: ${question.text}` : undefined,
      });
    },
    onSuccess: async (response) => {
      const data: TutorResponse = await response.json();
      setConversationHistory(prev => [
        ...prev,
        {
          type: "user",
          content: userQuestion
        },
        {
          type: "ai",
          content: data.explanation,
          examples: data.examples,
          relatedTopics: data.relatedTopics,
          confidence: data.confidence
        }
      ]);
      setUserQuestion("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;
    askTutorMutation.mutate(userQuestion);
  };

  const handleExplainCurrentQuestion = () => {
    if (!question) return;
    explainQuestionMutation.mutate();
  };

  const quickQuestions = [
    "Can you explain this concept step by step?",
    "What are some similar examples?",
    "What should I study to understand this better?",
    "Can you break this down into simpler terms?"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <Brain className="mr-3 h-7 w-7 text-purple-600" />
            AI Tutor
            <Sparkles className="ml-2 h-5 w-5 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Current Question Context */}
          {question && (
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Question</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{question.text}</p>
                    <Button
                      onClick={handleExplainCurrentQuestion}
                      disabled={explainQuestionMutation.isPending}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {explainQuestionMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Lightbulb className="mr-2 h-4 w-4" />
                      )}
                      Explain This Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation History */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {conversationHistory.length === 0 ? (
                  <Card className="border-dashed border-gray-300 dark:border-gray-600">
                    <CardContent className="p-8 text-center">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to AI Tutor!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        I'm here to help you understand concepts, solve problems, and answer your questions.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickQuestions.map((q, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserQuestion(q);
                              askTutorMutation.mutate(q);
                            }}
                            className="text-left justify-start h-auto py-2 px-3"
                            disabled={askTutorMutation.isPending}
                          >
                            <MessageSquare className="mr-2 h-3 w-3 flex-shrink-0" />
                            <span className="text-xs">{q}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  conversationHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <Card className={`max-w-[80%] ${
                        message.type === "user" 
                          ? "bg-blue-500 text-white" 
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {message.type === "ai" && (
                              <Brain className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm leading-relaxed ${
                                message.type === "user" 
                                  ? "text-white" 
                                  : "text-gray-900 dark:text-white"
                              }`}>
                                {message.content}
                              </p>
                              
                              {message.examples && message.examples.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <Lightbulb className="mr-2 h-4 w-4" />
                                    Examples:
                                  </h4>
                                  <ul className="space-y-1">
                                    {message.examples.map((example, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-purple-200 dark:border-purple-700">
                                        {example}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {message.relatedTopics && message.relatedTopics.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Related Topics:
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {message.relatedTopics.map((topic, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {message.confidence && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  Confidence: {Math.round(message.confidence * 100)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex space-x-3">
              <Textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask me anything about this topic or any other study question..."
                className="flex-1 min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim() || askTutorMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-6"
                size="lg"
              >
                {askTutorMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
