import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Brain, 
  FileText, 
  MessageCircle, 
  Target, 
  Shield,
  Zap,
  Globe,
  Award
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Mentor Matchmaking",
    description: "AI-powered pairing with industry professionals who match your interests and career goals.",
    highlights: ["1:1 mentorship", "Industry experts", "Schedule flexibility"],
    comingSoon: false
  },
  {
    icon: Brain,
    title: "AI Career Therapist",
    description: "Emotional support and career guidance with human escalation when needed.",
    highlights: ["24/7 support", "Mood tracking", "Human backup"],
    comingSoon: false
  },
  {
    icon: FileText,
    title: "Living Resume",
    description: "Auto-updating portfolio that grows with your projects and achievements.",
    highlights: ["Auto-updates", "PDF export", "Skill tracking"],
    comingSoon: false
  },
  {
    icon: MessageCircle,
    title: "Virtual Career Coach",
    description: "Chat-based assistant providing personalized nudges and guidance.",
    highlights: ["Smart nudges", "Goal tracking", "Progress insights"],
    comingSoon: false
  },
  {
    icon: Target,
    title: "Project Playground",
    description: "Hands-on challenges and real-world projects to build your portfolio.",
    highlights: ["Real projects", "Peer collaboration", "Industry validation"],
    comingSoon: false
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description: "GDPR compliant with special protections for minors and parental consent flows.",
    highlights: ["Data encryption", "Parental controls", "GDPR compliant"],
    comingSoon: false
  },
  {
    icon: Zap,
    title: "Offline-First PWA",
    description: "Works seamlessly on 2G/3G networks with intelligent caching and sync.",
    highlights: ["Offline mode", "Low bandwidth", "Smart sync"],
    comingSoon: false
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in multiple languages with cultural adaptation for different regions.",
    highlights: ["10+ languages", "Cultural adapt", "Local content"],
    comingSoon: true
  },
  {
    icon: Award,
    title: "Certification Tracking",
    description: "Track your progress toward industry certifications and micro-credentials.",
    highlights: ["Cert pathways", "Progress tracking", "Industry recognition"],
    comingSoon: true
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need for Career Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI-powered guidance to hands-on projects, Nexa provides a comprehensive 
            platform designed specifically for young learners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className={`group hover:shadow-elevation transition-all duration-300 animate-slide-up ${
                feature.comingSoon ? 'border-accent/30 bg-accent/5' : 'hover:-translate-y-1'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    feature.comingSoon ? 'bg-accent/20' : 'bg-primary/10 group-hover:bg-primary/20'
                  } transition-colors duration-300`}>
                    <feature.icon className={`h-6 w-6 ${
                      feature.comingSoon ? 'text-accent' : 'text-primary'
                    }`} />
                  </div>
                  {feature.comingSoon && (
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Benefits:</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight) => (
                      <Badge 
                        key={highlight} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in" style={{animationDelay: "0.6s"}}>
          <p className="text-muted-foreground mb-6">
            Built with privacy, accessibility, and low-bandwidth environments in mind
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Shield className="h-4 w-4 mr-2" />
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Globe className="h-4 w-4 mr-2" />
              Works on 2G/3G
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Users className="h-4 w-4 mr-2" />
              Safe for Minors
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Zap className="h-4 w-4 mr-2" />
              Offline Ready
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;