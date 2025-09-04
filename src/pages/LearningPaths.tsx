import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle
} from 'lucide-react';

const LearningPaths = () => {
  const learningPaths = [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, JavaScript and build your first websites',
      progress: 75,
      duration: '8 weeks',
      difficulty: 'Beginner',
      students: 1247,
      rating: 4.8,
      status: 'in-progress',
      nextLesson: 'CSS Grid Layout'
    },
    {
      id: 2,
      title: 'React Advanced Patterns',
      description: 'Learn advanced React concepts and modern development practices',
      progress: 30,
      duration: '6 weeks',
      difficulty: 'Intermediate',
      students: 892,
      rating: 4.9,
      status: 'in-progress',
      nextLesson: 'Context API Deep Dive'
    },
    {
      id: 3,
      title: 'Data Science with Python',
      description: 'Complete data analysis and machine learning journey',
      progress: 0,
      duration: '12 weeks',
      difficulty: 'Advanced',
      students: 2156,
      rating: 4.7,
      status: 'not-started',
      nextLesson: 'Python Basics'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
        <p className="text-gray-600 mt-2">Continue your learning journey with structured paths</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </div>
                <Badge variant={path.status === 'in-progress' ? 'default' : 'secondary'}>
                  {path.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{path.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{path.students.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{path.rating}</span>
                </div>
                <Badge variant="outline">{path.difficulty}</Badge>
              </div>

              {path.status === 'in-progress' && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Next: {path.nextLesson}</p>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              )}

              {path.status === 'not-started' && (
                <Button className="w-full" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LearningPaths;


