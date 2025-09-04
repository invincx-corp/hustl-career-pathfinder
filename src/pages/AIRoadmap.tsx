import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  BookOpen, 
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Plus,
  Play,
  Calendar
} from 'lucide-react';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'project' | 'assessment' | 'practice';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  isCurrent: boolean;
  resources: string[];
  prerequisites: string[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalSteps: number;
  completedSteps: number;
  progress: number;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: RoadmapStep[];
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
}

const AIRoadmap = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadUserRoadmaps();
  }, [user]);

  const loadUserRoadmaps = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call to get user's roadmaps
      // For now, we'll generate roadmaps based on user's interests and skills
      const userInterests = user?.interests || [];
      const userSkills = user?.skills || [];
      const skillAssessmentResults = user?.skill_assessment_results || {};
      
      // Generate personalized roadmaps based on user data
      const generatedRoadmaps: Roadmap[] = [
        {
          id: 'web-dev-fundamentals',
          title: 'Web Development Fundamentals',
          description: 'Master the basics of web development with HTML, CSS, and JavaScript',
          category: 'Programming',
          totalSteps: 12,
          completedSteps: 8,
          progress: 67,
          estimatedDuration: '8 weeks',
          difficulty: 'beginner',
          isActive: true,
          createdAt: '2024-01-15',
          lastUpdated: '2024-01-20',
          steps: [
            {
              id: 'html-basics',
              title: 'HTML Fundamentals',
              description: 'Learn the structure and semantics of HTML',
              type: 'learning',
              duration: '1 week',
              difficulty: 'beginner',
              isCompleted: true,
              isCurrent: false,
              resources: ['MDN HTML Guide', 'HTML Tutorial'],
              prerequisites: []
            },
            {
              id: 'css-basics',
              title: 'CSS Styling',
              description: 'Master CSS for beautiful web designs',
              type: 'learning',
              duration: '2 weeks',
              difficulty: 'beginner',
              isCompleted: true,
              isCurrent: false,
              resources: ['CSS Guide', 'Flexbox Tutorial'],
              prerequisites: ['html-basics']
            },
            {
              id: 'javascript-basics',
              title: 'JavaScript Fundamentals',
              description: 'Learn programming with JavaScript',
              type: 'learning',
              duration: '3 weeks',
              difficulty: 'intermediate',
              isCompleted: false,
              isCurrent: true,
              resources: ['JavaScript.info', 'MDN JS Guide'],
              prerequisites: ['html-basics', 'css-basics']
            }
          ]
        },
        {
          id: 'react-development',
          title: 'React Development',
          description: 'Build modern web applications with React',
          category: 'Programming',
          totalSteps: 15,
          completedSteps: 3,
          progress: 20,
          estimatedDuration: '10 weeks',
          difficulty: 'intermediate',
          isActive: true,
          createdAt: '2024-01-10',
          lastUpdated: '2024-01-18',
          steps: [
            {
              id: 'react-intro',
              title: 'React Introduction',
              description: 'Understand React concepts and JSX',
              type: 'learning',
              duration: '1 week',
              difficulty: 'intermediate',
              isCompleted: true,
              isCurrent: false,
              resources: ['React Docs', 'React Tutorial'],
              prerequisites: ['javascript-basics']
            },
            {
              id: 'components-props',
              title: 'Components and Props',
              description: 'Learn to create and use React components',
              type: 'learning',
              duration: '1 week',
              difficulty: 'intermediate',
              isCompleted: true,
              isCurrent: false,
              resources: ['React Components Guide'],
              prerequisites: ['react-intro']
            },
            {
              id: 'state-management',
              title: 'State Management',
              description: 'Master React state and hooks',
              type: 'learning',
              duration: '2 weeks',
              difficulty: 'intermediate',
              isCompleted: false,
              isCurrent: true,
              resources: ['React Hooks Guide', 'State Management Tutorial'],
              prerequisites: ['components-props']
            }
          ]
        }
      ];
      
      setRoadmaps(generatedRoadmaps);
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewRoadmap = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement real AI roadmap generation
      console.log('Generating new AI roadmap...');
      // This would call an AI service to generate a personalized roadmap
      // based on user's interests, skills, and goals
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'learning': return BookOpen;
      case 'project': return Target;
      case 'assessment': return CheckCircle;
      case 'practice': return Play;
      default: return BookOpen;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'practice': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Roadmaps...</h2>
            <p className="text-gray-600 text-center">
              Preparing your personalized learning paths.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          AI Roadmaps
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Personalized learning paths powered by AI. Your roadmaps adapt to your progress, 
          interests, and learning style for maximum effectiveness.
        </p>
      </div>

      {/* Generate New Roadmap */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Generate New Roadmap</h3>
                <p className="text-gray-600">Create a personalized learning path based on your goals and interests</p>
              </div>
            </div>
            <Button 
              onClick={generateNewRoadmap}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roadmaps Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {roadmaps.map((roadmap) => (
          <Card 
            key={roadmap.id} 
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
              selectedRoadmap?.id === roadmap.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRoadmap(roadmap)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                  <CardDescription>{roadmap.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getDifficultyColor(roadmap.difficulty)}>
                    {roadmap.difficulty}
                  </Badge>
                  <Badge variant="outline" className={roadmap.isActive ? 'text-green-600' : 'text-gray-600'}>
                    {roadmap.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{roadmap.completedSteps}/{roadmap.totalSteps} steps</span>
                </div>
                <Progress value={roadmap.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{roadmap.estimatedDuration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(roadmap.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant={selectedRoadmap?.id === roadmap.id ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoadmap(roadmap);
                }}
              >
                View Roadmap
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Roadmap Details */}
      {selectedRoadmap && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <span>{selectedRoadmap.title} - Learning Path</span>
            </CardTitle>
            <CardDescription>
              {selectedRoadmap.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedRoadmap.totalSteps}</div>
                <div className="text-sm text-gray-600">Total Steps</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedRoadmap.completedSteps}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{selectedRoadmap.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Learning Steps</h4>
              {selectedRoadmap.steps.map((step, index) => {
                const StepIcon = getStepTypeIcon(step.type);
                return (
                  <div 
                    key={step.id} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      step.isCurrent 
                        ? 'border-blue-500 bg-blue-50' 
                        : step.isCompleted 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : step.isCurrent 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{step.title}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStepTypeColor(step.type)}>
                              <StepIcon className="h-3 w-3 mr-1" />
                              {step.type}
                            </Badge>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Difficulty: {step.difficulty}</span>
                          {step.resources.length > 0 && (
                            <span>Resources: {step.resources.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4">
              <Button className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
              <Button variant="outline" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIRoadmap;


