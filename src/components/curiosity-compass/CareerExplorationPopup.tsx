import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  Target,
  Heart,
  ThumbsDown,
  BookOpen,
  Code,
  Palette,
  Calculator,
  Globe,
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { SearchService, SearchResult } from '@/lib/search-service';
import ApiService from '@/lib/api-services';

interface CareerExplorationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selections: ExplorationSelections) => void;
}

interface ExplorationSelections {
  likedDomains: string[];
  dislikedDomains: string[];
  likedTopics: string[];
  dislikedTopics: string[];
}

interface Domain {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

const CareerExplorationPopup: React.FC<CareerExplorationPopupProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selections, setSelections] = useState<ExplorationSelections>({
    likedDomains: [],
    dislikedDomains: [],
    likedTopics: [],
    dislikedTopics: []
  });

  // Loading and error states
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);

  // Domain data
  const domains: Domain[] = [
    {
      id: 'technology',
      name: 'Technology & Digital',
      description: 'Build the future with code, AI, and innovation',
      icon: Code,
      color: 'bg-blue-500',
      category: 'Technology'
    },
    {
      id: 'creative',
      name: 'Creative Arts & Design',
      description: 'Express yourself through design, media, and storytelling',
      icon: Palette,
      color: 'bg-pink-500',
      category: 'Creative Arts'
    },
    {
      id: 'science',
      name: 'Science & Research',
      description: 'Discover, analyze, and solve complex problems',
      icon: Calculator,
      color: 'bg-green-500',
      category: 'Science'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Medical',
      description: 'Heal, care, and improve quality of life',
      icon: Heart,
      color: 'bg-red-500',
      category: 'Healthcare'
    },
    {
      id: 'business',
      name: 'Business & Finance',
      description: 'Lead, strategize, and drive economic growth',
      icon: Briefcase,
      color: 'bg-yellow-500',
      category: 'Business'
    },
    {
      id: 'social',
      name: 'Social Impact',
      description: 'Make a difference in communities and society',
      icon: Users,
      color: 'bg-purple-500',
      category: 'Social Impact'
    }
  ];

  // Topic data
  const topics: Topic[] = [
    // Technology topics
    { id: 'web-dev', name: 'Web Development', description: 'Building websites and web applications', icon: '🌐', color: 'bg-blue-500', category: 'Technology' },
    { id: 'mobile-dev', name: 'Mobile Development', description: 'Creating mobile apps for iOS and Android', icon: '📱', color: 'bg-blue-500', category: 'Technology' },
    { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Building intelligent systems and algorithms', icon: '🤖', color: 'bg-blue-500', category: 'Technology' },
    { id: 'data-science', name: 'Data Science', description: 'Analyzing data to drive business decisions', icon: '📊', color: 'bg-blue-500', category: 'Technology' },
    { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protecting systems and data from threats', icon: '🔒', color: 'bg-blue-500', category: 'Technology' },
    
    // Creative topics
    { id: 'ui-ux', name: 'UI/UX Design', description: 'Creating user-friendly interfaces', icon: '🎨', color: 'bg-pink-500', category: 'Creative Arts' },
    { id: 'graphic-design', name: 'Graphic Design', description: 'Visual communication and branding', icon: '🎨', color: 'bg-pink-500', category: 'Creative Arts' },
    { id: 'photography', name: 'Photography', description: 'Capturing moments and telling stories', icon: '📸', color: 'bg-pink-500', category: 'Creative Arts' },
    { id: 'video-production', name: 'Video Production', description: 'Creating engaging video content', icon: '🎬', color: 'bg-pink-500', category: 'Creative Arts' },
    { id: 'writing', name: 'Content Writing', description: 'Crafting compelling written content', icon: '✍️', color: 'bg-pink-500', category: 'Creative Arts' },
    
    // Business topics
    { id: 'marketing', name: 'Digital Marketing', description: 'Promoting products and services online', icon: '📈', color: 'bg-yellow-500', category: 'Business' },
    { id: 'finance', name: 'Finance & Investment', description: 'Managing money and investments', icon: '💰', color: 'bg-yellow-500', category: 'Business' },
    { id: 'entrepreneurship', name: 'Entrepreneurship', description: 'Starting and running your own business', icon: '🚀', color: 'bg-yellow-500', category: 'Business' },
    { id: 'sales', name: 'Sales & Business Development', description: 'Building relationships and closing deals', icon: '💼', color: 'bg-yellow-500', category: 'Business' },
    
    // Healthcare topics
    { id: 'nursing', name: 'Nursing', description: 'Providing patient care and support', icon: '🏥', color: 'bg-red-500', category: 'Healthcare' },
    { id: 'mental-health', name: 'Mental Health', description: 'Supporting psychological well-being', icon: '🧠', color: 'bg-red-500', category: 'Healthcare' },
    { id: 'public-health', name: 'Public Health', description: 'Improving community health outcomes', icon: '🌍', color: 'bg-red-500', category: 'Healthcare' },
    
    // Education topics
    { id: 'teaching', name: 'Teaching & Education', description: 'Sharing knowledge and shaping minds', icon: '👨‍🏫', color: 'bg-green-500', category: 'Education' },
    { id: 'training', name: 'Corporate Training', description: 'Developing workforce skills', icon: '🎓', color: 'bg-green-500', category: 'Education' }
  ];

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      SearchService.search(searchQuery, {}, 10)
        .then(results => {
          setSearchResults(results);
          setIsSearching(false);
        })
        .catch(error => {
          console.error('Search error:', error);
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleDomainSelection = (domainId: string, isLiked: boolean) => {
    setSelections(prev => ({
      ...prev,
      [isLiked ? 'likedDomains' : 'dislikedDomains']: isLiked
        ? [...prev.likedDomains.filter(id => id !== domainId), domainId]
        : [...prev.dislikedDomains.filter(id => id !== domainId), domainId]
    }));
  };

  const handleTopicSelection = (topicId: string, isLiked: boolean) => {
    setSelections(prev => ({
      ...prev,
      [isLiked ? 'likedTopics' : 'dislikedTopics']: isLiked
        ? [...prev.likedTopics.filter(id => id !== topicId), topicId]
        : [...prev.dislikedTopics.filter(id => id !== topicId), topicId]
    }));
  };

  const handleSearchResultSelection = (result: SearchResult, isLiked: boolean) => {
    if (result.type === 'domain') {
      handleDomainSelection(result.id, isLiked);
    } else if (result.type === 'subject') {
      // Find matching topic or create new one
      const existingTopic = topics.find(t => t.name.toLowerCase() === result.title.toLowerCase());
      if (existingTopic) {
        handleTopicSelection(existingTopic.id, isLiked);
      }
    }
  };

  const nextStep = () => {
    console.log('Next step clicked! Current step:', currentStep);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      console.log('Moving to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateRoadmap = async () => {
    console.log('🚀 GENERATE ROADMAP BUTTON CLICKED!');
    console.log('Current selections:', selections);
    
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);
    setRoadmapGenerated(false);
    
    try {
      console.log('Generating roadmap with selections:', selections);
      
      // Validate selections
      if (selections.likedDomains.length === 0 && selections.likedTopics.length === 0) {
        setRoadmapError('Please select at least one domain or topic you\'re interested in.');
        return;
      }
      
      // Call API to generate roadmap based on selections
      console.log('Calling generatePersonalizedRoadmap with selections:', selections);
      const roadmapResult = await ApiService.generatePersonalizedRoadmap(selections);
      console.log('Roadmap generation result:', roadmapResult);
      
      if (roadmapResult.success && roadmapResult.data) {
        console.log('Roadmap generated successfully:', roadmapResult.data);
        setGeneratedRoadmap(roadmapResult.data);
        setRoadmapGenerated(true);
        
        // Store roadmap in localStorage for the roadmaps page
        localStorage.setItem('generated_roadmap', JSON.stringify(roadmapResult.data));
        localStorage.setItem('exploration_selections', JSON.stringify(selections));
        
        console.log('Stored roadmap in localStorage, navigating to /roadmaps...');
        
        // Show success message for a moment before navigating
        setTimeout(() => {
          console.log('Navigating to /ai-roadmap...');
          // Close popup first
          onClose();
          // Navigate to AI Roadmaps page
          navigate('/ai-roadmap');
        }, 2000); // Increased delay to show success message
        
      } else {
        console.error('Failed to generate roadmap:', roadmapResult);
        const errorMessage = roadmapResult.error || 'Failed to generate roadmap. Please try again.';
        setRoadmapError(errorMessage);
        console.error('Roadmap generation failed with error:', errorMessage);
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setRoadmapError(errorMessage);
      console.error('Roadmap generation exception:', errorMessage);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const isDomainSelected = (domainId: string, isLiked: boolean) => {
    return isLiked 
      ? selections.likedDomains.includes(domainId)
      : selections.dislikedDomains.includes(domainId);
  };

  const isTopicSelected = (topicId: string, isLiked: boolean) => {
    return isLiked 
      ? selections.likedTopics.includes(topicId)
      : selections.dislikedTopics.includes(topicId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-center">
            {currentStep === 0 && "Your Journey Starts Here"}
            {currentStep === 1 && "Explore Career Domains"}
            {currentStep === 2 && "Select What You Don't Like"}
            {currentStep === 3 && "Dive Deeper Into Topics"}
            {currentStep === 4 && "Review Your Selections"}
          </CardTitle>
          <CardDescription className="text-center">
            {currentStep === 0 && "Let's explore your interests and create a personalized roadmap to your dream career."}
            {currentStep === 1 && "Which areas spark your interest? Select domains you're curious about."}
            {currentStep === 2 && "Which areas do you dislike? This helps us refine your recommendations."}
            {currentStep === 3 && "What specific topics excite you? Choose from these popular areas."}
            {currentStep === 4 && "Based on your interests, we'll create customized roadmaps to help you achieve your goals."}
          </CardDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of 5</span>
              <span>{Math.round(((currentStep + 1) / 5) * 100)}% Complete</span>
            </div>
            <Progress value={((currentStep + 1) / 5) * 100} className="h-2" />
          </div>

          {/* Step 0: Introduction */}
          {currentStep === 0 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">This will only take a few minutes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">AI-powered personalized learning roadmaps</h4>
                    <p className="text-sm text-gray-600">Get customized learning paths based on your interests and goals</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Curated projects and hands-on experiences</h4>
                    <p className="text-sm text-gray-600">Practice with real-world projects that build your portfolio</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Access to mentors and career guidance</h4>
                    <p className="text-sm text-gray-600">Connect with industry experts and get personalized advice</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Explore Career Domains */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search domains, job roles, and skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Search Results</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{result.icon}</span>
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSearchResultSelection(result, true)}
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domain Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isDomainSelected(domain.id, true)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleDomainSelection(domain.id, true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${domain.color} rounded-lg flex items-center justify-center`}>
                          <domain.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{domain.name}</h3>
                          <p className="text-sm text-gray-600">{domain.description}</p>
                        </div>
                        {isDomainSelected(domain.id, true) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Domains */}
              {selections.likedDomains.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Selected Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.likedDomains.map(domainId => {
                      const domain = domains.find(d => d.id === domainId);
                      return domain ? (
                        <Badge key={domainId} className="bg-blue-100 text-blue-800">
                          {domain.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select What You Don't Like */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search domains you want to avoid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Search Results</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{result.icon}</span>
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSearchResultSelection(result, false)}
                        >
                          Avoid
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domain Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isDomainSelected(domain.id, false)
                        ? 'ring-2 ring-red-500 bg-red-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleDomainSelection(domain.id, false)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${domain.color} rounded-lg flex items-center justify-center`}>
                          <domain.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{domain.name}</h3>
                          <p className="text-sm text-gray-600">{domain.description}</p>
                        </div>
                        {isDomainSelected(domain.id, false) && (
                          <ThumbsDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Disliked Domains */}
              {selections.dislikedDomains.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Domains to Avoid</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.dislikedDomains.map(domainId => {
                      const domain = domains.find(d => d.id === domainId);
                      return domain ? (
                        <Badge key={domainId} className="bg-red-100 text-red-800">
                          {domain.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Dive Deeper Into Topics */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search specific topics and subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Search Results</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{result.icon}</span>
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSearchResultSelection(result, true)}
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Capsules */}
              <div className="space-y-4">
                {Object.entries(
                  topics.reduce((acc, topic) => {
                    if (!acc[topic.category]) acc[topic.category] = [];
                    acc[topic.category].push(topic);
                    return acc;
                  }, {} as Record<string, Topic[]>)
                ).map(([category, categoryTopics]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border cursor-pointer transition-all duration-200 ${
                            isTopicSelected(topic.id, true)
                              ? 'bg-blue-100 border-blue-500 text-blue-800'
                              : 'bg-white border-gray-300 hover:border-blue-300'
                          }`}
                          onClick={() => handleTopicSelection(topic.id, true)}
                        >
                          <span className="text-lg">{topic.icon}</span>
                          <span className="text-sm font-medium">{topic.name}</span>
                          {isTopicSelected(topic.id, true) && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Topics */}
              {selections.likedTopics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Selected Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.likedTopics.map(topicId => {
                      const topic = topics.find(t => t.id === topicId);
                      return topic ? (
                        <Badge key={topicId} className="bg-blue-100 text-blue-800">
                          {topic.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review Selections */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {console.log('Step 4 rendering - states:', { roadmapGenerated, isGeneratingRoadmap, roadmapError })}
              {console.log('Current selections:', selections)}
              {!roadmapGenerated && !isGeneratingRoadmap && !roadmapError && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Perfect! Here's what we found about you:</h3>
                  <p className="text-gray-600">Based on your interests, we'll create customized roadmaps to help you achieve your goals.</p>
                </div>
              )}

              {/* Loading State */}
              {isGeneratingRoadmap && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Generating Your Personalized Roadmap...</h3>
                  <p className="text-gray-600">Our AI is analyzing your preferences and creating a customized learning path just for you.</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">This may take a few moments...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {roadmapGenerated && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-600">Roadmap Generated Successfully!</h3>
                  <p className="text-gray-600">Your personalized learning roadmap is ready. Redirecting you to the roadmaps page...</p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Roadmap saved and ready to view!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {roadmapError && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-red-600">Oops! Something went wrong</h3>
                  <p className="text-gray-600 mb-4">{roadmapError}</p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Please try again or contact support if the issue persists.</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Debug info: Check browser console for more details</p>
                  </div>
                </div>
              )}

              {/* Liked Domains */}
              {selections.likedDomains.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">✅ Domains You're Interested In</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.likedDomains.map(domainId => {
                      const domain = domains.find(d => d.id === domainId);
                      return domain ? (
                        <Badge key={domainId} className="bg-green-100 text-green-800 text-sm px-3 py-1">
                          {domain.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Disliked Domains */}
              {selections.dislikedDomains.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">❌ Domains You Want to Avoid</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.dislikedDomains.map(domainId => {
                      const domain = domains.find(d => d.id === domainId);
                      return domain ? (
                        <Badge key={domainId} className="bg-red-100 text-red-800 text-sm px-3 py-1">
                          {domain.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Liked Topics */}
              {selections.likedTopics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🎯 Specific Topics You're Excited About</h4>
                  <div className="flex flex-wrap gap-2">
                    {selections.likedTopics.map(topicId => {
                      const topic = topics.find(t => t.id === topicId);
                      return topic ? (
                        <Badge key={topicId} className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                          {topic.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 What happens next?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• AI will analyze your preferences and create personalized learning roadmaps</li>
                  <li>• You'll get curated projects and hands-on experiences</li>
                  <li>• Connect with mentors who match your interests</li>
                  <li>• Track your progress and celebrate milestones</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isGeneratingRoadmap}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && selections.likedDomains.length === 0) ||
                  (currentStep === 3 && selections.likedTopics.length === 0) ||
                  isGeneratingRoadmap
                }
              >
                {console.log('Next button state:', {
                  currentStep,
                  likedDomains: selections.likedDomains.length,
                  likedTopics: selections.likedTopics.length,
                  isGeneratingRoadmap,
                  disabled: (currentStep === 1 && selections.likedDomains.length === 0) ||
                           (currentStep === 3 && selections.likedTopics.length === 0) ||
                           isGeneratingRoadmap
                })}
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex space-x-2">
                {console.log('Rendering buttons - roadmapError:', roadmapError, 'isGeneratingRoadmap:', isGeneratingRoadmap, 'roadmapGenerated:', roadmapGenerated)}
                {roadmapError && (
                  <Button
                    onClick={() => {
                      console.log('Try Again button clicked!');
                      generateRoadmap();
                    }}
                    variant="outline"
                    disabled={isGeneratingRoadmap}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button
                  onClick={() => {
                    console.log('🚀 GENERATE ROADMAP BUTTON CLICKED!');
                    console.log('Button clicked! Current state:', { isGeneratingRoadmap, roadmapGenerated });
                    console.log('Button disabled?', isGeneratingRoadmap || roadmapGenerated);
                    generateRoadmap();
                  }}
                  disabled={isGeneratingRoadmap || roadmapGenerated}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isGeneratingRoadmap ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : roadmapGenerated ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Generated!
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate My Roadmap
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerExplorationPopup;
