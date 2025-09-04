import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { projectService, Project, ProjectTemplate } from '@/lib/project-service';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Eye, 
  Heart, 
  MessageCircle,
  Code,
  Palette,
  Database,
  Smartphone,
  Globe,
  Target,
  CheckCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Share,
  Download,
  Upload,
  GitBranch,
  Settings,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Interfaces are now imported from project-service.ts

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform with React, Node.js, and PostgreSQL',
    category: 'web',
    status: 'in_progress',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    team_members: [
      { 
        id: '1', 
        project_id: '1',
        user_id: 'user1',
        role: 'Frontend Developer', 
        joined_at: '2024-01-15',
        is_active: true,
        user: { id: 'user1', full_name: 'John Doe', avatar_url: undefined }
      },
      { 
        id: '2', 
        project_id: '1',
        user_id: 'user2',
        role: 'Backend Developer', 
        joined_at: '2024-01-16',
        is_active: true,
        user: { id: 'user2', full_name: 'Jane Smith', avatar_url: undefined }
      }
    ],
    created_by: 'user1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    due_date: '2024-03-01T00:00:00Z',
    progress: 65,
    likes: 24,
    views: 156,
    repository_url: 'https://github.com/user/ecommerce-platform',
    live_url: 'https://ecommerce-demo.com',
    features: ['User Authentication', 'Product Catalog', 'Shopping Cart', 'Payment Processing'],
    challenges: ['Payment integration complexity', 'Performance optimization'],
    learnings: ['Stripe API integration', 'React performance optimization'],
    resources: ['React documentation', 'Stripe guides', 'PostgreSQL tutorials'],
    is_public: true,
    tags: ['ecommerce', 'fullstack', 'react', 'nodejs']
  },
  {
    id: '2',
    title: 'Mobile Fitness App',
    description: 'A React Native app for tracking workouts and nutrition',
    category: 'mobile',
    status: 'completed',
    technologies: ['React Native', 'Firebase', 'Redux'],
    team_members: [
      { 
        id: '3', 
        project_id: '2',
        user_id: 'user3',
        role: 'Mobile Developer', 
        joined_at: '2024-01-10',
        is_active: true,
        user: { id: 'user3', full_name: 'Mike Johnson', avatar_url: undefined }
      }
    ],
    created_by: 'user2',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-02-15T14:20:00Z',
    due_date: '2024-02-15T00:00:00Z',
    progress: 100,
    likes: 42,
    views: 289,
    repository_url: 'https://github.com/user/fitness-app',
    features: ['Workout Tracking', 'Nutrition Logging', 'Progress Charts', 'Social Features'],
    challenges: ['Offline functionality', 'Data synchronization'],
    learnings: ['React Native navigation', 'Firebase real-time database'],
    resources: ['React Native docs', 'Firebase tutorials'],
    is_public: true,
    tags: ['mobile', 'fitness', 'react-native', 'firebase']
  }
];

const projectTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'Todo App',
    description: 'A simple todo application with CRUD operations',
    category: 'web',
    technologies: ['React', 'Node.js', 'MongoDB'],
    estimated_duration: '2-3 weeks',
    difficulty: 'beginner',
    features: ['Add/Edit/Delete todos', 'Mark as complete', 'Filter todos'],
    resources: ['React tutorial', 'MongoDB setup guide']
  },
  {
    id: '2',
    name: 'Weather Dashboard',
    description: 'A weather dashboard with real-time data',
    category: 'web',
    technologies: ['Vue.js', 'API Integration', 'Chart.js'],
    estimated_duration: '1-2 weeks',
    difficulty: 'beginner',
    features: ['Current weather', 'Forecast', 'Location search', 'Charts'],
    resources: ['OpenWeather API', 'Vue.js docs', 'Chart.js tutorial']
  },
  {
    id: '3',
    name: 'Data Visualization Tool',
    description: 'A tool for creating interactive data visualizations',
    category: 'data',
    technologies: ['Python', 'D3.js', 'Flask'],
    estimated_duration: '4-6 weeks',
    difficulty: 'advanced',
    features: ['Data import', 'Chart creation', 'Interactive dashboards'],
    resources: ['D3.js documentation', 'Python pandas', 'Flask tutorial']
  }
];

const ProjectPlayground = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('my-projects');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: 'web',
    status: 'planned',
    technologies: [],
    features: [],
    tags: [],
    is_public: true
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load user's projects
        const { data: userProjects, error: projectsError } = await projectService.getUserProjects(user.id);
        if (userProjects && !projectsError) {
          setProjects(userProjects);
        } else {
          console.warn('Using mock data due to API error:', projectsError);
          setProjects(mockProjects);
        }

        // Load project templates
        const { data: templates, error: templatesError } = await projectService.getProjectTemplates();
        if (templates && !templatesError) {
          setProjectTemplates(templates);
        } else {
          console.warn('Using mock templates due to API error:', templatesError);
          setProjectTemplates([
            {
              id: '1',
              name: 'Todo App',
              description: 'A simple todo application with CRUD operations',
              category: 'web',
              technologies: ['React', 'Node.js', 'MongoDB'],
              estimated_duration: '2-3 weeks',
              difficulty: 'beginner',
              features: ['Add/Edit/Delete todos', 'Mark as complete', 'Filter todos'],
              resources: ['React tutorial', 'MongoDB setup guide'],
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const categories = ['all', 'web', 'mobile', 'desktop', 'data', 'design', 'other'];
  const statuses = ['all', 'planned', 'in_progress', 'completed', 'on_hold'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return <Globe className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Code className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'design': return <Palette className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description || !user) return;

    try {
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        category: newProject.category as any,
        status: newProject.status as any,
        technologies: newProject.technologies || [],
        created_by: user.id,
        progress: 0,
        likes: 0,
        views: 0,
        features: newProject.features || [],
        challenges: [],
        learnings: [],
        resources: [],
        is_public: newProject.is_public || true,
        tags: newProject.tags || []
      };

      const { data: createdProject, error } = await projectService.createProject(projectData);
      
      if (createdProject && !error) {
        setProjects(prev => [createdProject, ...prev]);
        setIsCreateDialogOpen(false);
        setNewProject({
          title: '',
          description: '',
          category: 'web',
          status: 'planned',
          technologies: [],
          features: [],
          tags: [],
          is_public: true
        });
      } else {
        console.error('Error creating project:', error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUseTemplate = (template: ProjectTemplate) => {
    setNewProject({
      title: template.name,
      description: template.description,
      category: template.category as any,
      status: 'planned',
      technologies: template.technologies,
      features: template.features,
      tags: [],
      is_public: true
    });
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Project Playground
          </h2>
          <p className="text-lg text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Project Playground
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build, collaborate, and showcase your projects with real-time team collaboration
        </p>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold">
                  {projects.reduce((acc, p) => acc + p.team_members.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
          <TabsTrigger value="public">Public Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Projects</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Title</label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newProject.category}
                        onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="web">Web</option>
                        <option value="mobile">Mobile</option>
                        <option value="desktop">Desktop</option>
                        <option value="data">Data</option>
                        <option value="design">Design</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryIcon(project.category)}
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{project.team_members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>{project.views}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech) => (
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

                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <h3 className="text-xl font-semibold">Project Templates</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>
                    <Badge className={getStatusColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{template.estimated_duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(template.category)}
                        <span className="capitalize">{template.category}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-6">
          <h3 className="text-xl font-semibold">Team Collaborations</h3>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active collaborations yet</p>
            <p className="text-sm text-gray-500">Join a project or invite others to collaborate</p>
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-6">
          <h3 className="text-xl font-semibold">Public Projects</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.filter(p => p.is_public).map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryIcon(project.category)}
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span>{project.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>{project.views}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
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

export default ProjectPlayground;
