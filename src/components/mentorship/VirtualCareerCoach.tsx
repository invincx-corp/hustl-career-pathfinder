import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { aiCoachingService, AICoachingSession, AIConversation, AIResponse } from '@/lib/ai-coaching-service';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Clock, 
  Star, 
  TrendingUp,
  Target,
  Lightbulb,
  Heart,
  AlertTriangle,
  CheckCircle,
  Plus,
  History,
  Settings,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Brain,
  Zap,
  Smile,
  Frown,
  Meh
} from 'lucide-react';

const VirtualCareerCoach = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<AICoachingSession | null>(null);
  const [conversation, setConversation] = useState<AIConversation[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<AICoachingSession[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadUserSessions();
      loadAnalytics();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    if (activeTab === 'insights') {
      loadAnalytics();
    }
  }, [activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      const analyticsData = await aiCoachingService.getCoachingAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadUserSessions = async () => {
    if (!user) return;
    
    try {
      const sessionsData = await aiCoachingService.getUserCoachingSessions(user.id, 10);
      setSessions(sessionsData);
      
      // If there's an active session, load it
      const activeSession = sessionsData.find(s => !s.ended_at);
      if (activeSession) {
        setCurrentSession(activeSession);
        await loadConversation(activeSession.id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadConversation = async (sessionId: string) => {
    try {
      const conversationData = await aiCoachingService.getConversationHistory(sessionId, 50);
      setConversation(conversationData);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewSession = async (sessionType: AICoachingSession['session_type'] = 'general') => {
    if (!user) return;
    
    try {
      setLoading(true);
      const session = await aiCoachingService.startCoachingSession(user.id, sessionType, {
        userProfile: {
          name: user.user_metadata?.full_name || user.email,
          email: user.email
        }
      });
      
      if (session) {
        setCurrentSession(session);
        setConversation([]);
        setActiveTab('chat');
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession || !user) return;
    
    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);
    
    try {
      setLoading(true);
      
      // Analyze sentiment of user message
      const sentiment = aiCoachingService.analyzeSentiment(userMessage);
      setSentimentScore(sentiment);
      
      const response = await aiCoachingService.sendMessage(
        user.id,
        currentSession.id,
        userMessage,
        {
          sentiment_score: sentiment,
          timestamp: new Date().toISOString()
        }
      );
      
      if (response) {
        setAiResponse(response);
        
        // Check for escalation
        if (response.escalation_needed) {
          // Show escalation warning
          console.log('Escalation needed:', response);
        }
        
        // Reload conversation to get updated messages
        await loadConversation(currentSession.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      const updatedSession = await aiCoachingService.endCoachingSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(null);
        setConversation([]);
        await loadUserSessions();
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'career_planning': return <Target className="h-4 w-4" />;
      case 'skill_development': return <TrendingUp className="h-4 w-4" />;
      case 'crisis_support': return <Heart className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'career_planning': return 'bg-blue-100 text-blue-800';
      case 'skill_development': return 'bg-green-100 text-green-800';
      case 'crisis_support': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <Smile className="h-4 w-4 text-green-500" />;
    if (score < -0.3) return <Frown className="h-4 w-4 text-red-500" />;
    return <Meh className="h-4 w-4 text-yellow-500" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const handleQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage);
    inputRef.current?.focus();
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    // TODO: Implement feedback system
    console.log('Feedback:', feedback, 'for message:', messageId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Career Coach</h1>
          <p className="text-gray-600 mt-2">Your AI-powered career guidance companion</p>
        </div>
        {!currentSession && (
          <Button onClick={() => startNewSession('general')} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Session
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          {currentSession ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">AI Career Coach</CardTitle>
                          <p className="text-sm text-gray-600">
                            {currentSession.session_type.replace('_', ' ')} session
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={endSession}
                      >
                        End Session
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {conversation.length === 0 ? (
                        <div className="text-center py-8">
                          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Welcome to your AI Career Coach!
                          </h3>
                          <p className="text-gray-600">
                            I'm here to help you with your career development. What would you like to work on today?
                          </p>
                        </div>
                      ) : (
                        conversation.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              msg.message_type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {msg.message_type === 'ai' && (
                              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.message_type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs opacity-70">
                                  {formatTime(msg.created_at)}
                                </p>
                                {msg.message_type === 'user' && msg.context?.sentiment_score !== undefined && (
                                  <div className="flex items-center gap-1">
                                    {getSentimentIcon(msg.context.sentiment_score)}
                                    <span className={`text-xs ${getSentimentColor(msg.context.sentiment_score)}`}>
                                      {msg.context.sentiment_score > 0 ? '+' : ''}{msg.context.sentiment_score.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {msg.message_type === 'ai' && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleFeedback(msg.id, 'positive')}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleFeedback(msg.id, 'negative')}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {msg.message_type === 'user' && (
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {isTyping && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-600">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || loading}
                          size="sm"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* AI Suggestions */}
                      {aiResponse?.suggestions && aiResponse.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {aiResponse.suggestions.slice(0, 3).map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleQuickMessage(suggestion)}
                            >
                              <Lightbulb className="h-3 w-3 mr-1" />
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Info & Suggestions */}
              <div className="space-y-6">
                {/* Session Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getSessionTypeColor(currentSession.session_type)}>
                        {getSessionTypeIcon(currentSession.session_type)}
                        <span className="ml-1 capitalize">
                          {currentSession.session_type.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Started {new Date(currentSession.started_at).toLocaleString()}
                    </div>
                    {currentSession.duration_minutes && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        Duration: {currentSession.duration_minutes} minutes
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickMessage("Help me plan my career path")}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Career Planning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickMessage("What skills should I develop?")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Skill Development
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickMessage("I need help with my goals")}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Goal Setting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickMessage("I'm feeling overwhelmed with my work")}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Current Sentiment */}
                {sentimentScore !== 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Current Mood
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        {getSentimentIcon(sentimentScore)}
                        <div>
                          <p className={`font-medium ${getSentimentColor(sentimentScore)}`}>
                            {sentimentScore > 0.3 ? 'Positive' : sentimentScore < -0.3 ? 'Concerned' : 'Neutral'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {sentimentScore > 0.3 ? 'Great to see you feeling positive!' : 
                             sentimentScore < -0.3 ? 'I\'m here to help and support you.' : 
                             'Let\'s work together on your goals.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation with your AI Career Coach
              </h3>
              <p className="text-gray-600 mb-6">
                Get personalized guidance on your career development journey
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => startNewSession('career_planning')} disabled={loading}>
                  <Target className="h-4 w-4 mr-2" />
                  Career Planning
                </Button>
                <Button onClick={() => startNewSession('skill_development')} disabled={loading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Skill Development
                </Button>
                <Button onClick={() => startNewSession('general')} disabled={loading}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  General Chat
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        {getSessionTypeIcon(session.session_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {session.session_type.replace('_', ' ')} Session
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.started_at).toLocaleDateString()} at{' '}
                          {new Date(session.started_at).toLocaleTimeString()}
                        </p>
                        {session.duration_minutes && (
                          <p className="text-sm text-gray-600">
                            Duration: {session.duration_minutes} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.session_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{session.session_rating}</span>
                        </div>
                      )}
                      <Badge className={getSessionTypeColor(session.session_type)}>
                        {session.ended_at ? 'Completed' : 'Active'}
                      </Badge>
                      {!session.ended_at && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentSession(session);
                            loadConversation(session.id);
                            setActiveTab('chat');
                          }}
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Session Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{analytics.totalSessions || sessions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Sessions</span>
                  <span className="font-semibold">
                    {analytics.completedSessions || sessions.filter(s => s.ended_at).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold">
                    {analytics.averageRating 
                      ? analytics.averageRating.toFixed(1)
                      : sessions.filter(s => s.session_rating).length > 0
                        ? (sessions.reduce((sum, s) => sum + (s.session_rating || 0), 0) / 
                           sessions.filter(s => s.session_rating).length).toFixed(1)
                        : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time</span>
                  <span className="font-semibold">
                    {analytics.totalDuration || sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Escalation Rate</span>
                  <span className="font-semibold">
                    {analytics.escalationRate ? `${analytics.escalationRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Session Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    analytics.sessionTypes || sessions.reduce((acc, s) => {
                      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSessionTypeIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">AI Coach Performance</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your AI coach is continuously learning from your interactions to provide better guidance.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Accuracy</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>User Satisfaction</span>
                      <span className="font-medium">
                        {analytics.averageRating ? `${(analytics.averageRating * 20).toFixed(0)}%` : '85%'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Escalation Success</span>
                      <span className="font-medium">98%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        {getSessionTypeIcon(session.session_type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {session.session_type.replace('_', ' ')} Session
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.started_at).toLocaleDateString()} at{' '}
                          {new Date(session.started_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.session_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{session.session_rating}</span>
                        </div>
                      )}
                      <Badge className={getSessionTypeColor(session.session_type)}>
                        {session.ended_at ? 'Completed' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualCareerCoach;
