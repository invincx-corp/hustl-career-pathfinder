import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  Video, 
  MessageCircle,
  Calendar,
  Filter,
  Search,
  Heart,
  Globe
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  totalSessions: number;
  domains: string[];
  languages: string[];
  timezone: string;
  hourlyRate: number;
  isOnline: boolean;
  nextAvailable: string;
  expertise: string[];
  bio: string;
  matchScore: number;
}

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    avatar: "/placeholder.svg",
    rating: 4.9,
    totalSessions: 127,
    domains: ["Technology", "AI/ML"],
    languages: ["English", "Mandarin"],
    timezone: "PST",
    hourlyRate: 75,
    isOnline: true,
    nextAvailable: "Today 3:00 PM",
    expertise: ["Python", "Machine Learning", "Career Guidance", "Interview Prep"],
    bio: "Passionate about helping young developers break into tech. 5+ years at Google working on AI systems.",
    matchScore: 95
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    title: "UX Design Lead",
    company: "Airbnb",
    avatar: "/placeholder.svg",
    rating: 4.8,
    totalSessions: 89,
    domains: ["Creative Arts", "Technology"],
    languages: ["English", "Spanish"],
    timezone: "EST",
    hourlyRate: 60,
    isOnline: false,
    nextAvailable: "Tomorrow 10:00 AM",
    expertise: ["Design Thinking", "Prototyping", "User Research", "Portfolio Building"],
    bio: "Design leader helping creators turn ideas into impactful products. Former startup founder.",
    matchScore: 87
  },
  {
    id: "3",
    name: "Dr. Priya Patel",
    title: "Research Scientist",
    company: "Johns Hopkins",
    avatar: "/placeholder.svg",
    rating: 4.9,
    totalSessions: 156,
    domains: ["Science & Research", "Healthcare"],
    languages: ["English", "Hindi"],
    timezone: "EST",
    hourlyRate: 50,
    isOnline: true,
    nextAvailable: "Today 7:00 PM",
    expertise: ["Research Methods", "Academic Writing", "PhD Guidance", "Grant Writing"],
    bio: "Supporting young researchers in biomedical sciences. Published 30+ papers, mentored 50+ students.",
    matchScore: 92
  }
];

const MentorMatchmaking = () => {
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const domains = ["All", "Technology", "Creative Arts", "Science & Research", "Business", "Healthcare"];

  const filteredMentors = mockMentors.filter(mentor => {
    const matchesDomain = selectedDomain === "All" || mentor.domains.includes(selectedDomain);
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
  };

  if (showBooking && selectedMentor) {
    return (
      <section id="mentors" className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => setShowBooking(false)}
              className="mb-6"
            >
              ← Back to Mentors
            </Button>

            <Card className="p-8 shadow-elevation">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={selectedMentor.avatar} />
                  <AvatarFallback>{selectedMentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2">Book Session with {selectedMentor.name}</h2>
                <p className="text-muted-foreground">{selectedMentor.title} at {selectedMentor.company}</p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Session Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        60 minutes
                      </li>
                      <li className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                        Video call on Zoom
                      </li>
                      <li className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        Follow-up resources included
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">What You'll Get</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Personalized career advice</li>
                      <li>• Industry insights & trends</li>
                      <li>• Resume/portfolio review</li>
                      <li>• Next steps action plan</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Select Time Slot</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Today 3:00 PM", "Today 5:00 PM", "Tomorrow 10:00 AM", "Tomorrow 2:00 PM"].map((time) => (
                      <Button key={time} variant="outline" className="justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Cost</span>
                    <span className="text-2xl font-bold">${selectedMentor.hourlyRate}</span>
                  </div>
                  <Button variant="hero" size="lg" className="w-full">
                    Book Session Now
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Protected by our satisfaction guarantee
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="mentors" className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
            <Users className="h-4 w-4 mr-2" />
            Mentor Matchmaking
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Learn from Industry Experts
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with professionals who've walked your path. Get personalized guidance, 
            career advice, and insider knowledge from people working at top companies.
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <Button
                    key={domain}
                    variant={selectedDomain === domain ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDomain(domain)}
                  >
                    {domain}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredMentors.map((mentor, index) => (
            <Card key={mentor.id} className="hover:shadow-elevation transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mentor.avatar} />
                      <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {mentor.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{mentor.name}</h3>
                        <p className="text-muted-foreground text-sm">{mentor.title}</p>
                        <p className="text-muted-foreground text-sm">{mentor.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-success font-medium">
                          <Heart className="h-3 w-3 mr-1" />
                          {mentor.matchScore}% match
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-muted-foreground ml-1">({mentor.totalSessions} sessions)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {mentor.timezone}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">EXPERTISE</h4>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">LANGUAGES</h4>
                    <div className="flex items-center space-x-2">
                      {mentor.languages.map((lang) => (
                        <div key={lang} className="flex items-center text-xs text-muted-foreground">
                          <Globe className="h-3 w-3 mr-1" />
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Next available</div>
                        <div className="text-sm font-medium">{mentor.nextAvailable}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${mentor.hourlyRate}</div>
                        <div className="text-xs text-muted-foreground">per hour</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => handleBookSession(mentor)}
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or domain filter.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MentorMatchmaking;