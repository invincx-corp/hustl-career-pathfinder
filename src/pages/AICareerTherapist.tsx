import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Brain, 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Smile,
  Frown,
  Meh
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'negative';
  suggestions?: string[];
}

interface TherapySession {
  id: string;
  topic: string;
  duration: number;
  mood: 'positive' | 'neutral' | 'negative';
  insights: string[];
  copingStrategies: string[];
  progress: number;
}

const AICareerTherapist = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [therapyHistory, setTherapyHistory] = useState<TherapySession[]>([]);
  const [moodTracking, setMoodTracking] = useState<{date: string, mood: string, note: string}[]>([]);

  // Mock therapy history
  useEffect(() => {
    const mockHistory: TherapySession[] = [
      {
        id: '1',
        topic: 'Career Anxiety',
        duration: 30,
        mood: 'negative',
        insights: ['High stress about job search', 'Fear of rejection'],
        copingStrategies: ['Deep breathing exercises', 'Positive affirmations'],
        progress: 65
      },
      {
        id: '2',
        topic: 'Work-Life Balance',
        duration: 25,
        mood: 'neutral',
        insights: ['Difficulty setting boundaries', 'Burnout symptoms'],
        copingStrategies: ['Time blocking', 'Mindfulness meditation'],
        progress: 80
      }
    ];
    setTherapyHistory(mockHistory);

    const mockMoodTracking = [
      { date: '2024-01-15', mood: 'positive', note: 'Feeling confident about new opportunities' },
      { date: '2024-01-14', mood: 'neutral', note: 'Stable day, focused on learning' },
      { date: '2024-01-13', mood: 'negative', note: 'Stressed about interview preparation' }
    ];
    setMoodTracking(mockMoodTracking);

    // Initial AI greeting
    const greeting: Message = {
      id: '1',
      type: 'ai',
      content: `Hello ${user?.user_metadata?.full_name || 'there'}! 💙 I'm your AI Career Therapist. I'm here to provide emotional support, help you manage career-related stress, and guide you through challenging times. This is a safe space to share your feelings. How are you feeling today?`,
      timestamp: new Date(),
      suggestions: [
        "I'm feeling overwhelmed",
        "I'm anxious about my career",
        "I need help with work stress",
        "I'm feeling lost and confused"
      ]
    };
    setMessages([greeting]);
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      emotion: analyzeEmotion(inputMessage)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateTherapyResponse(inputMessage, userMessage.emotion),
        timestamp: new Date(),
        suggestions: generateTherapySuggestions(inputMessage, userMessage.emotion)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const analyzeEmotion = (text: string): 'positive' | 'neutral' | 'negative' => {
    const negativeWords = ['stressed', 'anxious', 'worried', 'scared', 'overwhelmed', 'frustrated', 'sad', 'depressed'];
    const positiveWords = ['happy', 'excited', 'confident', 'motivated', 'grateful', 'proud', 'optimistic'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  };

  const generateTherapyResponse = (userInput: string, emotion?: string): string => {
    const input = userInput.toLowerCase();
    
    if (emotion === 'negative' || input.includes('stressed') || input.includes('anxious')) {
      return "I can hear that you're going through a difficult time, and I want you to know that your feelings are completely valid. Career stress is one of the most common challenges people face. Let's work through this together. Can you tell me what specific situation is causing you the most stress right now?";
    }
    
    if (input.includes('overwhelmed') || input.includes('too much')) {
      return "Feeling overwhelmed is your mind's way of telling you that you need to slow down and prioritize. This is actually a protective response. Let's break down what's on your plate into smaller, manageable pieces. What feels like the most urgent thing you need to address?";
    }
    
    if (input.includes('failure') || input.includes('failed')) {
      return "I want to remind you that failure is not the opposite of success—it's a stepping stone to success. Every successful person has failed many times. What matters is what you learn from these experiences. Can you tell me about a time when you overcame a challenge?";
    }
    
    if (input.includes('confidence') || input.includes('doubt')) {
      return "Self-doubt is something we all experience, especially when stepping into new territory. It's actually a sign that you're growing and pushing your boundaries. Let's focus on your strengths and achievements. What are three things you're proud of accomplishing?";
    }
    
    if (input.includes('future') || input.includes('uncertain')) {
      return "Uncertainty about the future is one of the most common sources of anxiety. The truth is, no one knows exactly what the future holds, and that's okay. What we can do is focus on what we can control in the present moment. What's one small step you can take today toward your goals?";
    }
    
    return "Thank you for sharing that with me. I'm here to listen and support you. Can you help me understand more about how this is affecting you? The more you share, the better I can help you work through these feelings.";
  };

  const generateTherapySuggestions = (userInput: string, emotion?: string): string[] => {
    if (emotion === 'negative') {
      return [
        "Help me calm down",
        "I need coping strategies",
        "How do I build resilience?"
      ];
    }
    
    if (userInput.toLowerCase().includes('stress')) {
      return [
        "What are stress management techniques?",
        "How do I prevent burnout?",
        "Help me prioritize my tasks"
      ];
    }
    
    return [
      "Tell me more about this",
      "How can I feel better?",
      "What should I do next?"
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const startNewSession = () => {
    setCurrentSession({
      id: Date.now().toString(),
      topic: 'New Session',
      duration: 0,
      mood: 'neutral',
      insights: [],
      copingStrategies: [],
      progress: 0
    });
    setMessages([]);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Career Therapist
              </h1>
              <p className="text-gray-600">Your compassionate companion for career wellness</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={startNewSession} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Sparkles className="h-4 w-4 mr-2" />
              New Session
            </Button>
            <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <BookOpen className="h-4 w-4 mr-2" />
              Session History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  Therapy Session
                </CardTitle>
                <CardDescription>
                  Share your feelings in a safe, judgment-free space
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.emotion && (
                              <div className="flex items-center gap-1">
                                {getMoodIcon(message.emotion)}
                                <span className="text-xs opacity-70 capitalize">{message.emotion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {message.type === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-500 text-white">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Share your thoughts and feelings..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Suggestions */}
                  {messages.length > 0 && messages[messages.length - 1].suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Therapy Insights */}
          <div className="space-y-6">
            {/* Mood Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Mood Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodTracking.slice(0, 3).map((entry, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getMoodColor(entry.mood)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getMoodIcon(entry.mood)}
                          <span className="text-sm font-medium capitalize">{entry.mood}</span>
                        </div>
                        <span className="text-xs opacity-70">{entry.date}</span>
                      </div>
                      <p className="text-xs opacity-80">{entry.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Session */}
            {currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Current Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Topic</p>
                      <p className="text-sm text-gray-600">{currentSession.topic}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-gray-600">{currentSession.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Progress</p>
                      <Progress value={currentSession.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{currentSession.progress}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Therapy History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {therapyHistory.map((session) => (
                    <div key={session.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{session.topic}</h4>
                        <div className="flex items-center gap-2">
                          {getMoodIcon(session.mood)}
                          <Badge variant="outline" className="text-xs">
                            {session.duration}m
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Key Insights:</p>
                          <ul className="text-xs text-gray-500">
                            {session.insights.slice(0, 2).map((insight, index) => (
                              <li key={index}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Coping Strategies:</p>
                          <ul className="text-xs text-gray-500">
                            {session.copingStrategies.slice(0, 2).map((strategy, index) => (
                              <li key={index}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2">
                          <Progress value={session.progress} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{session.progress}% progress</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Wellness Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">Practice self-compassion daily</p>
                  </div>
                  <div className="flex gap-3">
                    <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm">Take breaks when feeling overwhelmed</p>
                  </div>
                  <div className="flex gap-3">
                    <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                    <p className="text-sm">Connect with supportive people</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICareerTherapist;
