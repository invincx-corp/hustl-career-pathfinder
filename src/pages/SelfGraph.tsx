import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Brain, 
  Heart, 
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function SelfGraph() {
  const [selfGraphData, setSelfGraphData] = React.useState({
    confidence: 75,
    energy: 80,
    decisionMaking: 70,
    collaboration: 85,
    learning: 90,
    creativity: 65
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSelfGraphData(prev => ({
        confidence: Math.min(100, prev.confidence + Math.random() * 10 - 5),
        energy: Math.min(100, prev.energy + Math.random() * 10 - 5),
        decisionMaking: Math.min(100, prev.decisionMaking + Math.random() * 10 - 5),
        collaboration: Math.min(100, prev.collaboration + Math.random() * 10 - 5),
        learning: Math.min(100, prev.learning + Math.random() * 10 - 5),
        creativity: Math.min(100, prev.creativity + Math.random() * 10 - 5)
      }));
      setIsLoading(false);
    }, 1000);
  };

  const metrics = [
    { key: 'confidence', label: 'Confidence', icon: Target, color: 'bg-blue-500' },
    { key: 'energy', label: 'Energy', icon: Zap, color: 'bg-yellow-500' },
    { key: 'decisionMaking', label: 'Decision Making', icon: Brain, color: 'bg-purple-500' },
    { key: 'collaboration', label: 'Collaboration', icon: Heart, color: 'bg-pink-500' },
    { key: 'learning', label: 'Learning', icon: TrendingUp, color: 'bg-green-500' },
    { key: 'creativity', label: 'Creativity', icon: BarChart3, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Self Graph</h1>
              <p className="text-gray-600 mt-2">
                Track your personal development and growth metrics
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = Math.round(selfGraphData[metric.key as keyof typeof selfGraphData]);
            
            return (
              <Card key={metric.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${metric.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{metric.label}</CardTitle>
                        <CardDescription>Current level</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg font-semibold">
                      {value}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={value} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Strengths</h4>
                  <p className="text-green-700 text-sm mt-1">
                    Your learning and collaboration skills are excellent! Keep building on these strengths.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Areas for Growth</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Consider focusing on creativity and decision-making to reach your full potential.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Practice creative problem-solving</p>
                    <p className="text-sm text-gray-600">Try brainstorming sessions and design thinking exercises</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Improve decision-making confidence</p>
                    <p className="text-sm text-gray-600">Start with small decisions and work your way up</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Maintain your learning momentum</p>
                    <p className="text-sm text-gray-600">Your learning skills are outstanding - keep it up!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}










