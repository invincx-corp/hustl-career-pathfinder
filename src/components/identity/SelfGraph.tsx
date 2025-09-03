import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Users, 
  BookOpen, 
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Heart,
  Lightbulb
} from 'lucide-react';

interface SelfGraphData {
  id: string;
  timestamp: string;
  interests: Interest[];
  skills: Skill[];
  values: Value[];
  confidence: number;
  energy: number;
  decisionMaking: number;
  collaboration: number;
  learning: number;
  creativity: number;
}

interface Interest {
  name: string;
  intensity: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface Skill {
  name: string;
  level: number;
  confidence: number;
  lastPracticed: string;
  category: string;
}

interface Value {
  name: string;
  importance: number;
  alignment: number;
  category: string;
}

const mockSelfGraphData: SelfGraphData[] = [
  {
    id: '1',
    timestamp: '2024-01-15',
    interests: [
      { name: 'Frontend Development', intensity: 85, trend: 'up', category: 'Technical' },
      { name: 'UI/UX Design', intensity: 72, trend: 'up', category: 'Creative' },
      { name: 'Data Science', intensity: 45, trend: 'down', category: 'Technical' },
      { name: 'Leadership', intensity: 68, trend: 'stable', category: 'Soft Skills' }
    ],
    skills: [
      { name: 'React', level: 7, confidence: 8, lastPracticed: '2024-01-14', category: 'Technical' },
      { name: 'JavaScript', level: 8, confidence: 9, lastPracticed: '2024-01-15', category: 'Technical' },
      { name: 'Communication', level: 6, confidence: 7, lastPracticed: '2024-01-10', category: 'Soft Skills' },
      { name: 'Problem Solving', level: 8, confidence: 8, lastPracticed: '2024-01-12', category: 'Soft Skills' }
    ],
    values: [
      { name: 'Innovation', importance: 9, alignment: 8, category: 'Work' },
      { name: 'Work-Life Balance', importance: 8, alignment: 6, category: 'Life' },
      { name: 'Learning', importance: 9, alignment: 9, category: 'Growth' },
      { name: 'Impact', importance: 7, alignment: 5, category: 'Purpose' }
    ],
    confidence: 75,
    energy: 80,
    decisionMaking: 70,
    collaboration: 65,
    learning: 85,
    creativity: 78
  }
];

const SelfGraph = () => {
  const [selfGraphData, setSelfGraphData] = useState<SelfGraphData[]>(mockSelfGraphData);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');

  const currentData = selfGraphData[0];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-800';
      case 'Creative': return 'bg-purple-100 text-purple-800';
      case 'Soft Skills': return 'bg-green-100 text-green-800';
      case 'Work': return 'bg-orange-100 text-orange-800';
      case 'Life': return 'bg-pink-100 text-pink-800';
      case 'Growth': return 'bg-indigo-100 text-indigo-800';
      case 'Purpose': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SelfGraph
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your evolving identity intelligence - tracking your interests, skills, values, and growth patterns
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Confidence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {currentData.confidence}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.confidence}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your overall confidence in your abilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Energy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {currentData.energy}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.energy}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your current energy and motivation level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Decision Making</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentData.decisionMaking}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.decisionMaking}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your confidence in making decisions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Collaboration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {currentData.collaboration}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.collaboration}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your comfort with teamwork
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {currentData.learning}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.learning}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your learning and growth mindset
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-orange-600" />
                  <span>Creativity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {currentData.creativity}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.creativity}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your creative thinking ability
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <div className="grid gap-6">
            {currentData.interests.map((interest, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{interest.name}</h3>
                        <Badge className={getCategoryColor(interest.category)}>
                          {interest.category}
                        </Badge>
                        <div className={`flex items-center space-x-1 ${getTrendColor(interest.trend)}`}>
                          {getTrendIcon(interest.trend)}
                          <span className="text-sm capitalize">{interest.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Intensity</span>
                            <span>{interest.intensity}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${interest.intensity}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid gap-6">
            {currentData.skills.map((skill, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="font-semibold text-lg">{skill.name}</h3>
                        <Badge className={getCategoryColor(skill.category)}>
                          {skill.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Level</span>
                            <span>{skill.level}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.level * 10}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Confidence</span>
                            <span>{skill.confidence}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.confidence * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        Last practiced: {new Date(skill.lastPracticed).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="values" className="space-y-6">
          <div className="grid gap-6">
            {currentData.values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="font-semibold text-lg">{value.name}</h3>
                        <Badge className={getCategoryColor(value.category)}>
                          {value.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Importance</span>
                            <span>{value.importance}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${value.importance * 10}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Alignment</span>
                            <span>{value.alignment}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${value.alignment * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {value.alignment < value.importance && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Gap identified:</strong> This value is important to you but not well-aligned with your current activities.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfGraph;



