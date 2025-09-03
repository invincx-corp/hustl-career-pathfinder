import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User,
  Brain,
  Target,
  Calendar,
  BookOpen,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { aiProvider } from "@/lib/ai-provider";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionItems?: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  type: "course" | "project" | "skill" | "meeting";
  dueDate?: string;
  completed: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    content: "Hello! I'm your Virtual Career Coach. I've been analyzing your progress and I'm excited to help you reach your goals! 🚀",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    type: "bot",
    content: "I noticed you completed the Portfolio Project yesterday - congratulations! Based on your interest in web development, I have some personalized recommendations for your next steps.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    suggestions: [
      "Learn React Advanced Patterns",
      "Start Backend Development Course",
      "Apply for Frontend Internships",
      "Join the Web Dev Community Project"
    ]
  }
];

const mockActionItems: ActionItem[] = [
  {
    id: "1",
    title: "Complete JavaScript Fundamentals Quiz",
    type: "course",
    dueDate: "Today",
    completed: false
  },
  {
    id: "2",
    title: "Submit Portfolio Project",
    type: "project",
    dueDate: "Tomorrow",
    completed: true
  },
  {
    id: "3",
    title: "Practice React Hooks",
    type: "skill",
    dueDate: "This Week",
    completed: false
  },
  {
    id: "4",
    title: "Mentor Session with Sarah",
    type: "meeting",
    dueDate: "Friday 3 PM",
    completed: false
  }
];

const suggestedQuestions = [
  "What should I learn next?",
  "How can I improve my portfolio?",
  "What internships match my skills?",
  "Help me set weekly goals",
  "Review my progress this month"
];

const VirtualCareerCoach = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Enhanced context with real-time data
      const context = {
        userHistory: messages.slice(-10), // Last 10 messages for better context
        userProfile: {
          age: "15-18",
          interests: ["Technology", "Learning", "Web Development"],
          goals: ["Career Development", "Skill Building", "Full-Stack Development"]
        },
        currentSkills: ["HTML", "CSS", "JavaScript", "React"], // Simulated current skills
        learningProgress: {
          completedCourses: 3,
          projectsBuilt: 2,
          skillsMastered: 4,
          learningStreak: 5
        }
      };
      
      // Use enhanced AI provider for intelligent responses
      const enhancedResponse = await aiProvider.generateCoachResponse(content, context);
      
      // Extract components from enhanced response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: enhancedResponse.content || enhancedResponse,
        timestamp: new Date(),
        suggestions: enhancedResponse.suggestions || generateDefaultSuggestions(content),
        actionItems: enhancedResponse.actionItems || []
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Update action items if new ones are provided
      if (enhancedResponse.actionItems && enhancedResponse.actionItems.length > 0) {
        setActionItems(prev => [...prev, ...enhancedResponse.actionItems]);
      }
      
      // Log the enhanced response for debugging
      console.log('Enhanced AI Response:', enhancedResponse);
      
    } catch (error) {
      console.error('Failed to generate enhanced AI response:', error);
      
      // Fallback to enhanced simulated response
      const fallbackContext = {
        userHistory: messages.slice(-5),
        userProfile: {
          age: "15-18",
          interests: ["Technology", "Learning"],
          goals: ["Career Development", "Skill Building"]
        },
        currentSkills: ["HTML", "CSS", "JavaScript"],
        learningProgress: { completedCourses: 2, projectsBuilt: 1, skillsMastered: 3, learningStreak: 3 }
      };
      
      const fallbackResponse = await aiProvider.generateCoachResponse(content, fallbackContext);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: fallbackResponse.content || fallbackResponse,
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions || generateDefaultSuggestions(content),
        actionItems: fallbackResponse.actionItems || []
      };
      
      setMessages(prev => [...prev, botResponse]);
    }
    
    setIsTyping(false);
  };

  // Generate default suggestions based on user input
  const generateDefaultSuggestions = (content: string): string[] => {
    const input = content.toLowerCase();
    
    if (input.includes('next') || input.includes('learn')) {
      return [
        "Advanced React Patterns Course",
        "Node.js Backend Development", 
        "System Design Fundamentals",
        "Database Design Principles"
      ];
    }
    
    if (input.includes('portfolio') || input.includes('project')) {
      return [
        "Build a Full-Stack E-commerce App",
        "Create a Portfolio Website",
        "Develop a Mobile App",
        "Contribute to Open Source"
      ];
    }
    
    if (input.includes('career') || input.includes('job')) {
      return [
        "Update Your Resume",
        "Practice Technical Interviews",
        "Network on LinkedIn",
        "Apply for Internships"
      ];
    }
    
    return [
      "Explore New Technologies",
      "Build Personal Projects",
      "Join Coding Communities",
      "Set Learning Goals"
    ];
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("next") || input.includes("learn")) {
      return "Based on your current progress and interests, I recommend focusing on backend development next. You've mastered frontend fundamentals, so Node.js and Express would be perfect next steps. This will make you a full-stack developer! 💪";
    }
    
    if (input.includes("portfolio")) {
      return "Your portfolio looks great! To make it even better, consider adding: 1) A detailed case study for your main project, 2) Performance metrics and optimizations you've made, 3) A blog section to showcase your learning journey. Would you like help with any of these?";
    }
    
    if (input.includes("internship") || input.includes("job")) {
      return "Great question! Based on your skills in React and JavaScript, you're ready for junior frontend roles. I've found 5 companies in your area actively hiring. Would you like me to help you prepare application materials and practice interview questions?";
    }
    
    if (input.includes("goal")) {
      return "Let's set some SMART goals! Based on your learning pace, I suggest: 1) Complete the Backend Basics course by next Friday, 2) Build a full-stack project by month-end, 3) Apply to 3 internships next week. Sound good?";
    }
    
    return "That's a great question! I'm here to help you navigate your career journey. Whether it's choosing the right courses, improving your skills, or finding opportunities, I've got your back. What specific area would you like to focus on?";
  };

  const toggleActionItem = (id: string) => {
    setActionItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "project": return Target;
      case "skill": return Brain;
      case "meeting": return Calendar;
      default: return Target;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "course": return "text-blue-500";
      case "project": return "text-green-500";
      case "skill": return "text-purple-500";
      case "meeting": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            Virtual Career Coach
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Personal AI Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized career guidance, skill recommendations, and gentle nudges 
            to keep you on track. Available 24/7 to support your journey.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2 animate-slide-up">
            <Card className="h-[600px] flex flex-col shadow-elevation">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-primary text-primary-foreground rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Career Coach AI</h3>
                    <p className="text-sm opacity-90">Always here to help • Powered by AI</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : ""}`}>
                      <div className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}>
                          {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        
                        <div className={`rounded-lg p-3 ${
                          message.type === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs opacity-75">Suggested next steps:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="block w-full text-left justify-start text-xs h-auto py-1"
                                  onClick={() => handleSendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-xs text-muted-foreground mt-1 ${message.type === "user" ? "text-right" : ""}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask me anything about your career journey..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(newMessage)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSendMessage(newMessage)}
                    disabled={!newMessage.trim()}
                    variant="hero"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSendMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-slide-up" style={{animationDelay: "0.2s"}}>
            {/* Action Items */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Your Action Items
              </h3>
              
              <div className="space-y-3">
                {actionItems.map((item) => {
                  const Icon = getActionIcon(item.type);
                  return (
                    <div key={item.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleActionItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className={`h-4 w-4 ${getActionColor(item.type)}`} />
                          <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </p>
                        </div>
                        {item.dueDate && (
                          <p className="text-xs text-muted-foreground">{item.dueDate}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Lightbulb className="h-4 w-4 mr-2" />
                Get More Suggestions
              </Button>
            </Card>

            {/* Weekly Insights */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" />
                This Week's Insights
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">Great Progress!</p>
                  <p className="text-xs text-muted-foreground">You completed 3 projects this week</p>
                </div>
                
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Skill Recommendation</p>
                  <p className="text-xs text-muted-foreground">TypeScript would complement your JavaScript skills</p>
                </div>
                
                <div className="p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-accent">Opportunity Alert</p>
                  <p className="text-xs text-muted-foreground">2 new internships match your profile</p>
                </div>
              </div>
            </Card>

            {/* Coach Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Coach Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversations</span>
                  <Badge variant="secondary">47</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goals Achieved</span>
                  <Badge variant="default">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recommendations</span>
                  <Badge variant="outline">23</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualCareerCoach;