import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Search, 
  Filter,
  Code,
  ExternalLink,
  Github,
  Star,
  Eye,
  Calendar,
  FolderOpen,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    totalLikes: 0
  });

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user]);

  const loadUserProjects = () => {
    // Generate personalized projects based on user's skills and interests
    const userSkills = user?.skills || [];
    const userInterests = user?.interests || [];
    const assessmentResults = user?.skill_assessment_results || {};

    // Create projects based on user's skills and interests
    const generatedProjects = [
      {
        id: 1,
        title: 'Personal Portfolio Website',
        description: 'A modern, responsive portfolio website showcasing your skills and projects',
        status: 'completed',
        difficulty: 'Beginner',
        technologies: userSkills.includes('React') ? ['React', 'TypeScript', 'Tailwind CSS'] : ['HTML', 'CSS', 'JavaScript'],
        githubUrl: 'https://github.com/user/portfolio',
        liveUrl: 'https://portfolio.example.com',
        likes: 24,
        views: 156,
        createdAt: '2024-01-15',
        tags: ['web', 'portfolio', 'personal'],
        category: 'Web Development'
      },
      {
        id: 2,
        title: 'Skill Assessment Dashboard',
        description: 'Interactive dashboard to track and visualize your learning progress',
        status: 'in-progress',
        difficulty: 'Intermediate',
        technologies: ['React', 'Chart.js', 'Node.js'],
        githubUrl: 'https://github.com/user/skill-dashboard',
        likes: 18,
        views: 89,
        createdAt: '2024-01-01',
        tags: ['dashboard', 'analytics', 'react'],
        category: 'Data Visualization'
      },
      {
        id: 3,
        title: 'Learning Path Tracker',
        description: 'Mobile app to track your learning journey and set goals',
        status: 'planned',
        difficulty: 'Advanced',
        technologies: ['React Native', 'Firebase', 'Redux'],
        likes: 12,
        views: 45,
        createdAt: '2024-02-01',
        tags: ['mobile', 'learning', 'react-native'],
        category: 'Mobile Development'
      }
    ];

    // Add more projects based on user interests
    if (userInterests.includes('Data Science') || userSkills.includes('Python')) {
      generatedProjects.push({
        id: 4,
        title: 'Data Analysis Tool',
        description: 'Python-based tool for analyzing and visualizing datasets',
        status: 'in-progress',
        difficulty: 'Advanced',
        technologies: ['Python', 'Pandas', 'Matplotlib'],
        githubUrl: 'https://github.com/user/data-tool',
        likes: 31,
        views: 127,
        createdAt: '2024-01-20',
        tags: ['data', 'python', 'analytics'],
        category: 'Data Science'
      });
    }

    if (userInterests.includes('AI/ML') || userSkills.includes('Machine Learning')) {
      generatedProjects.push({
        id: 5,
        title: 'AI Chatbot',
        description: 'Intelligent chatbot using natural language processing',
        status: 'planned',
        difficulty: 'Advanced',
        technologies: ['Python', 'TensorFlow', 'OpenAI API'],
        likes: 8,
        views: 23,
        createdAt: '2024-02-10',
        tags: ['ai', 'nlp', 'python'],
        category: 'Artificial Intelligence'
      });
    }

    setProjects(generatedProjects);

    // Calculate user stats
    const completedProjects = generatedProjects.filter(project => project.status === 'completed').length;
    const inProgressProjects = generatedProjects.filter(project => project.status === 'in-progress').length;
    const totalLikes = generatedProjects.reduce((total, project) => total + project.likes, 0);

    setUserStats({
      totalProjects: generatedProjects.length,
      completedProjects,
      inProgressProjects,
      totalLikes
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient styling matching landing page */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
          <FolderOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Projects
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Showcase your work, build your portfolio, and demonstrate your skills through real-world projects
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.totalProjects}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.completedProjects}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.inProgressProjects}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.totalLikes}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with New Project Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your Projects</h2>
          <p className="text-gray-600 mt-1">Manage and showcase your work</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              {project.category && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  {project.category}
                </Badge>
              )}

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{project.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.views}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {project.githubUrl && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Github className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                )}
                {project.liveUrl && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live
                  </Button>
                )}
                {!project.githubUrl && !project.liveUrl && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Code className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-8 text-center">
          <Code className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to build something amazing?</h3>
          <p className="text-gray-600 mb-4">
            Start a new project and showcase your skills to the world. Every project is a step forward in your journey.
          </p>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Start New Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
