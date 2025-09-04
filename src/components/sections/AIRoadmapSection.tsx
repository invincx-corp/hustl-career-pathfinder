import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Map, 
  Target, 
  Clock, 
  BookOpen, 
  Award, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Circle
} from "lucide-react";
import { aiProvider } from "@/lib/ai-provider";
import roadmapImage from "@/assets/roadmap-visual.jpg";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "course" | "project" | "certification" | "experience";
  completed: boolean;
  skills: string[];
  resources: string[];
}

const sampleRoadmap: RoadmapStep[] = [
  {
    id: "1",
    title: "Programming Fundamentals",
    description: "Learn the basics of programming with Python",
    duration: "4 weeks",
    type: "course",
    completed: true,
    skills: ["Python", "Problem Solving", "Logic"],
    resources: ["Python for Beginners", "Coding Challenges", "Practice Projects"]
  },
  {
    id: "2",
    title: "Build Your First Web App",
    description: "Create a personal portfolio website",
    duration: "3 weeks",
    type: "project",
    completed: true,
    skills: ["HTML/CSS", "JavaScript", "Web Design"],
    resources: ["Web Development Bootcamp", "Design Principles", "GitHub Pages"]
  },
  {
    id: "3",
    title: "Data Structures & Algorithms",
    description: "Master fundamental computer science concepts",
    duration: "6 weeks",
    type: "course",
    completed: false,
    skills: ["Data Structures", "Algorithms", "Problem Solving"],
    resources: ["Algorithm Visualizer", "LeetCode Practice", "CS50 Course"]
  },
  {
    id: "4",
    title: "Full-Stack Project",
    description: "Build a complete web application with backend",
    duration: "8 weeks",
    type: "project",
    completed: false,
    skills: ["React", "Node.js", "Database Design", "API Development"],
    resources: ["Full-Stack Tutorial", "Database Course", "Deployment Guide"]
  },
  {
    id: "5",
    title: "Industry Certification",
    description: "Get certified in cloud development",
    duration: "2 weeks",
    type: "certification",
    completed: false,
    skills: ["Cloud Computing", "AWS", "DevOps"],
    resources: ["AWS Training", "Practice Exams", "Certification Guide"]
  },
  {
    id: "6",
    title: "Internship Application",
    description: "Apply for software development internships",
    duration: "4 weeks",
    type: "experience",
    completed: false,
    skills: ["Resume Building", "Interview Skills", "Portfolio Presentation"],
    resources: ["Resume Templates", "Interview Prep", "Company Research"]
  }
];

const AIRoadmapSection = () => {
  const [goal, setGoal] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerateRoadmap = async () => {
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Use AI provider to generate roadmap
      const userProfile = {
        age: "15-18",
        interests: ["Technology", "Problem Solving"],
        currentSkills: ["Basic Programming", "Mathematics"]
      };
      
      const roadmap = await aiProvider.generateRoadmap(goal, userProfile);
      console.log('Generated roadmap:', roadmap);
      
      // For now, we'll still show the sample roadmap
      // In a full implementation, you'd update the state with the AI-generated roadmap
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    }
    
    setIsGenerating(false);
    setShowRoadmap(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "project": return Target;
      case "certification": return Award;
      case "experience": return Map;
      default: return Circle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course": return "bg-blue-500";
      case "project": return "bg-green-500";
      case "certification": return "bg-purple-500";
      case "experience": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section id="roadmap" className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Roadmaps
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Personalized Learning Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your interests, current skills, and career goals to create 
            a step-by-step roadmap tailored just for you.
          </p>
        </div>

        {!showRoadmap ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
              {/* Roadmap Generator */}
              <div className="animate-slide-up space-y-6">
                <Card className="p-8 shadow-elevation">
                  <CardContent className="p-0 space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Generate Your Roadmap</h3>
                      <p className="text-muted-foreground">
                        Tell us your career goal and we'll create a personalized path to get there
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="goal" className="block text-sm font-medium mb-2">
                          What's your career goal?
                        </label>
                        <Input
                          id="goal"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="e.g., Become a Software Engineer, Start in Data Science, Learn Web Development..."
                          className="w-full"
                        />
                      </div>

                      <Button
                        onClick={handleGenerateRoadmap}
                        variant="hero"
                        size="lg"
                        className="w-full"
                        disabled={!goal.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating Your Roadmap...
                          </>
                        ) : (
                          <>
                            Generate My Roadmap
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold mb-3">What you'll get:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success mr-2" />
                          Step-by-step learning path
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success mr-2" />
                          Curated resources and courses
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success mr-2" />
                          Project-based milestones
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success mr-2" />
                          Timeline and progress tracking
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Element */}
              <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
                <img
                  src={roadmapImage}
                  alt="AI-generated roadmap visualization with milestones and progress tracking"
                  className="w-full h-auto rounded-2xl shadow-card"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Roadmap Header */}
            <div className="text-center mb-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-2">Your Roadmap to: {goal}</h3>
              <p className="text-muted-foreground mb-4">
                Here's your personalized journey with 6 key milestones
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success mr-1" />
                  <span>2 Completed</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-primary mr-1" />
                  <span>~27 weeks total</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-accent mr-1" />
                  <span>4 Milestones ahead</span>
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="space-y-6">
              {sampleRoadmap.map((step, index) => {
                const Icon = getTypeIcon(step.type);
                return (
                  <Card 
                    key={step.id} 
                    className={`animate-slide-up ${step.completed ? 'border-success/50 bg-success/5' : 'hover:shadow-card'} transition-all duration-300`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Step Indicator */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-10 h-10 ${getTypeColor(step.type)} rounded-full flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {index < sampleRoadmap.length - 1 && (
                            <div className={`w-0.5 h-16 mt-2 ${step.completed ? 'bg-success' : 'bg-border'}`}></div>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-semibold flex items-center">
                                {step.title}
                                {step.completed && (
                                  <CheckCircle className="h-5 w-5 text-success ml-2" />
                                )}
                              </h4>
                              <p className="text-muted-foreground">{step.description}</p>
                            </div>
                            <Badge variant={step.type === 'course' ? 'secondary' : step.type === 'project' ? 'default' : 'outline'}>
                              {step.duration}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium mb-1">Skills You'll Gain:</h5>
                              <div className="flex flex-wrap gap-2">
                                {step.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium mb-1">Resources:</h5>
                              <div className="flex flex-wrap gap-2">
                                {step.resources.map((resource) => (
                                  <Badge key={resource} variant="secondary" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2">
                              <Button 
                                variant={step.completed ? "outline" : "default"} 
                                size="sm"
                                disabled={step.completed}
                              >
                                {step.completed ? 'Completed ✓' : 'Start Learning'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-8 space-y-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="group"
                onClick={() => navigate('/signup')}
              >
                Start My Journey
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" onClick={() => setShowRoadmap(false)}>
                Generate New Roadmap
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRoadmapSection;