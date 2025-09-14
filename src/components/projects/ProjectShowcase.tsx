import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  ExternalLink, 
  Github, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  Calendar,
  Tag,
  Code,
  Palette,
  Database,
  Globe,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: 'web' | 'mobile' | 'desktop' | 'data' | 'design' | 'other';
  status: 'completed' | 'in-progress' | 'planned';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  actualTime?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  isPublic: boolean;
  likes: number;
  views: number;
}

interface ProjectShowcaseProps {
  userId: string;
  isOwnProfile?: boolean;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Personal Portfolio Website',
    description: 'A modern, responsive portfolio website built with React and TypeScript',
    longDescription: 'A fully responsive portfolio website showcasing my projects and skills. Built with modern web technologies including React, TypeScript, Tailwind CSS, and deployed on Vercel. Features include dark mode, smooth animations, and a contact form.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    category: 'web',
    status: 'completed',
    difficulty: 'intermediate',
    estimatedTime: '2 weeks',
    actualTime: '1.5 weeks',
    githubUrl: 'https://github.com/user/portfolio',
    liveUrl: 'https://user-portfolio.vercel.app',
    imageUrl: '/api/placeholder/600/400',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['portfolio', 'react', 'typescript', 'responsive'],
    features: [
      'Responsive design for all devices',
      'Dark mode toggle',
      'Smooth page transitions',
      'Contact form with validation',
      'Project showcase with filtering'
    ],
    challenges: [
      'Implementing smooth animations without performance issues',
      'Creating a responsive design that works on all screen sizes',
      'Optimizing images for fast loading'
    ],
    learnings: [
      'Advanced React patterns and hooks',
      'TypeScript best practices',
      'CSS Grid and Flexbox mastery',
      'Performance optimization techniques'
    ],
    isPublic: true,
    likes: 24,
    views: 156
  },
  {
    id: '2',
    title: 'E-commerce Mobile App',
    description: 'A cross-platform mobile app for online shopping with React Native',
    longDescription: 'A feature-rich e-commerce mobile application built with React Native and Expo. Includes user authentication, product catalog, shopping cart, payment integration, and order tracking. The app supports both iOS and Android platforms.',
    technologies: ['React Native', 'Expo', 'Firebase', 'Stripe', 'Redux'],
    category: 'mobile',
    status: 'in-progress',
    difficulty: 'advanced',
    estimatedTime: '3 months',
    actualTime: '2 months',
    githubUrl: 'https://github.com/user/ecommerce-app',
    imageUrl: '/api/placeholder/600/400',
    createdAt: '2024-01-01',
    updatedAt: '2024-02-15',
    tags: ['mobile', 'ecommerce', 'react-native', 'firebase'],
    features: [
      'User authentication and profiles',
      'Product catalog with search and filters',
      'Shopping cart and wishlist',
      'Payment processing with Stripe',
      'Order tracking and history',
      'Push notifications'
    ],
    challenges: [
      'Implementing complex state management',
      'Integrating multiple third-party services',
      'Optimizing app performance on different devices',
      'Handling offline functionality'
    ],
    learnings: [
      'React Native development best practices',
      'Firebase integration and security rules',
      'Payment processing with Stripe',
      'Mobile app performance optimization'
    ],
    isPublic: true,
    likes: 18,
    views: 89
  },
  {
    id: '3',
    title: 'Data Visualization Dashboard',
    description: 'Interactive dashboard for analyzing sales data with D3.js and Python',
    longDescription: 'A comprehensive data visualization dashboard that processes and displays sales data from multiple sources. Built with Python for data processing, D3.js for interactive visualizations, and Flask for the backend API. Features real-time data updates and customizable charts.',
    technologies: ['Python', 'D3.js', 'Flask', 'PostgreSQL', 'Docker'],
    category: 'data',
    status: 'completed',
    difficulty: 'advanced',
    estimatedTime: '1 month',
    actualTime: '1.2 months',
    githubUrl: 'https://github.com/user/data-dashboard',
    liveUrl: 'https://data-dashboard.herokuapp.com',
    imageUrl: '/api/placeholder/600/400',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-20',
    tags: ['data-viz', 'python', 'd3js', 'dashboard'],
    features: [
      'Real-time data processing',
      'Interactive charts and graphs',
      'Customizable dashboard layouts',
      'Data export functionality',
      'User authentication and roles',
      'Responsive design'
    ],
    challenges: [
      'Handling large datasets efficiently',
      'Creating smooth animations for data updates',
      'Implementing complex filtering and aggregation',
      'Optimizing database queries'
    ],
    learnings: [
      'Advanced D3.js techniques',
      'Python data processing with Pandas',
      'Database optimization strategies',
      'Real-time data synchronization'
    ],
    isPublic: true,
    likes: 31,
    views: 203
  }
];

const CATEGORY_ICONS = {
  web: <Globe className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
  desktop: <Code className="h-4 w-4" />,
  data: <Database className="h-4 w-4" />,
  design: <Palette className="h-4 w-4" />,
  other: <Tag className="h-4 w-4" />
};

const CATEGORY_COLORS = {
  web: 'bg-blue-100 text-blue-800',
  mobile: 'bg-green-100 text-green-800',
  desktop: 'bg-purple-100 text-purple-800',
  data: 'bg-orange-100 text-orange-800',
  design: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800'
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  planned: 'bg-gray-100 text-gray-800'
};

export default function ProjectShowcase({ userId, isOwnProfile = false }: ProjectShowcaseProps) {
  const { user } = useAuth();
  const { 
    dashboardData, 
    createProject, 
    updateProject, 
    deleteProject, 
    isLoading 
  } = useUserContext();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load projects from dashboard data
  useEffect(() => {
    if (dashboardData?.projects) {
      const formattedProjects = dashboardData.projects.map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        longDescription: project.description, // Use description as long description for now
        technologies: project.technologies || [],
        category: project.category || 'other',
        status: project.status || 'planned',
        difficulty: project.difficulty_level || 'beginner',
        estimatedTime: project.estimated_duration || '1 week',
        actualTime: project.actual_duration,
        githubUrl: project.github_url,
        liveUrl: project.live_url,
        imageUrl: project.image_url,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        features: project.features || [],
        challenges: project.challenges || [],
        learnings: project.learnings || []
      }));
      setProjects(formattedProjects);
    }
  }, [dashboardData]);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedCategory, selectedStatus, projects]);

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  };

  const handleAddProject = async (projectData: Partial<Project>) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const success = await createProject({
        title: projectData.title || '',
        description: projectData.description || '',
        category: projectData.category || 'other',
        technologies: projectData.technologies || [],
        status: projectData.status || 'planned',
        difficulty_level: projectData.difficulty || 'beginner',
        estimated_duration: projectData.estimatedTime || '1 week',
        actual_duration: projectData.actualTime,
        github_url: projectData.githubUrl,
        live_url: projectData.liveUrl,
        image_url: projectData.imageUrl,
        features: projectData.features || [],
        challenges: projectData.challenges || [],
        learnings: projectData.learnings || []
      });

      if (success) {
        setIsAddProjectOpen(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProject = async (projectData: Partial<Project>) => {
    if (!editingProject) return;

    setIsSaving(true);
    try {
      const success = await updateProject(editingProject.id, {
        title: projectData.title || editingProject.title,
        description: projectData.description || editingProject.description,
        category: projectData.category || editingProject.category,
        technologies: projectData.technologies || editingProject.technologies,
        status: projectData.status || editingProject.status,
        difficulty_level: projectData.difficulty || editingProject.difficulty,
        estimated_duration: projectData.estimatedTime || editingProject.estimatedTime,
        actual_duration: projectData.actualTime || editingProject.actualTime,
        github_url: projectData.githubUrl || editingProject.githubUrl,
        live_url: projectData.liveUrl || editingProject.liveUrl,
        image_url: projectData.imageUrl || editingProject.imageUrl,
        features: projectData.features || editingProject.features,
        challenges: projectData.challenges || editingProject.challenges,
        learnings: projectData.learnings || editingProject.learnings
      });

      if (success) {
        setEditingProject(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsSaving(true);
    try {
      const success = await deleteProject(projectId);
      if (!success) {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];
  const statuses = ['all', ...Array.from(new Set(projects.map(p => p.status)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Showcase your work and track your progress</p>
        </div>
        {isOwnProfile && (
          <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Share your project with the community and track your progress
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                onSubmit={handleAddProject}
                onCancel={() => setIsAddProjectOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            {statuses.slice(1).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Code className="h-12 w-12" />
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                </div>
                {isOwnProfile && (
                  <div className="flex space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={CATEGORY_COLORS[project.category]}>
                    {CATEGORY_ICONS[project.category]}
                    <span className="ml-1">{project.category}</span>
                  </Badge>
                  <Badge className={STATUS_COLORS[project.status]}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={DIFFICULTY_COLORS[project.difficulty]}>
                    {project.difficulty}
                  </Badge>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map(tech => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.technologies.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {project.likes}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {project.views}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {project.githubUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Live
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters to see more projects.'
              : 'Start building your portfolio by adding your first project.'}
          </p>
        </div>
      )}

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project information
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              project={editingProject}
              onSubmit={handleEditProject}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Project Form Component
interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
}

function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    longDescription: project?.longDescription || '',
    technologies: project?.technologies.join(', ') || '',
    category: project?.category || 'other',
    status: project?.status || 'planned',
    difficulty: project?.difficulty || 'beginner',
    estimatedTime: project?.estimatedTime || '',
    actualTime: project?.actualTime || '',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    imageUrl: project?.imageUrl || '',
    tags: project?.tags.join(', ') || '',
    features: project?.features.join('\n') || '',
    challenges: project?.challenges.join('\n') || '',
    learnings: project?.learnings.join('\n') || '',
    isPublic: project?.isPublic ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      features: formData.features.split('\n').filter(Boolean),
      challenges: formData.challenges.split('\n').filter(Boolean),
      learnings: formData.learnings.split('\n').filter(Boolean)
    };

    onSubmit(projectData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="data">Data</option>
            <option value="design">Design</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Short Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="longDescription">Detailed Description</Label>
        <Textarea
          id="longDescription"
          value={formData.longDescription}
          onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input
          id="technologies"
          value={formData.technologies}
          onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
          placeholder="React, TypeScript, Node.js"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <Label htmlFor="estimatedTime">Estimated Time</Label>
          <Input
            id="estimatedTime"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            placeholder="2 weeks"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            type="url"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input
            id="liveUrl"
            type="url"
            value={formData.liveUrl}
            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="features">Key Features (one per line)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          rows={3}
          placeholder="Responsive design&#10;Dark mode toggle&#10;User authentication"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : (project ? 'Update Project' : 'Add Project')}
        </Button>
      </div>
    </form>
  );
}



