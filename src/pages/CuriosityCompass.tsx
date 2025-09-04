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
  Check,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  BarChart3,
  MapPin,
  Calendar,
  Award,
  Zap,
  Shield,
  Lightbulb,
  Building,
  DollarSign,
  Clock,
  User,
  MessageCircle,
  FileText,
  Gamepad2
} from 'lucide-react';

interface CareerCard {
  id: string;
  title: string;
  category: string;
  description: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  growth: number;
  demand: number;
  workStyle: string[];
  education: string;
  experience: string;
  icon: React.ComponentType<any>;
  color: string;
  pros: string[];
  cons: string[];
  companies: string[];
  locations: string[];
}

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

interface UserChoice {
  careerId: string;
  choice: 'interested' | 'maybe' | 'not-interested';
  timestamp: Date;
}

const CuriosityCompass = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const [careerCards, setCareerCards] = useState<CareerCard[]>([]);
  const [activeTab, setActiveTab] = useState('discover');

  // Career cards data
  const allCareerCards: CareerCard[] = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      category: 'Technology',
      description: 'Design, develop, and maintain software applications and systems',
      salary: { min: 800000, max: 2000000, currency: 'INR' },
      skills: ['Programming', 'Problem Solving', 'System Design', 'Collaboration'],
      growth: 25,
      demand: 95,
      workStyle: ['Remote Work', 'Flexible Hours', 'Team Collaboration', 'Continuous Learning'],
      education: 'Bachelor\'s in Computer Science or related field',
      experience: '0-2 years for entry level',
      icon: Code,
      color: 'from-blue-500 to-cyan-600',
      pros: ['High demand', 'Good salary', 'Remote work options', 'Creative problem solving'],
      cons: ['Long hours sometimes', 'Constant learning required', 'Sitting for long periods'],
      companies: ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      category: 'Technology',
      description: 'Extract insights from data using statistical analysis and machine learning',
      salary: { min: 1000000, max: 2500000, currency: 'INR' },
      skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
      growth: 30,
      demand: 90,
      workStyle: ['Research Focus', 'Data Analysis', 'Cross-functional Teams', 'Presentation Skills'],
      education: 'Master\'s in Data Science, Statistics, or related field',
      experience: '1-3 years in analytics or research',
      icon: BarChart3,
      color: 'from-green-500 to-teal-600',
      pros: ['High growth field', 'Excellent salary', 'Impact on business decisions', 'Intellectual challenge'],
      cons: ['Requires advanced education', 'Complex mathematical concepts', 'Data quality issues'],
      companies: ['Netflix', 'Uber', 'Airbnb', 'Flipkart', 'Paytm'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']
    },
    {
      id: 'ux-designer',
      title: 'UX Designer',
      category: 'Design',
      description: 'Create user-centered designs for digital products and services',
      salary: { min: 600000, max: 1500000, currency: 'INR' },
      skills: ['User Research', 'Prototyping', 'Design Thinking', 'Figma'],
      growth: 20,
      demand: 85,
      workStyle: ['User Research', 'Design Iteration', 'Stakeholder Collaboration', 'Creative Problem Solving'],
      education: 'Bachelor\'s in Design, HCI, or related field',
      experience: '0-2 years in design or related field',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      pros: ['Creative work', 'User impact', 'Growing field', 'Collaborative environment'],
      cons: ['Subjective feedback', 'Multiple iterations', 'Balancing user needs with business goals'],
      companies: ['Adobe', 'Figma', 'InVision', 'Zomato', 'Swiggy'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai']
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      category: 'Business',
      description: 'Lead product strategy and development from conception to launch',
      salary: { min: 1200000, max: 3000000, currency: 'INR' },
      skills: ['Strategic Thinking', 'Communication', 'Data Analysis', 'Leadership'],
      growth: 22,
      demand: 88,
      workStyle: ['Cross-functional Leadership', 'Strategic Planning', 'Stakeholder Management', 'Market Research'],
      education: 'MBA or Bachelor\'s in Business, Engineering, or related field',
      experience: '2-5 years in product, business, or engineering',
      icon: Target,
      color: 'from-purple-500 to-indigo-600',
      pros: ['High impact role', 'Excellent salary', 'Leadership opportunities', 'Strategic thinking'],
      cons: ['High responsibility', 'Multiple stakeholders', 'Pressure to deliver results'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Paytm'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    },
    {
      id: 'digital-marketer',
      title: 'Digital Marketing Specialist',
      category: 'Marketing',
      description: 'Develop and execute digital marketing campaigns across various channels',
      salary: { min: 400000, max: 1200000, currency: 'INR' },
      skills: ['SEO/SEM', 'Social Media', 'Analytics', 'Content Creation'],
      growth: 18,
      demand: 80,
      workStyle: ['Campaign Management', 'Data Analysis', 'Creative Content', 'Client Interaction'],
      education: 'Bachelor\'s in Marketing, Communications, or related field',
      experience: '0-2 years in marketing or related field',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      pros: ['Creative freedom', 'Growing field', 'Diverse projects', 'Data-driven decisions'],
      cons: ['Fast-changing landscape', 'ROI pressure', 'Multiple platforms to manage'],
      companies: ['Google', 'Facebook', 'Amazon', 'Flipkart', 'Zomato'],
      locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune']
    },
    {
      id: 'cybersecurity-analyst',
      title: 'Cybersecurity Analyst',
      category: 'Technology',
      description: 'Protect organizations from cyber threats and security breaches',
      salary: { min: 800000, max: 1800000, currency: 'INR' },
      skills: ['Network Security', 'Risk Assessment', 'Incident Response', 'Security Tools'],
      growth: 35,
      demand: 92,
      workStyle: ['Security Monitoring', 'Incident Response', 'Risk Assessment', 'Compliance'],
      education: 'Bachelor\'s in Cybersecurity, Computer Science, or related field',
      experience: '1-3 years in IT security or related field',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      pros: ['High demand', 'Good salary', 'Critical role', 'Continuous learning'],
      cons: ['High stress', 'On-call responsibilities', 'Complex technical requirements'],
      companies: ['IBM Security', 'Symantec', 'Check Point', 'Palo Alto', 'Cisco'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    },
    {
      id: 'financial-analyst',
      title: 'Financial Analyst',
      category: 'Finance',
      description: 'Analyze financial data to help businesses make investment decisions',
      salary: { min: 600000, max: 1500000, currency: 'INR' },
      skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Communication'],
      growth: 15,
      demand: 75,
      workStyle: ['Financial Analysis', 'Report Writing', 'Client Interaction', 'Market Research'],
      education: 'Bachelor\'s in Finance, Economics, or related field',
      experience: '0-2 years in finance or related field',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      pros: ['Stable career', 'Good salary', 'Analytical work', 'Business impact'],
      cons: ['Long hours during reporting periods', 'High pressure', 'Regulatory compliance'],
      companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'HDFC', 'ICICI'],
      locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']
    },
    {
      id: 'content-creator',
      title: 'Content Creator',
      category: 'Creative',
      description: 'Create engaging content for social media, blogs, and digital platforms',
      salary: { min: 300000, max: 1000000, currency: 'INR' },
      skills: ['Content Writing', 'Video Editing', 'Social Media', 'Photography'],
      growth: 25,
      demand: 70,
      workStyle: ['Creative Freedom', 'Flexible Schedule', 'Multiple Platforms', 'Audience Building'],
      education: 'Bachelor\'s in Communications, Journalism, or related field',
      experience: '0-2 years in content creation or related field',
      icon: Star,
      color: 'from-indigo-500 to-purple-600',
      pros: ['Creative freedom', 'Flexible schedule', 'Growing field', 'Direct audience connection'],
      cons: ['Inconsistent income', 'High competition', 'Need for self-promotion'],
      companies: ['YouTube', 'Instagram', 'TikTok', 'Medium', 'Substack'],
      locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune']
    },
    {
      id: 'project-manager',
      title: 'Project Manager',
      category: 'Business',
      description: 'Plan, execute, and oversee projects to ensure successful completion',
      salary: { min: 700000, max: 1800000, currency: 'INR' },
      skills: ['Project Planning', 'Team Management', 'Risk Management', 'Communication'],
      growth: 20,
      demand: 85,
      workStyle: ['Team Leadership', 'Project Planning', 'Stakeholder Communication', 'Risk Management'],
      education: 'Bachelor\'s in Business, Engineering, or related field',
      experience: '2-4 years in project management or related field',
      icon: Calendar,
      color: 'from-teal-500 to-cyan-600',
      pros: ['Leadership role', 'Good salary', 'Diverse projects', 'Team collaboration'],
      cons: ['High responsibility', 'Multiple stakeholders', 'Pressure to meet deadlines'],
      companies: ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    },
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      category: 'Technology',
      description: 'Develop and implement artificial intelligence solutions and machine learning models',
      salary: { min: 1200000, max: 3000000, currency: 'INR' },
      skills: ['Machine Learning', 'Python', 'Deep Learning', 'TensorFlow'],
      growth: 40,
      demand: 95,
      workStyle: ['Research & Development', 'Model Training', 'Algorithm Development', 'Cross-functional Teams'],
      education: 'Master\'s in AI, Machine Learning, or related field',
      experience: '1-3 years in AI/ML or related field',
      icon: Zap,
      color: 'from-violet-500 to-purple-600',
      pros: ['Cutting-edge field', 'Excellent salary', 'High demand', 'Innovation focus'],
      cons: ['Requires advanced education', 'Rapidly changing technology', 'Complex mathematical concepts'],
      companies: ['Google', 'Microsoft', 'Amazon', 'OpenAI', 'Tesla'],
      locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    }
  ];

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

  useEffect(() => {
    loadUserInterests();
    setCareerCards(allCareerCards);
  }, [user]);

  const loadUserInterests = async () => {
    setIsLoading(true);
    try {
      const userInterests = user?.interests || [];
      const userSkills = user?.skills || [];
      
      const generatedDomains: Domain[] = [
        {
          id: 'technology',
          name: 'Technology',
          icon: Code,
          description: 'Build the future with code, AI, and innovation',
          color: 'bg-blue-500',
          skills: ['Programming', 'AI/ML', 'Web Development', 'Cybersecurity'],
          careers: ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'],
          interestLevel: userInterests.includes('Programming') ? 85 : 45,
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
          interestLevel: userInterests.includes('Design') ? 70 : 30,
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
          interestLevel: userInterests.includes('Research') ? 60 : 25,
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
          interestLevel: userInterests.includes('Patient Care') ? 75 : 20,
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
          interestLevel: userInterests.includes('Leadership') ? 65 : 35,
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
          interestLevel: userInterests.includes('Community Service') ? 55 : 15,
          lastInteracted: '4 days ago',
          totalInteractions: 7
        }
      ];

      setDomains(generatedDomains);
      setUserInterests(userInterests);
    } catch (error) {
      console.error('Error loading user interests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardChoice = (choice: 'interested' | 'maybe' | 'not-interested') => {
    const currentCard = careerCards[currentCardIndex];
    const newChoice: UserChoice = {
      careerId: currentCard.id,
      choice,
      timestamp: new Date()
    };

    setUserChoices(prev => [...prev, newChoice]);
    
    // Move to next card
    if (currentCardIndex < careerCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // All cards completed, switch to results tab
      setActiveTab('results');
    }
  };

  const resetCardSystem = () => {
    setCurrentCardIndex(0);
    setUserChoices([]);
    setActiveTab('discover');
  };

  const getRecommendedCareers = () => {
    const interestedCareers = userChoices
      .filter(choice => choice.choice === 'interested')
      .map(choice => careerCards.find(card => card.id === choice.careerId))
      .filter(Boolean);

    const maybeCareers = userChoices
      .filter(choice => choice.choice === 'maybe')
      .map(choice => careerCards.find(card => card.id === choice.careerId))
      .filter(Boolean);

    return { interestedCareers, maybeCareers };
  };

  const formatSalary = (salary: CareerCard['salary']) => {
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L`;
  };

  const handleDomainClick = (domain: Domain) => {
    setSelectedDomain(domain);
    trackDomainInteraction(domain.id);
  };

  const trackDomainInteraction = async (domainId: string) => {
    try {
      console.log('Tracking interaction with domain:', domainId);
    } catch (error) {
      console.error('Error tracking domain interaction:', error);
    }
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

  const currentCard = careerCards[currentCardIndex];
  const { interestedCareers, maybeCareers } = getRecommendedCareers();

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

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Discover Careers
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Explore Domains
          </TabsTrigger>
        </TabsList>

        {/* Discover Careers Tab - Tinder-like Cards */}
        <TabsContent value="discover" className="space-y-6">
          {currentCard && (
            <div className="max-w-md mx-auto">
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600">
                  Card {currentCardIndex + 1} of {careerCards.length}
                </p>
                <Progress value={(currentCardIndex / careerCards.length) * 100} className="h-2 mt-2" />
              </div>

              {/* Career Card */}
              <Card className="relative overflow-hidden shadow-2xl border-0">
                <div className={`h-2 bg-gradient-to-r ${currentCard.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${currentCard.color}`}>
                      <currentCard.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {currentCard.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{currentCard.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {currentCard.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-800">{formatSalary(currentCard.salary)}</p>
                      <p className="text-xs text-green-600">Annual Salary</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-blue-800">+{currentCard.growth}%</p>
                      <p className="text-xs text-blue-600">Growth Rate</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Key Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentCard.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Work Style */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Work Style</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentCard.workStyle.slice(0, 3).map((style) => (
                        <Badge key={style} variant="outline" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Education</p>
                      <p className="font-medium">{currentCard.education}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Experience</p>
                      <p className="font-medium">{currentCard.experience}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 max-w-32 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  onClick={() => handleCardChoice('not-interested')}
                >
                  <X className="h-5 w-5 mr-2" />
                  Not Interested
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 max-w-32 bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
                  onClick={() => handleCardChoice('maybe')}
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Maybe
                </Button>
                <Button
                  size="lg"
                  className="flex-1 max-w-32 bg-green-600 hover:bg-green-700"
                  onClick={() => handleCardChoice('interested')}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Interested
                </Button>
              </div>

              {/* Reset Button */}
              {userChoices.length > 0 && (
                <div className="text-center mt-4">
                  <Button variant="ghost" size="sm" onClick={resetCardSystem}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* My Profile Tab - Results based on card choices */}
        <TabsContent value="results" className="space-y-6">
          {userChoices.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Career Preferences Yet</h3>
                <p className="text-gray-600 mb-4">
                  Complete the career discovery cards to see your personalized recommendations.
                </p>
                <Button onClick={() => setActiveTab('discover')}>
                  Start Career Discovery
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span>Your Career Discovery Results</span>
                  </CardTitle>
                  <CardDescription>
                    Based on your preferences from {userChoices.length} career cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {interestedCareers.length}
                      </div>
                      <p className="text-sm text-gray-600">Interested Careers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {maybeCareers.length}
                      </div>
                      <p className="text-sm text-gray-600">Maybe Careers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {userChoices.filter(c => c.choice === 'not-interested').length}
                      </div>
                      <p className="text-sm text-gray-600">Not Interested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interested Careers */}
              {interestedCareers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <span>Your Top Career Interests</span>
                    </CardTitle>
                    <CardDescription>
                      Careers that match your interests and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {interestedCareers.map((career) => (
                        <div key={career.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${career.color}`}>
                                <career.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{career.title}</h4>
                                <p className="text-sm text-gray-600">{career.category}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Interested</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{career.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">{formatSalary(career.salary)}</span>
                            <span className="text-blue-600">+{career.growth}% growth</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Maybe Careers */}
              {maybeCareers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-yellow-600" />
                      <span>Careers to Explore Further</span>
                    </CardTitle>
                    <CardDescription>
                      These careers might be worth researching more
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {maybeCareers.map((career) => (
                        <div key={career.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${career.color}`}>
                                <career.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{career.title}</h4>
                                <p className="text-sm text-gray-600">{career.category}</p>
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Maybe</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{career.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">{formatSalary(career.salary)}</span>
                            <span className="text-blue-600">+{career.growth}% growth</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={() => setActiveTab('discover')} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Redo Career Discovery
                </Button>
                <Button onClick={() => setActiveTab('explore')}>
                  <Globe className="h-4 w-4 mr-2" />
                  Explore Domains
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Explore Domains Tab - Original content */}
        <TabsContent value="explore" className="space-y-6">
          {/* User Interest Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Your Interest Profile</span>
              </CardTitle>
              <CardDescription>
                Based on your learning journey and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </Tabs>
    </div>
  );
};

export default CuriosityCompass;