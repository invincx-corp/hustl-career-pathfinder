import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  metadata: any;
  replyToId?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    mime_type: string;
  }>;
  reactions?: Array<{
    id: string;
    user_id: string;
    reaction_type: string;
    profiles: {
      full_name: string;
    };
  }>;
}

interface Conversation {
  id: string;
  type: string;
  title: string;
  lastMessageAt: string;
  participants: Array<{
    user_id: string;
    role: string;
    last_read_at: string;
    is_active: boolean;
    profiles: {
      id: string;
      full_name: string;
      avatar_url?: string;
      email: string;
    };
  }>;
}

interface ChatInterfaceProps {
  conversationId: string;
  userId: string;
  onBack?: () => void;
}

export function ChatInterface({ conversationId, userId, onBack }: ChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join conversation room
    newSocket.emit('join-conversation', conversationId);

    // Listen for new messages
    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    newSocket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== userId) {
        if (data.isTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    });

    return () => {
      newSocket.emit('leave-conversation', conversationId);
      newSocket.disconnect();
    };
  }, [conversationId, userId]);

  useEffect(() => {
    fetchConversation();
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/messaging/conversations?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const conv = data.conversations.find((c: Conversation) => c.id === conversationId);
        setConversation(conv || null);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      conversationId,
      userId,
      message: newMessage,
      messageType: 'text'
    };

    try {
      // Send via API
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userId,
          content: newMessage,
          messageType: 'text'
        }),
      });

      if (response.ok) {
        // Also emit via socket for real-time updates
        socket.emit('send-message', messageData);
        setNewMessage('');
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing-start', { conversationId, userId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing-stop', { conversationId, userId });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
          <p className="text-muted-foreground mb-4">This conversation may have been deleted or you don't have access to it.</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                ←
              </Button>
            )}
            <div className="flex items-center gap-2">
              {conversation.type === 'direct' && conversation.participants.length === 2 && (
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={conversation.participants.find(p => p.user_id !== userId)?.profiles.avatar_url} 
                  />
                  <AvatarFallback>
                    {conversation.participants.find(p => p.user_id !== userId)?.profiles.full_name
                      ?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <CardTitle className="text-lg">
                  {conversation.type === 'direct' 
                    ? conversation.participants.find(p => p.user_id !== userId)?.profiles.full_name
                    : conversation.title
                  }
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                  {conversation.type === 'group' && (
                    <Badge variant="outline" className="text-xs">
                      Group
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {date}
                  </Badge>
                </div>
                
                {dateMessages.map((message, index) => {
                  const isOwnMessage = message.senderId === userId;
                  const showAvatar = index === 0 || 
                    dateMessages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.profiles?.avatar_url} />
                          <AvatarFallback>
                            {message.profiles?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {!isOwnMessage && !showAvatar && (
                        <div className="w-8" /> // Spacer
                      )}
                      
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {message.profiles?.full_name}
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                  <Paperclip className="h-3 w-3" />
                                  <a 
                                    href={attachment.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {attachment.file_name}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction) => (
                                <Badge key={reaction.id} variant="outline" className="text-xs">
                                  {reaction.reaction_type} {reaction.profiles.full_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.createdAt)}
                          {message.isEdited && ' (edited)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex gap-3 justify-start">
                <div className="w-8" /> {/* Spacer */}
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] resize-none"
              rows={1}
            />
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
