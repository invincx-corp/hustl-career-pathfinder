import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Heart, 
  TrendingUp, 
  Target,
  BookOpen,
  Code,
  Palette,
  Calculator,
  Globe,
  Briefcase,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  X,
  RotateCcw,
  CheckCircle,
  Clock,
  ThumbsUp
} from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  skills: string[];
  careers: string[];
  interestLevel: number;
  lastInteracted: string;
  totalInteractions: number;
}

interface CareerCard {
  id: string;
  title: string;
  company: string;
  description: string;
  salary: string;
  location: string;
  requirements: string[];
  benefits: string[];
  category: string;
  difficulty: 'entry' | 'mid' | 'senior';
  growth: number;
  image: string;
}

interface UserChoice {
  careerId: string;
  choice: 'interested' | 'maybe' | 'not_interested';
  timestamp: Date;
}

interface InterestProfile {
  topCategories: string[];
  preferredDifficulty: string;
  averageGrowth: number;
  totalChoices: number;
  interestedCount: number;
  maybeCount: number;
  notInterestedCount: number;
}

const CuriosityCompass = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  
  // Card system states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const [careerCards, setCareerCards] = useState<CareerCard[]>([]);
  const [interestProfile, setInterestProfile] = useState<InterestProfile | null>(null);

  const domainIcons = {
    technology: Code,
    creative: Palette,
    science: Calculator,
    healthcare: Heart,
    business: Briefcase,
    social: Users,
    education: BookOpen,
    arts: Star
  };

  // Mock career cards - in real implementation, this would come from an API
  const mockCareerCards: CareerCard[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Startup',
      description: 'Build beautiful and responsive user interfaces using React, TypeScript, and modern web technologies.',
      salary: '₹6-12 LPA',
      location: 'Remote/Bangalore',
      requirements: ['React', 'TypeScript', 'CSS', 'Git'],
      benefits: ['Flexible hours', 'Stock options', 'Learning budget'],
      category: 'Technology',
      difficulty: 'entry',
      growth: 85,
      image: '💻'
    },
    {
      id: '2',
      title: 'UX Designer',
      company: 'Design Agency',
      description: 'Create intuitive and user-centered designs for web and mobile applications.',
      salary: '₹5-10 LPA',
      location: 'Mumbai',
      requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      benefits: ['Creative freedom', 'Latest tools', 'Design conferences'],
      category: 'Design',
      difficulty: 'entry',
      growth: 75,
      image: '🎨'
    },
    {
      id: '3',
      title: 'Data Scientist',
      company: 'Fintech Company',
      description: 'Analyze complex data to drive business decisions and build predictive models.',
      salary: '₹8-15 LPA',
      location: 'Hyderabad',
      requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      benefits: ['High impact', 'Cutting-edge tech', 'Research opportunities'],
      category: 'Data Science',
      difficulty: 'mid',
      growth: 90,
      image: '📊'
    },
    {
      id: '4',
      title: 'Digital Marketing Manager',
      company: 'E-commerce Platform',
      description: 'Develop and execute digital marketing strategies to drive growth and engagement.',
      salary: '₹4-8 LPA',
      location: 'Delhi',
      requirements: ['SEO/SEM', 'Social Media', 'Analytics', 'Content Strategy'],
      benefits: ['Performance bonuses', 'Marketing tools', 'Team leadership'],
      category: 'Marketing',
      difficulty: 'mid',
      growth: 70,
      image: '📈'
    },
    {
      id: '5',
      title: 'Product Manager',
      company: 'SaaS Company',
      description: 'Lead product development from conception to launch, working with cross-functional teams.',
      salary: '₹10-20 LPA',
      location: 'Bangalore',
      requirements: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
      benefits: ['High responsibility', 'Strategic impact', 'Leadership growth'],
      category: 'Product',
      difficulty: 'senior',
      growth: 80,
      image: '🚀'
    },
    {
      id: '6',
      title: 'Content Writer',
      company: 'Media Company',
      description: 'Create engaging content for blogs, social media, and marketing campaigns.',
      salary: '₹3-6 LPA',
      location: 'Remote',
      requirements: ['Writing Skills', 'SEO', 'Research', 'Social Media'],
      benefits: ['Creative writing', 'Flexible schedule', 'Portfolio building'],
      category: 'Content',
      difficulty: 'entry',
      growth: 60,
      image: '✍️'
    },
    {
      id: '7',
      title: 'DevOps Engineer',
      company: 'Cloud Platform',
      description: 'Manage infrastructure, deployment pipelines, and ensure system reliability.',
      salary: '₹8-16 LPA',
      location: 'Pune',
      requirements: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD'],
      benefits: ['High demand', 'Cloud expertise', 'Automation focus'],
      category: 'Technology',
      difficulty: 'mid',
      growth: 85,
      image: '⚙️'
    },
    {
      id: '8',
      title: 'Business Analyst',
      company: 'Consulting Firm',
      description: 'Analyze business processes and recommend solutions to improve efficiency.',
      salary: '₹5-10 LPA',
      location: 'Chennai',
      requirements: ['Analytics', 'Process Mapping', 'Stakeholder Management', 'Documentation'],
      benefits: ['Business exposure', 'Problem solving', 'Client interaction'],
      category: 'Business',
      difficulty: 'mid',
      growth: 65,
      image: '📋'
    },
    {
      id: '9',
      title: 'Mobile App Developer',
      company: 'Gaming Studio',
      description: 'Develop mobile applications for iOS and Android platforms.',
      salary: '₹6-12 LPA',
      location: 'Gurgaon',
      requirements: ['React Native', 'iOS/Android', 'API Integration', 'App Store'],
      benefits: ['Creative projects', 'Gaming industry', 'App portfolio'],
      category: 'Technology',
      difficulty: 'entry',
      growth: 75,
      image: '📱'
    },
    {
      id: '10',
      title: 'Sales Executive',
      company: 'SaaS Startup',
      description: 'Drive sales growth by building relationships with potential clients.',
      salary: '₹4-8 LPA + Commission',
      location: 'Mumbai',
      requirements: ['Communication', 'CRM', 'Negotiation', 'Industry Knowledge'],
      benefits: ['High earning potential', 'Client relationships', 'Sales skills'],
      category: 'Sales',
      difficulty: 'entry',
      growth: 70,
      image: '💼'
    }
  ];

  useEffect(() => {
    // Load user's real interest data from database and career cards
    loadUserInterests();
    loadCareerData();
  }, [user]);

  const loadUserInterests = async () => {
    try {
      // TODO: Replace with real API call to get user's interest data
      // For now, we'll use the user's stored interests from their profile
      const userInterests = user?.interests || [];
      const userSkills = user?.skills || [];
      
      // Generate domains based on user's actual interests, skills, and card choices
      const generatedDomains: Domain[] = [
        {
          id: 'technology',
          name: 'Technology',
          icon: Code,
          description: 'Build the future with code, AI, and innovation',
          color: 'bg-blue-500',
          skills: ['Programming', 'AI/ML', 'Web Development', 'Cybersecurity'],
          careers: ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'],
          interestLevel: calculateInterestLevel('Technology', userInterests, userChoices),
          lastInteracted: '2 hours ago',
          totalInteractions: 23
        },
        {
          id: 'creative',
          name: 'Creative Arts',
          icon: Palette,
          description: 'Express yourself through design, media, and storytelling',
          color: 'bg-pink-500',
          skills: ['Design', 'Video Editing', 'Content Creation', 'Animation'],
          careers: ['UX Designer', 'Content Creator', 'Art Director', 'Animator'],
          interestLevel: calculateInterestLevel('Design', userInterests, userChoices),
          lastInteracted: '1 day ago',
          totalInteractions: 15
        },
        {
          id: 'science',
          name: 'Science & Research',
          icon: Calculator,
          description: 'Discover, analyze, and solve complex problems',
          color: 'bg-green-500',
          skills: ['Research', 'Data Analysis', 'Laboratory Work', 'Scientific Writing'],
          careers: ['Research Scientist', 'Lab Technician', 'Environmental Scientist', 'Biotech Researcher'],
          interestLevel: calculateInterestLevel('Data Science', userInterests, userChoices),
          lastInteracted: '3 days ago',
          totalInteractions: 8
        },
        {
          id: 'healthcare',
          name: 'Healthcare',
          icon: Heart,
          description: 'Heal, care, and improve quality of life',
          color: 'bg-red-500',
          skills: ['Patient Care', 'Medical Knowledge', 'Empathy', 'Emergency Response'],
          careers: ['Nurse', 'Doctor', 'Therapist', 'Medical Technician'],
          interestLevel: calculateInterestLevel('Healthcare', userInterests, userChoices),
          lastInteracted: '1 week ago',
          totalInteractions: 5
        },
        {
          id: 'business',
          name: 'Business & Finance',
          icon: Briefcase,
          description: 'Lead, strategize, and drive economic growth',
          color: 'bg-yellow-500',
          skills: ['Leadership', 'Financial Analysis', 'Strategy', 'Communication'],
          careers: ['Business Analyst', 'Financial Advisor', 'Entrepreneur', 'Marketing Manager'],
          interestLevel: calculateInterestLevel('Business', userInterests, userChoices),
          lastInteracted: '2 days ago',
          totalInteractions: 12
        },
        {
          id: 'social',
          name: 'Social Impact',
          icon: Users,
          description: 'Make a difference in communities and society',
          color: 'bg-purple-500',
          skills: ['Community Service', 'Social Work', 'Advocacy', 'Public Speaking'],
          careers: ['Social Worker', 'Community Organizer', 'Policy Analyst', 'Non-profit Manager'],
          interestLevel: calculateInterestLevel('Social Impact', userInterests, userChoices),
          lastInteracted: '4 days ago',
          totalInteractions: 7
        }
      ];

      setDomains(generatedDomains);
      setUserInterests(userInterests);
    } catch (error) {
      console.error('Error loading user interests:', error);
    }
  };

  const calculateInterestLevel = (category: string, userInterests: string[], userChoices: UserChoice[]) => {
    let baseLevel = 30; // Default level
    
    // Check if user has interests in this category
    if (userInterests.some(interest => 
      interest.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(interest.toLowerCase())
    )) {
      baseLevel += 30;
    }
    
    // Check card choices for this category
    const interestedChoices = userChoices.filter(c => c.choice === 'interested');
    const maybeChoices = userChoices.filter(c => c.choice === 'maybe');
    
    // Find careers in this category that user showed interest in
    const categoryCareers = careerCards.filter(card => card.category === category);
    const interestedCategoryCareers = categoryCareers.filter(card => 
      interestedChoices.some(choice => choice.careerId === card.id)
    );
    const maybeCategoryCareers = categoryCareers.filter(card => 
      maybeChoices.some(choice => choice.careerId === card.id)
    );
    
    // Boost interest level based on card choices
    baseLevel += (interestedCategoryCareers.length * 15) + (maybeCategoryCareers.length * 8);
    
    return Math.min(baseLevel, 95); // Cap at 95%
  };

  const loadCareerData = async () => {
    try {
      // TODO: Replace with real API call
      // For now, shuffle the mock data to simulate unlimited cards
      const shuffledCards = [...mockCareerCards].sort(() => Math.random() - 0.5);
      setCareerCards(shuffledCards);
      
      // Load user's previous choices if any
      const savedChoices = localStorage.getItem(`curiosity_choices_${user?.id}`);
      if (savedChoices) {
        setUserChoices(JSON.parse(savedChoices));
      }
    } catch (error) {
      console.error('Error loading career data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = (choice: 'interested' | 'maybe' | 'not_interested') => {
    if (currentCardIndex >= careerCards.length) return;

    const currentCard = careerCards[currentCardIndex];
    const newChoice: UserChoice = {
      careerId: currentCard.id,
      choice,
      timestamp: new Date()
    };

    const updatedChoices = [...userChoices, newChoice];
    setUserChoices(updatedChoices);

    // Save to localStorage
    localStorage.setItem(`curiosity_choices_${user?.id}`, JSON.stringify(updatedChoices));

    // Refresh domains with updated interest levels
    loadUserInterests();

    // Move to next card
    if (currentCardIndex < careerCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Generate more cards or show results
      generateMoreCards();
    }
  };

  const generateMoreCards = () => {
    // In a real implementation, this would fetch more cards from an API
    // For now, we'll shuffle the existing cards and add them
    const moreCards = [...mockCareerCards].sort(() => Math.random() - 0.5);
    setCareerCards([...careerCards, ...moreCards]);
    setCurrentCardIndex(currentCardIndex + 1);
  };

  const showResultsNow = () => {
    if (userChoices.length < 5) {
      alert('Please make at least 5 choices to see your interest profile!');
      return;
    }
    generateInterestProfile();
    setActiveTab('results');
  };

  const generateInterestProfile = () => {
    const interestedChoices = userChoices.filter(c => c.choice === 'interested');
    const maybeChoices = userChoices.filter(c => c.choice === 'maybe');
    const notInterestedChoices = userChoices.filter(c => c.choice === 'not_interested');

    // Get categories of interested careers
    const interestedCareers = careerCards.filter(card => 
      interestedChoices.some(choice => choice.careerId === card.id)
    );

    const categoryCounts: { [key: string]: number } = {};
    interestedCareers.forEach(career => {
      categoryCounts[career.category] = (categoryCounts[career.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Calculate average growth for interested careers
    const averageGrowth = interestedCareers.length > 0 
      ? Math.round(interestedCareers.reduce((sum, career) => sum + career.growth, 0) / interestedCareers.length)
      : 0;

    // Determine preferred difficulty level
    const difficultyCounts: { [key: string]: number } = {};
    interestedCareers.forEach(career => {
      difficultyCounts[career.difficulty] = (difficultyCounts[career.difficulty] || 0) + 1;
    });

    const preferredDifficulty = Object.entries(difficultyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'entry';

    const profile: InterestProfile = {
      topCategories,
      preferredDifficulty,
      averageGrowth,
      totalChoices: userChoices.length,
      interestedCount: interestedChoices.length,
      maybeCount: maybeChoices.length,
      notInterestedCount: notInterestedChoices.length
    };

    setInterestProfile(profile);
  };

  const handleDomainClick = (domain: Domain) => {
    setSelectedDomain(domain);
    // Track user interaction with domain
    trackDomainInteraction(domain.id);
  };

  const trackDomainInteraction = async (domainId: string) => {
    try {
      // TODO: Implement real API call to track user interaction
      console.log('Tracking interaction with domain:', domainId);
      // This would update the user's interest data in the database
    } catch (error) {
      console.error('Error tracking domain interaction:', error);
    }
  };

  const resetCompass = () => {
    setUserChoices([]);
    setCurrentCardIndex(0);
    setInterestProfile(null);
    localStorage.removeItem(`curiosity_choices_${user?.id}`);
    // Refresh domains to reset interest levels
    loadUserInterests();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 80) return 'text-green-600';
    if (growth >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInterestColor = (level: number) => {
    if (level >= 70) return 'text-green-600 bg-green-100';
    if (level >= 50) return 'text-blue-600 bg-blue-100';
    if (level >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Interests...</h2>
            <p className="text-gray-600 text-center">
              Analyzing your learning patterns and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Curiosity Compass
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover your interests and explore career domains that match your passions. 
          Your interactions help us understand what truly excites you.
        </p>
      </div>

      {/* Tabs for different exploration modes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore">Explore Domains</TabsTrigger>
          <TabsTrigger value="cards">Career Cards</TabsTrigger>
          <TabsTrigger value="results">My Profile</TabsTrigger>
        </TabsList>

        {/* Original Domain Exploration Tab */}
        <TabsContent value="explore" className="space-y-8">
          {/* User Interest Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Your Interest Profile</span>
              </CardTitle>
              <CardDescription>
                Based on your learning journey, interactions, and career card choices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {domains.filter(d => d.interestLevel >= 50).length}
                  </div>
                  <p className="text-sm text-gray-600">High Interest Domains</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {domains.reduce((sum, d) => sum + d.totalInteractions, 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Interactions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(domains.reduce((sum, d) => sum + d.interestLevel, 0) / domains.length)}%
                  </div>
                  <p className="text-sm text-gray-600">Average Interest Level</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {userChoices.length}
                  </div>
                  <p className="text-sm text-gray-600">Career Cards Explored</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domains Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <Card 
                key={domain.id} 
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  selectedDomain?.id === domain.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleDomainClick(domain)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${domain.color} rounded-lg flex items-center justify-center`}>
                      <domain.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={getInterestColor(domain.interestLevel)}>
                      {domain.interestLevel}% Interest
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{domain.name}</CardTitle>
                  <CardDescription>{domain.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Interest Level</span>
                      <span>{domain.interestLevel}%</span>
                    </div>
                    <Progress value={domain.interestLevel} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Top Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {domain.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Last interaction: {domain.lastInteracted}</p>
                    <p>Total interactions: {domain.totalInteractions}</p>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={selectedDomain?.id === domain.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDomainClick(domain);
                    }}
                  >
                    Explore Domain
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Domain Details */}
          {selectedDomain && (
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${selectedDomain.color} rounded-lg flex items-center justify-center`}>
                    <selectedDomain.icon className="h-4 w-4 text-white" />
                  </div>
                  <span>Explore {selectedDomain.name}</span>
                </CardTitle>
                <CardDescription>
                  Deep dive into this domain and discover your potential career paths
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Skills to Develop</h4>
                    <div className="space-y-2">
                      {selectedDomain.skills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Career Opportunities</h4>
                    <div className="space-y-2">
                      {selectedDomain.careers.map((career) => (
                        <div key={career} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning Path
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Set Career Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Career Cards Tab */}
        <TabsContent value="cards" className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Exploration Cards</h2>
            <p className="text-gray-600">
              Swipe through career cards and tell us what interests you! 
              Your choices will influence your interest profile above.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Card {currentCardIndex + 1} of {careerCards.length}
              </span>
              <span className="text-sm text-gray-600">
                {userChoices.length} choices made
              </span>
            </div>
            <Progress value={((currentCardIndex + 1) / Math.max(careerCards.length, 1)) * 100} className="h-2" />
          </div>

          {/* Career Card */}
          {careerCards[currentCardIndex] && (
            <Card className="mb-8 shadow-2xl border-0 bg-white max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Career Header */}
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">{careerCards[currentCardIndex].image}</div>
                    <h2 className="text-3xl font-bold text-gray-900">{careerCards[currentCardIndex].title}</h2>
                    <p className="text-lg text-gray-600">{careerCards[currentCardIndex].company}</p>
                  </div>

                  {/* Career Details */}
                  <div className="space-y-4 text-left">
                    <p className="text-gray-700 leading-relaxed">{careerCards[currentCardIndex].description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">💰 Salary</h4>
                        <p className="text-gray-600">{careerCards[currentCardIndex].salary}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📍 Location</h4>
                        <p className="text-gray-600">{careerCards[currentCardIndex].location}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Growth Potential</h4>
                      <div className="flex items-center space-x-2">
                        <Progress value={careerCards[currentCardIndex].growth} className="flex-1 h-2" />
                        <span className={`font-medium ${getGrowthColor(careerCards[currentCardIndex].growth)}`}>
                          {careerCards[currentCardIndex].growth}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📋 Key Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {careerCards[currentCardIndex].requirements.map((req) => (
                          <Badge key={req} variant="outline">{req}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">✨ Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {careerCards[currentCardIndex].benefits.map((benefit) => (
                          <Badge key={benefit} className="bg-green-100 text-green-800">{benefit}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 mb-8">
            <Button
              size="lg"
              variant="destructive"
              className="w-20 h-20 rounded-full"
              onClick={() => handleChoice('not_interested')}
            >
              <X className="h-8 w-8" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-20 h-20 rounded-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleChoice('maybe')}
            >
              <Clock className="h-8 w-8" />
            </Button>
            
            <Button
              size="lg"
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600"
              onClick={() => handleChoice('interested')}
            >
              <Heart className="h-8 w-8" />
            </Button>
          </div>

          {/* Action Labels */}
          <div className="flex justify-center space-x-16 mb-8">
            <div className="text-center">
              <p className="text-sm font-medium text-red-600">Not Interested</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-yellow-600">Maybe</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-600">Interested</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={showResultsNow} disabled={userChoices.length < 5}>
              <CheckCircle className="h-4 w-4 mr-2" />
              See Results ({userChoices.length}/5)
            </Button>
            <Button variant="outline" onClick={resetCompass}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-8">
          {interestProfile ? (
            <>
              {/* Profile Summary */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Your Career Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {interestProfile.interestedCount}
                      </div>
                      <p className="text-sm text-gray-600">Interested</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {interestProfile.maybeCount}
                      </div>
                      <p className="text-sm text-gray-600">Maybe</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {interestProfile.notInterestedCount}
                      </div>
                      <p className="text-sm text-gray-600">Not Interested</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {interestProfile.totalChoices}
                      </div>
                      <p className="text-sm text-gray-600">Total Choices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Your Top Interest Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {interestProfile.topCategories.map((category, index) => (
                      <Badge key={category} className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                        #{index + 1} {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Careers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span>Your Top Career Matches</span>
                  </CardTitle>
                  <CardDescription>
                    Based on your "Interested" choices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {careerCards.filter(card => 
                      userChoices.filter(c => c.choice === 'interested').some(choice => choice.careerId === card.id)
                    ).slice(0, 6).map((career) => (
                      <Card key={career.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{career.title}</h3>
                              <p className="text-sm text-gray-600">{career.company}</p>
                            </div>
                            <span className="text-2xl">{career.image}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{career.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Badge className={getDifficultyColor(career.difficulty)}>
                                {career.difficulty}
                              </Badge>
                              <Badge variant="outline">{career.salary}</Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className={`text-sm font-medium ${getGrowthColor(career.growth)}`}>
                                {career.growth}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Generate Learning Roadmap
                </Button>
                <Button variant="outline" size="lg" onClick={resetCompass}>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Explore More Careers
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-600 mb-4">
                  Make at least 5 career card choices to see your personalized interest profile.
                </p>
                <Button onClick={() => setActiveTab('cards')}>
                  Start Exploring Careers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CuriosityCompass;
