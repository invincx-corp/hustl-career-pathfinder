import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Edit,
  Trophy,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Github,
  Linkedin,
  Star
} from "lucide-react";

interface Experience {
  id: string;
  type: "project" | "internship" | "certification" | "course";
  title: string;
  organization: string;
  duration: string;
  description: string;
  skills: string[];
  achievements?: string[];
  rating?: number;
}

interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
  bio: string;
  avatar: string;
}

const mockPersonalInfo: PersonalInfo = {
  name: "Alex Johnson",
  title: "Aspiring Software Developer",
  location: "San Francisco, CA",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  website: "alexjohnson.dev",
  github: "alexjohnson",
  linkedin: "alex-johnson-dev",
  bio: "Passionate about technology and innovation. Currently exploring web development and machine learning through hands-on projects and mentorship.",
  avatar: "/placeholder.svg"
};

const mockExperiences: Experience[] = [
  {
    id: "1",
    type: "project",
    title: "Personal Portfolio Website",
    organization: "Nexa Project Playground",
    duration: "March 2024 - April 2024",
    description: "Built a responsive portfolio website using React and Tailwind CSS, featuring dynamic content and smooth animations.",
    skills: ["React", "Tailwind CSS", "JavaScript", "Responsive Design"],
    achievements: ["Achieved 95% Lighthouse performance score", "Implemented accessibility best practices", "Deployed on Vercel with CI/CD"],
    rating: 4.8
  },
  {
    id: "2",
    type: "internship",
    title: "Junior Developer Intern",
    organization: "TechStart Inc.",
    duration: "June 2024 - August 2024",
    description: "Contributed to front-end development of customer dashboard, working with senior developers in an agile environment.",
    skills: ["Vue.js", "TypeScript", "Git", "Agile Methodology"],
    achievements: ["Reduced page load time by 30%", "Fixed 15+ bugs in legacy codebase", "Presented project to stakeholders"]
  },
  {
    id: "3",
    type: "certification",
    title: "AWS Cloud Practitioner",
    organization: "Amazon Web Services",
    duration: "September 2024",
    description: "Foundational certification covering cloud concepts, AWS services, security, and pricing models.",
    skills: ["Cloud Computing", "AWS Services", "Security", "Cost Optimization"]
  },
  {
    id: "4",
    type: "course",
    title: "Machine Learning Fundamentals",
    organization: "Coursera - Stanford University",
    duration: "October 2024 - December 2024",
    description: "Comprehensive course covering supervised and unsupervised learning algorithms, with hands-on Python implementations.",
    skills: ["Python", "Machine Learning", "Data Analysis", "Scikit-learn"],
    rating: 4.9
  }
];

const mockSkills = [
  { name: "JavaScript", level: 85, category: "Programming" },
  { name: "React", level: 80, category: "Frontend" },
  { name: "Python", level: 75, category: "Programming" },
  { name: "CSS/Tailwind", level: 90, category: "Frontend" },
  { name: "Git", level: 70, category: "Tools" },
  { name: "AWS", level: 60, category: "Cloud" },
];

const LivingResume = () => {
  const [activeTab, setActiveTab] = useState("preview");
  const [isEditing, setIsEditing] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project": return Trophy;
      case "internship": return MapPin;
      case "certification": return Star;
      case "course": return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project": return "bg-primary";
      case "internship": return "bg-success";
      case "certification": return "bg-accent";
      case "course": return "bg-secondary";
      default: return "bg-muted";
    }
  };

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented with a PDF generation library");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/resume/${mockPersonalInfo.name.toLowerCase().replace(' ', '-')}`);
    alert("Resume link copied to clipboard!");
  };

  if (activeTab === "preview") {
    return (
      <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Living Resume</h1>
                <p className="text-muted-foreground">Your automatically updated portfolio</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("edit")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="hero" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="bg-background border rounded-lg shadow-card p-8 space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {mockPersonalInfo.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{mockPersonalInfo.name}</h1>
                <p className="text-xl text-muted-foreground mb-4">{mockPersonalInfo.title}</p>
                <p className="text-muted-foreground max-w-2xl mx-auto">{mockPersonalInfo.bio}</p>
                
                <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {mockPersonalInfo.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {mockPersonalInfo.phone}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {mockPersonalInfo.location}
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {mockPersonalInfo.website}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold mb-4">Core Skills</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockSkills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xl font-bold mb-4">Experience & Projects</h2>
                <div className="space-y-6">
                  {mockExperiences.map((exp, index) => {
                    const Icon = getTypeIcon(exp.type);
                    return (
                      <div key={exp.id} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 ${getTypeColor(exp.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {index < mockExperiences.length - 1 && (
                            <div className="w-0.5 h-16 bg-border mt-2"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{exp.title}</h3>
                              <p className="text-muted-foreground">{exp.organization}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {exp.type}
                              </Badge>
                              {exp.rating && (
                                <div className="flex items-center mt-1">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs">{exp.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{exp.duration}</p>
                          <p className="text-sm mb-3">{exp.description}</p>
                          
                          {exp.achievements && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Key Achievements:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="text-success mr-2">•</span>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center">
                <div className="flex justify-center space-x-6">
                  <a href={`https://github.com/${mockPersonalInfo.github}`} className="flex items-center text-muted-foreground hover:text-primary">
                    <Github className="h-5 w-5 mr-2" />
                    GitHub
                  </a>
                  <a href={`https://linkedin.com/in/${mockPersonalInfo.linkedin}`} className="flex items-center text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5 mr-2" />
                    LinkedIn
                  </a>
                  <a href={`https://${mockPersonalInfo.website}`} className="flex items-center text-muted-foreground hover:text-primary">
                    <Globe className="h-5 w-5 mr-2" />
                    Portfolio
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This resume is automatically updated as you complete projects and gain new skills on Nexa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <FileText className="h-4 w-4 mr-2" />
            Living Resume
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Portfolio That Grows With You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your resume automatically updates as you complete projects, gain skills, and achieve milestones. 
            Always ready to share with mentors and potential employers.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="settings">
              <FileText className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input className="border rounded p-2" placeholder="Full Name" defaultValue={mockPersonalInfo.name} />
                <input className="border rounded p-2" placeholder="Professional Title" defaultValue={mockPersonalInfo.title} />
                <input className="border rounded p-2" placeholder="Email" defaultValue={mockPersonalInfo.email} />
                <input className="border rounded p-2" placeholder="Phone" defaultValue={mockPersonalInfo.phone} />
                <input className="border rounded p-2" placeholder="Location" defaultValue={mockPersonalInfo.location} />
                <input className="border rounded p-2" placeholder="Website" defaultValue={mockPersonalInfo.website} />
              </div>
              <textarea 
                className="border rounded p-2 w-full mt-4" 
                rows={3} 
                placeholder="Professional Bio" 
                defaultValue={mockPersonalInfo.bio}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Auto-Detected Achievements</h3>
              <p className="text-muted-foreground mb-4">
                These items were automatically added based on your Nexa activity
              </p>
              <div className="space-y-3">
                {mockExperiences.filter(exp => exp.type === "project").map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.organization}</p>
                    </div>
                    <Badge variant="default">Auto-added</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>
                Cancel
              </Button>
              <Button variant="hero" onClick={() => setActiveTab("preview")}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Resume</p>
                    <p className="text-sm text-muted-foreground">Allow others to view your resume via shared link</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Contact Information</p>
                    <p className="text-sm text-muted-foreground">Display email and phone on public resume</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-update</p>
                    <p className="text-sm text-muted-foreground">Automatically add completed projects and certifications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export Options</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Public Link
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default LivingResume;