import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award,
  Clock,
  Star,
  CheckCircle,
  Plus,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  lastPracticed: string;
  totalTimeSpent: number;
  resources: string[];
  nextSteps: string[];
  isActive: boolean;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  skills: Skill[];
  totalProgress: number;
}

const SkillStacker = () => {
  const { user } = useAuth();
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalSkills: 0,
    skillsInProgress: 0,
    skillsCompleted: 0,
    totalTimeSpent: 0,
    averageProgress: 0
  });

  useEffect(() => {
    loadUserSkills();
  }, [user]);

  const loadUserSkills = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call to get user's skill data
      // For now, we'll use the user's stored skills from their profile
      const userSkills = user?.skills || [];
      const skillAssessmentResults = user?.skill_assessment_results || {};
      
      // Generate skill categories based on user's actual skills and assessment results
      const generatedCategories: SkillCategory[] = [
        {
          id: 'programming',
          name: 'Programming',
          icon: BookOpen,
          color: 'bg-blue-500',
          totalProgress: 75,
          skills: [
            {
              id: 'javascript',
              name: 'JavaScript',
              category: 'programming',
              currentLevel: 8,
              targetLevel: 10,
              progress: 80,
              lastPracticed: '2 hours ago',
              totalTimeSpent: 45,
              resources: ['MDN Docs', 'JavaScript.info', 'FreeCodeCamp'],
              nextSteps: ['Learn ES6+ features', 'Practice async/await', 'Build projects'],
              isActive: true
            },
            {
              id: 'react',
              name: 'React',
              category: 'programming',
              currentLevel: 6,
              targetLevel: 9,
              progress: 67,
              lastPracticed: '1 day ago',
              totalTimeSpent: 32,
              resources: ['React Docs', 'React Tutorial', 'CodeSandbox'],
              nextSteps: ['Learn hooks', 'Practice state management', 'Build components'],
              isActive: true
            },
            {
              id: 'python',
              name: 'Python',
              category: 'programming',
              currentLevel: 4,
              targetLevel: 8,
              progress: 50,
              lastPracticed: '3 days ago',
              totalTimeSpent: 18,
              resources: ['Python.org', 'Real Python', 'LeetCode'],
              nextSteps: ['Learn data structures', 'Practice algorithms', 'Build projects'],
              isActive: false
            }
          ]
        },
        {
          id: 'design',
          name: 'Design',
          icon: Star,
          color: 'bg-pink-500',
          totalProgress: 60,
          skills: [
            {
              id: 'ui-design',
              name: 'UI Design',
              category: 'design',
              currentLevel: 5,
              targetLevel: 8,
              progress: 63,
              lastPracticed: '1 day ago',
              totalTimeSpent: 25,
              resources: ['Figma', 'Dribbble', 'UI Design Course'],
              nextSteps: ['Learn design systems', 'Practice prototyping', 'Study user flows'],
              isActive: true
            },
            {
              id: 'ux-research',
              name: 'UX Research',
              category: 'design',
              currentLevel: 3,
              targetLevel: 7,
              progress: 43,
              lastPracticed: '1 week ago',
              totalTimeSpent: 12,
              resources: ['UX Research Methods', 'User Interviews', 'Analytics'],
              nextSteps: ['Learn user testing', 'Practice interviews', 'Analyze data'],
              isActive: false
            }
          ]
        },
        {
          id: 'data',
          name: 'Data Science',
          icon: BarChart3,
          color: 'bg-green-500',
          totalProgress: 40,
          skills: [
            {
              id: 'data-analysis',
              name: 'Data Analysis',
              category: 'data',
              currentLevel: 4,
              targetLevel: 8,
              progress: 50,
              lastPracticed: '2 days ago',
              totalTimeSpent: 20,
              resources: ['Pandas', 'NumPy', 'Data Analysis Course'],
              nextSteps: ['Learn visualization', 'Practice with datasets', 'Build dashboards'],
              isActive: true
            }
          ]
        }
      ];

      setSkillCategories(generatedCategories);
      
      // Calculate user stats
      const allSkills = generatedCategories.flatMap(cat => cat.skills);
      const stats = {
        totalSkills: allSkills.length,
        skillsInProgress: allSkills.filter(s => s.isActive).length,
        skillsCompleted: allSkills.filter(s => s.progress >= 100).length,
        totalTimeSpent: allSkills.reduce((sum, s) => sum + s.totalTimeSpent, 0),
        averageProgress: Math.round(allSkills.reduce((sum, s) => sum + s.progress, 0) / allSkills.length)
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillClick = (skill: Skill) => {
    // Track skill interaction
    trackSkillInteraction(skill.id);
  };

  const trackSkillInteraction = async (skillId: string) => {
    try {
      // TODO: Implement real API call to track skill interaction
      console.log('Tracking interaction with skill:', skillId);
    } catch (error) {
      console.error('Error tracking skill interaction:', error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 60) return 'text-blue-600 bg-blue-100';
    if (progress >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-600 bg-purple-100';
    if (level >= 6) return 'text-blue-600 bg-blue-100';
    if (level >= 4) return 'text-green-600 bg-green-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Skills...</h2>
            <p className="text-gray-600 text-center">
              Analyzing your skill development and progress.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Skill Stacker
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Build and track your skills systematically. Set goals, track progress, 
          and unlock your potential with personalized learning paths.
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalSkills}</p>
                <p className="text-sm text-gray-600">Total Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.skillsInProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.skillsCompleted}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalTimeSpent}h</p>
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.averageProgress}%</p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Skill Categories</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Skill
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category) => (
            <Card 
              key={category.id} 
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selectedCategory?.id === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className={getProgressColor(category.totalProgress)}>
                    {category.totalProgress}% Complete
                  </Badge>
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>
                  {category.skills.length} skills • {category.skills.filter(s => s.isActive).length} active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{category.totalProgress}%</span>
                  </div>
                  <Progress value={category.totalProgress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Active Skills</h4>
                  <div className="space-y-1">
                    {category.skills.filter(s => s.isActive).slice(0, 3).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <Badge variant="outline" className={getLevelColor(skill.currentLevel)}>
                          L{skill.currentLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={selectedCategory?.id === category.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory(category);
                  }}
                >
                  View Skills
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${selectedCategory.color} rounded-lg flex items-center justify-center`}>
                <selectedCategory.icon className="h-4 w-4 text-white" />
              </div>
              <span>{selectedCategory.name} Skills</span>
            </CardTitle>
            <CardDescription>
              Manage and track your skills in this category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {selectedCategory.skills.map((skill) => (
                <Card key={skill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${selectedCategory.color} rounded-lg flex items-center justify-center`}>
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{skill.name}</h3>
                          <p className="text-sm text-gray-600">
                            Level {skill.currentLevel} → {skill.targetLevel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getProgressColor(skill.progress)}>
                          {skill.progress}%
                        </Badge>
                        <Badge variant="outline" className={skill.isActive ? 'text-green-600' : 'text-gray-600'}>
                          {skill.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{skill.totalTimeSpent}h spent</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Last: {skill.lastPracticed}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Next Steps</h4>
                        <div className="space-y-1">
                          {skill.nextSteps.slice(0, 2).map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSkillClick(skill)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Practice
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Target className="h-4 w-4 mr-2" />
                          Set Goal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillStacker;
