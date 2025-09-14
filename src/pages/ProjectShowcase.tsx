import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  Eye, 
  Code, 
  ExternalLink, 
  Plus,
  Search,
  Filter,
  Calendar,
  Tag
} from 'lucide-react';

export default function ProjectShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution with React, Node.js, and MongoDB',
      image: '/api/placeholder/400/250',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      status: 'completed',
      rating: 4.8,
      views: 1250,
      date: '2024-01-15',
      category: 'Web Development',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example'
    },
    {
      id: 2,
      title: 'AI Chatbot',
      description: 'Intelligent chatbot using OpenAI API and natural language processing',
      image: '/api/placeholder/400/250',
      technologies: ['Python', 'OpenAI', 'Flask', 'PostgreSQL'],
      status: 'in-progress',
      rating: 4.6,
      views: 890,
      date: '2024-01-10',
      category: 'AI/ML',
      liveUrl: null,
      githubUrl: 'https://github.com/example'
    },
    {
      id: 3,
      title: 'Mobile Weather App',
      description: 'Cross-platform weather application with real-time data',
      image: '/api/placeholder/400/250',
      technologies: ['React Native', 'TypeScript', 'Weather API'],
      status: 'completed',
      rating: 4.9,
      views: 2100,
      date: '2024-01-05',
      category: 'Mobile Development',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Showcase</h1>
          <p className="text-gray-600 mt-2">
            Showcase your projects and track their performance
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={selectedFilter === 'in-progress' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('in-progress')}
            >
              In Progress
            </Button>
          </div>
        </div>

        {/* Add Project Button */}
        <div className="mb-6">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="mt-1">{project.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{project.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Technologies */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Technologies</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Live Demo
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="flex-1">
                      <Code className="h-4 w-4 mr-1" />
                      Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first project'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}










