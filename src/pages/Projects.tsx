import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  Code,
  ExternalLink,
  Github,
  Star,
  Eye,
  Calendar
} from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Personal Portfolio Website',
      description: 'A modern, responsive portfolio website built with React and TypeScript',
      status: 'completed',
      difficulty: 'Beginner',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      githubUrl: 'https://github.com/user/portfolio',
      liveUrl: 'https://portfolio.example.com',
      likes: 24,
      views: 156,
      createdAt: '2024-01-15',
      tags: ['web', 'portfolio', 'react']
    },
    {
      id: 2,
      title: 'E-commerce Mobile App',
      description: 'A cross-platform mobile app for online shopping with React Native',
      status: 'in-progress',
      difficulty: 'Advanced',
      technologies: ['React Native', 'Firebase', 'Stripe'],
      githubUrl: 'https://github.com/user/ecommerce-app',
      likes: 18,
      views: 89,
      createdAt: '2024-01-01',
      tags: ['mobile', 'ecommerce', 'react-native']
    },
    {
      id: 3,
      title: 'Data Visualization Dashboard',
      description: 'Interactive dashboard for analyzing business metrics and KPIs',
      status: 'planned',
      difficulty: 'Intermediate',
      technologies: ['Python', 'Django', 'Chart.js'],
      likes: 12,
      views: 45,
      createdAt: '2024-02-01',
      tags: ['data', 'dashboard', 'python']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Showcase your work and build your portfolio</p>
        </div>
        <Button>
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
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
    </div>
  );
};

export default Projects;


