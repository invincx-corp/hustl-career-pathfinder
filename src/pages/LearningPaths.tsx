import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

const LearningPaths = () => {
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState([]);
  const [userStats, setUserStats] = useState({
    totalPaths: 0,
    completedPaths: 0,
    inProgressPaths: 0,
    totalHours: 0
  });

  useEffect(() => {
    if (user) {
      loadUserLearningPaths();
    }
  }, [user]);

  const loadUserLearningPaths = () => {
    // Generate personalized learning paths based on user's selected roadmaps and skills
    const userRoadmaps = user?.selected_roadmaps || [];
    const userSkills = user?.skills || [];
    const assessmentResults = user?.skill_assessment_results || {};

    // Create learning paths based on user's roadmaps
    const generatedPaths = userRoadmaps.map((roadmap, index) => ({
      id: index + 1,
      title: roadmap.title || `Learning Path ${index + 1}`,
      description: roadmap.description || `Master ${roadmap.skills?.join(', ') || 'new skills'} and advance your career`,
      progress: Math.floor(Math.random() * 100), // Simulate progress
      duration: roadmap.duration || '8 weeks',
      difficulty: roadmap.difficulty || 'Intermediate',
      students: Math.floor(Math.random() * 2000) + 500,
      rating: (Math.random() * 1 + 4).toFixed(1),
      status: Math.random() > 0.5 ? 'in-progress' : 'not-started',
      nextLesson: roadmap.steps?.[0]?.title || 'Getting Started',
      skills: roadmap.skills || [],
      category: roadmap.category || 'Technology'
    }));

    // Add some additional paths based on user interests
    const additionalPaths = [
      {
        id: generatedPaths.length + 1,
        title: 'Advanced JavaScript Concepts',
        description: 'Deep dive into modern JavaScript, ES6+, async programming, and performance optimization',
        progress: 0,
        duration: '6 weeks',
        difficulty: 'Advanced',
        students: 1847,
        rating: 4.8,
        status: 'not-started',
        nextLesson: 'ES6+ Features',
        skills: ['JavaScript', 'ES6', 'Async Programming'],
        category: 'Programming'
      },
      {
        id: generatedPaths.length + 2,
        title: 'UI/UX Design Fundamentals',
        description: 'Learn design principles, user research, wireframing, and prototyping',
        progress: 0,
        duration: '10 weeks',
        difficulty: 'Beginner',
        students: 2156,
        rating: 4.7,
        status: 'not-started',
        nextLesson: 'Design Principles',
        skills: ['UI Design', 'UX Research', 'Figma'],
        category: 'Design'
      }
    ];

    const allPaths = [...generatedPaths, ...additionalPaths];
    setLearningPaths(allPaths);

    // Calculate user stats
    const completedPaths = allPaths.filter(path => path.progress === 100).length;
    const inProgressPaths = allPaths.filter(path => path.progress > 0 && path.progress < 100).length;
    const totalHours = allPaths.reduce((total, path) => {
      const weeks = parseInt(path.duration);
      return total + (weeks * 5); // Assume 5 hours per week
    }, 0);

    setUserStats({
      totalPaths: allPaths.length,
      completedPaths,
      inProgressPaths,
      totalHours
    });
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient styling matching landing page */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Learning Paths
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Continue your personalized learning journey with structured paths tailored to your goals and interests
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.totalPaths}</p>
                <p className="text-sm text-gray-600">Total Paths</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.completedPaths}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.inProgressPaths}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.totalHours}h</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription className="text-sm">{path.description}</CardDescription>
                </div>
                <Badge 
                  variant={path.status === 'in-progress' ? 'default' : 'secondary'}
                  className={path.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                >
                  {path.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Skills Tags */}
              {path.skills && path.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {path.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {path.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{path.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{path.progress}%</span>
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
                <Badge variant="outline" className="text-xs">{path.difficulty}</Badge>
              </div>

              {path.status === 'in-progress' && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Next: {path.nextLesson}</p>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
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

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to accelerate your learning?</h3>
          <p className="text-gray-600 mb-4">
            Discover more personalized learning paths based on your interests and career goals.
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            Explore More Paths
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPaths;
