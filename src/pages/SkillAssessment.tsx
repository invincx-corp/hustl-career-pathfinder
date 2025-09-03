import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Brain, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

const SkillAssessment = () => {
  const assessments = [
    {
      id: 1,
      title: 'Web Development Skills',
      description: 'Test your knowledge of HTML, CSS, JavaScript, and modern frameworks',
      category: 'Technology',
      difficulty: 'Mixed',
      duration: '45 minutes',
      questions: 30,
      status: 'completed',
      score: 85,
      completedAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      description: 'Assess your understanding of statistics, Python, and data analysis',
      category: 'Data Science',
      difficulty: 'Intermediate',
      duration: '60 minutes',
      questions: 40,
      status: 'in-progress',
      progress: 60,
      currentQuestion: 24
    },
    {
      id: 3,
      title: 'UI/UX Design Principles',
      description: 'Evaluate your design thinking and user experience knowledge',
      category: 'Design',
      difficulty: 'Beginner',
      duration: '30 minutes',
      questions: 20,
      status: 'not-started',
      progress: 0
    }
  ];

  const recentResults = [
    {
      skill: 'JavaScript',
      score: 92,
      level: 'Advanced',
      improvement: '+15%'
    },
    {
      skill: 'React',
      score: 78,
      level: 'Intermediate',
      improvement: '+8%'
    },
    {
      skill: 'CSS',
      score: 85,
      level: 'Advanced',
      improvement: '+12%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skill Assessment</h1>
        <p className="text-gray-600 mt-2">Test your skills and track your progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Assessments Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Certificates Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">+23%</p>
                <p className="text-sm text-gray-600">Average Improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-gray-600">Skills Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
          <CardDescription>Your latest skill evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{result.skill}</h3>
                    <Badge className={getLevelColor(result.level)}>
                      {result.level}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{result.score}%</p>
                  <p className="text-sm text-green-600">{result.improvement}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Assessments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Assessments</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(assessment.status)}>
                    {assessment.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{assessment.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>{assessment.questions} questions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{assessment.category}</Badge>
                  <Badge variant="outline">{assessment.difficulty}</Badge>
                </div>

                {assessment.status === 'completed' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className="font-semibold">{assessment.score}%</span>
                    </div>
                    <Progress value={assessment.score} className="h-2" />
                    <p className="text-xs text-gray-500">
                      Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {assessment.status === 'in-progress' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{assessment.currentQuestion}/{assessment.questions}</span>
                    </div>
                    <Progress value={assessment.progress} className="h-2" />
                    <Button className="w-full">
                      Continue Assessment
                    </Button>
                  </div>
                )}

                {assessment.status === 'not-started' && (
                  <Button className="w-full">
                    Start Assessment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
