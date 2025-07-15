import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  Circle,
  AlertCircle,
  Star,
  Archive,
  Settings
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
}

interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: 'student' | 'institution' | 'admin';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  assignedTo?: string;
}

export default function LiveChatSystem() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Mock data
  const conversations: ChatConversation[] = [
    {
      id: '1',
      userId: 'student-001',
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b607?w=150',
      userRole: 'student',
      lastMessage: 'I need help with the physics exam preparation',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      status: 'online',
      priority: 'high',
      tags: ['exam-help', 'physics'],
      assignedTo: 'admin-001'
    },
    {
      id: '2',
      userId: 'institution-002',
      userName: 'Lagos State University',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      userRole: 'institution',
      lastMessage: 'Can we schedule a demo for our faculty?',
      lastMessageTime: '15 min ago',
      unreadCount: 1,
      status: 'online',
      priority: 'medium',
      tags: ['demo', 'institution'],
      assignedTo: 'admin-002'
    },
    {
      id: '3',
      userId: 'student-003',
      userName: 'Mary Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      userRole: 'student',
      lastMessage: 'Thank you for the explanation!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      status: 'away',
      priority: 'low',
      tags: ['resolved'],
      assignedTo: 'admin-001'
    }
  ];

  const messages: Record<string, ChatMessage[]> = {
    '1': [
      {
        id: '1',
        senderId: 'student-001',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b607?w=150',
        content: 'Hi, I need help with the physics exam preparation',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        senderId: 'admin-001',
        senderName: 'Admin',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        content: 'Hello John! I\'d be happy to help you with physics. What specific topics are you struggling with?',
        timestamp: '2024-01-15T10:32:00Z',
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        senderId: 'student-001',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b607?w=150',
        content: 'I\'m having trouble with electromagnetic waves and optics',
        timestamp: '2024-01-15T10:35:00Z',
        type: 'text',
        status: 'delivered'
      }
    ]
  };

  const filteredConversations = conversations.filter(conv => 
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || conv.status === statusFilter)
  );

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    // Add message logic here
    toast({ title: "Message sent" });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'institution': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            Live Chat System
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time support and communication
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Circle className="w-3 h-3 mr-1 fill-green-500" />
            {conversations.filter(c => c.status === 'online').length} Online
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <MessageCircle className="w-3 h-3 mr-1" />
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} Unread
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Conversations</span>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-4">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.userAvatar} />
                          <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conversation.userName}</p>
                          <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className={`text-xs ${getRoleColor(conversation.userRole)}`}>
                              {conversation.userRole}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </Badge>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs bg-red-500">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.userAvatar} />
                        <AvatarFallback>
                          {conversations.find(c => c.id === selectedConversation)?.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversations.find(c => c.id === selectedConversation)?.status || 'offline')}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{conversations.find(c => c.id === selectedConversation)?.userName}</h3>
                      <p className="text-sm text-gray-500">
                        {conversations.find(c => c.id === selectedConversation)?.status === 'online' ? 'Online' : 'Last seen 2 hours ago'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] px-4">
                  <div className="space-y-4 py-4">
                    {messages[selectedConversation]?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === 'admin-001' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.senderId === 'admin-001' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-lg ${
                            msg.senderId === 'admin-001' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <div className={`flex items-center mt-1 space-x-1 ${
                            msg.senderId === 'admin-001' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {msg.senderId === 'admin-001' && (
                              <CheckCheck className={`w-4 h-4 ${
                                msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'
                              }`} />
                            )}
                          </div>
                        </div>
                        <Avatar className={`w-8 h-8 ${msg.senderId === 'admin-001' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                          <AvatarImage src={msg.senderAvatar} />
                          <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
                <p className="text-gray-500">Choose a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}