import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target,
  Zap, 
  Heart,
  Users,
  BookOpen, 
  Briefcase,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface IdentityNode {
  id: string;
  label: string;
  category: 'skill' | 'interest' | 'value' | 'goal' | 'experience';
  strength: number;
  connections: string[];
  color: string;
  lastUpdated: string;
}

interface BehaviorPattern {
  id: string;
  name: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface LearningJourney {
  id: string;
  skill: string;
  progress: number;
  milestones: {
    date: string;
    achievement: string;
    level: number;
  }[];
  currentLevel: number;
  nextMilestone: string;
}

const SelfGraph = () => {
  const { user } = useAuth();
  const [identityNodes, setIdentityNodes] = useState<IdentityNode[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [learningJourney, setLearningJourney] = useState<LearningJourney[]>([]);
  const [selectedNode, setSelectedNode] = useState<IdentityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock identity nodes
    const mockNodes: IdentityNode[] = [
      {
        id: '1',
        label: 'Problem Solving',
        category: 'skill',
        strength: 85,
        connections: ['2', '3', '4'],
        color: 'from-blue-500 to-cyan-600',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        label: 'Critical Thinking',
        category: 'skill',
        strength: 78,
        connections: ['1', '5'],
        color: 'from-purple-500 to-pink-600',
        lastUpdated: '2024-01-14'
      },
      {
        id: '3',
        label: 'Technology',
        category: 'interest',
        strength: 92,
        connections: ['1', '6', '7'],
        color: 'from-green-500 to-teal-600',
        lastUpdated: '2024-01-16'
      },
      {
        id: '4',
        label: 'Innovation',
        category: 'value',
        strength: 88,
        connections: ['1', '8'],
        color: 'from-yellow-500 to-orange-600',
        lastUpdated: '2024-01-13'
      },
      {
        id: '5',
        label: 'Communication',
        category: 'skill',
        strength: 72,
        connections: ['2', '9'],
        color: 'from-red-500 to-pink-600',
        lastUpdated: '2024-01-12'
      },
      {
        id: '6',
        label: 'AI/ML',
        category: 'interest',
        strength: 95,
        connections: ['3', '10'],
        color: 'from-indigo-500 to-purple-600',
        lastUpdated: '2024-01-16'
      },
      {
        id: '7',
        label: 'Web Development',
        category: 'interest',
        strength: 80,
        connections: ['3', '11'],
        color: 'from-cyan-500 to-blue-600',
        lastUpdated: '2024-01-15'
      },
      {
        id: '8',
        label: 'Creativity',
        category: 'value',
        strength: 75,
        connections: ['4', '12'],
        color: 'from-pink-500 to-rose-600',
        lastUpdated: '2024-01-14'
      },
      {
        id: '9',
        label: 'Teamwork',
        category: 'skill',
        strength: 68,
        connections: ['5', '13'],
        color: 'from-emerald-500 to-green-600',
        lastUpdated: '2024-01-11'
      },
      {
        id: '10',
        label: 'Data Science Career',
        category: 'goal',
        strength: 90,
        connections: ['6', '14'],
        color: 'from-violet-500 to-purple-600',
        lastUpdated: '2024-01-16'
      }
    ];

    // Mock behavior patterns
    const mockPatterns: BehaviorPattern[] = [
      {
        id: '1',
        name: 'Learning New Technologies',
        frequency: 85,
        trend: 'increasing',
        impact: 'positive',
        description: 'Consistently engaging with new tech content and tutorials'
      },
      {
        id: '2',
        name: 'Problem-Solving Approach',
        frequency: 78,
        trend: 'stable',
        impact: 'positive',
        description: 'Systematic approach to breaking down complex problems'
      },
      {
        id: '3',
        name: 'Collaborative Work',
        frequency: 65,
        trend: 'increasing',
        impact: 'positive',
        description: 'Active participation in team projects and discussions'
      },
      {
        id: '4',
        name: 'Procrastination',
        frequency: 30,
        trend: 'decreasing',
        impact: 'negative',
        description: 'Delaying tasks, but showing improvement over time'
      }
    ];

    // Mock learning journey
    const mockJourney: LearningJourney[] = [
      {
        id: '1',
        skill: 'Python Programming',
        progress: 75,
        milestones: [
          { date: '2024-01-01', achievement: 'Basic Syntax', level: 1 },
          { date: '2024-01-08', achievement: 'Data Structures', level: 2 },
          { date: '2024-01-15', achievement: 'Object-Oriented Programming', level: 3 }
        ],
        currentLevel: 3,
        nextMilestone: 'Advanced Python Concepts'
      },
      {
        id: '2',
        skill: 'Machine Learning',
        progress: 45,
        milestones: [
          { date: '2024-01-10', achievement: 'Linear Regression', level: 1 },
          { date: '2024-01-16', achievement: 'Classification Models', level: 2 }
        ],
        currentLevel: 2,
        nextMilestone: 'Deep Learning Fundamentals'
      },
      {
        id: '3',
        skill: 'Web Development',
        progress: 60,
        milestones: [
          { date: '2024-01-05', achievement: 'HTML/CSS', level: 1 },
          { date: '2024-01-12', achievement: 'JavaScript Basics', level: 2 },
          { date: '2024-01-16', achievement: 'React Fundamentals', level: 3 }
        ],
        currentLevel: 3,
        nextMilestone: 'Advanced React Patterns'
      }
    ];

    setIdentityNodes(mockNodes);
    setBehaviorPatterns(mockPatterns);
    setLearningJourney(mockJourney);
    setSelectedNode(mockNodes[0]);
    setIsLoading(false);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <Zap className="h-4 w-4" />;
      case 'interest': return <Heart className="h-4 w-4" />;
      case 'value': return <Star className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'experience': return <Briefcase className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'skill': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'interest': return 'text-green-600 bg-green-50 border-green-200';
      case 'value': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'goal': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'experience': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Building your SelfGraph...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SelfGraph
              </h1>
              <p className="text-gray-600">Your evolving digital identity and growth patterns</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Network */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  Identity Network
                    </CardTitle>
                <CardDescription>
                  Your skills, interests, values, and goals interconnected
                </CardDescription>
                  </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {identityNodes.map((node) => (
                    <div
                      key={node.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedNode?.id === node.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(node.category)}
                        <Badge className={`text-xs ${getCategoryColor(node.category)}`}>
                          {node.category}
                          </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-2">{node.label}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Strength</span>
                          <span className="text-xs font-medium">{node.strength}%</span>
                    </div>
                        <Progress value={node.strength} className="h-1" />
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {node.connections.length} connections
                        </span>
                      </div>
                    </div>
                  ))}
                    </div>
                  </CardContent>
                </Card>

            {/* Behavior Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Behavior Patterns
                    </CardTitle>
                <CardDescription>
                  Your learning and working patterns over time
                </CardDescription>
                  </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviorPatterns.map((pattern) => (
                    <div key={pattern.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{pattern.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                        </div>
                          <div className="flex items-center gap-2">
                          {getTrendIcon(pattern.trend)}
                          <Badge className={`text-xs ${getImpactColor(pattern.impact)}`}>
                            {pattern.impact}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Frequency</span>
                          <span className="text-sm font-medium">{pattern.frequency}%</span>
                        </div>
                        <Progress value={pattern.frequency} className="h-2" />
                      </div>
                      </div>
                    ))}
                </div>
                  </CardContent>
                </Card>
              </div>

          {/* Learning Journey & Insights */}
              <div className="space-y-6">
            {/* Selected Node Details */}
            {selectedNode && (
                <Card>
                  <CardHeader>
                  <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {getCategoryIcon(selectedNode.category)}
                    {selectedNode.category}
                  </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Strength</span>
                        <span className="text-sm text-gray-600">{selectedNode.strength}%</span>
                      </div>
                      <Progress value={selectedNode.strength} className="h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Connections</p>
                      <p className="text-sm text-gray-600">
                        Connected to {selectedNode.connections.length} other aspects of your identity
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedNode.lastUpdated).toLocaleDateString()}
                      </p>
                          </div>
                        </div>
                  </CardContent>
                </Card>
            )}

            {/* Learning Journey */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Learning Journey
                    </CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningJourney.map((journey) => (
                    <div key={journey.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{journey.skill}</h4>
                        <Badge variant="outline" className="text-xs">
                          Level {journey.currentLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium">{journey.progress}%</span>
                        </div>
                        <Progress value={journey.progress} className="h-1" />
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Next: {journey.nextMilestone}</p>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600">Recent Milestones:</p>
                        <ul className="text-xs text-gray-500 mt-1">
                          {journey.milestones.slice(-2).map((milestone, index) => (
                            <li key={index}>• {milestone.achievement}</li>
                          ))}
                        </ul>
                      </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Strong Growth</p>
                      <p className="text-xs text-gray-600">AI/ML interest increased 15% this month</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Goal Alignment</p>
                      <p className="text-xs text-gray-600">Skills match 90% of your career goals</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Network Growth</p>
                      <p className="text-xs text-gray-600">Connected with 5 new professionals</p>
                    </div>
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

export default SelfGraph;