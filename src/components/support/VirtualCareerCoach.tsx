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
  Brain
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  suggestions?: Suggestion[];
}

interface Suggestion {
  id: string;
  title: string;
  type: 'action' | 'resource' | 'nudge';
  description: string;
  action?: string;
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
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [nudges, setNudges] = useState<Nudge[]>(mockNudges);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: generateCoachResponse(inputMessage),
        timestamp: new Date(),
        suggestions: generateSuggestions(inputMessage)
      };
      setMessages(prev => [...prev, coachResponse]);
    }, 1000);
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="nudges">Nudges</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>Career Coach Chat</span>
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
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
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
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your career..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
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
    </div>
  );
};

export default VirtualCareerCoach;





