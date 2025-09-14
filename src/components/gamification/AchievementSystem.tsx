import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  BookOpen, 
  Users, 
  Calendar,
  CheckCircle,
  Lock,
  Gift,
  Flame,
  Crown,
  Medal,
  Shield,
  Rocket,
  Diamond,
  Heart,
  Brain,
  Code,
  Palette,
  Database,
  Globe,
  Smartphone,
  TrendingUp,
  Clock,
  MessageCircle,
  ThumbsUp,
  Share2,
  Eye,
  Download,
  Upload,
  Settings,
  Bell,
  Search,
  Filter
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'social' | 'milestone' | 'special' | 'streak' | 'project';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    target: number;
    current: number;
    description: string;
  }[];
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  xpReward: number;
  badgeColor: string;
  backgroundColor: string;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  totalLearningTime: number;
  projectsCompleted: number;
  skillsLearned: number;
  mentorsConnected: number;
  communityPoints: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  achievements: number;
  streak: number;
  rank: number;
  isCurrentUser: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: <BookOpen className="h-6 w-6" />,
    category: 'learning',
    rarity: 'common',
    points: 10,
    requirements: [
      {
        type: 'lessons_completed',
        target: 1,
        current: 0,
        description: 'Complete 1 lesson'
      }
    ],
    isUnlocked: false,
    progress: 0,
    xpReward: 50,
    badgeColor: 'text-green-600',
    backgroundColor: 'bg-green-100'
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: <Flame className="h-6 w-6" />,
    category: 'streak',
    rarity: 'rare',
    points: 50,
    requirements: [
      {
        type: 'streak_days',
        target: 7,
        current: 3,
        description: 'Maintain a 7-day learning streak'
      }
    ],
    isUnlocked: false,
    progress: 43,
    xpReward: 200,
    badgeColor: 'text-orange-600',
    backgroundColor: 'bg-orange-100'
  },
  {
    id: 'project-master',
    title: 'Project Master',
    description: 'Complete 5 projects',
    icon: <Code className="h-6 w-6" />,
    category: 'project',
    rarity: 'epic',
    points: 100,
    requirements: [
      {
        type: 'projects_completed',
        target: 5,
        current: 2,
        description: 'Complete 5 projects'
      }
    ],
    isUnlocked: false,
    progress: 40,
    xpReward: 500,
    badgeColor: 'text-purple-600',
    backgroundColor: 'bg-purple-100'
  },
  {
    id: 'mentor-connector',
    title: 'Mentor Connector',
    description: 'Connect with your first mentor',
    icon: <Users className="h-6 w-6" />,
    category: 'social',
    rarity: 'common',
    points: 25,
    requirements: [
      {
        type: 'mentors_connected',
        target: 1,
        current: 1,
        description: 'Connect with 1 mentor'
      }
    ],
    isUnlocked: true,
    unlockedAt: '2024-01-15',
    progress: 100,
    xpReward: 100,
    badgeColor: 'text-blue-600',
    backgroundColor: 'bg-blue-100'
  },
  {
    id: 'skill-collector',
    title: 'Skill Collector',
    description: 'Learn 10 different skills',
    icon: <Brain className="h-6 w-6" />,
    category: 'learning',
    rarity: 'rare',
    points: 75,
    requirements: [
      {
        type: 'skills_learned',
        target: 10,
        current: 7,
        description: 'Learn 10 different skills'
      }
    ],
    isUnlocked: false,
    progress: 70,
    xpReward: 300,
    badgeColor: 'text-indigo-600',
    backgroundColor: 'bg-indigo-100'
  },
  {
    id: 'community-champion',
    title: 'Community Champion',
    description: 'Help 50 community members',
    icon: <Heart className="h-6 w-6" />,
    category: 'social',
    rarity: 'legendary',
    points: 200,
    requirements: [
      {
        type: 'community_help',
        target: 50,
        current: 12,
        description: 'Help 50 community members'
      }
    ],
    isUnlocked: false,
    progress: 24,
    xpReward: 1000,
    badgeColor: 'text-red-600',
    backgroundColor: 'bg-red-100'
  },
  {
    id: 'speed-learner',
    title: 'Speed Learner',
    description: 'Complete a lesson in under 30 minutes',
    icon: <Zap className="h-6 w-6" />,
    category: 'special',
    rarity: 'rare',
    points: 30,
    requirements: [
      {
        type: 'fast_lesson',
        target: 1,
        current: 0,
        description: 'Complete a lesson in under 30 minutes'
      }
    ],
    isUnlocked: false,
    progress: 0,
    xpReward: 150,
    badgeColor: 'text-yellow-600',
    backgroundColor: 'bg-yellow-100'
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Earn 1000 total XP',
    icon: <Diamond className="h-6 w-6" />,
    category: 'milestone',
    rarity: 'epic',
    points: 150,
    requirements: [
      {
        type: 'total_xp',
        target: 1000,
        current: 650,
        description: 'Earn 1000 total XP'
      }
    ],
    isUnlocked: false,
    progress: 65,
    xpReward: 750,
    badgeColor: 'text-pink-600',
    backgroundColor: 'bg-pink-100'
  }
];

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '/api/placeholder/40/40',
    level: 15,
    xp: 2450,
    achievements: 23,
    streak: 45,
    rank: 1,
    isCurrentUser: false
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: '/api/placeholder/40/40',
    level: 14,
    xp: 2380,
    achievements: 21,
    streak: 32,
    rank: 2,
    isCurrentUser: false
  },
  {
    id: '3',
    name: 'You',
    avatar: '/api/placeholder/40/40',
    level: 12,
    xp: 2150,
    achievements: 18,
    streak: 15,
    rank: 3,
    isCurrentUser: true
  },
  {
    id: '4',
    name: 'Mike Rodriguez',
    avatar: '/api/placeholder/40/40',
    level: 11,
    xp: 1980,
    achievements: 16,
    streak: 8,
    rank: 4,
    isCurrentUser: false
  },
  {
    id: '5',
    name: 'Emily Davis',
    avatar: '/api/placeholder/40/40',
    level: 10,
    xp: 1850,
    achievements: 14,
    streak: 22,
    rank: 5,
    isCurrentUser: false
  }
];

interface AchievementSystemProps {
  userId: string;
}

export default function AchievementSystem({ userId }: AchievementSystemProps) {
  const { user } = useAuth();
  const { 
    dashboardData, 
    unlockAchievement, 
    isLoading 
  } = useUserContext();
  
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    xp: 2150,
    xpToNextLevel: 350,
    totalXp: 2150,
    achievementsUnlocked: 18,
    totalAchievements: ACHIEVEMENTS.length,
    currentStreak: 15,
    longestStreak: 28,
    totalLearningTime: 45,
    projectsCompleted: 2,
    skillsLearned: 7,
    mentorsConnected: 1,
    communityPoints: 1250
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Load achievements from dashboard data
  useEffect(() => {
    if (dashboardData?.achievements) {
      // Update user stats based on real data
      const stats = dashboardData.stats || {};
      setUserStats(prev => ({
        ...prev,
        projectsCompleted: stats.totalProjects || 0,
        skillsLearned: stats.totalSkills || 0,
        achievementsUnlocked: stats.totalAchievements || 0
      }));
    }
  }, [dashboardData]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return <BookOpen className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'project': return <Code className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getLevelProgress = () => {
    const currentLevelXp = userStats.level * 200;
    const nextLevelXp = (userStats.level + 1) * 200;
    const progress = ((userStats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const handleUnlockAchievement = async (achievementId: string) => {
    if (!user?.id) return;
    
    setIsUnlocking(true);
    try {
      const success = await unlockAchievement(achievementId);
      if (success) {
        // Update local state to reflect the unlocked achievement
        setAchievements(prev => prev.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, isUnlocked: true, unlockedAt: new Date().toISOString() }
            : achievement
        ));
        
        // Update user stats
        setUserStats(prev => ({
          ...prev,
          achievementsUnlocked: prev.achievementsUnlocked + 1,
          xp: prev.xp + 100 // Award XP for unlocking achievement
        }));
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    } finally {
      setIsUnlocking(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
  const rarities = ['all', ...Array.from(new Set(achievements.map(a => a.rarity)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements & Progress</h2>
          <p className="text-gray-600">Track your learning journey and unlock rewards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Trophy className="h-3 w-3 mr-1" />
            Level {userStats.level}
          </Badge>
        </div>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Level</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.level}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{userStats.xp} XP</span>
                    <span>{userStats.xpToNextLevel} to next level</span>
                  </div>
                  <Progress value={getLevelProgress()} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.achievementsUnlocked}/{userStats.totalAchievements}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((userStats.achievementsUnlocked / userStats.totalAchievements) * 100)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak} days</p>
                <p className="text-xs text-gray-500">
                  Best: {userStats.longestStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalLearningTime}h</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Rarities</option>
                {rarities.slice(1).map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => (
              <Card key={achievement.id} className={`${achievement.isUnlocked ? 'border-green-200' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${achievement.backgroundColor}`}>
                      <div className={achievement.badgeColor}>
                        {achievement.isUnlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <span className="text-sm text-gray-500">{achievement.points} pts</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      {achievement.isUnlocked ? (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Unlocked {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {achievement.requirements.map((req, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{req.description}</span>
                                <span>{req.current}/{req.target}</span>
                              </div>
                              <Progress value={(req.current / req.target) * 100} className="h-2" />
                            </div>
                          ))}
                          
                          {/* Check if all requirements are met */}
                          {achievement.requirements.every(req => req.current >= req.target) && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUnlockAchievement(achievement.id)}
                              disabled={isUnlocking}
                              className="mt-2"
                            >
                              {isUnlocking ? 'Unlocking...' : 'Unlock Achievement'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top learners this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      entry.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-medium">
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        <div>
                          <p className="font-medium text-sm">{entry.name}</p>
                          <p className="text-xs text-gray-500">Level {entry.level}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{entry.xp} XP</p>
                      <p className="text-xs text-gray-500">{entry.achievements} achievements</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projects Completed</span>
                  <span className="font-medium">{userStats.projectsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Skills Learned</span>
                  <span className="font-medium">{userStats.skillsLearned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mentors Connected</span>
                  <span className="font-medium">{userStats.mentorsConnected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Community Points</span>
                  <span className="font-medium">{userStats.communityPoints}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



