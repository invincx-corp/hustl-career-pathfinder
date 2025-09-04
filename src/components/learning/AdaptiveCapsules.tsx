import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { contentManagementService, LearningContent, UserProgress, Badge as BadgeType } from '@/lib/content-management';
import { 
  BookOpen, 
  Play, 
  Download, 
  Clock, 
  Star, 
  Filter,
  Search,
  Wifi,
  WifiOff,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  Plus,
  Trophy,
  Zap,
  Target,
  Bookmark
} from 'lucide-react';

interface CapsuleWithProgress extends LearningContent {
  userProgress?: UserProgress;
  isOffline: boolean;
  rating: number;
}

// Mock data for fallback when API is not available
const mockCapsules: CapsuleWithProgress[] = [
  {
    id: '1',
    title: 'React Hooks Deep Dive',
    description: 'Master the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
    category: 'Frontend Development',
    duration: 45,
    difficulty: 'intermediate',
    rating: 4.8,
    source: 'Nexa Learning',
    type: 'video',
    isOffline: true,
    tags: ['React', 'JavaScript', 'Hooks'],
    prerequisites: [],
    learning_objectives: ['Understand React Hooks', 'Implement useState and useEffect', 'Create custom hooks'],
    content_data: {},
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    userProgress: {
      id: '1',
      user_id: 'user1',
      content_id: '1',
      progress_percentage: 0,
      time_spent: 0,
      is_completed: false,
      last_accessed: new Date().toISOString()
    }
  },
  {
    id: '2',
    title: 'Design Thinking Workshop',
    description: 'Learn the design thinking process and apply it to real-world problems.',
    category: 'Design',
    duration: 120,
    difficulty: 'beginner',
    rating: 4.9,
    source: 'Nexa Learning',
    type: 'interactive',
    isOffline: false,
    tags: ['Design', 'UX', 'Problem Solving'],
    prerequisites: [],
    learning_objectives: ['Learn design thinking principles', 'Apply design thinking to problems'],
    content_data: {},
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    userProgress: {
      id: '2',
      user_id: 'user1',
      content_id: '2',
      progress_percentage: 100,
      time_spent: 120,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_accessed: new Date().toISOString()
    }
  }
];

const AdaptiveCapsules = () => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<CapsuleWithProgress[]>(mockCapsules);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [offlineContent, setOfflineContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const categories = ['all', 'Frontend Development', 'Design', 'Data Science', 'Soft Skills', 'Backend Development', 'Mobile Development', 'DevOps', 'Business'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load content list
        const { data: contentData, error: contentError } = await contentManagementService.getContentList({
          limit: 50
        });

        if (contentData && !contentError) {
          // Load user progress for each content
          const capsulesWithProgress = await Promise.all(
            contentData.map(async (content) => {
              const { data: progressData } = await contentManagementService.getUserProgress(
                user.id,
                content.id
              );
              
              return {
                ...content,
                userProgress: progressData?.[0],
                isOffline: offlineContent.includes(content.id),
                rating: 4.5 // Default rating, could be fetched from reviews
              };
            })
          );

          setCapsules(capsulesWithProgress);
        } else {
          console.warn('Using mock data due to API error:', contentError);
          setCapsules(mockCapsules);
        }

        // Load user badges
        const { data: badgesData } = await contentManagementService.getUserBadges(user.id);
        if (badgesData) {
          setUserBadges(badgesData.map(ub => ub.badges).filter(Boolean));
        }

        // Load offline content
        const { data: offlineData } = await contentManagementService.getOfflineContent(user.id);
        if (offlineData) {
          setOfflineContent(offlineData.map(oc => oc.content_id));
        }

      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data
        setCapsules(mockCapsules);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, offlineContent]);

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || capsule.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || capsule.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'interactive': return <Users className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleDownload = async (capsuleId: string) => {
    if (!user) return;

    try {
      const { error } = await contentManagementService.downloadForOffline(user.id, capsuleId);
      if (!error) {
        setOfflineContent(prev => [...prev, capsuleId]);
        setCapsules(prev => prev.map(capsule => 
          capsule.id === capsuleId 
            ? { ...capsule, isOffline: true }
            : capsule
        ));
      }
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  const handleStart = async (capsuleId: string) => {
    if (!user) return;

    try {
      // Update last accessed time
      await contentManagementService.updateProgress(user.id, capsuleId, {
        last_accessed: new Date().toISOString()
      });

      // In a real app, this would open the capsule content
      console.log('Starting capsule:', capsuleId);
      // TODO: Implement content viewer/player
    } catch (error) {
      console.error('Error starting capsule:', error);
    }
  };

  const handleComplete = async (capsuleId: string) => {
    if (!user) return;

    try {
      await contentManagementService.markAsCompleted(user.id, capsuleId);
      
      // Update local state
      setCapsules(prev => prev.map(capsule => 
        capsule.id === capsuleId 
          ? { 
              ...capsule, 
              userProgress: {
                ...capsule.userProgress,
                is_completed: true,
                progress_percentage: 100,
                completed_at: new Date().toISOString()
              }
            }
          : capsule
      ));

      // Reload badges to check for new achievements
      const { data: badgesData } = await contentManagementService.getUserBadges(user.id);
      if (badgesData) {
        setUserBadges(badgesData.map(ub => ub.badges).filter(Boolean));
      }
    } catch (error) {
      console.error('Error completing capsule:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Adaptive Capsules
          </h2>
          <p className="text-lg text-gray-600">Loading your personalized content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Adaptive Capsules
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Personalized micro-learning content that adapts to your pace and preferences
        </p>
      </div>

      {/* User Badges Section */}
      {userBadges.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Your Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userBadges.slice(0, 5).map((badge) => (
                <Badge key={badge.id} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Award className="h-3 w-3 mr-1" />
                  {badge.name}
                </Badge>
              ))}
              {userBadges.length > 5 && (
                <Badge variant="outline" className="text-gray-600">
                  +{userBadges.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search capsules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'All Levels' : difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Capsules</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCapsules.map((capsule) => (
              <Card key={capsule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{capsule.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{capsule.description}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {capsule.isOffline ? (
                        <WifiOff className="h-4 w-4 text-green-600" />
                      ) : (
                        <Wifi className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(capsule.type)}
                        <span className="capitalize">{capsule.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{capsule.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{capsule.duration} min</span>
                      </div>
                      <Badge className={getDifficultyColor(capsule.difficulty)}>
                        {capsule.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {capsule.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {capsule.userProgress && capsule.userProgress.progress_percentage > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{capsule.userProgress.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${capsule.userProgress.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {capsule.userProgress?.is_completed ? (
                        <Button className="flex-1" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1"
                          onClick={() => handleStart(capsule.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {capsule.userProgress?.progress_percentage > 0 ? 'Continue' : 'Start'}
                        </Button>
                      )}
                      
                      {!capsule.isOffline && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(capsule.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCapsules
              .filter(capsule => capsule.rating >= 4.7)
              .map((capsule) => (
                <Card key={capsule.id} className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{capsule.title}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{capsule.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(capsule.type)}
                          <span className="capitalize">{capsule.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{capsule.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{capsule.duration}</span>
                        </div>
                        <Badge className={getDifficultyColor(capsule.difficulty)}>
                          {capsule.difficulty}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleStart(capsule.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
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

        <TabsContent value="offline" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCapsules
              .filter(capsule => capsule.isOffline)
              .map((capsule) => (
                <Card key={capsule.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{capsule.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-800">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Offline
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{capsule.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(capsule.type)}
                          <span className="capitalize">{capsule.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{capsule.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{capsule.duration}</span>
                        </div>
                        <Badge className={getDifficultyColor(capsule.difficulty)}>
                          {capsule.difficulty}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleStart(capsule.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {capsule.userProgress?.progress_percentage > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCapsules
              .filter(capsule => capsule.userProgress?.is_completed)
              .map((capsule) => (
                <Card key={capsule.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{capsule.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{capsule.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(capsule.type)}
                          <span className="capitalize">{capsule.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{capsule.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{capsule.duration}</span>
                        </div>
                        <Badge className={getDifficultyColor(capsule.difficulty)}>
                          {capsule.difficulty}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
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

export default AdaptiveCapsules;
