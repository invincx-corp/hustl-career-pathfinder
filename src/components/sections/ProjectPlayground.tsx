import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, 
  Users, 
  Code, 
  Trophy, 
  Clock, 
  Heart,
  Share2,
  Download,
  Play,
  CheckCircle,
  Star
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  participants: number;
  maxParticipants: number;
  skills: string[];
  mentor: {
    name: string;
    avatar: string;
    title: string;
  };
  progress?: number;
  isCompleted?: boolean;
  rating?: number;
  submittedBy?: number;
}

interface Submission {
  id: string;
  projectId: string;
  studentName: string;
  avatar: string;
  submittedAt: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  rating: number;
  feedback: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Build a Personal Portfolio Website",
    description: "Create a responsive portfolio website showcasing your skills and projects using modern web technologies.",
    domain: "Technology",
    difficulty: "Beginner",
    duration: "2 weeks",
    participants: 23,
    maxParticipants: 30,
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    mentor: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
      title: "Senior Developer at Google"
    },
    progress: 75,
    rating: 4.8
  },
  {
    id: "2",
    title: "Design a Mobile App for Local Business",
    description: "Partner with a real local business to design a mobile app that solves an actual problem they're facing.",
    domain: "Creative Arts",
    difficulty: "Intermediate",
    duration: "4 weeks",
    participants: 15,
    maxParticipants: 20,
    skills: ["UI/UX Design", "Figma", "User Research", "Prototyping"],
    mentor: {
      name: "Marcus Rodriguez",
      avatar: "/placeholder.svg",
      title: "Design Lead at Airbnb"
    },
    progress: 40,
    rating: 4.9
  },
  {
    id: "3",
    title: "Data Analysis: Climate Change Impact",
    description: "Analyze real climate data to identify trends and create visualizations that tell a compelling story.",
    domain: "Science & Research",
    difficulty: "Advanced",
    duration: "3 weeks",
    participants: 8,
    maxParticipants: 15,
    skills: ["Python", "Data Visualization", "Statistical Analysis", "Research Methods"],
    mentor: {
      name: "Dr. Priya Patel",
      avatar: "/placeholder.svg",
      title: "Research Scientist at Johns Hopkins"
    },
    isCompleted: true,
    rating: 4.7,
    submittedBy: 8
  }
];

const mockSubmissions: Submission[] = [
  {
    id: "1",
    projectId: "3",
    studentName: "Alex Johnson",
    avatar: "/placeholder.svg",
    submittedAt: "2 days ago",
    description: "Comprehensive analysis showing correlation between industrial activity and local temperature changes over the past decade.",
    githubUrl: "https://github.com/alexj/climate-analysis",
    liveUrl: "https://alexj-climate-viz.netlify.app",
    rating: 4.8,
    feedback: "Excellent work! Your data visualization clearly shows the trends and your methodology is sound."
  },
  {
    id: "2",
    projectId: "3",
    studentName: "Zoe Chen",
    avatar: "/placeholder.svg",
    submittedAt: "1 week ago",
    description: "Interactive dashboard exploring the relationship between sea level rise and coastal erosion patterns.",
    githubUrl: "https://github.com/zoechen/sea-level-dashboard",
    liveUrl: "https://sea-level-impact.vercel.app",
    rating: 4.9,
    feedback: "Outstanding visualization work! The interactive elements make complex data very accessible."
  }
];

const ProjectPlayground = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleJoinProject = (project: Project) => {
    alert(`Joined project: ${project.title}! You'll receive an email with next steps.`);
  };

  const ProjectCard = ({ project, showProgress = false }: { project: Project; showProgress?: boolean }) => (
    <Card className="hover:shadow-elevation transition-all duration-300 cursor-pointer" onClick={() => setSelectedProject(project)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant={project.difficulty === "Beginner" ? "secondary" : project.difficulty === "Intermediate" ? "default" : "destructive"}>
            {project.difficulty}
          </Badge>
          <Badge variant="outline">{project.domain}</Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {project.duration}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {project.participants}/{project.maxParticipants}
          </div>
          {project.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {project.rating}
            </div>
          )}
        </div>
        
        {showProgress && project.progress && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}
        
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">SKILLS YOU'LL LEARN</h4>
          <div className="flex flex-wrap gap-1">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 pt-2 border-t">
          <Avatar className="w-8 h-8">
            <AvatarImage src={project.mentor.avatar} />
            <AvatarFallback>{project.mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{project.mentor.name}</p>
            <p className="text-xs text-muted-foreground">{project.mentor.title}</p>
          </div>
          {project.isCompleted ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              handleJoinProject(project);
            }}>
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (selectedProject) {
    return (
      <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProject(null)}
              className="mb-6"
            >
              ← Back to Projects
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">{selectedProject.title}</h1>
                        <div className="flex items-center space-x-4">
                          <Badge variant={selectedProject.difficulty === "Beginner" ? "secondary" : selectedProject.difficulty === "Intermediate" ? "default" : "destructive"}>
                            {selectedProject.difficulty}
                          </Badge>
                          <Badge variant="outline">{selectedProject.domain}</Badge>
                          {selectedProject.rating && (
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {selectedProject.rating} ({selectedProject.submittedBy} submissions)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">{selectedProject.description}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedProject.participants}</div>
                        <div className="text-sm text-muted-foreground">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedProject.duration}</div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedProject.skills.length}</div>
                        <div className="text-sm text-muted-foreground">Skills</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {selectedProject.isCompleted && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Student Submissions</h3>
                    <div className="space-y-4">
                      {mockSubmissions.filter(s => s.projectId === selectedProject.id).map((submission) => (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={submission.avatar} />
                              <AvatarFallback>{submission.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{submission.studentName}</h4>
                                <div className="flex items-center text-sm">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                  {submission.rating}
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{submission.description}</p>
                              
                              <div className="flex items-center space-x-4">
                                {submission.githubUrl && (
                                  <Button variant="outline" size="sm">
                                    <Code className="h-4 w-4 mr-1" />
                                    GitHub
                                  </Button>
                                )}
                                {submission.liveUrl && (
                                  <Button variant="outline" size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    Live Demo
                                  </Button>
                                )}
                                <span className="text-xs text-muted-foreground">{submission.submittedAt}</span>
                              </div>
                              
                              <div className="mt-3 p-3 bg-muted rounded text-sm">
                                <strong>Mentor Feedback:</strong> {submission.feedback}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Project Mentor</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedProject.mentor.avatar} />
                      <AvatarFallback>{selectedProject.mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedProject.mentor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedProject.mentor.title}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Message Mentor
                  </Button>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Skills You'll Learn</h3>
                  <div className="space-y-2">
                    {selectedProject.skills.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm">{skill}</span>
                        <Badge variant="outline" className="text-xs">+50 XP</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="space-y-3">
                  {!selectedProject.isCompleted ? (
                    <Button variant="hero" size="lg" className="w-full" onClick={() => handleJoinProject(selectedProject)}>
                      <Users className="h-4 w-4 mr-2" />
                      Join Project
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resources
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Target className="h-4 w-4 mr-2" />
            Project Playground
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Build Real Projects, Gain Real Skills
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Work on hands-on projects with industry mentors. Collaborate with peers, 
            build your portfolio, and get real-world experience.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="available">Available Projects</TabsTrigger>
            <TabsTrigger value="active">My Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockProjects.filter(p => !p.isCompleted).map((project, index) => (
                <div key={project.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockProjects.filter(p => p.progress && !p.isCompleted).map((project, index) => (
                <div key={project.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <ProjectCard project={project} showProgress />
                </div>
              ))}
            </div>
            {mockProjects.filter(p => p.progress && !p.isCompleted).length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active projects</h3>
                <p className="text-muted-foreground mb-4">Join a project to start building!</p>
                <Button variant="hero" onClick={() => setActiveTab("available")}>
                  Browse Projects
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockProjects.filter(p => p.isCompleted).map((project, index) => (
                <div key={project.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProjectPlayground;