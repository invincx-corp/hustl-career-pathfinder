import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Users, 
  Trophy, 
  TrendingUp, 
  Calendar,
  MessageCircle,
  Star,
  Sparkles,
  ArrowRight,
  Zap,
  Award,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    roadmapsCompleted: 0,
    projectsCompleted: 0,
    skillsLearned: 0,
    mentorshipSessions: 0,
    currentStreak: 0,
    totalPoints: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserDashboardData();
  }, [user]);

  const loadUserDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API calls to get user's actual data
      // For now, we'll calculate stats based on user's profile data
      const userSkills = user?.skills || [];
      const userInterests = user?.interests || [];
      const skillAssessmentResults = user?.skill_assessment_results || {};
      
      // Calculate real stats based on user data
      const stats = {
        roadmapsCompleted: user?.selected_roadmaps?.length || 0,
        projectsCompleted: 0, // TODO: Get from projects table
        skillsLearned: userSkills.length,
        mentorshipSessions: 0, // TODO: Get from mentorship sessions
        currentStreak: 7, // TODO: Calculate from activity logs
        totalPoints: Object.keys(skillAssessmentResults).length * 100 + userSkills.length * 50
      };
      
      setUserStats(stats);
      
      // Generate recent activity based on user's actual data
      const activity = [
        {
          id: 1,
          type: 'skill',
          title: `Completed skill assessment for ${userSkills[0] || 'your first skill'}`,
          time: '2 hours ago',
          points: 100
        },
        {
          id: 2,
          type: 'interest',
          title: `Explored ${userInterests[0] || 'new interests'} in Curiosity Compass`,
          time: '1 day ago',
          points: 50
        },
        {
          id: 3,
          type: 'profile',
          title: 'Updated your profile information',
          time: '2 days ago',
          points: 25
        }
      ];
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Check if this is a new user (just completed onboarding)
  const isNewUser = user.onboarding_completed && user.onboarding_step === 100;

  const currentRoadmaps = [
    {
      id: 1,
      title: 'React Advanced Patterns',
      progress: 65,
      nextStep: 'Learn Context API',
      dueDate: '2024-02-15'
    },
    {
      id: 2,
      title: 'Data Science with Python',
      progress: 30,
      nextStep: 'Complete Statistics Module',
      dueDate: '2024-03-01'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {isNewUser ? 'Welcome to Nexa!' : `Welcome back, ${user.full_name || user.email}!`}
              </h1>
              <p className="text-gray-600">
                {isNewUser 
                  ? 'Your personalized learning journey is ready. Let\'s get started!' 
                  : 'Ready to continue your learning journey? Let\'s make today productive.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* New User Welcome Section */}
        {isNewUser && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    🎉 Congratulations on completing your onboarding!
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Based on your interests and skills, we've prepared a personalized learning experience just for you.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <Target className="h-6 w-6 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Your Roadmaps</h4>
                      <p className="text-sm text-gray-600">Personalized learning paths based on your goals</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Skill Assessment</h4>
                      <p className="text-sm text-gray-600">Track your progress and identify gaps</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <Users className="h-6 w-6 text-orange-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Mentor Network</h4>
                      <p className="text-sm text-gray-600">Connect with industry professionals</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roadmaps Completed</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{userStats.roadmapsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{userStats.projectsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Learned</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userStats.skillsLearned}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{userStats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Level {Math.floor(userStats.totalPoints / 100) + 1}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Roadmaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Roadmaps
              </CardTitle>
              <CardDescription>
                Continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentRoadmaps.map((roadmap) => (
                <div key={roadmap.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{roadmap.title}</h4>
                    <Badge variant="secondary">{roadmap.progress}%</Badge>
                  </div>
                  <Progress value={roadmap.progress} className="h-2" />
                  <div className="text-sm text-gray-600">
                    <p>Next: {roadmap.nextStep}</p>
                    <p>Due: {roadmap.dueDate}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                View All Roadmaps
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {activity.type === 'roadmap' && <BookOpen className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'project' && <Target className="h-4 w-4 text-green-600" />}
                      {activity.type === 'mentorship' && <Users className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{activity.points}</span>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into your learning activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <BookOpen className="h-6 w-6" />
                <span>Start New Roadmap</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Target className="h-6 w-6" />
                <span>Browse Projects</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <MessageCircle className="h-6 w-6" />
                <span>Chat with AI Coach</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
