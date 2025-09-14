import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiService from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter,
  Download,
  Share,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Trash2,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Palette,
  Database,
  Smartphone,
  Globe as WebIcon,
  Calendar,
  Star,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  Check,
  Users
} from 'lucide-react';

interface ResumeSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'certifications';
  title: string;
  content: any;
  is_visible: boolean;
  order: number;
  last_updated: string;
}

interface PersonalInfo {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  bio?: string;
  avatar_url?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  achievements: string[];
}

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  certifications?: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  start_date: string;
  end_date?: string;
  is_featured: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'award' | 'certification' | 'publication' | 'recognition';
  issuer?: string;
  url?: string;
}

const mockPersonalInfo: PersonalInfo = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  github: 'https://github.com/johndoe',
  linkedin: 'https://linkedin.com/in/johndoe',
  twitter: 'https://twitter.com/johndoe',
  bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications. I love creating innovative solutions and mentoring junior developers.',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
};

const mockExperiences: Experience[] = [
  {
    id: '1',
    company: 'Tech Corp',
    position: 'Senior Full-Stack Developer',
    location: 'San Francisco, CA',
    start_date: '2022-01-01',
    is_current: true,
    description: 'Lead development of microservices architecture and mentor junior developers.',
    achievements: [
      'Reduced API response time by 40%',
      'Led team of 5 developers',
      'Implemented CI/CD pipeline'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']
  },
  {
    id: '2',
    company: 'StartupXYZ',
    position: 'Frontend Developer',
    location: 'Remote',
    start_date: '2020-06-01',
    end_date: '2021-12-31',
    is_current: false,
    description: 'Developed responsive web applications using modern JavaScript frameworks.',
    achievements: [
      'Built 10+ responsive web applications',
      'Improved user engagement by 25%',
      'Collaborated with design team'
    ],
    technologies: ['React', 'Vue.js', 'TypeScript', 'Sass', 'Webpack']
  }
];

const mockEducation: Education[] = [
  {
    id: '1',
    institution: 'University of California',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    start_date: '2016-09-01',
    end_date: '2020-05-31',
    gpa: '3.8',
    achievements: ['Dean\'s List', 'Computer Science Honor Society']
  }
];

const mockSkills: Skill[] = [
  { id: '1', name: 'JavaScript', category: 'technical', level: 'expert', years_experience: 5 },
  { id: '2', name: 'React', category: 'technical', level: 'advanced', years_experience: 4 },
  { id: '3', name: 'Node.js', category: 'technical', level: 'advanced', years_experience: 3 },
  { id: '4', name: 'Leadership', category: 'soft', level: 'intermediate', years_experience: 2 },
  { id: '5', name: 'English', category: 'language', level: 'expert' },
  { id: '6', name: 'Spanish', category: 'language', level: 'intermediate' }
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React and Node.js',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    url: 'https://ecommerce-demo.com',
    github_url: 'https://github.com/johndoe/ecommerce',
    start_date: '2023-01-01',
    end_date: '2023-06-30',
    is_featured: true
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Collaborative task management tool with real-time updates',
    technologies: ['Vue.js', 'Socket.io', 'MongoDB'],
    github_url: 'https://github.com/johndoe/taskmanager',
    start_date: '2022-08-01',
    end_date: '2022-12-31',
    is_featured: true
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'AWS Certified Solutions Architect',
    description: 'Professional certification in cloud architecture',
    date: '2023-03-15',
    category: 'certification',
    issuer: 'Amazon Web Services',
    url: 'https://aws.amazon.com/certification/'
  },
  {
    id: '2',
    title: 'Best Innovation Award',
    description: 'Recognized for innovative approach to microservices architecture',
    date: '2023-01-20',
    category: 'award',
    issuer: 'Tech Corp'
  }
];

const LivingResume = () => {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(mockPersonalInfo);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumeData();
  }, [user]);

  const loadResumeData = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      // Load user profile for personal info
      const profileResult = await ApiService.getUserProfile(user.id);
      if (profileResult.success && profileResult.data) {
        const profile = profileResult.data;
        setPersonalInfo({
          full_name: profile.full_name || user.email || 'User',
          email: user.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          website: profile.website || '',
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          twitter: profile.twitter || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || ''
        });
      }

      // Load user skills
      const skillsResult = await ApiService.getUserSkills(user.id);
      if (skillsResult.success) {
        const mappedSkills: Skill[] = skillsResult.data.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category || 'technical',
          level: skill.current_level >= 8 ? 'expert' : 
                 skill.current_level >= 6 ? 'advanced' :
                 skill.current_level >= 4 ? 'intermediate' : 'beginner',
          years_experience: Math.floor(skill.total_time_spent / 365) || 0,
          certifications: skill.certifications || []
        }));
        setSkills(mappedSkills);
      }

      // Load user projects
      const projectsResult = await ApiService.getUserProjects(user.id);
      if (projectsResult.success) {
        const mappedProjects: Project[] = projectsResult.data.map((project: any) => ({
          id: project.id,
          name: project.title,
          description: project.description,
          technologies: project.technologies || [],
          url: project.url || '',
          github_url: project.github_url || '',
          start_date: project.created_at,
          end_date: project.completed_at || '',
          is_featured: project.is_featured || false
        }));
        setProjects(mappedProjects);
      }

      // Load user achievements
      const achievementsResult = await ApiService.getUserAchievements(user.id);
      if (achievementsResult.success) {
        const mappedAchievements: Achievement[] = achievementsResult.data.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          date: achievement.unlocked_at,
          category: achievement.category || 'award',
          issuer: achievement.issuer || '',
          url: achievement.url || ''
        }));
        setAchievements(mappedAchievements);
      }

      // Load resume sections from database
      const resumeSectionsResult = await ApiService.getResumeSections(user.id);
      if (resumeSectionsResult.success) {
        const sections = resumeSectionsResult.data;
        
        // Process experience sections
        const experienceSections = sections.filter((s: any) => s.type === 'experience');
        if (experienceSections.length > 0) {
          const mappedExperiences: Experience[] = experienceSections.map((section: any) => ({
            id: section.id,
            company: section.content.company || '',
            position: section.content.position || '',
            location: section.content.location || '',
            start_date: section.content.start_date || '',
            end_date: section.content.end_date || '',
            is_current: section.content.is_current || false,
            description: section.content.description || '',
            achievements: section.content.achievements || [],
            technologies: section.content.technologies || []
          }));
          setExperiences(mappedExperiences);
        }

        // Process education sections
        const educationSections = sections.filter((s: any) => s.type === 'education');
        if (educationSections.length > 0) {
          const mappedEducation: Education[] = educationSections.map((section: any) => ({
            id: section.id,
            institution: section.content.institution || '',
            degree: section.content.degree || '',
            field: section.content.field || '',
            start_date: section.content.start_date || '',
            end_date: section.content.end_date || '',
            gpa: section.content.gpa || '',
            achievements: section.content.achievements || []
          }));
          setEducation(mappedEducation);
        }
      }

    } catch (error) {
      console.error('Error loading resume data:', error);
      // Fallback to mock data
      setExperiences(mockExperiences);
      setEducation(mockEducation);
      setSkills(mockSkills);
      setProjects(mockProjects);
      setAchievements(mockAchievements);
    } finally {
      setIsLoading(false);
    }
  };

  const updateResumeSection = async (sectionId: string, updates: any) => {
    try {
      if (!user?.id) return;

      const result = await ApiService.updateResumeSection(sectionId, updates);
      
      if (result.success) {
        // Reload resume data to reflect changes
        loadResumeData();
        
        // Track the activity
        await ApiService.trackUserActivity(user.id, {
          activity_type: 'resume_update',
          activity_name: 'Updated resume section',
          category: 'living_resume',
          page_url: '/living-resume',
          metadata: {
            section_id: sectionId,
            updates: updates,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error updating resume section:', error);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="h-4 w-4" />;
      case 'soft': return <Users className="h-4 w-4" />;
      case 'language': return <Globe className="h-4 w-4" />;
      case 'tool': return <Settings className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'award': return <Award className="h-4 w-4" />;
      case 'certification': return <FileText className="h-4 w-4" />;
      case 'publication': return <BookOpen className="h-4 w-4" />;
      case 'recognition': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log('Exporting to PDF...');
  };

  const handleShareResume = async () => {
    try {
      const url = `${window.location.origin}/resume/${user?.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error sharing resume:', error);
    }
  };

  const handleToggleVisibility = (section: string, isVisible: boolean) => {
    // In a real app, this would update the database
    console.log(`Toggling ${section} visibility to ${isVisible}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Living Resume
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your resume that automatically updates as you learn, build, and achieve
        </p>
      </div>

      {/* Resume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-2xl font-bold">{experiences.length} positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Skills</p>
                <p className="text-2xl font-bold">{skills.length} skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length} awards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={handleShareResume}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Share className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Share Resume'}
        </Button>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Preview' : 'Edit'}
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Privacy Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  {personalInfo.avatar_url ? (
                    <img 
                      src={personalInfo.avatar_url} 
                      alt={personalInfo.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{personalInfo.full_name}</h1>
                <p className="text-lg text-gray-600 mb-4">{personalInfo.bio}</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{personalInfo.email}</span>
                  </div>
                  {personalInfo.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {personalInfo.website && (
                    <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <WebIcon className="h-5 w-5" />
                    </a>
                  )}
                  {personalInfo.github && (
                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {personalInfo.linkedin && (
                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-6 w-6 mr-2" />
                  Experience
                </h2>
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600">{exp.location}</p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>{new Date(exp.start_date).toLocaleDateString()} - {exp.is_current ? 'Present' : new Date(exp.end_date!).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Code className="h-6 w-6 mr-2" />
                  Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['technical', 'soft', 'language', 'tool'].map((category) => {
                    const categorySkills = skills.filter(skill => skill.category === category);
                    if (categorySkills.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="font-semibold text-gray-900 capitalize flex items-center">
                          {getCategoryIcon(category)}
                          <span className="ml-2">{category} Skills</span>
                        </h3>
                        <div className="space-y-1">
                          {categorySkills.map((skill) => (
                            <div key={skill.id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">{skill.name}</span>
                              <Badge className={getSkillLevelColor(skill.level)}>
                                {skill.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Code className="h-6 w-6 mr-2" />
                  Featured Projects
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.filter(p => p.is_featured).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex space-x-2">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  Achievements & Certifications
                </h2>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getAchievementIcon(achievement.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.issuer && (
                          <p className="text-sm text-blue-600">{achievement.issuer}</p>
                        )}
                        <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={personalInfo.full_name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Make resume public</p>
                    <p className="text-sm text-gray-600">Allow others to view your resume</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show contact information</p>
                    <p className="text-sm text-gray-600">Display email and phone number</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show social links</p>
                    <p className="text-sm text-gray-600">Display GitHub, LinkedIn, etc.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resume Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-3xl font-bold">1,234</p>
                  <p className="text-sm text-gray-600">Total views this month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Experience</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills</span>
                    <span className="font-semibold">72%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projects</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievements</span>
                    <span className="font-semibold">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LivingResume;
