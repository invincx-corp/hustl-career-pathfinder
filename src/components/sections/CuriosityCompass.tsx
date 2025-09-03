import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Palette, 
  Calculator, 
  Heart, 
  Briefcase, 
  Globe, 
  ArrowRight,
  RotateCcw,
  Compass
} from "lucide-react";
import curiosityImage from "@/assets/curiosity-compass.jpg";

interface Domain {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  skills: string[];
  careers: string[];
}

const domains: Domain[] = [
  {
    id: "technology",
    name: "Technology",
    icon: Code,
    description: "Build the future with code, AI, and innovation",
    color: "bg-blue-500",
    skills: ["Programming", "AI/ML", "Web Development", "Cybersecurity"],
    careers: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"]
  },
  {
    id: "creative",
    name: "Creative Arts",
    icon: Palette,
    description: "Express yourself through design, media, and storytelling",
    color: "bg-pink-500",
    skills: ["Design", "Video Editing", "Content Creation", "Animation"],
    careers: ["UX Designer", "Content Creator", "Art Director", "Animator"]
  },
  {
    id: "science",
    name: "Science & Research",
    icon: Calculator,
    description: "Discover, analyze, and solve complex problems",
    color: "bg-green-500",
    skills: ["Research", "Data Analysis", "Laboratory Work", "Scientific Writing"],
    careers: ["Research Scientist", "Lab Technician", "Environmental Scientist", "Biotech Researcher"]
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Heart,
    description: "Heal, care, and improve quality of life",
    color: "bg-red-500",
    skills: ["Patient Care", "Medical Knowledge", "Empathy", "Emergency Response"],
    careers: ["Nurse", "Doctor", "Therapist", "Medical Technician"]
  },
  {
    id: "business",
    name: "Business & Finance",
    icon: Briefcase,
    description: "Lead, strategize, and drive economic growth",
    color: "bg-yellow-500",
    skills: ["Leadership", "Financial Analysis", "Strategy", "Communication"],
    careers: ["Business Analyst", "Financial Advisor", "Entrepreneur", "Marketing Manager"]
  },
  {
    id: "social",
    name: "Social Impact",
    icon: Globe,
    description: "Create positive change in communities and society",
    color: "bg-purple-500",
    skills: ["Community Engagement", "Policy Analysis", "Advocacy", "Program Management"],
    careers: ["Social Worker", "Policy Analyst", "NGO Coordinator", "Community Organizer"]
  }
];

const CuriosityCompass = () => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        return prev.filter(id => id !== domainId);
      } else {
        return [...prev, domainId];
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < domains.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setSelectedDomains([]);
    setCurrentIndex(0);
    setShowResults(false);
  };

  const currentDomain = domains[currentIndex];
  const selectedDomainsData = domains.filter(d => selectedDomains.includes(d.id));

  if (showResults) {
    return (
      <section id="explore" className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
              <Compass className="h-4 w-4 mr-2" />
              Compass Results
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Interest Profile
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your selections, here are your top interests and recommended next steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {selectedDomainsData.map((domain, index) => (
              <Card key={domain.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${domain.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <domain.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{domain.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{domain.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Key Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {domain.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Career Paths:</h4>
                          <div className="flex flex-wrap gap-1">
                            {domain.careers.slice(0, 2).map((career) => (
                              <Badge key={career} variant="outline" className="text-xs">
                                {career}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button variant="hero" size="lg" className="group">
              Generate My Roadmap
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" onClick={handleReset} className="ml-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Compass
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="explore" className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Compass className="h-4 w-4 mr-2" />
            Curiosity Compass
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Discover What Excites You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore different career domains through an interactive journey. 
            Select the areas that spark your curiosity and we'll help map your path.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentIndex + 1} of {domains.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedDomains.length} interests selected
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / domains.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Domain Card */}
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
            <div className="animate-slide-up">
              <Card className="p-8 shadow-elevation hover:shadow-glow transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 ${currentDomain.color} rounded-full flex items-center justify-center mx-auto`}>
                      <currentDomain.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{currentDomain.name}</h3>
                      <p className="text-muted-foreground mb-4">{currentDomain.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Skills You'll Develop:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {currentDomain.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Potential Career Paths:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {currentDomain.careers.map((career) => (
                            <Badge key={career} variant="outline">
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDomainSelect(currentDomain.id)}
                      variant={selectedDomains.includes(currentDomain.id) ? "success" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {selectedDomains.includes(currentDomain.id) ? "Selected ✓" : "I'm Interested"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Element */}
            <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
              <img
                src={curiosityImage}
                alt="Curiosity compass illustration showing different career paths"
                className="w-full h-auto rounded-2xl shadow-card"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {domains.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                ></div>
              ))}
            </div>

            <Button
              onClick={handleNext}
              variant="hero"
            >
              {currentIndex === domains.length - 1 ? 'See Results' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CuriosityCompass;