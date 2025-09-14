import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  Target,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Heart,
  Zap,
  Brain,
  Loader2
} from 'lucide-react';
import { aiProvider } from '@/lib/ai-provider';
import { contextManager } from '@/lib/context-manager';
import { sentimentAnalyzer } from '@/lib/sentiment-analyzer';
import { escalationManager } from '@/lib/escalation-manager';
import { conversationStorage } from '@/lib/conversation-storage';
import { personalizationEngine } from '@/lib/personalization-engine';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date | string;
  suggestions?: Suggestion[];
  actionItems?: ActionItem[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics?: string[];
}

interface Suggestion {
  id: string;
  title: string;
  type: 'action' | 'resource' | 'nudge';
  description: string;
  action?: string;
}

interface ActionItem {
  id: string;
  title: string;
  type: 'learning' | 'assessment' | 'action';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

interface Nudge {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'encouragement' | 'challenge';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'coach',
    content: "Hello! I'm your AI Career Coach. I'm here to help guide you through your career journey. What would you like to explore today?",
    timestamp: new Date(),
    suggestions: [
      {
        id: 's1',
        title: 'Review my roadmap',
        type: 'action',
        description: 'Check your current learning path and next steps',
        action: 'view_roadmap'
      },
      {
        id: 's2',
        title: 'Find a mentor',
        type: 'action',
        description: 'Connect with industry professionals',
        action: 'find_mentor'
      },
      {
        id: 's3',
        title: 'Skill assessment',
        type: 'action',
        description: 'Evaluate your current skills and gaps',
        action: 'skill_assessment'
      }
    ]
  }
];

const mockNudges: Nudge[] = [
  {
    id: 'n1',
    title: 'Continue your React learning',
    message: "You're doing great with React! Ready to tackle the next challenge?",
    type: 'encouragement',
    priority: 'medium',
    timestamp: new Date()
  },
  {
    id: 'n2',
    title: 'Mentor session reminder',
    message: 'Your mentor session with Sarah is tomorrow at 2 PM. Prepare your questions!',
    type: 'reminder',
    priority: 'high',
    timestamp: new Date()
  },
  {
    id: 'n3',
    title: 'New project opportunity',
    message: 'A new project matching your skills is available. Interested?',
    type: 'challenge',
    priority: 'medium',
    timestamp: new Date()
  }
];

const VirtualCareerCoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [nudges, setNudges] = useState<Nudge[]>(mockNudges);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(aiProvider.getStatus());
  const [escalationRequest, setEscalationRequest] = useState<any>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [conversationSessions, setConversationSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([]);
  const [careerInsights, setCareerInsights] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation session on component mount
  useEffect(() => {
    if (user) {
      const session = conversationStorage.createSession(user.id, 'Career Coaching Session');
      console.log('Created conversation session:', session.id);
      loadConversationSessions();
      loadPersonalizedRecommendations();
    }
  }, [user]);

  // Load conversation sessions
  const loadConversationSessions = () => {
    if (user) {
      const sessions = conversationStorage.getUserSessions(user.id);
      setConversationSessions(sessions);
    }
  };

  // Load personalized recommendations
  const loadPersonalizedRecommendations = () => {
    if (user) {
      // Update personalization engine with user data
      personalizationEngine.updateUserProfile({
        id: user.id,
        age: (user as any).user_metadata?.age || '15-18',
        interests: (user as any).user_metadata?.interests || ['Technology', 'Learning'],
        goals: (user as any).user_metadata?.goals || ['Career Development', 'Skill Building'],
        experienceLevel: (user as any).user_metadata?.experience_level || 'beginner',
        skills: (user as any).user_metadata?.skills || ['HTML', 'CSS', 'JavaScript']
      });

      // Update with conversation history
      const recentMessages = conversationStorage.getRecentMessages(user.id, 50);
      personalizationEngine.updateConversationHistory(recentMessages);

      // Generate recommendations and insights
      const recommendations = personalizationEngine.generatePersonalizedRecommendations();
      const insights = personalizationEngine.generateCareerInsights();

      setPersonalizedRecommendations(recommendations);
      setCareerInsights(insights);
    }
  };

  // Load session messages
  const loadSessionMessages = (sessionId: string) => {
    const sessionMessages = conversationStorage.getSessionMessages(sessionId);
    const formattedMessages = sessionMessages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      sentiment: msg.sentiment,
      topics: msg.topics
    }));
    setMessages(formattedMessages);
    setSelectedSession(sessionId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Perform comprehensive sentiment analysis
    const sentimentAnalysis = sentimentAnalyzer.analyzeSentiment(inputMessage);
    const emotionalState = sentimentAnalyzer.detectEmotionalState(inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      sentiment: sentimentAnalysis.sentiment,
      topics: extractTopics(inputMessage)
    };

    setMessages(prev => [...prev, userMessage]);
    
      // Save user message to conversation storage
      conversationStorage.addMessage({
        type: 'user',
        content: inputMessage,
        sentiment: sentimentAnalysis.sentiment,
        topics: extractTopics(inputMessage),
        metadata: {
          emotionalState: emotionalState as any,
          sentimentAnalysis: sentimentAnalysis as any
        }
      });
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Update context with user message
      contextManager.addMessage({
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        timestamp: typeof userMessage.timestamp === 'string' ? userMessage.timestamp : userMessage.timestamp.toISOString(),
        sentiment: userMessage.sentiment,
        topics: userMessage.topics
      });
      
      // Update user profile if available
      if (user) {
        contextManager.updateUserProfile({
          id: user.id,
          age: (user as any).user_metadata?.age || '15-18',
          interests: (user as any).user_metadata?.interests || ['Technology', 'Learning'],
          goals: (user as any).user_metadata?.goals || ['Career Development', 'Skill Building'],
          experienceLevel: (user as any).user_metadata?.experience_level || 'beginner',
          skills: (user as any).user_metadata?.skills || ['HTML', 'CSS', 'JavaScript']
        });
      }

      // Get enhanced context for AI
      const context = contextManager.getContextForAI();
      
      // Add emotional context to AI request
      const enhancedContext = {
        ...context,
        emotionalState,
        sentimentAnalysis,
        supportNeeded: emotionalState.supportNeeded,
        empatheticResponse: sentimentAnalyzer.generateEmpatheticResponse(
          sentimentAnalysis.sentiment,
          (emotionalState as any).emotions || [],
          sentimentAnalysis.supportLevel
        )
      };

      // Get AI response with full context including emotional support
      const aiResponse = await aiProvider.generateCoachResponse(currentInput, enhancedContext);
      
      // Check if escalation is needed
      const escalationCheck = escalationManager.shouldEscalate(
        currentInput,
        enhancedContext,
        aiResponse,
        emotionalState
      );
      
      let coachResponse: Message;
      
      if (escalationCheck.shouldEscalate) {
        // Create escalation request
        const escalation = escalationManager.createEscalationRequest(
          user?.id || 'anonymous',
          escalationCheck.reason!,
          enhancedContext
        );
        
        setEscalationRequest(escalation);
        setShowEscalationModal(true);
        
        // Generate escalation response
        coachResponse = {
          id: (Date.now() + 1).toString(),
          type: 'coach',
          content: `I understand this is a complex situation that would benefit from human guidance. I've connected you with a mentor who specializes in ${escalationCheck.reason!.description.toLowerCase()}. They'll be in touch shortly to help you with this.`,
          timestamp: new Date(),
          suggestions: [
            { id: '1', title: 'Wait for mentor response', type: 'action', description: 'Wait for mentor to respond' },
            { id: '2', title: 'Prepare specific questions', type: 'action', description: 'Prepare your questions' },
            { id: '3', title: 'Review your situation', type: 'action', description: 'Review your situation' }
          ],
          actionItems: []
        };
      } else {
        // Generate emotional support suggestions
        const emotionalSuggestions = sentimentAnalyzer.generateSupportSuggestions(emotionalState);
        const allSuggestions = [
          ...(aiResponse.suggestions || generateSuggestions(currentInput)),
          ...emotionalSuggestions
        ];

        coachResponse = {
          id: (Date.now() + 1).toString(),
          type: 'coach',
          content: aiResponse.content || aiResponse,
          timestamp: new Date(),
          suggestions: allSuggestions.slice(0, 6), // Limit to 6 suggestions
          actionItems: aiResponse.actionItems || []
        };
      }
      
      setMessages(prev => [...prev, coachResponse]);
      
      // Save coach response to conversation storage
      conversationStorage.addMessage({
        type: 'coach',
        content: coachResponse.content,
        metadata: {
          aiProvider: aiStatus.provider,
          responseTime: Date.now() - (typeof userMessage.timestamp === 'string' ? new Date(userMessage.timestamp).getTime() : userMessage.timestamp.getTime()),
          escalationTriggered: escalationCheck.shouldEscalate,
          contextUsed: enhancedContext
        }
      });
      
      // Update context with coach response
      contextManager.addMessage({
        id: coachResponse.id,
        type: 'coach',
        content: coachResponse.content,
        timestamp: typeof coachResponse.timestamp === 'string' ? coachResponse.timestamp : coachResponse.timestamp.toISOString()
      });
      
      // Update nudges if AI provided action items
      if (aiResponse.actionItems && aiResponse.actionItems.length > 0) {
        const newNudges = aiResponse.actionItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: `Action item: ${item.title}`,
          type: 'challenge' as const,
          priority: item.priority || 'medium' as const,
          timestamp: new Date()
        }));
        setNudges(prev => [...prev, ...newNudges]);
      }
      
    } catch (error) {
      console.error('AI response error:', error);
      
      // Fallback to simulated response
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: generateCoachResponse(currentInput),
        timestamp: new Date(),
        suggestions: generateSuggestions(currentInput)
      };
      setMessages(prev => [...prev, coachResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze sentiment of user message
  const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const analysis = sentimentAnalyzer.analyzeSentiment(text);
    return analysis.sentiment;
  };

  // Extract topics from user message
  const extractTopics = (text: string): string[] => {
    const topics: string[] = [];
    const textLower = text.toLowerCase();
    
    const topicKeywords = {
      'programming': ['code', 'programming', 'coding', 'developer', 'software'],
      'web development': ['web', 'website', 'frontend', 'backend', 'html', 'css', 'javascript'],
      'mobile development': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
      'data science': ['data', 'analysis', 'machine learning', 'ai', 'python', 'statistics'],
      'career': ['career', 'job', 'internship', 'resume', 'interview', 'hiring'],
      'learning': ['learn', 'study', 'course', 'tutorial', 'education', 'skill'],
      'projects': ['project', 'build', 'create', 'portfolio', 'github']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  };

  const generateCoachResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('roadmap') || input.includes('path')) {
      return "Great question! Based on your current progress, I recommend focusing on React fundamentals first, then moving to state management. Would you like me to create a personalized roadmap for you?";
    }
    
    if (input.includes('mentor') || input.includes('help')) {
      return "I can help you find the perfect mentor! Based on your interests in frontend development, I've identified several experienced professionals who could guide you. Would you like to see their profiles?";
    }
    
    if (input.includes('skill') || input.includes('learn')) {
      return "Your learning journey is impressive! I notice you're strong in JavaScript but could benefit from more React practice. I've found some excellent resources that match your learning style. Shall I add them to your roadmap?";
    }
    
    if (input.includes('project') || input.includes('build')) {
      return "Building projects is the best way to learn! I can suggest some projects that align with your current skills and help you grow. What type of project interests you most?";
    }
    
    return "That's an interesting question! I'm here to help you navigate your career journey. Could you tell me more about what specific area you'd like to explore?";
  };

  const generateSuggestions = (userInput: string): Suggestion[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('roadmap') || input.includes('path')) {
      return [
        {
          id: 's1',
          title: 'Create new roadmap',
          type: 'action',
          description: 'Generate a personalized learning path',
          action: 'create_roadmap'
        },
        {
          id: 's2',
          title: 'View current roadmap',
          type: 'action',
          description: 'Check your existing learning plan',
          action: 'view_roadmap'
        }
      ];
    }
    
    if (input.includes('mentor') || input.includes('help')) {
      return [
        {
          id: 's3',
          title: 'Find mentors',
          type: 'action',
          description: 'Browse available mentors in your field',
          action: 'find_mentors'
        },
        {
          id: 's4',
          title: 'Schedule session',
          type: 'action',
          description: 'Book a mentoring session',
          action: 'schedule_session'
        }
      ];
    }
    
    return [
      {
        id: 's5',
        title: 'Explore resources',
        type: 'resource',
        description: 'Find learning materials',
        action: 'explore_resources'
      },
      {
        id: 's6',
        title: 'Skill assessment',
        type: 'action',
        description: 'Evaluate your current skills',
        action: 'skill_assessment'
      }
    ];
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion.title,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Calendar className="h-4 w-4" />;
      case 'encouragement': return <Heart className="h-4 w-4" />;
      case 'challenge': return <Zap className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getNudgeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'encouragement': return 'bg-green-100 text-green-800 border-green-200';
      case 'challenge': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Virtual Career Coach
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your AI-powered career companion, here to guide, encourage, and help you navigate your professional journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="nudges">Nudges</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>Career Coach Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={aiStatus.configured ? "default" : "secondary"} className="flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {aiStatus.configured ? 'AI Powered' : 'Simulated'}
                  </Badge>
                  {aiStatus.configured && (
                    <Badge variant="outline" className="text-xs">
                      {aiStatus.provider}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          <p className="text-xs">
                            {typeof message.timestamp === 'string' ? new Date(message.timestamp).toLocaleTimeString() : message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.type === 'user' && message.sentiment && (
                            <div className={`w-2 h-2 rounded-full ${
                              message.sentiment === 'positive' ? 'bg-green-400' :
                              message.sentiment === 'negative' ? 'bg-red-400' :
                              'bg-yellow-400'
                            }`} title={`${message.sentiment} sentiment`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.map((message) => (
                  message.suggestions && (
                    <div key={`suggestions-${message.id}`} className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
                          <div className="space-y-2">
                            {message.suggestions.map((suggestion) => (
                              <Button
                                key={suggestion.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Lightbulb className="h-3 w-3 mr-2" />
                                {suggestion.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your career..."
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                  <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Conversation History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversation history yet</p>
                    <p className="text-sm">Start chatting to see your conversation history here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversationSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedSession === session.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => loadSessionMessages(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{session.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(session.lastMessageAt).toLocaleDateString()} • {session.messageCount} messages
                            </p>
                            {session.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.tags.slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {session.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{session.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">
                              {new Date(session.lastMessageAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nudges" className="space-y-6">
          <div className="grid gap-6">
            {nudges.map((nudge) => (
              <Card key={nudge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${getNudgeColor(nudge.type)}`}>
                          {getNudgeIcon(nudge.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{nudge.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={getNudgeColor(nudge.type)}>
                              {nudge.type}
                            </Badge>
                            <Badge className={getPriorityColor(nudge.priority)}>
                              {nudge.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{nudge.message}</p>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Take Action
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Remind Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Personalized Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Personalized Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedRecommendations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Loading personalized recommendations...</p>
                  </div>
                ) : (
                  personalizedRecommendations.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{rec.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={rec.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.difficulty}</Badge>
                            <span className="text-xs text-gray-500">{rec.estimatedTime}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {rec.relevanceScore}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Career Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerInsights.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Loading career insights...</p>
                  </div>
                ) : (
                  careerInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'opportunity' ? 'border-green-500 bg-green-50' :
                      insight.type === 'warning' ? 'border-red-500 bg-red-50' :
                      insight.type === 'achievement' ? 'border-blue-500 bg-blue-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={
                              insight.impact === 'high' ? 'destructive' :
                              insight.impact === 'medium' ? 'default' : 'secondary'
                            }>
                              {insight.impact} impact
                            </Badge>
                            <span className="text-xs text-gray-500">{insight.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>This week</span>
                    <span className="font-medium">3 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    You're on track to meet your weekly learning goal!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Skill Development</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>React Skills</span>
                    <span className="font-medium">+15% this month</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Great progress! Consider tackling more advanced concepts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Mentor Engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Active sessions</span>
                    <span className="font-medium">2 this month</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Regular mentor sessions are helping you grow faster.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Goal Achievement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Q1 Goals</span>
                    <span className="font-medium">2 of 3 completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    You're ahead of schedule! Keep up the great work.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Escalation Modal */}
      {showEscalationModal && escalationRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Mentor Connection</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                I've identified that your question would benefit from human expertise. 
                A mentor has been assigned to help you with this specific issue.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Escalation Details:</h4>
                <p className="text-sm text-blue-800">
                  <strong>Reason:</strong> {escalationRequest.reason.description}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Priority:</strong> {escalationRequest.priority}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> {escalationRequest.status}
                </p>
              </div>
              
              {escalationRequest.assignedMentor && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Assigned Mentor:</h4>
                  <p className="text-sm text-green-800">
                    A mentor will respond within the next few hours. 
                    You'll receive a notification when they're ready to help.
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowEscalationModal(false)}
                  className="flex-1"
                >
                  Continue Chatting
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // TODO: Navigate to mentor dashboard
                    setShowEscalationModal(false);
                  }}
                >
                  View Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCareerCoach;



