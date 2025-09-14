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
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  sentiment?: {
    sentiment: string;
    confidence: number;
    isUrgent: boolean;
  };
  suggestions?: Array<{
    title: string;
    type: string;
    description: string;
  }>;
  actionItems?: Array<{
    id: string;
    title: string;
    type: string;
    dueDate: string;
    priority: string;
    estimatedTime: string;
  }>;
  insights?: {
    insights: string[];
    actionItems: string[];
  };
  escalation?: {
    needsEscalation: boolean;
    reason: string;
    priority: string;
  };
}

interface AICoachChatProps {
  userId: string;
  onEscalation?: (escalation: any) => void;
}

export function AICoachChat({ userId, onEscalation }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPreferences();
    fetchConversationHistory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/ai/coach/preferences/${userId}`);
      const data = await response.json();
      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const response = await fetch(`/api/ai/coach/conversations/${userId}?limit=10`);
      const data = await response.json();
      if (data.success && data.conversations.length > 0) {
        const conversationMessages = data.conversations.map((conv: any) => ({
          id: conv.id,
          type: 'user' as const,
          content: conv.user_message,
          timestamp: conv.created_at,
          sentiment: conv.sentiment
        }));
        
        const aiMessages = data.conversations.map((conv: any) => ({
          id: conv.id + '_ai',
          type: 'ai' as const,
          content: conv.ai_response,
          timestamp: conv.created_at,
          sentiment: conv.sentiment,
          suggestions: conv.insights?.suggestions,
          actionItems: conv.insights?.actionItems,
          escalation: {
            needsEscalation: conv.needs_escalation,
            reason: conv.escalation_reason,
            priority: conv.escalation_priority
          }
        }));

        const allMessages = conversationMessages.concat(aiMessages)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setMessages(allMessages);
        setConversationId(data.conversations[0]?.conversation_id);
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: inputMessage,
          conversationId,
          context: {
            preferences,
            recentMessages: messages.slice(-5) // Last 5 messages for context
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString() + '_ai',
          type: 'ai',
          content: data.response.content,
          timestamp: data.response.timestamp,
          sentiment: data.response.sentiment,
          suggestions: data.response.suggestions,
          actionItems: data.response.actionItems,
          insights: data.response.insights,
          escalation: data.response.escalation
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationId(data.response.conversationId);

        // Handle escalation
        if (data.response.escalation?.needsEscalation && onEscalation) {
          onEscalation(data.response.escalation);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'urgent': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4" />;
      case 'negative': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          AI Career Coach
          {preferences && (
            <Badge variant="outline" className="ml-2">
              {preferences.coaching_style} style
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your personalized AI career coach is here to help guide your professional journey.
        </p>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to your AI Career Coach!</h3>
                <p className="text-muted-foreground mb-4">
                  I'm here to help you with career guidance, skill development, and professional growth.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("Help me plan my career path")}
                  >
                    Plan Career Path
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("What skills should I learn?")}
                  >
                    Skill Development
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("I'm feeling stuck in my career")}
                  >
                    Career Guidance
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Sentiment indicator */}
                    {message.sentiment && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${getSentimentColor(message.sentiment.sentiment)}`}>
                        {getSentimentIcon(message.sentiment.sentiment)}
                        <span>
                          {message.sentiment.sentiment} ({Math.round(message.sentiment.confidence * 100)}%)
                        </span>
                      </div>
                    )}

                    {/* Escalation warning */}
                    {message.escalation?.needsEscalation && (
                      <Alert className="mt-2 border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Escalation Alert:</strong> {message.escalation.reason}
                          <br />
                          <span className="text-xs">Priority: {message.escalation.priority}</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Suggestions:
                      </p>
                      {message.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          <strong>{suggestion.title}:</strong> {suggestion.description}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Items */}
                  {message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Action Items:
                      </p>
                      {message.actionItems.map((item, index) => (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded border-l-2 border-green-200">
                          <div className="flex items-center justify-between">
                            <span><strong>{item.title}</strong> - {item.description}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.priority} priority
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Due: {item.dueDate} • Est. time: {item.estimatedTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI career coach anything..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
