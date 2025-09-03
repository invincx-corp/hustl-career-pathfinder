import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: 'capsule' | 'project' | 'course';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  source: string;
}

const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'React Development',
    category: 'Frontend',
    currentLevel: 3,
    requiredLevel: 7,
    priority: 'high',
    estimatedTime: '3-4 months',
    resources: [
      {
        id: 'r1',
        title: 'React Fundamentals',
        type: 'capsule',
        duration: '2 hours',
        difficulty: 'beginner',
        rating: 4.8,
        source: 'Nexa Learning'
      },
      {
        id: 'r2',
        title: 'Build a Todo App',
        type: 'project',
        duration: '1 week',
        difficulty: 'intermediate',
        rating: 4.6,
        source: 'Project Playground'
      }
    ]
  },
  {
    id: '2',
    name: 'Data Analysis',
    category: 'Analytics',
    currentLevel: 2,
    requiredLevel: 6,
    priority: 'medium',
    estimatedTime: '2-3 months',
    resources: [
      {
        id: 'r3',
        title: 'Python for Data Science',
        type: 'course',
        duration: '4 weeks',
        difficulty: 'intermediate',
        rating: 4.7,
        source: 'Coursera'
      }
    ]
  },
  {
    id: '3',
    name: 'UI/UX Design',
    category: 'Design',
    currentLevel: 4,
    requiredLevel: 5,
    priority: 'low',
    estimatedTime: '1-2 months',
    resources: [
      {
        id: 'r4',
        title: 'Design Thinking Workshop',
        type: 'capsule',
        duration: '3 hours',
        difficulty: 'beginner',
        rating: 4.9,
        source: 'Nexa Learning'
      }
    ]
  }
];

const SkillStacker = () => {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeTab, setActiveTab] = useState('gaps');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const calculateGap = (current: number, required: number) => {
    return Math.max(0, required - current);
  };

  const getGapSeverity = (gap: number) => {
    if (gap >= 4) return 'high';
    if (gap >= 2) return 'medium';
    return 'low';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SkillStacker
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze your current skills against your career goals and get personalized recommendations to bridge the gaps
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-6">
          <div className="grid gap-6">
            {skills.map((skill) => {
              const gap = calculateGap(skill.currentLevel, skill.requiredLevel);
              const gapSeverity = getGapSeverity(gap);
              
              return (
                <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{skill.name}</CardTitle>
                          <p className="text-sm text-gray-500">{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(skill.priority)}>
                          {skill.priority} priority
                        </Badge>
                        {gap > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Gap: {gap} levels
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Current Level</span>
                            <span className="font-medium">{skill.currentLevel}/10</span>
                          </div>
                          <Progress value={skill.currentLevel * 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Required Level</span>
                            <span className="font-medium">{skill.requiredLevel}/10</span>
                          </div>
                          <Progress value={skill.requiredLevel * 10} className="h-2" />
                        </div>
                      </div>

                      {gap > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <span className="font-medium text-orange-800">Skill Gap Identified</span>
                          </div>
                          <p className="text-sm text-orange-700">
                            You need to improve by {gap} levels. Estimated time: {skill.estimatedTime}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => setSelectedSkill(skill)}
                          className="flex-1"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Resources
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Roadmap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {skills.flatMap(skill => skill.resources).map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {resource.type === 'capsule' && <BookOpen className="h-5 w-5 text-blue-600" />}
                          {resource.type === 'project' && <Users className="h-5 w-5 text-blue-600" />}
                          {resource.type === 'course' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <p className="text-sm text-gray-500">{resource.source}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{resource.duration}</span>
                        </div>
                        <Badge className={getDifficultyColor(resource.difficulty)}>
                          {resource.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{resource.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Roadmap
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Overall Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Skills Improved</span>
                    <span className="font-medium">2 of 3</span>
                  </div>
                  <Progress value={66} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">2</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">1</div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">0</div>
                      <div className="text-sm text-gray-600">Not Started</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">React Fundamentals Completed</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Data Analysis Project Submitted</p>
                      <p className="text-sm text-gray-600">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {selectedSkill && (
        <Card className="fixed inset-4 bg-white shadow-2xl z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resources for {selectedSkill.name}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedSkill(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSkill.resources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.source} • {resource.duration}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Start</Button>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillStacker;



