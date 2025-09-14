import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
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
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    dashboardData, 
    isLoading, 
    isDashboardLoading, 
    dashboardError, 
    refreshDashboard 
  } = useUserContext();
  
  const [userStats, setUserStats] = useState({
    roadmapsCompleted: 0,
    projectsCompleted: 0,
    skillsLearned: 0,
    mentorshipSessions: 0,
    currentStreak: 0,
    totalPoints: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (dashboardData) {
      updateUserStats();
      updateRecentActivity();
    }
  }, [dashboardData]);

  const updateUserStats = () => {
    if (!dashboardData) return;
    
    const stats = dashboardData.stats || {};
    const projects = dashboardData.projects || [];
    const skills = dashboardData.skills || [];
    const achievements = dashboardData.achievements || [];
    
    setUserStats({
      roadmapsCompleted: stats.totalRoadmaps || 0,
      projectsCompleted: projects.filter((p: any) => p.status === 'completed').length,
      skillsLearned: stats.totalSkills || 0,
      mentorshipSessions: 0, // TODO: Get from mentor sessions data
      currentStreak: 7, // TODO: Calculate from user activity
      totalPoints: achievements.reduce((sum: number, a: any) => sum + (a.points || 0), 0)
    });
  };

  const updateRecentActivity = () => {
    if (!dashboardData) return;
    
    const activities = [];
    
    // Add recent projects
    const recentProjects = (dashboardData.projects || []).slice(0, 3);
    recentProjects.forEach((project: any) => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        title: `Created project: ${project.title}`,
        description: project.description,
        timestamp: project.created_at,
        icon: 'folder'
      });
    });
    
    // Add recent achievements
    const recentAchievements = (dashboardData.achievements || []).slice(0, 2);
    recentAchievements.forEach((achievement: any) => {
      activities.push({
        id: `achievement-${achievement.id}`,
        type: 'achievement',
        title: `Unlocked: ${achievement.title}`,
        description: achievement.description,
        timestamp: achievement.unlocked_at,
        icon: 'trophy'
      });
    });
    
    // Sort by timestamp and take most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activities.slice(0, 5));
  };

  const loadUserDashboardData = async () => {
    await refreshDashboard();
  };

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-4">{dashboardError}</p>
              <Button onClick={loadUserDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  // Check if this is a new user (just completed onboarding)
  const isNewUser = user.onboarding_completed && user.onboarding_step === 100;

  // Get current roadmaps from dashboard data
  const currentRoadmaps = (dashboardData?.roadmaps || []).slice(0, 2).map((roadmap: any) => ({
    id: roadmap.id,
    title: roadmap.title,
    progress: Math.floor(Math.random() * 80) + 10, // TODO: Calculate real progress
    nextStep: roadmap.steps?.[0]?.title || 'Start learning',
    dueDate: roadmap.estimated_duration || '1 month'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isNewUser ? 'Welcome to Nexa!' : `Welcome back, ${user.full_name || user.email}!`}
          </h1>
          <p className="text-gray-600">
            {isNewUser 
              ? 'Your personalized learning journey is ready. Let\'s get started!' 
              : 'Ready to continue your learning journey? Let\'s make today productive.'
            }
          </p>
        </div>

        {/* New User Welcome Section */}
        {isNewUser && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roadmaps Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.roadmapsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.projectsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Learned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.skillsLearned}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalPoints}</div>
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
