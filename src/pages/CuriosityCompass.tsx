import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/lib/api-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  ThumbsUp,
  DollarSign,
  Cpu
} from 'lucide-react';
import CareerExplorationPopup from '@/components/curiosity-compass/CareerExplorationPopup';
import DomainDetailsPopup from '@/components/curiosity-compass/DomainDetailsPopup';
import { SearchService, SearchResult } from '@/lib/search-service';
import intelligentContentService from '@/lib/intelligent-content-service';

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
  domain: string;
  description: string;
  coreSkills: string[];
  skillCategories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  growth: number;
  image: string;
  // Domain-focused informative fields
  skillProgression: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    timeToIntermediate: string;
    timeToAdvanced: string;
  };
  learningPath: {
    fundamentals: string[];
    intermediate: string[];
    advanced: string[];
    recommendedResources: string[];
  };
  careerOpportunities: {
    entryRoles: string[];
    midLevelRoles: string[];
    seniorRoles: string[];
    industries: string[];
  };
  marketDemand: {
    currentDemand: 'low' | 'medium' | 'high';
    futureOutlook: 'declining' | 'stable' | 'growing';
    salaryRange: string;
    remoteOpportunities: number; // percentage
  };
  skillVersatility: {
    transferableSkills: string[];
    complementaryDomains: string[];
    crossIndustryValue: number; // 1-5
  };
  futureRelevance: {
    automationResistance: 'low' | 'medium' | 'high';
    aiEnhancement: 'low' | 'medium' | 'high';
    emergingTrends: string[];
  };
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
  insights: string[];
}

const CuriosityCompass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Search functionality states
  const [showDomainDetails, setShowDomainDetails] = useState(false);
  const [selectedDomainForDetails, setSelectedDomainForDetails] = useState<Domain | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 4-step popup states
  const [showExplorationPopup, setShowExplorationPopup] = useState(false);

  // ML-powered content states
  const [mlCuratedCareers, setMlCuratedCareers] = useState<CareerCard[]>([]);
  const [isLoadingMLContent, setIsLoadingMLContent] = useState(false);
  const [mlInsights, setMlInsights] = useState<any>(null);

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

  // Mock career cards removed - now using real-time Google APIs data
  // const mockCareerCards: CareerCard[] = [
  /*
    // TECHNOLOGY & DIGITAL DOMAINS
    {
      id: '1',
      title: 'Software Engineering',
      domain: 'Technology',
      description: 'Build scalable applications, solve complex problems, and create digital solutions that impact millions of users.',
      coreSkills: ['Programming', 'Problem Solving', 'System Design', 'Algorithms', 'Database Management', 'Version Control'],
      skillCategories: ['Programming', 'Logic', 'Architecture', 'Collaboration'],
      difficulty: 'intermediate',
      growth: 85,
      image: '💻',
      skillProgression: {
        beginner: ['Programming basics', 'Data structures', 'Version control', 'Basic algorithms'],
        intermediate: ['System design', 'Database optimization', 'API development', 'Testing'],
        advanced: ['Architecture patterns', 'Performance optimization', 'Team leadership', 'Technical strategy'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Programming languages', 'Data structures', 'Algorithms', 'Version control'],
        intermediate: ['System design', 'Database management', 'API development', 'Testing'],
        advanced: ['Architecture patterns', 'Performance optimization', 'Leadership', 'Strategy'],
        recommendedResources: ['LeetCode', 'System Design Primer', 'Clean Code', 'Design Patterns']
      },
      careerOpportunities: {
        entryRoles: ['Junior Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
        midLevelRoles: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Architect'],
        seniorRoles: ['Senior Software Engineer', 'Principal Engineer', 'Engineering Manager', 'CTO'],
        industries: ['Technology', 'Fintech', 'E-commerce', 'Healthcare', 'Gaming', 'Media']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹8-40 LPA',
        remoteOpportunities: 80
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Problem Solving', 'Logic', 'Project Management', 'Communication'],
        complementaryDomains: ['Data Science', 'Product Management', 'UX Design']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI/ML Integration', 'Cloud Computing', 'Edge Computing', 'Quantum Computing']
      }
    },
    {
      id: '2',
      title: 'Cybersecurity',
      domain: 'Security & Risk',
      description: 'Protect digital assets, prevent cyber threats, and ensure data security in an increasingly connected world.',
      coreSkills: ['Network Security', 'Penetration Testing', 'Risk Assessment', 'Incident Response', 'Cryptography', 'Compliance'],
      skillCategories: ['Security', 'Risk Management', 'Technology', 'Analytics'],
      difficulty: 'advanced',
      growth: 95,
      image: '🔒',
      skillProgression: {
        beginner: ['Basic security concepts', 'Network fundamentals', 'Operating systems', 'Programming basics'],
        intermediate: ['Penetration testing', 'Security tools', 'Risk assessment', 'Incident response'],
        advanced: ['Advanced threat analysis', 'Security architecture', 'Team leadership', 'Strategic planning'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '3-5 years'
      },
      learningPath: {
        fundamentals: ['Security fundamentals', 'Network security', 'Operating systems', 'Programming'],
        intermediate: ['Penetration testing', 'Security tools', 'Risk management', 'Compliance'],
        advanced: ['Advanced threats', 'Security architecture', 'Leadership', 'Strategy'],
        recommendedResources: ['CISSP', 'CEH', 'OSCP', 'SANS Training']
      },
      careerOpportunities: {
        entryRoles: ['Security Analyst', 'Junior Penetration Tester', 'Security Administrator', 'Compliance Officer'],
        midLevelRoles: ['Security Engineer', 'Penetration Tester', 'Security Consultant', 'Risk Manager'],
        seniorRoles: ['Senior Security Engineer', 'Security Architect', 'CISO', 'Security Director'],
        industries: ['Technology', 'Finance', 'Healthcare', 'Government', 'Defense', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹10-50 LPA',
        remoteOpportunities: 70
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Risk Assessment', 'Problem Solving', 'Communication', 'Project Management'],
        complementaryDomains: ['Data Science', 'Compliance', 'Business Analysis']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI Security', 'Zero Trust Architecture', 'Cloud Security', 'IoT Security']
      }
    },
    {
      id: '2',
      title: 'User Experience Design',
      domain: 'Design & Research',
      description: 'Learn to create intuitive, user-centered digital experiences through research, design thinking, and human psychology.',
      coreSkills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
      skillCategories: ['Design Thinking', 'Psychology', 'Research', 'Visual Design'],
      difficulty: 'beginner',
      growth: 75,
      image: '🎨',
      skillProgression: {
        beginner: ['Design thinking basics', 'User research methods', 'Wireframing', 'Prototyping tools'],
        intermediate: ['Advanced research', 'Design systems', 'Accessibility', 'User testing'],
        advanced: ['Strategic design', 'Design leadership', 'Cross-platform design', 'AI/ML integration'],
        timeToIntermediate: '8-15 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Design thinking', 'User research', 'Figma/Sketch', 'Psychology basics'],
        intermediate: ['Advanced prototyping', 'Design systems', 'Accessibility', 'Analytics'],
        advanced: ['Design strategy', 'Leadership', 'Cross-functional collaboration', 'Emerging technologies'],
        recommendedResources: ['Nielsen Norman Group', 'Google UX Certificate', 'IDEO Design Thinking', 'Figma Academy']
      },
      careerOpportunities: {
        entryRoles: ['UX Designer', 'UI Designer', 'UX Researcher', 'Product Designer'],
        midLevelRoles: ['Senior UX Designer', 'UX Lead', 'Product Design Manager', 'Design Systems Designer'],
        seniorRoles: ['UX Director', 'Head of Design', 'Principal Designer', 'VP of Design'],
        industries: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Government']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹4-20 LPA',
        remoteOpportunities: 70
      },
      skillVersatility: {
        transferableSkills: ['Empathy', 'Problem solving', 'Communication', 'Analytical thinking'],
        complementaryDomains: ['Frontend Development', 'Product Management', 'Marketing', 'Psychology'],
        crossIndustryValue: 5
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI-powered design', 'Voice interfaces', 'AR/VR design', 'Inclusive design']
      }
    },
    {
      id: '3',
      title: 'Data Science',
      domain: 'Analytics & AI',
      description: 'Master the art of extracting insights from data using statistical analysis, machine learning, and advanced analytics.',
      coreSkills: ['Python/R', 'Machine Learning', 'Statistics', 'Data Visualization'],
      skillCategories: ['Mathematics', 'Programming', 'Analytics', 'AI/ML'],
      difficulty: 'intermediate',
      growth: 90,
      image: '📊',
      skillProgression: {
        beginner: ['Python basics', 'Data manipulation', 'Basic statistics', 'Visualization'],
        intermediate: ['Machine learning', 'Advanced statistics', 'Database management', 'Model deployment'],
        advanced: ['Deep learning', 'Big data processing', 'MLOps', 'AI strategy'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Python/R programming', 'Statistics', 'SQL', 'Data visualization'],
        intermediate: ['Machine learning', 'Data engineering', 'Cloud platforms', 'Advanced analytics'],
        advanced: ['Deep learning', 'MLOps', 'AI strategy', 'Big data technologies'],
        recommendedResources: ['Kaggle Learn', 'Coursera ML Course', 'Fast.ai', 'Towards Data Science']
      },
      careerOpportunities: {
        entryRoles: ['Data Analyst', 'Junior Data Scientist', 'Business Analyst', 'Research Assistant'],
        midLevelRoles: ['Data Scientist', 'ML Engineer', 'Analytics Manager', 'Research Scientist'],
        seniorRoles: ['Senior Data Scientist', 'Principal Data Scientist', 'Head of Data', 'Chief Data Officer'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting', 'Research']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-30 LPA',
        remoteOpportunities: 75
      },
      skillVersatility: {
        transferableSkills: ['Problem solving', 'Analytical thinking', 'Communication', 'Critical thinking'],
        complementaryDomains: ['Software Engineering', 'Product Management', 'Business Intelligence', 'Research'],
        crossIndustryValue: 5
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['LLMs', 'AutoML', 'Edge AI', 'Quantum Computing']
      }
    },
    {
      id: '4',
      title: 'Digital Marketing',
      domain: 'Marketing & Growth',
      description: 'Master digital marketing strategies, analytics, and growth hacking techniques to drive business success.',
      coreSkills: ['SEO/SEM', 'Social Media Marketing', 'Analytics', 'Content Strategy', 'Email Marketing', 'PPC Advertising'],
      skillCategories: ['Growth Marketing', 'Analytics', 'Content Creation', 'Campaign Management'],
      difficulty: 'intermediate',
      growth: 70,
      image: '📈',
      skillProgression: {
        beginner: ['Basic SEO', 'Social Media Basics', 'Google Analytics', 'Content Writing'],
        intermediate: ['Advanced SEO', 'PPC Campaigns', 'Marketing Automation', 'A/B Testing'],
        advanced: ['Growth Hacking', 'Marketing Strategy', 'Team Leadership', 'ROI Optimization'],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years'
      },
      learningPath: {
        fundamentals: ['Digital Marketing Basics', 'Analytics Tools', 'Content Strategy'],
        intermediate: ['Advanced Analytics', 'Marketing Automation', 'Growth Hacking'],
        advanced: ['Marketing Leadership', 'Strategic Planning', 'Cross-channel Integration'],
        recommendedResources: ['Google Digital Garage', 'HubSpot Academy', 'Facebook Blueprint', 'Coursera Marketing']
      },
      careerOpportunities: {
        entryRoles: ['Marketing Coordinator', 'Social Media Manager', 'Content Creator', 'SEO Specialist'],
        midLevelRoles: ['Digital Marketing Manager', 'Growth Manager', 'Marketing Analyst', 'Campaign Manager'],
        seniorRoles: ['Marketing Director', 'Head of Growth', 'VP of Marketing', 'Chief Marketing Officer'],
        industries: ['E-commerce', 'SaaS', 'Technology', 'Retail', 'Media', 'Education']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹4-15 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Analytics', 'Communication', 'Project Management', 'Creative Thinking'],
        complementaryDomains: ['Product Management', 'Business Analysis', 'Content Creation']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI Marketing', 'Voice Search', 'Personalization', 'Privacy-First Marketing']
      }
    },
    {
      id: '5',
      title: 'Product Management',
      domain: 'Strategy & Leadership',
      description: 'Master the art of product strategy, user research, and cross-functional leadership to build successful products.',
      coreSkills: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Analytics', 'Stakeholder Management', 'Roadmap Planning'],
      skillCategories: ['Strategy', 'Research', 'Leadership', 'Analytics'],
      difficulty: 'advanced',
      growth: 80,
      image: '🚀',
      skillProgression: {
        beginner: ['Product Basics', 'User Research', 'Agile Fundamentals', 'Analytics Tools'],
        intermediate: ['Product Strategy', 'Cross-functional Leadership', 'Data Analysis', 'Market Research'],
        advanced: ['Product Vision', 'Strategic Planning', 'Team Leadership', 'Business Acumen'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Product Management Basics', 'User Research Methods', 'Agile Methodologies'],
        intermediate: ['Advanced Analytics', 'Strategic Thinking', 'Leadership Skills'],
        advanced: ['Product Vision', 'Business Strategy', 'Executive Communication'],
        recommendedResources: ['Google PM Certificate', 'Coursera Product Management', 'Product School', 'Harvard Business Review']
      },
      careerOpportunities: {
        entryRoles: ['Associate Product Manager', 'Product Analyst', 'Junior PM', 'Product Coordinator'],
        midLevelRoles: ['Product Manager', 'Senior PM', 'Product Lead', 'Product Owner'],
        seniorRoles: ['Senior Product Manager', 'Principal PM', 'VP of Product', 'Chief Product Officer'],
        industries: ['Technology', 'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹10-35 LPA',
        remoteOpportunities: 70
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Strategic Thinking', 'Leadership', 'Analytics', 'Communication'],
        complementaryDomains: ['Business Analysis', 'Digital Marketing', 'Data Science']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['AI Product Management', 'Platform Strategy', 'Data-Driven Decisions', 'Customer Success']
      }
    },
    {
      id: '6',
      title: 'Content Creation',
      domain: 'Writing & Communication',
      description: 'Master the art of creating compelling content across multiple platforms and formats to engage audiences.',
      coreSkills: ['Content Writing', 'SEO', 'Social Media', 'Research', 'Storytelling', 'Video Scripting'],
      skillCategories: ['Writing', 'SEO', 'Social Media', 'Research'],
      difficulty: 'beginner',
      growth: 60,
      image: '✍️',
      skillProgression: {
        beginner: ['Basic Writing', 'SEO Fundamentals', 'Social Media Basics', 'Research Skills'],
        intermediate: ['Advanced Writing', 'Content Strategy', 'Video Content', 'Analytics'],
        advanced: ['Content Leadership', 'Brand Voice', 'Multi-platform Strategy', 'Team Management'],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years'
      },
      learningPath: {
        fundamentals: ['Writing Basics', 'SEO Fundamentals', 'Content Strategy'],
        intermediate: ['Advanced SEO', 'Video Content', 'Social Media Strategy'],
        advanced: ['Content Leadership', 'Brand Strategy', 'Multi-channel Marketing'],
        recommendedResources: ['Content Marketing Institute', 'HubSpot Academy', 'Coursera Writing', 'Grammarly']
      },
      careerOpportunities: {
        entryRoles: ['Content Writer', 'Blog Writer', 'Social Media Writer', 'Copywriter'],
        midLevelRoles: ['Senior Content Writer', 'Content Manager', 'SEO Writer', 'Video Scriptwriter'],
        seniorRoles: ['Content Director', 'Head of Content', 'VP of Marketing', 'Chief Content Officer'],
        industries: ['Media', 'Marketing', 'E-commerce', 'Technology', 'Education', 'Publishing']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹3-12 LPA',
        remoteOpportunities: 85
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Communication', 'Research', 'Creativity', 'Project Management'],
        complementaryDomains: ['Digital Marketing', 'UX Design', 'Business Analysis']
      },
      futureRelevance: {
        automationResistance: 'low',
        aiEnhancement: 'high',
        emergingTrends: ['AI Writing Tools', 'Video Content', 'Interactive Content', 'Personalization']
      }
    },
    {
      id: '7',
      title: 'DevOps Engineering',
      domain: 'Infrastructure & Operations',
      description: 'Master infrastructure automation, deployment pipelines, and cloud-native technologies for scalable systems.',
      coreSkills: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
      skillCategories: ['Cloud', 'Automation', 'Security', 'Monitoring'],
      difficulty: 'advanced',
      growth: 85,
      image: '⚙️',
      skillProgression: {
        beginner: ['Linux Basics', 'Cloud Fundamentals', 'Docker Basics', 'Git'],
        intermediate: ['Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring'],
        advanced: ['Cloud Architecture', 'Security', 'Team Leadership', 'Strategic Planning'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Linux Administration', 'Cloud Basics', 'Docker Fundamentals'],
        intermediate: ['Kubernetes', 'CI/CD', 'Infrastructure as Code'],
        advanced: ['Cloud Architecture', 'Security', 'Leadership'],
        recommendedResources: ['AWS Training', 'Docker Academy', 'Kubernetes.io', 'Terraform Docs']
      },
      careerOpportunities: {
        entryRoles: ['Junior DevOps', 'Cloud Engineer', 'Infrastructure Engineer', 'Platform Engineer'],
        midLevelRoles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect', 'Platform Lead'],
        seniorRoles: ['Senior DevOps', 'Principal Engineer', 'VP of Engineering', 'CTO'],
        industries: ['Technology', 'Fintech', 'E-commerce', 'Healthcare', 'Gaming', 'Media']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹8-25 LPA',
        remoteOpportunities: 75
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Problem Solving', 'Automation', 'Security', 'Leadership'],
        complementaryDomains: ['Data Science', 'Product Management', 'Business Analysis']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['GitOps', 'Cloud Native', 'AI/ML Infrastructure', 'Edge Computing']
      }
    },
    {
      id: '8',
      title: 'Business Analysis',
      domain: 'Strategy & Analytics',
      description: 'Master business process analysis, data interpretation, and strategic recommendations to drive organizational success.',
      coreSkills: ['Data Analysis', 'SQL', 'Excel', 'Communication', 'Process Mapping', 'Stakeholder Management'],
      skillCategories: ['Analytics', 'Communication', 'Strategy', 'Process'],
      difficulty: 'intermediate',
      growth: 65,
      image: '📊',
      skillProgression: {
        beginner: ['Basic Analytics', 'Excel', 'Communication', 'Process Mapping'],
        intermediate: ['Advanced SQL', 'Data Visualization', 'Stakeholder Management', 'Requirements Gathering'],
        advanced: ['Strategic Analysis', 'Change Management', 'Team Leadership', 'Business Strategy'],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years'
      },
      learningPath: {
        fundamentals: ['Business Analysis Basics', 'Data Analysis', 'Communication Skills'],
        intermediate: ['Advanced Analytics', 'Process Improvement', 'Stakeholder Management'],
        advanced: ['Strategic Planning', 'Change Management', 'Leadership'],
        recommendedResources: ['IIBA CBAP', 'Coursera Business Analysis', 'Tableau Training', 'Harvard Business Review']
      },
      careerOpportunities: {
        entryRoles: ['Junior Business Analyst', 'Data Analyst', 'Process Analyst', 'Requirements Analyst'],
        midLevelRoles: ['Business Analyst', 'Senior BA', 'Process Improvement Specialist', 'Data Analyst'],
        seniorRoles: ['Senior Business Analyst', 'Principal BA', 'VP of Strategy', 'Chief Strategy Officer'],
        industries: ['Consulting', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Government']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹5-15 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Analytical Thinking', 'Communication', 'Problem Solving', 'Project Management'],
        complementaryDomains: ['Product Management', 'Digital Marketing', 'Data Science']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI Analytics', 'Predictive Modeling', 'Data Visualization', 'Process Automation']
      }
    },
    {
      id: '9',
      title: 'Mobile Development',
      domain: 'App Development',
      description: 'Master mobile app development across iOS and Android platforms using modern frameworks and best practices.',
      coreSkills: ['React Native', 'Flutter', 'iOS/Android', 'APIs', 'UI/UX', 'Performance Optimization'],
      skillCategories: ['Mobile', 'Cross-platform', 'UI/UX', 'APIs'],
      difficulty: 'intermediate',
      growth: 75,
      image: '📱',
      skillProgression: {
        beginner: ['Mobile Basics', 'React Native/Flutter', 'UI/UX Fundamentals', 'API Integration'],
        intermediate: ['Advanced Frameworks', 'Performance Optimization', 'State Management', 'Testing'],
        advanced: ['Architecture', 'Team Leadership', 'Platform Strategy', 'Business Acumen'],
        timeToIntermediate: '8-12 months',
        timeToAdvanced: '2-3 years'
      },
      learningPath: {
        fundamentals: ['Mobile Development Basics', 'React Native/Flutter', 'UI/UX Design'],
        intermediate: ['Advanced Frameworks', 'Performance', 'Testing'],
        advanced: ['Architecture', 'Leadership', 'Strategy'],
        recommendedResources: ['React Native Docs', 'Flutter Docs', 'Apple Developer', 'Google Mobile Training']
      },
      careerOpportunities: {
        entryRoles: ['Junior Mobile Developer', 'React Native Developer', 'Flutter Developer', 'iOS/Android Developer'],
        midLevelRoles: ['Mobile Developer', 'Senior Mobile Dev', 'Cross-platform Developer', 'Mobile Lead'],
        seniorRoles: ['Senior Mobile Developer', 'Principal Mobile Engineer', 'VP of Engineering', 'CTO'],
        industries: ['Technology', 'Gaming', 'E-commerce', 'Fintech', 'Healthcare', 'Media']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-18 LPA',
        remoteOpportunities: 70
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Problem Solving', 'UI/UX', 'APIs', 'Project Management'],
        complementaryDomains: ['UX Design', 'Product Management', 'Data Science']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Cross-platform', 'AI Integration', 'AR/VR', 'Progressive Web Apps']
      }
    },
    {
      id: '10',
      title: 'Sales & Business Development',
      domain: 'Revenue & Growth',
      description: 'Master sales strategies, relationship building, and revenue generation to drive business growth.',
      coreSkills: ['Communication', 'CRM', 'Negotiation', 'Product Knowledge', 'Relationship Building', 'Sales Strategy'],
      skillCategories: ['Sales', 'Communication', 'Strategy', 'Relationships'],
      difficulty: 'beginner',
      growth: 55,
      image: '💼',
      skillProgression: {
        beginner: ['Sales Basics', 'Communication', 'Product Knowledge', 'CRM Usage'],
        intermediate: ['Advanced Sales', 'Negotiation', 'Account Management', 'Sales Strategy'],
        advanced: ['Sales Leadership', 'Team Management', 'Strategic Planning', 'Business Development'],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years'
      },
      learningPath: {
        fundamentals: ['Sales Fundamentals', 'Communication Skills', 'Product Knowledge'],
        intermediate: ['Advanced Sales', 'Negotiation', 'Account Management'],
        advanced: ['Sales Leadership', 'Strategy', 'Business Development'],
        recommendedResources: ['Salesforce Training', 'HubSpot Academy', 'SPIN Selling', 'Harvard Business Review']
      },
      careerOpportunities: {
        entryRoles: ['Sales Executive', 'Business Development Rep', 'Account Executive', 'Inside Sales'],
        midLevelRoles: ['Senior Sales Executive', 'Account Manager', 'Sales Manager', 'Business Development Manager'],
        seniorRoles: ['Sales Director', 'VP of Sales', 'Chief Revenue Officer', 'CEO'],
        industries: ['SaaS', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹4-15 LPA',
        remoteOpportunities: 40
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Communication', 'Negotiation', 'Relationship Building', 'Strategic Thinking'],
        complementaryDomains: ['Digital Marketing', 'Product Management', 'Business Analysis']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI Sales Tools', 'Social Selling', 'Account-Based Marketing', 'Sales Analytics']
      }
    },
    // HEALTHCARE & LIFE SCIENCES
    {
      id: '11',
      title: 'Biomedical Engineering',
      domain: 'Healthcare Technology',
      description: 'Design medical devices, prosthetics, and healthcare technology to improve patient outcomes and quality of life.',
      coreSkills: ['Medical Device Design', 'Biomechanics', 'Signal Processing', 'Regulatory Compliance', 'Clinical Research', 'Prototyping'],
      skillCategories: ['Engineering', 'Healthcare', 'Research', 'Innovation'],
      difficulty: 'advanced',
      growth: 75,
      image: '🏥',
      skillProgression: {
        beginner: ['Basic engineering principles', 'Biology fundamentals', 'CAD software', 'Medical terminology'],
        intermediate: ['Medical device design', 'Biomechanical analysis', 'Clinical trials', 'Regulatory processes'],
        advanced: ['Advanced prosthetics', 'Neural interfaces', 'Team leadership', 'Research innovation'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '4-5 years'
      },
      learningPath: {
        fundamentals: ['Engineering basics', 'Biology', 'CAD design', 'Medical terminology'],
        intermediate: ['Medical devices', 'Biomechanics', 'Clinical research', 'Regulatory affairs'],
        advanced: ['Advanced prosthetics', 'Neural engineering', 'Leadership', 'Innovation'],
        recommendedResources: ['IEEE Engineering', 'Medical Device Design', 'Biomechanics Journals', 'FDA Guidelines']
      },
      careerOpportunities: {
        entryRoles: ['Biomedical Technician', 'Medical Device Designer', 'Research Assistant', 'Quality Engineer'],
        midLevelRoles: ['Biomedical Engineer', 'Senior Designer', 'Clinical Engineer', 'Regulatory Specialist'],
        seniorRoles: ['Principal Engineer', 'Director of R&D', 'Chief Technology Officer', 'Research Director'],
        industries: ['Healthcare', 'Medical Devices', 'Pharmaceuticals', 'Research', 'Government', 'Academia']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-35 LPA',
        remoteOpportunities: 40
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Problem Solving', 'Research', 'Project Management', 'Technical Communication'],
        complementaryDomains: ['Software Engineering', 'Data Science', 'Healthcare Management']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI in Healthcare', 'Wearable Technology', 'Telemedicine', 'Personalized Medicine']
      }
    },
    {
      id: '12',
      title: 'Public Health',
      domain: 'Community Health',
      description: 'Improve community health outcomes through policy, research, and program development for population health.',
      coreSkills: ['Epidemiology', 'Health Policy', 'Data Analysis', 'Program Management', 'Community Outreach', 'Research'],
      skillCategories: ['Healthcare', 'Policy', 'Research', 'Community'],
      difficulty: 'intermediate',
      growth: 80,
      image: '🌍',
      skillProgression: {
        beginner: ['Public health basics', 'Statistics', 'Health systems', 'Community assessment'],
        intermediate: ['Epidemiology', 'Policy analysis', 'Program design', 'Data interpretation'],
        advanced: ['Health policy development', 'Research leadership', 'Global health', 'Strategic planning'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Public health principles', 'Statistics', 'Health systems', 'Community health'],
        intermediate: ['Epidemiology', 'Health policy', 'Program management', 'Research methods'],
        advanced: ['Policy development', 'Global health', 'Leadership', 'Strategic planning'],
        recommendedResources: ['WHO Guidelines', 'CDC Training', 'Public Health Journals', 'Global Health Courses']
      },
      careerOpportunities: {
        entryRoles: ['Health Educator', 'Program Coordinator', 'Research Assistant', 'Community Health Worker'],
        midLevelRoles: ['Public Health Specialist', 'Program Manager', 'Epidemiologist', 'Policy Analyst'],
        seniorRoles: ['Public Health Director', 'Chief Health Officer', 'Policy Director', 'Global Health Leader'],
        industries: ['Government', 'NGOs', 'Healthcare', 'International Organizations', 'Research', 'Academia']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹4-25 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Data Analysis', 'Project Management', 'Communication', 'Research'],
        complementaryDomains: ['Data Science', 'Policy Analysis', 'Healthcare Management']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Digital Health', 'Pandemic Preparedness', 'Health Equity', 'Climate Health']
      }
    },
    // CREATIVE & DESIGN
    {
      id: '13',
      title: 'Architecture',
      domain: 'Built Environment',
      description: 'Design sustainable, functional, and beautiful spaces that enhance human experience and environmental harmony.',
      coreSkills: ['Design Thinking', 'CAD Software', 'Sustainable Design', 'Project Management', 'Client Relations', 'Building Codes'],
      skillCategories: ['Design', 'Engineering', 'Sustainability', 'Project Management'],
      difficulty: 'advanced',
      growth: 70,
      image: '🏗️',
      skillProgression: {
        beginner: ['Design fundamentals', 'CAD basics', 'Building systems', 'Drawing skills'],
        intermediate: ['Advanced design', 'Sustainable practices', 'Project management', 'Client presentation'],
        advanced: ['Complex projects', 'Team leadership', 'Business development', 'Innovation'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '4-5 years'
      },
      learningPath: {
        fundamentals: ['Design principles', 'CAD software', 'Building systems', 'Drawing'],
        intermediate: ['Advanced design', 'Sustainability', 'Project management', 'Presentation'],
        advanced: ['Complex projects', 'Leadership', 'Business', 'Innovation'],
        recommendedResources: ['Architecture Schools', 'CAD Software', 'Sustainable Design', 'Building Codes']
      },
      careerOpportunities: {
        entryRoles: ['Junior Architect', 'Design Assistant', 'CAD Technician', 'Project Coordinator'],
        midLevelRoles: ['Architect', 'Senior Designer', 'Project Manager', 'Design Lead'],
        seniorRoles: ['Principal Architect', 'Design Director', 'Partner', 'Studio Owner'],
        industries: ['Architecture', 'Construction', 'Real Estate', 'Government', 'Consulting', 'Education']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹5-30 LPA',
        remoteOpportunities: 30
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Design Thinking', 'Project Management', 'Communication', 'Problem Solving'],
        complementaryDomains: ['Urban Planning', 'Interior Design', 'Construction Management']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Sustainable Design', 'Smart Buildings', '3D Printing', 'Virtual Reality']
      }
    },
    // BUSINESS & FINANCE
    {
      id: '14',
      title: 'Investment Banking',
      domain: 'Financial Services',
      description: 'Facilitate capital raising, mergers, and acquisitions for corporations and governments in global financial markets.',
      coreSkills: ['Financial Modeling', 'Valuation', 'Deal Structuring', 'Market Analysis', 'Client Relations', 'Risk Assessment'],
      skillCategories: ['Finance', 'Analytics', 'Strategy', 'Communication'],
      difficulty: 'advanced',
      growth: 85,
      image: '💰',
      skillProgression: {
        beginner: ['Financial basics', 'Excel modeling', 'Accounting', 'Market research'],
        intermediate: ['Advanced modeling', 'Deal analysis', 'Client presentation', 'Industry knowledge'],
        advanced: ['Deal leadership', 'Client relationship management', 'Team management', 'Strategic thinking'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Finance basics', 'Excel modeling', 'Accounting', 'Economics'],
        intermediate: ['Financial modeling', 'Deal analysis', 'Presentation skills', 'Industry knowledge'],
        advanced: ['Deal leadership', 'Client management', 'Team leadership', 'Strategy'],
        recommendedResources: ['CFA Program', 'Investment Banking Courses', 'Financial Modeling', 'Industry Reports']
      },
      careerOpportunities: {
        entryRoles: ['Analyst', 'Associate', 'Research Assistant', 'Junior Banker'],
        midLevelRoles: ['Senior Analyst', 'Associate', 'Vice President', 'Deal Manager'],
        seniorRoles: ['Managing Director', 'Partner', 'Head of Division', 'Chief Investment Officer'],
        industries: ['Investment Banking', 'Private Equity', 'Hedge Funds', 'Corporate Finance', 'Government', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'stable',
        salaryRange: '₹15-80 LPA',
        remoteOpportunities: 20
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Analytical Thinking', 'Communication', 'Project Management', 'Strategic Thinking'],
        complementaryDomains: ['Corporate Finance', 'Private Equity', 'Management Consulting']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['Fintech', 'ESG Investing', 'Digital Assets', 'Sustainable Finance']
      }
    },
    {
      id: '15',
      title: 'Supply Chain Management',
      domain: 'Operations & Logistics',
      description: 'Optimize global supply chains, manage logistics, and ensure efficient product flow from source to consumer.',
      coreSkills: ['Logistics Planning', 'Inventory Management', 'Supplier Relations', 'Data Analysis', 'Process Optimization', 'Risk Management'],
      skillCategories: ['Operations', 'Analytics', 'Management', 'Strategy'],
      difficulty: 'intermediate',
      growth: 75,
      image: '📦',
      skillProgression: {
        beginner: ['Supply chain basics', 'Inventory management', 'Data analysis', 'Process mapping'],
        intermediate: ['Advanced planning', 'Supplier management', 'Cost optimization', 'Technology integration'],
        advanced: ['Strategic planning', 'Global operations', 'Team leadership', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Supply chain principles', 'Inventory management', 'Data analysis', 'Process optimization'],
        intermediate: ['Advanced planning', 'Supplier relations', 'Technology', 'Cost management'],
        advanced: ['Strategic planning', 'Global operations', 'Leadership', 'Innovation'],
        recommendedResources: ['APICS Certification', 'Supply Chain Courses', 'Industry Reports', 'Technology Platforms']
      },
      careerOpportunities: {
        entryRoles: ['Supply Chain Analyst', 'Logistics Coordinator', 'Inventory Specialist', 'Procurement Assistant'],
        midLevelRoles: ['Supply Chain Manager', 'Operations Manager', 'Procurement Manager', 'Logistics Manager'],
        seniorRoles: ['Supply Chain Director', 'VP of Operations', 'Chief Supply Chain Officer', 'Operations Director'],
        industries: ['Manufacturing', 'Retail', 'E-commerce', 'Automotive', 'Pharmaceuticals', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-35 LPA',
        remoteOpportunities: 50
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Problem Solving', 'Data Analysis', 'Project Management', 'Communication'],
        complementaryDomains: ['Operations Management', 'Data Science', 'Business Analysis']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI in Logistics', 'Blockchain', 'Sustainability', 'Resilience Planning']
      }
    },
    // EMERGING & UNDERRATED
    {
      id: '16',
      title: 'Sustainability Consulting',
      domain: 'Environmental Impact',
      description: 'Help organizations reduce environmental impact, implement sustainable practices, and achieve ESG goals.',
      coreSkills: ['Environmental Assessment', 'Carbon Footprinting', 'ESG Reporting', 'Sustainability Strategy', 'Stakeholder Engagement', 'Data Analysis'],
      skillCategories: ['Sustainability', 'Strategy', 'Analytics', 'Consulting'],
      difficulty: 'intermediate',
      growth: 90,
      image: '🌱',
      skillProgression: {
        beginner: ['Sustainability basics', 'Environmental science', 'Data analysis', 'Reporting standards'],
        intermediate: ['ESG assessment', 'Strategy development', 'Stakeholder management', 'Project management'],
        advanced: ['Strategic consulting', 'Team leadership', 'Business development', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Sustainability principles', 'Environmental science', 'Data analysis', 'Reporting'],
        intermediate: ['ESG assessment', 'Strategy', 'Stakeholder management', 'Project management'],
        advanced: ['Consulting', 'Leadership', 'Business development', 'Innovation'],
        recommendedResources: ['GRI Standards', 'SASB', 'Sustainability Courses', 'Industry Reports']
      },
      careerOpportunities: {
        entryRoles: ['Sustainability Analyst', 'Environmental Consultant', 'ESG Specialist', 'Research Assistant'],
        midLevelRoles: ['Sustainability Manager', 'ESG Manager', 'Environmental Manager', 'Consultant'],
        seniorRoles: ['Sustainability Director', 'Chief Sustainability Officer', 'Partner', 'Practice Lead'],
        industries: ['Consulting', 'Corporate', 'NGOs', 'Government', 'Financial Services', 'Manufacturing']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-40 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Strategic Thinking', 'Data Analysis', 'Communication', 'Project Management'],
        complementaryDomains: ['Management Consulting', 'Data Science', 'Public Policy']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Climate Tech', 'Circular Economy', 'Carbon Markets', 'Green Finance']
      }
    },
    {
      id: '17',
      title: 'Digital Forensics',
      domain: 'Cyber Investigation',
      description: 'Investigate cybercrimes, analyze digital evidence, and provide expert testimony in legal proceedings.',
      coreSkills: ['Digital Evidence Analysis', 'Computer Forensics', 'Network Forensics', 'Legal Procedures', 'Incident Response', 'Tool Proficiency'],
      skillCategories: ['Cybersecurity', 'Investigation', 'Legal', 'Technology'],
      difficulty: 'advanced',
      growth: 85,
      image: '🔍',
      skillProgression: {
        beginner: ['Computer basics', 'Operating systems', 'Network fundamentals', 'Legal procedures'],
        intermediate: ['Forensic tools', 'Evidence analysis', 'Incident response', 'Report writing'],
        advanced: ['Advanced forensics', 'Expert testimony', 'Team leadership', 'Research'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '3-5 years'
      },
      learningPath: {
        fundamentals: ['Computer systems', 'Networking', 'Legal procedures', 'Basic forensics'],
        intermediate: ['Forensic tools', 'Evidence analysis', 'Incident response', 'Reporting'],
        advanced: ['Advanced techniques', 'Expert testimony', 'Leadership', 'Research'],
        recommendedResources: ['SANS Forensics', 'EnCase', 'FTK', 'Legal Training']
      },
      careerOpportunities: {
        entryRoles: ['Digital Forensics Analyst', 'Incident Response Analyst', 'Evidence Technician', 'Junior Investigator'],
        midLevelRoles: ['Senior Analyst', 'Forensics Specialist', 'Incident Response Manager', 'Investigator'],
        seniorRoles: ['Principal Analyst', 'Forensics Director', 'Expert Witness', 'Consultant'],
        industries: ['Law Enforcement', 'Government', 'Consulting', 'Corporate', 'Legal', 'Financial Services']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹8-45 LPA',
        remoteOpportunities: 40
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Analytical Thinking', 'Attention to Detail', 'Communication', 'Problem Solving'],
        complementaryDomains: ['Cybersecurity', 'Law', 'Data Science']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI in Forensics', 'Cloud Forensics', 'Mobile Forensics', 'IoT Investigation']
      }
    },
    {
      id: '18',
      title: 'Urban Planning',
      domain: 'Smart Cities',
      description: 'Design sustainable, livable cities through data-driven planning, community engagement, and smart technology integration.',
      coreSkills: ['City Planning', 'Data Analysis', 'Community Engagement', 'GIS Software', 'Policy Development', 'Sustainability'],
      skillCategories: ['Planning', 'Data Analysis', 'Policy', 'Community'],
      difficulty: 'intermediate',
      growth: 80,
      image: '🏙️',
      skillProgression: {
        beginner: ['Planning basics', 'GIS software', 'Community engagement', 'Policy understanding'],
        intermediate: ['Advanced planning', 'Data analysis', 'Project management', 'Stakeholder relations'],
        advanced: ['Strategic planning', 'Policy development', 'Team leadership', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Urban planning', 'GIS software', 'Community engagement', 'Policy'],
        intermediate: ['Advanced planning', 'Data analysis', 'Project management', 'Stakeholders'],
        advanced: ['Strategic planning', 'Policy development', 'Leadership', 'Innovation'],
        recommendedResources: ['APA Resources', 'GIS Training', 'Planning Schools', 'Smart City Initiatives']
      },
      careerOpportunities: {
        entryRoles: ['Planning Assistant', 'GIS Analyst', 'Community Planner', 'Research Assistant'],
        midLevelRoles: ['Urban Planner', 'Senior Planner', 'Project Manager', 'Policy Analyst'],
        seniorRoles: ['Planning Director', 'Chief Planner', 'City Manager', 'Consultant'],
        industries: ['Government', 'Consulting', 'Real Estate', 'NGOs', 'International Organizations', 'Academia']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹5-30 LPA',
        remoteOpportunities: 30
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Strategic Thinking', 'Data Analysis', 'Communication', 'Project Management'],
        complementaryDomains: ['Architecture', 'Environmental Science', 'Public Policy']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['Smart Cities', 'Climate Adaptation', 'Mobility Innovation', 'Digital Twins']
      }
    },
    {
      id: '19',
      title: 'Renewable Energy',
      domain: 'Clean Technology',
      description: 'Develop and implement clean energy solutions including solar, wind, and energy storage technologies.',
      coreSkills: ['Energy Systems', 'Project Management', 'Technical Design', 'Regulatory Compliance', 'Financial Analysis', 'Stakeholder Management'],
      skillCategories: ['Engineering', 'Sustainability', 'Project Management', 'Finance'],
      difficulty: 'intermediate',
      growth: 95,
      image: '⚡',
      skillProgression: {
        beginner: ['Energy basics', 'Technical fundamentals', 'Project basics', 'Regulatory understanding'],
        intermediate: ['System design', 'Project management', 'Financial analysis', 'Stakeholder management'],
        advanced: ['Complex projects', 'Strategic planning', 'Team leadership', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Energy systems', 'Technical design', 'Project management', 'Regulations'],
        intermediate: ['Advanced design', 'Financial analysis', 'Stakeholder management', 'Technology'],
        advanced: ['Complex projects', 'Strategic planning', 'Leadership', 'Innovation'],
        recommendedResources: ['NREL Resources', 'IEA Reports', 'Energy Courses', 'Industry Certifications']
      },
      careerOpportunities: {
        entryRoles: ['Energy Analyst', 'Project Coordinator', 'Design Engineer', 'Field Technician'],
        midLevelRoles: ['Project Manager', 'Senior Engineer', 'Development Manager', 'Technical Lead'],
        seniorRoles: ['Project Director', 'VP of Development', 'Chief Technology Officer', 'Consultant'],
        industries: ['Energy', 'Utilities', 'Manufacturing', 'Consulting', 'Government', 'International Development']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-40 LPA',
        remoteOpportunities: 50
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Project Management', 'Technical Analysis', 'Communication', 'Problem Solving'],
        complementaryDomains: ['Engineering', 'Finance', 'Environmental Science']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Energy Storage', 'Grid Modernization', 'Hydrogen Economy', 'Carbon Capture']
      }
    },
    {
      id: '20',
      title: 'Space Technology',
      domain: 'Aerospace & Exploration',
      description: 'Develop technologies for space exploration, satellite systems, and commercial space applications.',
      coreSkills: ['Aerospace Engineering', 'Systems Engineering', 'Mission Planning', 'Satellite Technology', 'Launch Systems', 'Data Analysis'],
      skillCategories: ['Engineering', 'Technology', 'Research', 'Innovation'],
      difficulty: 'advanced',
      growth: 90,
      image: '🚀',
      skillProgression: {
        beginner: ['Engineering basics', 'Physics fundamentals', 'Mathematics', 'Programming'],
        intermediate: ['Aerospace systems', 'Mission design', 'Project management', 'Technical analysis'],
        advanced: ['Complex missions', 'Team leadership', 'Strategic planning', 'Innovation'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '4-5 years'
      },
      learningPath: {
        fundamentals: ['Engineering', 'Physics', 'Mathematics', 'Programming'],
        intermediate: ['Aerospace systems', 'Mission design', 'Project management', 'Analysis'],
        advanced: ['Complex missions', 'Leadership', 'Strategic planning', 'Innovation'],
        recommendedResources: ['NASA Resources', 'Aerospace Courses', 'Space Industry', 'Technical Journals']
      },
      careerOpportunities: {
        entryRoles: ['Aerospace Engineer', 'Mission Analyst', 'Systems Engineer', 'Research Assistant'],
        midLevelRoles: ['Senior Engineer', 'Mission Manager', 'Project Lead', 'Technical Specialist'],
        seniorRoles: ['Principal Engineer', 'Mission Director', 'Chief Engineer', 'VP of Engineering'],
        industries: ['Aerospace', 'Defense', 'Government', 'Commercial Space', 'Research', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹8-50 LPA',
        remoteOpportunities: 30
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Systems Thinking', 'Problem Solving', 'Project Management', 'Innovation'],
        complementaryDomains: ['Software Engineering', 'Data Science', 'Mechanical Engineering']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['Commercial Space', 'Satellite Constellations', 'Space Tourism', 'Lunar/Mars Missions']
      }
    },
    // EDUCATION & RESEARCH
    {
      id: '21',
      title: 'Educational Technology',
      domain: 'Learning Innovation',
      description: 'Design and implement technology solutions to enhance learning experiences and educational outcomes.',
      coreSkills: ['Learning Design', 'Educational Psychology', 'Technology Integration', 'Data Analysis', 'User Research', 'Content Development'],
      skillCategories: ['Education', 'Technology', 'Research', 'Design'],
      difficulty: 'intermediate',
      growth: 85,
      image: '📚',
      skillProgression: {
        beginner: ['Education basics', 'Technology fundamentals', 'Learning theories', 'Basic design'],
        intermediate: ['Learning design', 'Technology integration', 'Data analysis', 'User research'],
        advanced: ['Strategic planning', 'Team leadership', 'Innovation', 'Research'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Education principles', 'Technology basics', 'Learning theories', 'Design'],
        intermediate: ['Learning design', 'Technology integration', 'Data analysis', 'Research'],
        advanced: ['Strategic planning', 'Leadership', 'Innovation', 'Research'],
        recommendedResources: ['EdTech Courses', 'Learning Design', 'Educational Research', 'Technology Platforms']
      },
      careerOpportunities: {
        entryRoles: ['EdTech Specialist', 'Learning Designer', 'Instructional Designer', 'Technology Coordinator'],
        midLevelRoles: ['Senior Designer', 'EdTech Manager', 'Learning Manager', 'Product Manager'],
        seniorRoles: ['EdTech Director', 'Chief Learning Officer', 'VP of Education', 'Consultant'],
        industries: ['Education', 'Technology', 'Corporate Training', 'Government', 'NGOs', 'Consulting']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹5-35 LPA',
        remoteOpportunities: 70
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Learning Design', 'Technology Integration', 'Communication', 'Project Management'],
        complementaryDomains: ['Software Engineering', 'UX Design', 'Data Science']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI in Education', 'Personalized Learning', 'Virtual Reality', 'Adaptive Learning']
      }
    },
    {
      id: '22',
      title: 'Scientific Research',
      domain: 'Discovery & Innovation',
      description: 'Conduct cutting-edge research to advance scientific knowledge and develop breakthrough technologies.',
      coreSkills: ['Research Methodology', 'Data Analysis', 'Scientific Writing', 'Laboratory Techniques', 'Statistical Analysis', 'Critical Thinking'],
      skillCategories: ['Research', 'Analytics', 'Science', 'Innovation'],
      difficulty: 'advanced',
      growth: 75,
      image: '🔬',
      skillProgression: {
        beginner: ['Research basics', 'Laboratory techniques', 'Data analysis', 'Scientific writing'],
        intermediate: ['Advanced research', 'Statistical analysis', 'Project management', 'Publication'],
        advanced: ['Independent research', 'Team leadership', 'Grant writing', 'Innovation'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '4-6 years'
      },
      learningPath: {
        fundamentals: ['Research methods', 'Laboratory skills', 'Data analysis', 'Scientific writing'],
        intermediate: ['Advanced research', 'Statistics', 'Project management', 'Publication'],
        advanced: ['Independent research', 'Leadership', 'Grant writing', 'Innovation'],
        recommendedResources: ['Research Methods', 'Scientific Journals', 'Laboratory Training', 'Grant Writing']
      },
      careerOpportunities: {
        entryRoles: ['Research Assistant', 'Laboratory Technician', 'Data Analyst', 'Junior Researcher'],
        midLevelRoles: ['Research Scientist', 'Senior Researcher', 'Project Manager', 'Postdoc'],
        seniorRoles: ['Principal Investigator', 'Research Director', 'Professor', 'Chief Scientist'],
        industries: ['Academia', 'Research Institutes', 'Pharmaceuticals', 'Government', 'Technology', 'Healthcare']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹4-30 LPA',
        remoteOpportunities: 40
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Critical Thinking', 'Data Analysis', 'Problem Solving', 'Communication'],
        complementaryDomains: ['Data Science', 'Biomedical Engineering', 'Technology Development']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'high',
        emergingTrends: ['AI in Research', 'Interdisciplinary Studies', 'Open Science', 'Collaborative Research']
      }
    },
    {
      id: '23',
      title: 'Language Teaching',
      domain: 'Cross-Cultural Communication',
      description: 'Teach languages and cultural understanding to bridge communication gaps in our globalized world.',
      coreSkills: ['Language Proficiency', 'Teaching Methods', 'Cultural Awareness', 'Communication', 'Curriculum Design', 'Assessment'],
      skillCategories: ['Education', 'Communication', 'Culture', 'Language'],
      difficulty: 'intermediate',
      growth: 70,
      image: '🗣️',
      skillProgression: {
        beginner: ['Language proficiency', 'Basic teaching', 'Cultural awareness', 'Communication skills'],
        intermediate: ['Advanced teaching', 'Curriculum design', 'Assessment methods', 'Technology integration'],
        advanced: ['Program leadership', 'Teacher training', 'Research', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Language skills', 'Teaching methods', 'Cultural awareness', 'Communication'],
        intermediate: ['Advanced teaching', 'Curriculum design', 'Assessment', 'Technology'],
        advanced: ['Leadership', 'Teacher training', 'Research', 'Innovation'],
        recommendedResources: ['Language Certifications', 'Teaching Methods', 'Cultural Studies', 'Technology Tools']
      },
      careerOpportunities: {
        entryRoles: ['Language Teacher', 'Tutor', 'Language Assistant', 'Cultural Coordinator'],
        midLevelRoles: ['Senior Teacher', 'Curriculum Developer', 'Language Coordinator', 'Program Manager'],
        seniorRoles: ['Language Director', 'Academic Manager', 'Professor', 'Consultant'],
        industries: ['Education', 'International Organizations', 'Corporate Training', 'Government', 'NGOs', 'Online Platforms']
      },
      marketDemand: {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹3-20 LPA',
        remoteOpportunities: 80
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Communication', 'Cultural Awareness', 'Teaching', 'Project Management'],
        complementaryDomains: ['International Business', 'Translation', 'Cultural Studies']
      },
      futureRelevance: {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI Language Learning', 'Virtual Reality', 'Personalized Learning', 'Global Communication']
      }
    },
    // ADDITIONAL DIVERSE CAREERS
    {
      id: '24',
      title: 'Mental Health Counseling',
      domain: 'Psychology & Therapy',
      description: 'Provide therapeutic support, mental health treatment, and psychological counseling to help people overcome challenges.',
      coreSkills: ['Psychology', 'Therapeutic Techniques', 'Active Listening', 'Empathy', 'Assessment', 'Treatment Planning'],
      skillCategories: ['Psychology', 'Healthcare', 'Communication', 'Empathy'],
      difficulty: 'advanced',
      growth: 85,
      image: '🧠',
      skillProgression: {
        beginner: ['Psychology basics', 'Communication skills', 'Ethics', 'Basic techniques'],
        intermediate: ['Therapeutic methods', 'Assessment skills', 'Treatment planning', 'Case management'],
        advanced: ['Specialized therapy', 'Supervision', 'Research', 'Leadership'],
        timeToIntermediate: '18-24 months',
        timeToAdvanced: '4-6 years'
      },
      learningPath: {
        fundamentals: ['Psychology', 'Communication', 'Ethics', 'Basic therapy'],
        intermediate: ['Therapeutic methods', 'Assessment', 'Treatment planning', 'Case management'],
        advanced: ['Specialized therapy', 'Supervision', 'Research', 'Leadership'],
        recommendedResources: ['Psychology Programs', 'Therapy Training', 'Professional Organizations', 'Clinical Practice']
      },
      careerOpportunities: {
        entryRoles: ['Counselor', 'Therapist', 'Mental Health Worker', 'Case Manager'],
        midLevelRoles: ['Licensed Counselor', 'Senior Therapist', 'Clinical Supervisor', 'Program Manager'],
        seniorRoles: ['Clinical Director', 'Chief Mental Health Officer', 'Private Practice Owner', 'Professor'],
        industries: ['Healthcare', 'Education', 'Corporate', 'Private Practice', 'Government', 'NGOs']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹4-25 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 4,
        transferableSkills: ['Communication', 'Empathy', 'Problem Solving', 'Assessment'],
        complementaryDomains: ['Social Work', 'Healthcare', 'Education']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Teletherapy', 'AI-Assisted Therapy', 'Digital Mental Health', 'Preventive Care']
      }
    },
    {
      id: '25',
      title: 'International Business',
      domain: 'Global Trade & Commerce',
      description: 'Navigate global markets, manage international operations, and drive cross-cultural business success.',
      coreSkills: ['Global Strategy', 'Cross-Cultural Communication', 'International Law', 'Market Analysis', 'Negotiation', 'Language Skills'],
      skillCategories: ['Business', 'International', 'Communication', 'Strategy'],
      difficulty: 'intermediate',
      growth: 80,
      image: '🌐',
      skillProgression: {
        beginner: ['Business basics', 'International awareness', 'Communication skills', 'Cultural sensitivity'],
        intermediate: ['Global strategy', 'Market analysis', 'Negotiation', 'Project management'],
        advanced: ['Strategic leadership', 'Team management', 'Business development', 'Innovation'],
        timeToIntermediate: '12-18 months',
        timeToAdvanced: '3-4 years'
      },
      learningPath: {
        fundamentals: ['Business principles', 'International studies', 'Communication', 'Cultural awareness'],
        intermediate: ['Global strategy', 'Market analysis', 'Negotiation', 'Project management'],
        advanced: ['Strategic leadership', 'Team management', 'Business development', 'Innovation'],
        recommendedResources: ['International Business Courses', 'Global Markets', 'Cultural Studies', 'Language Learning']
      },
      careerOpportunities: {
        entryRoles: ['International Analyst', 'Global Coordinator', 'Export Specialist', 'Business Development Associate'],
        midLevelRoles: ['International Manager', 'Global Operations Manager', 'Regional Manager', 'Business Development Manager'],
        seniorRoles: ['International Director', 'VP of Global Operations', 'Chief International Officer', 'Regional President'],
        industries: ['Multinational Corporations', 'Export/Import', 'Consulting', 'Government', 'International Organizations', 'Trade']
      },
      marketDemand: {
        currentDemand: 'high',
        futureOutlook: 'growing',
        salaryRange: '₹6-40 LPA',
        remoteOpportunities: 60
      },
      skillVersatility: {
        crossIndustryValue: 5,
        transferableSkills: ['Strategic Thinking', 'Communication', 'Cultural Awareness', 'Project Management'],
        complementaryDomains: ['Supply Chain Management', 'Marketing', 'Finance']
      },
      futureRelevance: {
        automationResistance: 'high',
        aiEnhancement: 'medium',
        emergingTrends: ['Digital Trade', 'Sustainable Business', 'Emerging Markets', 'Global Supply Chains']
      }
    }
  ];
  */

  useEffect(() => {
    // Load user's real interest data from database and career cards
    loadUserInterests();
    loadCareerData();
    loadMLCuratedContent();
  }, [user]);

  // Load ML-curated content for Curiosity Compass
  const loadMLCuratedContent = async () => {
    if (!user?.id) return;
    
    setIsLoadingMLContent(true);
    try {
      console.log('🎯 Loading ML-curated content for Curiosity Compass');
      
      // Get personalized career content using ML
      const response = await intelligentContentService.getCuriosityCompassContent(
        user.id,
        'software_engineering', // Default domain
        'exploration'
      );

      if (response.success) {
        setMlCuratedCareers(response.careers);
        setMlInsights(response.insights);
        console.log(`✅ Loaded ${response.careers.length} ML-curated careers`);
      } else {
        console.warn('⚠️ Failed to load ML-curated content:', response.error);
      }
    } catch (error) {
      console.error('Error loading ML-curated content:', error);
    } finally {
      setIsLoadingMLContent(false);
    }
  };

  // Auto-refresh user data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        console.log('🔄 Auto-refreshing user interests...');
        loadUserInterests();
        // Don't reload career cards to prevent shuffling
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      SearchService.search(searchQuery, {}, 10)
        .then(results => {
          setSearchResults(results);
          setIsSearching(false);
          setShowSearchResults(true);
        })
        .catch(error => {
          console.error('Search error:', error);
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const loadUserInterests = async () => {
    try {
      if (!user?.id) return;

      // Get career domains from database
      const domainsResult = await ApiService.getCareerDomains();
      if (!domainsResult.success) {
        throw new Error('Failed to load career domains');
      }

      // Get user's explorations
      const explorationsResult = await ApiService.getUserExplorations(user.id);
      if (!explorationsResult.success) {
        throw new Error('Failed to load user explorations');
      }

      // Get user's interest analysis
      const interestAnalysisResult = await ApiService.analyzeUserInterests(user.id);
      if (!interestAnalysisResult.success) {
        throw new Error('Failed to analyze user interests');
      }

      const careerDomains = domainsResult.data;
      const userExplorations = explorationsResult.data;
      const interestAnalysis = interestAnalysisResult.data;

      // Map career domains to Domain interface
      const mappedDomains: Domain[] = careerDomains.map((domain: any) => {
        const exploration = userExplorations.find((exp: any) => exp.domain_id === domain.id);
        const interestLevel = exploration ? exploration.interest_level * 10 : 30; // Convert 1-10 to 0-100
        const timeSpent = exploration ? exploration.time_spent_minutes : 0;
        
        // Get icon based on category
        const getIcon = (category: string) => {
          switch (category.toLowerCase()) {
            case 'technology': return Code;
            case 'design': return Palette;
            case 'data science': return Calculator;
            case 'healthcare': return Heart;
            case 'business': return Briefcase;
            case 'marketing': return TrendingUp;
            case 'social': return Users;
            default: return Star;
          }
        };

        // Get color based on category
        const getColor = (category: string) => {
          switch (category.toLowerCase()) {
            case 'technology': return 'bg-blue-500';
            case 'design': return 'bg-pink-500';
            case 'data science': return 'bg-green-500';
            case 'healthcare': return 'bg-red-500';
            case 'business': return 'bg-yellow-500';
            case 'marketing': return 'bg-purple-500';
            case 'social': return 'bg-indigo-500';
            default: return 'bg-gray-500';
          }
        };

        return {
          id: domain.id,
          name: domain.name,
          icon: getIcon(domain.category),
          description: domain.description,
          color: getColor(domain.category),
          skills: domain.required_skills || [],
          careers: domain.typical_roles || [],
          interestLevel: Math.min(interestLevel, 95),
          lastInteracted: exploration ? 
            new Date(exploration.updated_at).toLocaleDateString() : 
            'Never',
          totalInteractions: exploration ? exploration.resources_viewed || 0 : 0
        };
      });

      // Add domains from interest analysis that might not be in career domains
      const analyzedCategories = interestAnalysis.topCategories || [];
      analyzedCategories.forEach((category: any) => {
        if (!mappedDomains.find(d => d.name.toLowerCase().includes(category.category.toLowerCase()))) {
          mappedDomains.push({
            id: `analyzed_${category.category.toLowerCase()}`,
            name: category.category,
            icon: Star,
            description: `Explore opportunities in ${category.category}`,
            color: 'bg-gray-500',
            skills: [],
            careers: [],
            interestLevel: category.score * 10,
            lastInteracted: 'Recently analyzed',
            totalInteractions: 0
          });
        }
      });

      setDomains(mappedDomains);
      setUserInterests(user?.interests || []);
    } catch (error) {
      console.error('Error loading user interests:', error);
      // No fallback - use real-time data only
      console.error('Failed to load user interests from API');
    }
  };

  // Mock interests removed - now using real-time data
  /*
  const loadMockInterests = () => {
    const userInterests = user?.interests || [];
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
  };
  */

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
    
    // Find careers in this domain that user showed interest in
    const categoryCareers = careerCards.filter(card => card.domain === category);
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

  const loadCareerData = async (shuffleCards = true) => {
    try {
      if (!user?.id) return;

      // Only load career cards if they haven't been loaded yet
      if (careerCards.length > 0 && !shuffleCards) {
        console.log('Career cards already loaded, skipping reload');
        return;
      }

      console.log('🔄 Loading real-time career cards using Google APIs...');
      
      // Get user profile for personalization
      const userProfile = {
        interests: user?.interests || [],
        skills: user?.skills || [],
        experience: user?.experience_level || 'beginner',
        location: 'global'
      };
      
      // Generate real-time career cards using Google APIs
      const response = await fetch('/api/career/cards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'technology', // Default domain, can be made dynamic
          userProfile: userProfile,
          count: 25
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cards) {
          console.log('✅ Loaded real-time career cards:', data.cards.length);
        if (shuffleCards) {
            const shuffledCards = [...data.cards].sort(() => Math.random() - 0.5);
          setCareerCards(shuffledCards);
        } else {
            setCareerCards(data.cards);
        }
      } else {
          throw new Error('Failed to generate career cards');
        }
        } else {
        throw new Error('API request failed');
      }
      
      // Load user's previous choices from database
      const userChoicesResult = await ApiService.getUserChoices(user.id);
      if (userChoicesResult.success && userChoicesResult.data) {
        const choices: UserChoice[] = userChoicesResult.data.map((choice: any) => ({
          careerId: choice.career_id,
          choice: choice.choice,
          timestamp: new Date(choice.created_at)
        }));
        setUserChoices(choices);
      } else {
        // Fallback to localStorage
      const savedChoices = localStorage.getItem(`curiosity_choices_${user?.id}`);
      if (savedChoices) {
        setUserChoices(JSON.parse(savedChoices));
        }
      }
    } catch (error) {
      console.error('Error loading career data:', error);
      toast({
        title: "Error Loading Career Data",
        description: "Failed to load real-time career information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (choice: 'interested' | 'maybe' | 'not_interested') => {
    if (currentCardIndex >= careerCards.length) return;

    const currentCard = careerCards[currentCardIndex];
    const newChoice: UserChoice = {
      careerId: currentCard.id,
      choice,
      timestamp: new Date()
    };

    const updatedChoices = [...userChoices, newChoice];
    setUserChoices(updatedChoices);

    // Save choice to database
    if (user?.id) {
      try {
        // Save choice to database
        const saveChoiceResult = await ApiService.saveUserChoice(user.id, {
          career_id: currentCard.id,
          choice: choice,
          career_title: currentCard.title,
          career_domain: currentCard.domain
        });

        if (!saveChoiceResult.success) {
          console.error('Failed to save choice to database:', saveChoiceResult.error);
          // Fallback to localStorage
          localStorage.setItem(`curiosity_choices_${user?.id}`, JSON.stringify(updatedChoices));
        }

        // Track the career choice activity
      await ApiService.trackUserActivity(user.id, {
        activity_type: 'career_choice',
        activity_name: `Made career choice: ${choice}`,
        category: 'curiosity_compass',
        page_url: '/curiosity-compass',
        metadata: {
          career_id: currentCard.id,
          career_title: currentCard.title,
            career_domain: currentCard.domain,
          choice: choice,
          timestamp: new Date().toISOString()
        }
      });

        // If interested, create exploration for the career domain
        if (choice === 'interested' && currentCard.domain) {
          // Find the domain ID for this domain
          const domain = domains.find(d => d.name.toLowerCase().includes(currentCard.domain.toLowerCase()));
        if (domain) {
          await ApiService.createUserExploration(user.id, domain.id, 8); // High interest
        }
      }
      } catch (error) {
        console.error('Error saving choice:', error);
        // Fallback to localStorage
        localStorage.setItem(`curiosity_choices_${user?.id}`, JSON.stringify(updatedChoices));
    }
    } else {
      // Save to localStorage if no user
    localStorage.setItem(`curiosity_choices_${user?.id}`, JSON.stringify(updatedChoices));
    }

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

  const generateMoreCards = async () => {
    try {
      console.log('🔄 Generating more real-time career cards using Google APIs...');
      
      // Get user profile for personalization
      const userProfile = {
        interests: user?.interests || [],
        skills: user?.skills || [],
        experience: user?.experience_level || 'beginner',
        location: 'global'
      };
      
      // Generate more real-time career cards using Google APIs
      const response = await fetch('/api/career/cards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'technology', // Default domain, can be made dynamic
          userProfile: userProfile,
          count: 10 // Generate 10 more cards
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cards) {
          console.log('✅ Generated more real-time career cards:', data.cards.length);

        // Filter out cards that are already shown
        const existingIds = careerCards.map(card => card.id);
          const uniqueNewCards = data.cards.filter((card: any) => !existingIds.includes(card.id));
        
        if (uniqueNewCards.length > 0) {
          setCareerCards([...careerCards, ...uniqueNewCards]);
            toast({
              title: "More Career Cards Added! 🎯",
              description: `Added ${uniqueNewCards.length} new career opportunities to explore.`,
              duration: 3000,
            });
        } else {
            toast({
              title: "No New Cards Available",
              description: "All available career cards are already shown. Try refreshing the page.",
              duration: 3000,
            });
        }
      } else {
          throw new Error('Failed to generate more career cards');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error generating more cards:', error);
      toast({
        title: "Error Generating More Cards",
        description: "Failed to generate additional career cards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const showResultsNow = async () => {
    if (userChoices.length < 5) {
      alert('Please make at least 5 choices to see your interest profile!');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Generate interest profile first
    generateInterestProfile();
      
      // Generate roadmap from career card choices
      await generateRoadmapFromCareerChoices();
      
      // Wait a moment to ensure data is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to AI Roadmaps page using React Router
      navigate('/ai-roadmap');
    } catch (error) {
      console.error('Error generating results:', error);
      alert('Error generating your roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoadmapFromCareerChoices = async () => {
    if (!user?.id) return;

    try {
      // Get both interested and maybe career choices
      const relevantChoices = userChoices.filter(c => c.choice === 'interested' || c.choice === 'maybe');
      const interestedChoices = userChoices.filter(c => c.choice === 'interested');
      const maybeChoices = userChoices.filter(c => c.choice === 'maybe');
      
      const relevantCareers = careerCards.filter(card => 
        relevantChoices.some(choice => choice.careerId === card.id)
      );
      const interestedCareers = careerCards.filter(card => 
        interestedChoices.some(choice => choice.careerId === card.id)
      );
      const maybeCareers = careerCards.filter(card => 
        maybeChoices.some(choice => choice.careerId === card.id)
      );

      if (relevantCareers.length === 0) {
        console.warn('No interested or maybe careers found for roadmap generation');
        return;
      }

      // Extract domains and skills from all relevant careers
      const domains = [...new Set(relevantCareers.map(career => career.domain))];
      const allSkills = relevantCareers.flatMap(career => career.coreSkills);
      const uniqueSkills = [...new Set(allSkills)];

      // Calculate difficulty level based on career choices (weighted by interest level)
      const difficultyCounts: { [key: string]: number } = {};
      relevantCareers.forEach(career => {
        const choice = relevantChoices.find(c => c.careerId === career.id);
        const weight = choice?.choice === 'interested' ? 2 : 1; // Interested gets double weight
        difficultyCounts[career.difficulty] = (difficultyCounts[career.difficulty] || 0) + weight;
      });
      const preferredDifficulty = Object.entries(difficultyCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'beginner';

      // Generate AI-powered roadmap using real API
      console.log('🤖 Generating AI-powered roadmap from career choices...');
      const aiRoadmapResult = await ApiService.generatePersonalizedRoadmap({
        likedDomains: domains,
        likedTopics: uniqueSkills.slice(0, 10),
        dislikedDomains: [],
        dislikedTopics: []
      });

      // Create roadmap data structure for separate career roadmaps
      const roadmapData = {
        id: `career-roadmap-${Date.now()}`,
        title: `Career Path Roadmap - ${domains.join(', ')}`,
        description: `Personalized learning roadmaps based on your career interests. Each career choice will have its own dedicated learning path.`,
        domains: domains,
        skills: uniqueSkills,
        difficulty_level: preferredDifficulty,
        estimated_completion: aiRoadmapResult.success ? (aiRoadmapResult.data.estimated_duration || '12-16 weeks') : '12-16 weeks',
        phases: aiRoadmapResult.success ? (aiRoadmapResult.data.phases || generateRoadmapPhases(relevantCareers, interestedCareers, maybeCareers, domains, uniqueSkills)) : generateRoadmapPhases(relevantCareers, interestedCareers, maybeCareers, domains, uniqueSkills),
        created_at: new Date().toISOString(),
        ai_confidence: aiRoadmapResult.success ? (aiRoadmapResult.data.ai_confidence || 0.85) : 0.75,
        ai_generated: aiRoadmapResult.success,
        user_choices: userChoices.map(choice => ({
          career_id: choice.careerId,
          choice: choice.choice,
          timestamp: choice.timestamp
        })),
        career_breakdown: {
          interested_careers: interestedCareers.map(career => ({
            id: career.id,
            title: career.title,
            domain: career.domain,
            difficulty: career.difficulty,
            growth: career.growth
          })),
          maybe_careers: maybeCareers.map(career => ({
            id: career.id,
            title: career.title,
            domain: career.domain,
            difficulty: career.difficulty,
            growth: career.growth
          }))
        }
      };

      // Note: Individual roadmaps will be created by the AI Roadmaps page
      // based on the career_breakdown data structure

      // Save roadmap data to localStorage for AI Roadmaps page to pick up
      localStorage.setItem('generated_roadmap', JSON.stringify(roadmapData));
      localStorage.setItem('exploration_selections', JSON.stringify({
        domains: domains,
        topics: uniqueSkills.slice(0, 10), // Limit topics
        timestamp: new Date().toISOString()
      }));

      // Dispatch custom event to notify AI Roadmaps page
      window.dispatchEvent(new CustomEvent('roadmapGenerated', {
        detail: { roadmapData, selections: { domains, topics: uniqueSkills.slice(0, 10) } }
      }));

      console.log('🎯 Generated roadmap from career choices:', roadmapData);

      // Show success message
      toast({
        title: "Roadmap Generated Successfully! 🎉",
        description: `Created a personalized roadmap based on your ${interestedChoices.length} interested and ${maybeChoices.length} maybe career choices.`,
        duration: 5000,
      });

      // Track the roadmap generation activity
      await ApiService.trackUserActivity(user.id, {
        activity_type: 'career_roadmap_generation',
        activity_name: 'Generated roadmap from career card choices',
        category: 'curiosity_compass',
        page_url: '/curiosity-compass',
        metadata: {
          domains: domains,
          skills: uniqueSkills,
          difficulty: preferredDifficulty,
          total_choices: userChoices.length,
          interested_count: interestedChoices.length,
          maybe_count: maybeChoices.length,
          total_relevant_careers: relevantCareers.length,
          interested_careers: interestedCareers.map(c => c.title),
          maybe_careers: maybeCareers.map(c => c.title),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error generating roadmap from career choices:', error);
    }
  };

  const generateRoadmapPhases = (allCareers: CareerCard[], interestedCareers: CareerCard[], maybeCareers: CareerCard[], domains: string[], skills: string[]) => {
    // Create comprehensive learning phases based on career interests
    const phases = [
      {
        id: 'foundation',
        title: 'Foundation Building',
        description: 'Build fundamental skills across your interested and maybe career domains',
        duration: '4-6 weeks',
        steps: [
          {
            id: '1',
            title: 'Core Skills Development',
            description: `Master fundamental skills: ${skills.slice(0, 5).join(', ')}`,
            type: 'learning',
            duration: '2-3 weeks',
            resources: ['Online Courses', 'Documentation', 'Practice Projects']
          },
          {
            id: '2',
            title: 'Domain Knowledge',
            description: `Deep dive into ${domains.join(', ')} fundamentals`,
            type: 'learning',
            duration: '2-3 weeks',
            resources: ['Industry Articles', 'Case Studies', 'Expert Interviews']
          }
        ]
      },
      {
        id: 'intermediate',
        title: 'Intermediate Development',
        description: 'Apply skills through practical projects and explore career paths',
        duration: '4-6 weeks',
        steps: [
          {
            id: '3',
            title: 'Project Portfolio',
            description: `Build 2-3 projects showcasing skills from ${interestedCareers.length > 0 ? interestedCareers[0].title : 'your interested careers'}`,
            type: 'project',
            duration: '3-4 weeks',
            resources: ['Project Templates', 'Code Repositories', 'Design Patterns']
          },
          {
            id: '4',
            title: 'Career Exploration',
            description: `Explore both interested careers (${interestedCareers.map(c => c.title).join(', ')}) and maybe careers (${maybeCareers.map(c => c.title).join(', ')})`,
            type: 'exploration',
            duration: '1-2 weeks',
            resources: ['Career Shadowing', 'Informational Interviews', 'Industry Research']
          }
        ]
      },
      {
        id: 'advanced',
        title: 'Advanced Specialization',
        description: 'Specialize in your chosen career paths and build expertise',
        duration: '4-6 weeks',
        steps: [
          {
            id: '5',
            title: 'Specialization Deep Dive',
            description: `Focus on advanced concepts in ${domains.join(', ')}`,
            type: 'learning',
            duration: '2-3 weeks',
            resources: ['Advanced Courses', 'Research Papers', 'Industry Certifications']
          },
          {
            id: '6',
            title: 'Career Preparation',
            description: 'Prepare for job applications and interviews in your chosen domains',
            type: 'career',
            duration: '2-3 weeks',
            resources: ['Resume Building', 'Interview Prep', 'Portfolio Optimization']
          }
        ]
      }
    ];

    return phases;
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
      categoryCounts[career.domain] = (categoryCounts[career.domain] || 0) + 1;
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
      notInterestedCount: notInterestedChoices.length,
      insights: [
        `You're most interested in ${topCategories[0] || 'various fields'}`,
        `You prefer ${preferredDifficulty} level challenges`,
        `Average growth potential: ${averageGrowth}%`
      ]
    };

    setInterestProfile(profile);
  };

  const handleDomainClick = (domain: Domain) => {
    setSelectedDomain(domain);
    setSelectedDomainForDetails(domain);
    setShowDomainDetails(true);
    // Track user interaction with domain
    trackDomainInteraction(domain.id);
  };

  const trackDomainInteraction = async (domainId: string) => {
    try {
      if (!user?.id) return;

      // Track the domain interaction activity
      await ApiService.trackUserActivity(user.id, {
        activity_type: 'domain_exploration',
        activity_name: 'Explored career domain',
        category: 'curiosity_compass',
        page_url: '/curiosity-compass',
        metadata: {
          domain_id: domainId,
          timestamp: new Date().toISOString()
        }
      });

      // Update or create user exploration record
      const explorationResult = await ApiService.createUserExploration(
        user.id, 
        domainId, 
        5 // Default interest level
      );

      if (explorationResult.success) {
        console.log('Successfully tracked domain interaction:', domainId);
      }
    } catch (error) {
      console.error('Error tracking domain interaction:', error);
    }
  };

  const resetCompass = async () => {
    setUserChoices([]);
    setCurrentCardIndex(0);
    setInterestProfile(null);
    
    // Clear from localStorage
    localStorage.removeItem(`curiosity_choices_${user?.id}`);
    
    // Clear from database if user is logged in
    if (user?.id) {
      try {
        await ApiService.clearUserChoices(user.id);
        console.log('User choices cleared from database');
      } catch (error) {
        console.error('Error clearing user choices from database:', error);
      }
    }
    
    // Refresh domains to reset interest levels
    loadUserInterests();
  };

  const handleSearchResultSelection = (result: SearchResult) => {
    if (result.type === 'domain') {
      const domain = domains.find(d => d.id === result.id);
      if (domain) {
        handleDomainClick(domain);
      }
    }
    // Clear search after selection
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleExplorationComplete = (selections: any) => {
    console.log('Exploration completed with selections:', selections);
    setShowExplorationPopup(false);
    // Don't interfere with navigation - let the popup handle it
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">       
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Curiosity Compass
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl text-right leading-relaxed">    
          Discover your interests and explore career domains that match your passions.
          Your interactions help us understand what truly excites you.
        </p>
      </div>

      {/* Tabs for different exploration modes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explore">Explore Domains</TabsTrigger>
          <TabsTrigger value="cards">Career Cards</TabsTrigger>
        </TabsList>

        {/* Original Domain Exploration Tab */}
        <TabsContent value="explore" className="space-y-8">
          {/* User Interest Summary - Compact Design */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Interest Profile</h3>
                    <p className="text-sm text-gray-600">Based on your learning journey and choices</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                    {domains.filter(d => d.interestLevel >= 50).length}
                  </div>
                    <p className="text-xs text-gray-600">High Interest</p>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                    {domains.reduce((sum, d) => sum + d.totalInteractions, 0)}
                  </div>
                    <p className="text-xs text-gray-600">Interactions</p>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                    {Math.round(domains.reduce((sum, d) => sum + d.interestLevel, 0) / domains.length)}%
                  </div>
                    <p className="text-xs text-gray-600">Avg Interest</p>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                    {userChoices.length}
                  </div>
                    <p className="text-xs text-gray-600">Cards Explored</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span>Search Domains, Jobs & Skills</span>
                  </CardTitle>
                  <CardDescription>
                    Find specific domains, job roles, and skills that interest you
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setShowExplorationPopup(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Guided Exploration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search domains, job roles, and skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Search Results</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSearchResultSelection(result)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{result.icon}</span>
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {result.type}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && !isSearching && (
                <div className="mt-4 text-center py-4">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
              )}
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

                  <div className="space-y-2">
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
                  </div>
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

        {/* Career Cards Tab - Redesigned Two-Panel Layout */}
        <TabsContent value="cards" className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Exploration Cards</h2>
            <p className="text-gray-600">
              Swipe through career cards and tell us what interests you! 
              Your choices will influence your interest profile above.
            </p>
          </div>

          {/* Your Selections Section - Moved here */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Selections</h3>
              <p className="text-sm text-gray-600">Track your career choices as you explore</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mb-6">
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                onClick={showResultsNow} 
                disabled={userChoices.length < 5 || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    See Results ({userChoices.length}/5)
                  </>
                )}
              </Button>
              <Button 
                size="sm"
                variant="outline" 
                className="flex-1"
                onClick={resetCompass}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setShowExplorationPopup(true)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Start Guided
              </Button>
            </div>

            {/* Selection Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Interested Cards */}
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-green-800 text-sm font-semibold">
                    <Heart className="h-4 w-4" />
                    <span>Interested ({userChoices.filter(c => c.choice === 'interested').length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {userChoices.filter(c => c.choice === 'interested').length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userChoices
                        .filter(c => c.choice === 'interested')
                        .map((choice, index) => {
                          const career = careerCards.find(card => card.id === choice.careerId);
                          return career ? (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-md border border-green-200/50 hover:bg-white transition-colors">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{career.image}</span>
                                <div>
                                  <span className="font-medium text-gray-900 text-xs">{career.title}</span>
                                  <p className="text-xs text-gray-500">{career.domain}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs bg-green-100">
                                {career.difficulty}
                              </Badge>
                            </div>
                          ) : null;
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 italic">No interested domains yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Maybe Cards */}
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-yellow-800 text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>Maybe ({userChoices.filter(c => c.choice === 'maybe').length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {userChoices.filter(c => c.choice === 'maybe').length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userChoices
                        .filter(c => c.choice === 'maybe')
                        .map((choice, index) => {
                          const career = careerCards.find(card => card.id === choice.careerId);
                          return career ? (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-md border border-yellow-200/50 hover:bg-white transition-colors">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{career.image}</span>
                                <div>
                                  <span className="font-medium text-gray-900 text-xs">{career.title}</span>
                                  <p className="text-xs text-gray-500">{career.domain}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs bg-yellow-100">
                                {career.difficulty}
                              </Badge>
                            </div>
                          ) : null;
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-yellow-600 italic">No maybe domains yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Not Interested Cards */}
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-red-800 text-sm font-semibold">
                    <X className="h-4 w-4" />
                    <span>Not Interested ({userChoices.filter(c => c.choice === 'not_interested').length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {userChoices.filter(c => c.choice === 'not_interested').length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userChoices
                        .filter(c => c.choice === 'not_interested')
                        .map((choice, index) => {
                          const career = careerCards.find(card => card.id === choice.careerId);
                          return career ? (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-md border border-red-200/50 hover:bg-white transition-colors">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{career.image}</span>
                                <div>
                                  <span className="font-medium text-gray-900 text-xs">{career.title}</span>
                                  <p className="text-xs text-gray-500">{career.domain}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-red-600 border-red-300 text-xs bg-red-100">
                                {career.difficulty}
                              </Badge>
                            </div>
                          ) : null;
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 italic">No not interested domains yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Career Cards - Full Width */}
          <div className="space-y-6">
          {/* Progress */}
              <div className="mb-6">
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

              {/* Career Card - Elegant Design */}
          {careerCards[currentCardIndex] && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header Section with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{careerCards[currentCardIndex].image}</div>
                          <div>
                            <h2 className="text-2xl font-bold">{careerCards[currentCardIndex].title}</h2>
                            <p className="text-blue-100 text-sm">{careerCards[currentCardIndex].domain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-100 text-sm">Growth</div>
                          <div className="text-2xl font-bold">{careerCards[currentCardIndex].growth}%</div>
                        </div>
                      </div>
                  </div>

                    {/* Content Section - Side by Side Layout */}
                    <div className="p-6">
                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed text-center mb-6">
                        {careerCards[currentCardIndex].description}
                      </p>

                      {/* Key Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{careerCards[currentCardIndex].marketDemand?.salaryRange || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Salary Range</div>
                      </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{careerCards[currentCardIndex].marketDemand?.remoteOpportunities || 0}%</div>
                          <div className="text-sm text-gray-500">Remote Work</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getGrowthColor(careerCards[currentCardIndex].growth)}`}>
                            {careerCards[currentCardIndex].growth}%
                          </div>
                          <div className="text-sm text-gray-500">Growth</div>
                      </div>
                    </div>

                      {/* All Sections in Side-by-Side Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Core Skills & Categories */}
                        <div className="space-y-3">
                    <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                              <Target className="h-4 w-4 mr-2 text-blue-600" />
                              Core Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {careerCards[currentCardIndex].coreSkills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                      </div>
                    </div>

                    <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                              <Star className="h-4 w-4 mr-2 text-yellow-500" />
                              Skill Categories
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {careerCards[currentCardIndex].skillCategories.map((category) => (
                                <Badge key={category} className="bg-green-50 text-green-700 text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                      </div>
                    </div>

                        {/* Skill Progression */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                            Skill Progression
                          </h4>
                          <div className="space-y-2">
                    <div>
                              <div className="text-xs font-medium text-gray-700 mb-1">Beginner ({careerCards[currentCardIndex].skillProgression.timeToIntermediate}):</div>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].skillProgression.beginner.slice(0, 2).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs bg-white">
                                    {skill}
                                  </Badge>
                        ))}
                      </div>
                    </div>
                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-1">Intermediate ({careerCards[currentCardIndex].skillProgression.timeToAdvanced}):</div>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].skillProgression.intermediate.slice(0, 2).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs bg-white">
                                    {skill}
                                  </Badge>
                                ))}
                  </div>
                </div>
                          </div>
          </div>

                        {/* Learning Path */}
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                            Learning Path
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-700 block mb-1">Fundamentals:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].learningPath.fundamentals.slice(0, 2).map((topic) => (
                                  <Badge key={topic} variant="outline" className="text-xs bg-white">
                                    {topic}
                                  </Badge>
                                ))}
            </div>
            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-700 block mb-1">Resources:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].learningPath.recommendedResources.slice(0, 2).map((resource) => (
                                  <Badge key={resource} className="text-xs bg-green-100 text-green-700">
                                    {resource}
                                  </Badge>
                                ))}
            </div>
          </div>
          </div>
                        </div>

                        {/* Career Opportunities */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <Briefcase className="h-4 w-4 mr-2 text-orange-600" />
                            Career Opportunities
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-gray-600 block mb-1">Entry Roles:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].careerOpportunities.entryRoles.slice(0, 2).map((role) => (
                                  <Badge key={role} variant="outline" className="text-xs bg-white">
                                    {role}
                                  </Badge>
                                ))}
                      </div>
                    </div>
                            <div>
                              <span className="text-gray-600 block mb-1">Industries:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].careerOpportunities.industries.slice(0, 3).map((industry) => (
                                  <Badge key={industry} className="text-xs bg-orange-100 text-orange-700">
                                    {industry}
                                  </Badge>
                                ))}
                      </div>
                    </div>
                      </div>
                    </div>

                        {/* Market Demand */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                            Market Demand
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Demand:</span>
                              <span className={`font-medium capitalize ${
                                careerCards[currentCardIndex].marketDemand?.currentDemand === 'high' ? 'text-green-600' :
                                careerCards[currentCardIndex].marketDemand?.currentDemand === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {careerCards[currentCardIndex].marketDemand?.currentDemand || 'N/A'}
                              </span>
                      </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Future Outlook:</span>
                              <span className={`font-medium capitalize ${
                                careerCards[currentCardIndex].marketDemand?.futureOutlook === 'growing' ? 'text-green-600' :
                                careerCards[currentCardIndex].marketDemand?.futureOutlook === 'stable' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {careerCards[currentCardIndex].marketDemand?.futureOutlook || 'N/A'}
                              </span>
                    </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remote Work:</span>
                              <span className="font-medium text-blue-600">{careerCards[currentCardIndex].marketDemand?.remoteOpportunities || 0}%</span>
                  </div>
                          </div>
                        </div>

                        {/* Skill Versatility */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <Target className="h-4 w-4 mr-2 text-yellow-600" />
                            Skill Versatility
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cross-Industry Value:</span>
                              <div className="flex items-center">
                                <span className="font-medium mr-1">{careerCards[currentCardIndex].skillVersatility.crossIndustryValue}/5</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-2 w-2 ${i < careerCards[currentCardIndex].skillVersatility.crossIndustryValue ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                            </div>
                          </div>
                            <div>
                              <span className="text-gray-600 block mb-1">Transferable Skills:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].skillVersatility.transferableSkills.slice(0, 2).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs bg-white">
                                    {skill}
                              </Badge>
                                ))}
                            </div>
                            </div>
                          </div>
                        </div>

                        {/* Future Relevance */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                            <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                            Future Relevance
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Automation Resistance:</span>
                              <span className={`font-medium capitalize ${
                                careerCards[currentCardIndex].futureRelevance.automationResistance === 'high' ? 'text-green-600' :
                                careerCards[currentCardIndex].futureRelevance.automationResistance === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {careerCards[currentCardIndex].futureRelevance.automationResistance}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">AI Enhancement:</span>
                              <span className={`font-medium capitalize ${
                                careerCards[currentCardIndex].futureRelevance.aiEnhancement === 'high' ? 'text-green-600' :
                                careerCards[currentCardIndex].futureRelevance.aiEnhancement === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {careerCards[currentCardIndex].futureRelevance.aiEnhancement}
                              </span>
                          </div>
                            <div>
                              <span className="text-gray-600 block mb-1">Emerging Trends:</span>
                              <div className="flex flex-wrap gap-1">
                                {careerCards[currentCardIndex].futureRelevance.emergingTrends.slice(0, 2).map((trend) => (
                                  <Badge key={trend} variant="outline" className="text-xs bg-white">
                                    {trend}
                                  </Badge>
                    ))}
                  </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

              {/* Action Buttons */}
                    <div className="bg-gray-50 px-6 py-4 border-t">
                      <div className="flex justify-center space-x-3">
                <Button 
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleChoice('not_interested')}
            >
                          <X className="h-4 w-4 mr-2" />
                          Not Interested
                </Button>
            
            <Button
              variant="outline"
                          className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleChoice('maybe')}
            >
                          <Clock className="h-4 w-4 mr-2" />
                          Maybe
                </Button>
            
            <Button
                          className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={() => handleChoice('interested')}
            >
                    <Heart className="h-4 w-4 mr-2" />
                          Interested
                  </Button>
          </div>
                    </div>

                    {/* ML-Powered Insights Section */}
                    {mlInsights && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-t">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Cpu className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Personalized Recommendations</h4>
                            <p className="text-sm text-gray-600">{mlInsights.personalizedRecommendations || 'Based on your profile, we recommend exploring these career paths.'}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Market Analysis</h4>
                            <p className="text-sm text-gray-600">{mlInsights.marketAnalysis || 'Current market trends and opportunities in your field of interest.'}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Skill Gap Analysis</h4>
                            <p className="text-sm text-gray-600">{mlInsights.skillGapAnalysis || 'Key skills you should focus on developing next.'}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Learning Path Suggestions</h4>
                            <p className="text-sm text-gray-600">{mlInsights.learningPathSuggestions || 'Optimized learning sequence based on your current level.'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ML-Curated Careers Section */}
                    {mlCuratedCareers.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">AI-Curated Career Matches</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mlCuratedCareers.slice(0, 6).map((career, index) => (
                            <Card key={career.id} className="hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-4">
                                <div className="flex items-center mb-3">
                                  <div className="text-2xl mr-3">{career.image}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{career.title}</h4>
                                    <p className="text-sm text-gray-600">{career.domain}</p>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{career.description}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                    <span className="text-sm font-medium text-green-600">{career.growth}%</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    AI Match
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>
          )}
          </div>
        </TabsContent>

      </Tabs>

      {/* 4-Step Career Exploration Popup */}
      <CareerExplorationPopup
        isOpen={showExplorationPopup}
        onClose={() => setShowExplorationPopup(false)}
        onComplete={handleExplorationComplete}
      />

      {/* Domain Details Popup */}
      <DomainDetailsPopup
        isOpen={showDomainDetails}
        onClose={() => setShowDomainDetails(false)}
        domain={selectedDomainForDetails}
        onStartExploration={() => setShowExplorationPopup(true)}
      />
    </div>
  );
};

export default CuriosityCompass;
