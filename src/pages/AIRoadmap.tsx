import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { APIService } from '@/lib/api-service';

// Create API service instance
const apiService = new APIService();
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { RecycleBinService } from '@/lib/recycle-bin-service';
import { NotificationService } from '@/lib/notification-service';
import { 
  Brain, 
  Target, 
  BookOpen, 
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Plus,
  Play,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Users
} from 'lucide-react';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'project' | 'assessment' | 'practice';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  isCurrent: boolean;
  resources: any[];
  prerequisites: string[];
  category?: string;
  objectives?: string[];
  instructions?: string[];
  exercises?: string[];
  projects?: string[];
  assessment?: string;
  skills?: string[];
  platforms?: string[];
  tools?: string[];
  technologies?: string[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  domain?: string;
  totalSteps: number;
  completedSteps: number;
  progress: number;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: RoadmapStep[];
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
}

const AIRoadmap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to generate unique IDs
  const generateUniqueId = (prefix: string, index: number, timestamp: number) => {
    return `${prefix}_${index + 1}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  };
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [detailedSteps, setDetailedSteps] = useState<any[]>([]);
  const [stepResources, setStepResources] = useState<{ [stepId: string]: any[] }>({});
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingResources, setLoadingResources] = useState<{ [stepId: string]: boolean }>({});

  useEffect(() => {
    loadUserRoadmaps();
    
    // Check for fresh roadmap data immediately on load
    const checkForFreshRoadmap = () => {
      const generatedRoadmap = localStorage.getItem('generated_roadmap');
      const explorationSelections = localStorage.getItem('exploration_selections');
      
      if (generatedRoadmap && explorationSelections) {
        console.log('🎯 Fresh roadmap data found on page load');
        toast({
          title: "Welcome! 🎯",
          description: "Your personalized roadmap is ready to explore!",
          duration: 3000,
        });
      }
    };
    
    // Check after a short delay to ensure page is fully loaded
    setTimeout(checkForFreshRoadmap, 1000);
  }, [user, toast]);

  // Load detailed steps when a roadmap is selected
  useEffect(() => {
    if (selectedRoadmap) {
      loadDetailedSteps(selectedRoadmap.id);
    }
  }, [selectedRoadmap]);

  // Listen for storage changes and custom events to update roadmaps in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'generated_roadmap' || e.key === 'exploration_selections') {
        console.log('🔄 Storage change detected, reloading roadmaps...');
        
        toast({
          title: "Roadmaps Updated! 🔄",
          description: "New roadmaps detected, updating your learning paths...",
          duration: 3000,
        });
        
        loadUserRoadmaps();
      }
    };

    const handleRoadmapGenerated = (e: CustomEvent) => {
      console.log('🎯 Custom roadmap generation event received:', e.detail);
      
      toast({
        title: "New Roadmap Generated! 🎯",
        description: "Your personalized roadmap is ready!",
        duration: 3000,
      });
      
      loadUserRoadmaps();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roadmapGenerated', handleRoadmapGenerated as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roadmapGenerated', handleRoadmapGenerated as EventListener);
    };
  }, [toast]);

  // Auto-refresh roadmaps every 30 seconds to catch any updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing roadmaps...');
      loadUserRoadmaps();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadUserRoadmaps = async () => {
    setIsLoading(true);
    let allRoadmaps: Roadmap[] = [];
    try {

      // Get list of deleted roadmaps to filter them out
      const deletedRoadmaps = JSON.parse(localStorage.getItem('deleted_roadmaps') || '[]');
      console.log('🗑️ Deleted roadmaps list:', deletedRoadmaps);

      // Check if we should clear localStorage due to deleted content
      const storedRoadmap = localStorage.getItem('generated_roadmap');
      const storedSelections = localStorage.getItem('exploration_selections');
      
      if (storedRoadmap && storedSelections && deletedRoadmaps.length > 0) {
        try {
          const roadmapData = JSON.parse(storedRoadmap);
          const selections = JSON.parse(storedSelections);
          
          // Check if the main roadmap or any of its derived content was deleted
          const mainRoadmapDeleted = deletedRoadmaps.includes(roadmapData.id);
          const hasDeletedDerivedContent = deletedRoadmaps.some((deletedId: string) => {
            // Check if any deleted roadmap was derived from this main roadmap
            return roadmapData.domains?.some((domain: any) => 
              selections.domains?.includes(domain)
            ) || roadmapData.topics?.some((topic: any) => 
              selections.topics?.includes(topic)
            );
          });
          
          if (mainRoadmapDeleted || hasDeletedDerivedContent) {
            console.log('🗑️ Clearing localStorage due to deleted content');
            localStorage.removeItem('generated_roadmap');
            localStorage.removeItem('exploration_selections');
            // Continue without localStorage data
            return;
          }
        } catch (error) {
          console.log('⚠️ Error checking localStorage for deleted content:', error);
        }
      }

      // First, check for generated roadmap from localStorage (from Curiosity Compass)
      // Note: storedRoadmap and storedSelections are already loaded above
      
      // If no stored roadmap, skip localStorage loading
      if (!storedRoadmap || !storedSelections) {
        console.log('📭 No stored roadmap found, skipping localStorage loading');
      } else {
        try {
          const roadmapData = JSON.parse(storedRoadmap);
          const selections = JSON.parse(storedSelections);
          
          console.log('🎯 Loading generated roadmap from localStorage:', roadmapData);
          console.log('🎯 Loading selections from localStorage:', selections);
          
          // Create separate roadmaps for each selected domain/topic
          const separateRoadmaps = createSeparateRoadmaps(roadmapData, selections);
          
          // Filter out deleted roadmaps from localStorage fallback
          const filteredRoadmaps = separateRoadmaps.filter(roadmap => {
            const isDeleted = deletedRoadmaps.includes(roadmap.id);
            if (isDeleted) {
              console.log('🗑️ Filtering out deleted roadmap:', roadmap.id, roadmap.title);
            }
            return !isDeleted;
          });

          // If all roadmaps were deleted, clear localStorage to prevent regeneration
          if (filteredRoadmaps.length === 0 && separateRoadmaps.length > 0) {
            console.log('🗑️ All roadmaps were deleted, clearing localStorage to prevent regeneration');
            localStorage.removeItem('generated_roadmap');
            localStorage.removeItem('exploration_selections');
          }
          
          allRoadmaps.push(...filteredRoadmaps);
          console.log('✅ Added separate roadmaps from localStorage:', filteredRoadmaps.length, 'roadmaps (filtered from', separateRoadmaps.length, 'total)');
        } catch (parseError) {
          console.error('❌ Error parsing stored roadmap:', parseError);
        }
      }

      // Then load user's roadmaps from database
      if (user?.id) {
        try {
          const roadmapsResult = await apiService.getUserRoadmaps(user.id) as any;
          if (roadmapsResult.success && roadmapsResult.data) {
            const dbRoadmaps = roadmapsResult.data;
            
            // Convert database roadmaps to component format
            const mappedRoadmaps: Roadmap[] = dbRoadmaps.map((roadmap: any) => ({
              id: roadmap.id,
              title: roadmap.title,
              description: roadmap.description,
              category: roadmap.category || 'General',
              totalSteps: roadmap.steps?.length || 0,
              completedSteps: roadmap.steps?.filter((step: any) => step.completed).length || 0,
              progress: roadmap.completion_percentage || 0,
              estimatedDuration: roadmap.estimated_duration || '8 weeks',
              difficulty: roadmap.difficulty_level || 'beginner',
              isActive: roadmap.is_active !== false,
              createdAt: roadmap.created_at,
              lastUpdated: roadmap.updated_at,
              steps: roadmap.steps?.map((step: any) => ({
                id: step.id,
                title: step.title,
                description: step.description,
                type: step.type || 'learning',
                duration: step.estimated_time || '1 week',
                difficulty: step.difficulty || 'beginner',
                isCompleted: step.completed || false,
                isCurrent: step.is_current || false,
                resources: step.resources || [],
                prerequisites: step.prerequisites || []
              })) || []
            }));

            allRoadmaps = [...allRoadmaps, ...mappedRoadmaps];
          }
        } catch (dbError) {
          console.error('Error loading roadmaps from database:', dbError);
        }
      }

      // Set the roadmaps (real data from Curiosity Compass or database)
      setRoadmaps(allRoadmaps);
      setLastUpdated(new Date());
      console.log('🎯 Final roadmaps loaded:', allRoadmaps.length, 'roadmaps');
      console.log('🎯 Roadmap details:', allRoadmaps.map(r => ({ id: r.id, title: r.title, category: r.category })));
    } catch (error) {
      console.error('Error loading roadmaps:', error);
      // Set roadmaps from API data
      setRoadmaps(allRoadmaps);
    } finally {
      setIsLoading(false);
    }
  };

  // Load detailed learning steps for a roadmap - REAL-TIME GENERATION
  const loadDetailedSteps = async (roadmapId: string) => {
    setLoadingSteps(true);
    try {
      console.log('🔄 Generating real-time learning steps for roadmap:', roadmapId);
      
      // Extract domain from roadmap ID or title
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (!roadmap) {
        console.log('⚠️ Roadmap not found');
        setLoadingSteps(false);
        return;
      }
      
      // Extract domain from roadmap title or use a default
      const domain = roadmap.title.split(' ')[0].toLowerCase() || 'software_engineering';
      
      // Call the new API endpoint for real-time generation
      const response = await fetch(`/api/ai/roadmap/${domain}/steps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          goal: roadmap.title,
          difficulty: roadmap.difficulty || 'beginner',
          userProfile: {
            experience: 'beginner',
            interests: [domain]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.steps) {
          setDetailedSteps(data.steps);
          console.log('✅ Real-time learning steps generated:', data.steps);
          toast({
            title: "Learning Steps Generated! 🎯",
            description: `Generated ${data.steps.length} personalized learning steps using Google APIs`,
            duration: 3000,
          });
        } else {
          console.log('⚠️ No detailed steps available, using roadmap steps');
          setDetailedSteps(roadmap.steps || []);
        }
      } else {
        console.log('⚠️ API call failed, using roadmap steps');
        setDetailedSteps(roadmap.steps || []);
      }
    } catch (error) {
      console.error('Error loading detailed steps:', error);
      // Fallback to roadmap steps
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (roadmap && roadmap.steps) {
        setDetailedSteps(roadmap.steps);
      }
    } finally {
      setLoadingSteps(false);
    }
  };


  // Load resources for a specific step using Google APIs
  const loadStepResources = async (stepId: string, stepTitle: string, stepDescription: string, skills: string[], difficulty: string, category: string, domain: string = 'software_engineering', learningCategory: string = 'foundation') => {
    setLoadingResources(prev => ({ ...prev, [stepId]: true }));
    try {
      console.log('🔄 Loading Google APIs resources for step:', stepId, 'domain:', domain, 'category:', learningCategory);
      const response = await apiService.generateStepResources({
        stepTitle,
        stepDescription,
        skills,
        difficulty,
        category,
        domain,
        learningCategory
      }) as any;
      
      if (response.success && response.resources) {
        setStepResources(prev => ({ ...prev, [stepId]: response.resources }));
        console.log('✅ Google APIs resources loaded for step:', stepId, response.resources);
        toast({
          title: "Success",
          description: "Google APIs learning resources generated!",
          variant: "default",
        });
      } else {
        console.log('⚠️ No resources returned for step:', stepId);
        setStepResources(prev => ({ ...prev, [stepId]: [] }));
      }
    } catch (error) {
      console.error('Error loading step resources:', error);
      toast({
        title: "Error Loading Resources",
        description: "Failed to load learning resources for this step.",
        variant: "destructive"
      });
    } finally {
      setLoadingResources(prev => ({ ...prev, [stepId]: false }));
    }
  };


  // Generate real-time learning steps using Google APIs
  const generateRealTimeLearningSteps = async (domain: string, roadmapData: any) => {
    try {
      console.log(`🔍 Generating REAL-TIME learning steps for domain: ${domain}`);
      
      // Call the backend API to generate real-time content using Google APIs
      const response = await fetch(`/api/ai/roadmap/${domain}/steps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          goal: roadmapData.goal || `Master ${domain}`,
          difficulty: roadmapData.difficulty_level || 'beginner',
          userProfile: {
            experience: 'beginner',
            interests: [domain]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.steps) {
          console.log(`✅ Generated ${data.steps.length} real-time learning steps for ${domain}`);
          return data.steps;
        }
      }
      
      console.log('⚠️ Falling back to structured learning steps');
      return generateStructuredLearningSteps(domain);
    } catch (error) {
      console.error('Error generating real-time learning steps:', error);
      return generateStructuredLearningSteps(domain);
    }
  };

  // Generate structured learning steps (4-step process)
  const generateStructuredLearningSteps = (domain: string) => {
    const categories = ['foundation', 'intermediate', 'advanced', 'real_world'];
    
    return categories.map((category, index) => ({
      id: `${domain.toLowerCase()}_step_${index + 1}`,
      title: `${domain} ${category.charAt(0).toUpperCase() + category.slice(1)} Learning`,
      description: `Master ${category} concepts and skills in ${domain}`,
      type: 'learning' as const,
      duration: category === 'foundation' ? '2-4 weeks' : 
                category === 'intermediate' ? '4-6 weeks' :
                category === 'advanced' ? '6-8 weeks' : '8-12 weeks',
      difficulty: (category === 'foundation' ? 'beginner' : 
                 category === 'intermediate' ? 'intermediate' : 'advanced') as 'beginner' | 'intermediate' | 'advanced',
      isCompleted: false,
      isCurrent: index === 0,
      resources: [],
      prerequisites: index === 0 ? [] : [`Complete ${categories[index - 1]} level`],
      category: category,
      objectives: [
        `Master core ${category} concepts in ${domain}`,
        `Build practical ${domain} skills`,
        `Apply ${domain} knowledge through projects`
      ],
      instructions: [
        `Study ${category} concepts and methodologies`,
        `Practice with hands-on exercises`,
        `Build ${domain} projects and applications`
      ],
      exercises: [
        `Complete ${category} coding challenges`,
        `Build ${domain} projects`,
        `Practice real-world problem solving`
      ],
      projects: [
        `Create a ${domain} portfolio project`,
        `Build a ${category} application`,
        `Develop industry-relevant solutions`
      ]
    }));
  };

  const createSeparateRoadmaps = (roadmapData: any, selections: any): Roadmap[] => {
    const roadmaps: Roadmap[] = [];
    
    // Check if this is a career-based roadmap (new format)
    if (roadmapData.career_breakdown) {
      console.log('🎯 Creating separate career-based roadmaps from career choices');
      
      // Use a consistent timestamp from the roadmap data or current time
      const baseTimestamp = roadmapData.created_at ? new Date(roadmapData.created_at).getTime() : roadmapData.id ? parseInt(roadmapData.id.split('_').pop() || '0') : Date.now();
      
      // Create separate roadmaps for interested careers
      roadmapData.career_breakdown.interested_careers.forEach((career: any, index: number) => {
        const careerRoadmap: Roadmap = {
          id: generateUniqueId('interested_career', index, baseTimestamp),
          title: `${career.title} Learning Roadmap`,
          description: `Comprehensive learning path for ${career.title} in ${career.domain} based on your interest`,
          category: career.domain,
          totalSteps: roadmapData.phases?.length || 0,
          completedSteps: 0,
          progress: 0,
          estimatedDuration: roadmapData.estimated_completion || '12-16 weeks',
          difficulty: career.difficulty || roadmapData.difficulty_level || 'beginner',
          isActive: true,
          createdAt: roadmapData.created_at || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          steps: (roadmapData.phases || []).flatMap((phase: any, phaseIndex: number) => 
            (phase.steps || []).map((step: any, stepIndex: number) => ({
              id: `${career.id}_phase_${phaseIndex}_step_${stepIndex}`,
              title: `${career.title} - ${step.title || `${phase.title} - Step ${stepIndex + 1}`}`,
              description: step.description || `Complete this step for ${career.title}`,
              type: step.type || 'learning' as const,
              duration: step.duration || phase.duration || '1-2 weeks',
              difficulty: step.difficulty || phase.difficulty || 'beginner',
              isCompleted: false,
              isCurrent: phaseIndex === 0 && stepIndex === 0,
              resources: Array.isArray(step.resources) ? step.resources : [],
              prerequisites: step.prerequisites || []
            }))
          )
        };
        
        roadmaps.push(careerRoadmap);
      });
      
      // Create separate roadmaps for maybe careers
      roadmapData.career_breakdown.maybe_careers.forEach((career: any, index: number) => {
        const careerRoadmap: Roadmap = {
          id: `maybe_career_${career.id}_${baseTimestamp}`,
          title: `${career.title} Exploration Roadmap`,
          description: `Exploration learning path for ${career.title} in ${career.domain} to help you decide`,
          category: career.domain,
          totalSteps: roadmapData.phases?.length || 0,
          completedSteps: 0,
          progress: 0,
          estimatedDuration: roadmapData.estimated_completion || '8-12 weeks',
          difficulty: career.difficulty || roadmapData.difficulty_level || 'beginner',
          isActive: true,
          createdAt: roadmapData.created_at || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          steps: (roadmapData.phases || []).flatMap((phase: any, phaseIndex: number) => 
            (phase.steps || []).map((step: any, stepIndex: number) => ({
              id: `${career.id}_phase_${phaseIndex}_step_${stepIndex}`,
              title: `${career.title} - ${step.title || `${phase.title} - Step ${stepIndex + 1}`}`,
              description: step.description || `Explore this step for ${career.title}`,
              type: step.type || 'learning' as const,
              duration: step.duration || phase.duration || '1-2 weeks',
              difficulty: step.difficulty || phase.difficulty || 'beginner',
              isCompleted: false,
              isCurrent: phaseIndex === 0 && stepIndex === 0,
              resources: Array.isArray(step.resources) ? step.resources : [],
              prerequisites: step.prerequisites || []
            }))
          )
        };
        
        roadmaps.push(careerRoadmap);
      });
      
      console.log('✅ Created separate career-based roadmaps:', roadmaps.length, 'roadmaps');
      return roadmaps;
    }
    
    // Legacy format for 4-step process
    // Map domain IDs to domain names
    const domainMap: { [key: string]: string } = {
      'technology': 'Technology & Digital',
      'creative': 'Creative Arts & Design',
      'science': 'Science & Research',
      'healthcare': 'Healthcare & Medicine',
      'business': 'Business & Finance',
      'social': 'Social Impact & Community'
    };
    
    // Map topic IDs to topic names
    const topicMap: { [key: string]: string } = {
      'web-dev': 'Web Development',
      'mobile-dev': 'Mobile Development',
      'ai-ml': 'AI & Machine Learning',
      'data-science': 'Data Science',
      'ui-ux': 'UI/UX Design',
      'marketing': 'Digital Marketing',
      'finance': 'Finance & Investment'
    };
    
    // Get the actual selected domains and topics (only the ones user selected)
    const likedDomainIds = selections.likedDomains || [];
    const likedTopicIds = selections.likedTopics || [];
    
    // Convert IDs to names
    const likedDomains = likedDomainIds.map(id => domainMap[id] || id);
    const likedTopics = likedTopicIds.map(id => topicMap[id] || id);
    
    console.log('Creating roadmaps for selected domains:', likedDomains);
    console.log('Creating roadmaps for selected topics:', likedTopics);
    
    // Use a consistent timestamp from the roadmap data or current time
    // This ensures the same IDs are generated across all pages
    const baseTimestamp = roadmapData.created_at ? new Date(roadmapData.created_at).getTime() : roadmapData.id ? parseInt(roadmapData.id.split('_').pop() || '0') : Date.now();
    
    // Create domain-based roadmaps (only for selected domains)
    likedDomains.forEach((domain: string, index: number) => {
      const domainId = likedDomainIds[index]; // Get the original ID
      const domainRoadmap: Roadmap = {
        id: generateUniqueId('domain', index, baseTimestamp),
        title: `${domain} Learning Roadmap`,
        description: `Comprehensive learning path for ${domain} based on your interests`,
        category: domainId,
        totalSteps: roadmapData.phases?.length || 0,
        completedSteps: 0,
        progress: 0,
        estimatedDuration: roadmapData.estimated_completion || '8-12 weeks',
        difficulty: roadmapData.difficulty_level || 'beginner',
        isActive: true,
        createdAt: roadmapData.created_at || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        steps: generateStructuredLearningSteps(domain)
      };
      
      roadmaps.push(domainRoadmap);
    });
    
    // Create topic-based roadmaps (only for selected topics)
    likedTopics.forEach((topic: string, index: number) => {
      const topicId = likedTopicIds[index]; // Get the original ID
      const topicRoadmap: Roadmap = {
        id: `topic_${topicId}_${baseTimestamp}`,
        title: `${topic} Learning Roadmap`,
        description: `Specialized learning path for ${topic} based on your interests`,
        category: topicId,
        totalSteps: roadmapData.phases?.length || 0,
        completedSteps: 0,
        progress: 0,
        estimatedDuration: roadmapData.estimated_completion || '6-10 weeks',
        difficulty: roadmapData.difficulty_level || 'beginner',
        isActive: true,
        createdAt: roadmapData.created_at || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        steps: generateStructuredLearningSteps(topic)
      };
      
      roadmaps.push(topicRoadmap);
    });
    
    return roadmaps;
  };


  const generateNewRoadmap = async () => {
    setIsGenerating(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user's interests and skills for AI analysis
      const userInterests = user?.interests || [];
      const userSkills = user?.skills || [];
      
      // Create roadmap preferences based on user data
      const preferences = {
        likedDomains: userInterests,
        dislikedDomains: [],
        likedTopics: userSkills,
        dislikedTopics: []
      };

      console.log('🚀 Generating new roadmap with preferences:', preferences);

      // Generate AI roadmap using the API service
      const roadmapResult = await apiService.generatePersonalizedRoadmap(preferences) as any;
      
      if (roadmapResult.success && roadmapResult.data) {
        console.log('✅ Roadmap generated successfully:', roadmapResult.data);
        
        // Store in localStorage for persistence and real-time updates
        localStorage.setItem('generated_roadmap', JSON.stringify(roadmapResult.data));
        localStorage.setItem('exploration_selections', JSON.stringify(preferences));
        
        // Convert the generated roadmap to component format
        const newRoadmap: Roadmap = {
          id: roadmapResult.data.id,
          title: roadmapResult.data.title,
          description: roadmapResult.data.description,
          category: roadmapResult.data.category || 'AI Generated',
          totalSteps: roadmapResult.data.steps?.length || 0,
          completedSteps: 0,
          progress: 0,
          estimatedDuration: roadmapResult.data.estimated_duration || '8 weeks',
          difficulty: roadmapResult.data.difficulty_level || 'beginner',
          isActive: true,
          createdAt: roadmapResult.data.created_at,
          lastUpdated: roadmapResult.data.updated_at,
          steps: roadmapResult.data.steps?.map((step: any) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            type: step.type || 'learning',
            duration: step.estimated_time || '1 week',
            difficulty: step.difficulty || 'beginner',
            isCompleted: false,
            isCurrent: false,
            resources: step.resources || [],
            prerequisites: step.prerequisites || []
          })) || []
        };

        // Add the new roadmap to the list and select it
        setRoadmaps(prev => [newRoadmap, ...prev]);
        setSelectedRoadmap(newRoadmap);
        
        // Track the activity
        await apiService.trackUserActivity(user.id, {
          activity_type: 'roadmap_generation',
          activity_name: 'Generated new AI roadmap',
          category: 'ai_roadmap',
          page_url: '/ai-roadmap',
          metadata: {
            roadmap_id: newRoadmap.id,
            roadmap_title: newRoadmap.title,
            roadmap_category: newRoadmap.category,
            timestamp: new Date().toISOString()
          }
        });

        console.log('Successfully generated AI roadmap:', newRoadmap.title);
        
        // Show success toast
        toast({
          title: "Roadmap Generated! 🎉",
          description: `Successfully created "${newRoadmap.title}" based on your preferences.`,
          duration: 5000,
        });

        // Send notification
        NotificationService.createRoadmapNotification(
          "New Roadmap Created!",
          `"${newRoadmap.title}" has been generated based on your preferences.`,
          '/ai-roadmap'
        );
      } else {
        throw new Error(roadmapResult.error || 'Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Generation Failed",
        description: `Failed to generate roadmap: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateRoadmapProgress = async (roadmapId: string, stepId: string, completed: boolean) => {
    try {
      if (!user?.id) return;

      // Update the roadmap step in the database
      const updateResult = await apiService.updateRoadmapStep(roadmapId, stepId, { completed }) as any;
      
      if (updateResult.success) {
        // Update local state
        setRoadmaps(prev => prev.map(roadmap => {
          if (roadmap.id === roadmapId) {
            const updatedSteps = roadmap.steps.map(step => 
              step.id === stepId ? { ...step, isCompleted: completed } : step
            );
            
            const completedSteps = updatedSteps.filter(step => step.isCompleted).length;
            const progress = Math.round((completedSteps / roadmap.totalSteps) * 100);
            
            return {
              ...roadmap,
              steps: updatedSteps,
              completedSteps,
              progress,
              lastUpdated: new Date().toISOString()
            };
          }
          return roadmap;
        }));

        // Track the activity
        await apiService.trackUserActivity(user.id, {
          activity_type: 'roadmap_progress',
          activity_name: completed ? 'Completed roadmap step' : 'Reopened roadmap step',
          category: 'ai_roadmap',
          page_url: '/ai-roadmap',
          metadata: {
            roadmap_id: roadmapId,
            step_id: stepId,
            completed: completed,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error updating roadmap progress:', error);
    }
  };

  // No longer needed - roadmap details are shown in the right panel
  // const handleViewRoadmap = (roadmap: Roadmap) => {
  //   // This function is no longer needed since we show details in the right panel
  // };

  const handleEditRoadmap = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    console.log('Edit roadmap:', roadmap);
  };

  const handleSaveEdit = (updatedRoadmap: Roadmap) => {
    setRoadmaps(prev => prev.map(roadmap => 
      roadmap.id === updatedRoadmap.id ? updatedRoadmap : roadmap
    ));
    
    if (selectedRoadmap?.id === updatedRoadmap.id) {
      setSelectedRoadmap(updatedRoadmap);
    }
    
    setEditingRoadmap(null);
    
    toast({
      title: "Roadmap Updated! ✅",
      description: `"${updatedRoadmap.title}" has been updated successfully.`,
      duration: 3000,
    });
  };

  const handleCancelEdit = () => {
    setEditingRoadmap(null);
  };

  // Debug function to clear deleted roadmaps (for testing)
  const clearDeletedRoadmaps = () => {
    localStorage.removeItem('deleted_roadmaps');
    console.log('🗑️ Cleared deleted roadmaps list');
    loadUserRoadmaps(); // Reload to show all roadmaps
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    try {
      const roadmapToDelete = roadmaps.find(r => r.id === roadmapId);
      if (!roadmapToDelete) return;

      // Add to recycle bin before deleting (only if not already there)
      try {
        await RecycleBinService.addToRecycleBin(
          roadmapId,
          'roadmap',
          roadmapToDelete,
          user?.id || 'anonymous',
          roadmapToDelete
        );
        console.log('✅ Added roadmap to recycle bin');
      } catch (error) {
        console.log('⚠️ Roadmap may already be in recycle bin:', error);
      }

      // Delete from database if it exists there
      try {
        const result = await apiService.deleteRoadmap(roadmapId, user?.id || 'anonymous') as any;
        if (result.success) {
          console.log('✅ Roadmap deleted from database successfully');
        } else {
          console.log('⚠️ Roadmap not found in database, continuing with local deletion');
        }
      } catch (error) {
        console.log('⚠️ Database deletion failed, continuing with local deletion:', error);
      }

      // CRITICAL: Remove from localStorage completely to prevent reload
      const storedRoadmap = localStorage.getItem('generated_roadmap');
      if (storedRoadmap) {
        try {
          const roadmapData = JSON.parse(storedRoadmap);
          // If this is the main generated roadmap, clear it completely
          if (roadmapData.id === roadmapId) {
            localStorage.removeItem('generated_roadmap');
            localStorage.removeItem('exploration_selections');
            console.log('✅ Removed main roadmap from localStorage completely');
          } else {
            // Check if the deleted roadmap was derived from the main roadmap
            // If so, we need to clear the main roadmap to prevent regeneration
            const storedSelections = localStorage.getItem('exploration_selections');
            if (storedSelections) {
              try {
                const selections = JSON.parse(storedSelections);
                // Check if this roadmap was created from the main roadmap
                const wasDerivedFromMain = roadmapData.domains?.some((domain: any) => 
                  selections.domains?.includes(domain)
                ) || roadmapData.topics?.some((topic: any) => 
                  selections.topics?.includes(topic)
                );
                
                if (wasDerivedFromMain) {
                  console.log('🗑️ Deleted roadmap was derived from main roadmap, clearing localStorage');
                  localStorage.removeItem('generated_roadmap');
                  localStorage.removeItem('exploration_selections');
                }
              } catch (error) {
                console.log('⚠️ Error parsing stored selections:', error);
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Error parsing stored roadmap:', error);
        }
      }

      // Mark as deleted in localStorage to prevent it from coming back
      const deletedRoadmaps = JSON.parse(localStorage.getItem('deleted_roadmaps') || '[]');
      if (!deletedRoadmaps.includes(roadmapId)) {
        deletedRoadmaps.push(roadmapId);
        localStorage.setItem('deleted_roadmaps', JSON.stringify(deletedRoadmaps));
        console.log('✅ Added roadmap to deleted list:', roadmapId);
      }

      // Remove from local state
      setRoadmaps(prev => {
        const updated = prev.filter(roadmap => roadmap.id !== roadmapId);
        console.log('✅ Removed from local state. Remaining roadmaps:', updated.length);
        return updated;
      });
      
      // If the deleted roadmap was selected, select another one
      if (selectedRoadmap?.id === roadmapId) {
        const remainingRoadmaps = roadmaps.filter(roadmap => roadmap.id !== roadmapId);
        setSelectedRoadmap(remainingRoadmaps.length > 0 ? remainingRoadmaps[0] : null);
        console.log('✅ Updated selected roadmap');
      }

      // Send notification
      NotificationService.createSystemNotification(
        'Roadmap Deleted',
        `"${roadmapToDelete.title}" has been permanently deleted.`,
        'success'
      );

      setShowDeleteConfirm(null);
      setLastUpdated(new Date());
      console.log('✅ Roadmap deletion completed successfully');
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  };



  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'learning': return BookOpen;
      case 'project': return Target;
      case 'assessment': return CheckCircle;
      case 'practice': return Play;
      default: return BookOpen;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'practice': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Roadmaps...</h2>
            <p className="text-gray-600 text-center">
              Preparing your personalized learning paths.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Learning Roadmaps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Follow your personalized AI-generated paths to achieve your career goals with real-time learning resources
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm text-gray-500">
              {isLoading ? 'Updating...' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Button 
            variant="outline"
            size="sm"
            onClick={loadUserRoadmaps}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    Loading...
                </>
              ) : (
                <>
                    <ArrowRight className="w-4 h-4" />
                    Refresh
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate('/curiosity-compass')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate New Roadmap
            </Button>
        </div>

        {roadmaps.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Roadmaps Generated Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete the Curiosity Compass to generate personalized AI-powered learning roadmaps based on your interests.
                  </p>
                  <Button
                    onClick={() => navigate('/curiosity-compass')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Start Curiosity Compass
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
          </div>
        </CardContent>
      </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Your Paths */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Paths</h2>
              </div>
              
              <div className="space-y-3">
        {roadmaps.map((roadmap) => (
          <Card 
            key={roadmap.id} 
                    className={`group cursor-pointer transition-all duration-200 ${
                      selectedRoadmap?.id === roadmap.id 
                        ? 'ring-2 ring-purple-500 bg-purple-50' 
                        : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedRoadmap(roadmap)}
          >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {roadmap.category}
                  </Badge>
                </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {roadmap.title}
                          </h3>
              </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRoadmap(roadmap);
                            }}
                            className="opacity-60 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                            title="Edit Roadmap"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(roadmap.id);
                            }}
                            className="opacity-60 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-100"
                            title="Delete Roadmap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

              <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{roadmap.completedSteps}/{roadmap.totalSteps} steps</span>
                </div>
                <Progress value={roadmap.progress} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {roadmap.progress}% Complete
              </div>
                </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>

            {/* Right Panel - Detailed Roadmap View */}
            <div className="space-y-4">
              {selectedRoadmap ? (
                <Card>
                  <CardContent className="p-6">
                    {/* Roadmap Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                              {selectedRoadmap.title}
                            </h2>
              </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{selectedRoadmap.estimatedDuration}</span>
              </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{selectedRoadmap.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
                              <span className="text-purple-600 font-medium">
                            {selectedRoadmap.progress}% Complete
                              </span>
                            </div>
                          </div>
              </div>
            </div>

                      <div className="flex gap-2">
                        <Badge variant="secondary">{selectedRoadmap.category}</Badge>
                        <Badge variant="outline">Roadmap</Badge>
                        <Badge variant="outline">Learning Path</Badge>
                      </div>
                    </div>

                    {/* Learning Steps */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Learning Steps</h3>
                      </div>

                      {loadingSteps ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                            <span className="text-gray-600">Loading AI-powered learning steps...</span>
                          </div>
                        </div>
                      ) : detailedSteps.length > 0 ? (
                        <div className="space-y-6">
                          {detailedSteps.map((step: any, index: number) => (
                            <div key={step.id || index} className="border rounded-lg p-6 bg-white shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-1">
                                        {step.title || `Activity ${index + 1}`}
                                      </h4>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {step.description || 'No description available'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Clock className="w-4 h-4" />
                                      <span>{step.estimatedTime || '2-3 hours'}</span>
                                    </div>
                                  </div>

                                  {/* Learning Category Badge */}
                                  {step.category && (
                                    <div className="mb-3">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          step.category === 'foundation' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                          step.category === 'intermediate' ? 'bg-green-100 text-green-800 border-green-200' :
                                          step.category === 'advanced' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                          step.category === 'real_world' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                          'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}
                                      >
                                        {step.category === 'foundation' ? '🏗️ Foundation' :
                                         step.category === 'intermediate' ? '⚙️ Intermediate' :
                                         step.category === 'advanced' ? '🚀 Advanced' :
                                         step.category === 'real_world' ? '🌍 Real-World' :
                                         step.category}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Learning Objectives */}
                                  {step.objectives && step.objectives.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.objectives.map((objective: string, objIndex: number) => (
                                          <li key={objIndex} className="text-sm text-gray-600">{objective}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Instructions */}
                                  {step.instructions && step.instructions.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h5>
                                      <ol className="list-decimal list-inside space-y-1">
                                        {step.instructions.map((instruction: string, instIndex: number) => (
                                          <li key={instIndex} className="text-sm text-gray-600">{instruction}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}

                                  {/* Exercises */}
                                  {step.exercises && step.exercises.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Practice Exercises:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.exercises.map((exercise: string, exIndex: number) => (
                                          <li key={exIndex} className="text-sm text-gray-600">{exercise}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Projects */}
                                  {step.projects && step.projects.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Projects:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.projects.map((project: string, projIndex: number) => (
                                          <li key={projIndex} className="text-sm text-gray-600">{project}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Assessment */}
                                  {step.assessment && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Assessment:</h5>
                                      <p className="text-sm text-gray-600">{step.assessment}</p>
                                    </div>
                                  )}

                                  {/* Resources Section */}
                                  <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="text-sm font-medium text-gray-700">Learning Resources:</h5>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => loadStepResources(
                                          step.id,
                                          step.title,
                                          step.description,
                                          step.skills || [],
                                          step.difficulty || 'beginner',
                                          selectedRoadmap?.category || 'General',
                                          selectedRoadmap?.domain || 'software_engineering',
                                          step.category || 'foundation'
                                        )}
                                        disabled={loadingResources[step.id]}
                                        className="text-xs"
                                      >
                                        {loadingResources[step.id] ? (
                                          <>
                                            <div className="w-3 h-3 border border-gray-300 border-t-purple-600 rounded-full animate-spin mr-1" />
                                            Loading...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Load Google APIs Resources
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    
                                    {stepResources[step.id] ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {stepResources[step.id].map((resource: any, resIndex: number) => (
                                          <div key={resIndex} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                              <h6 className="font-medium text-sm text-gray-900 line-clamp-2">{resource.title}</h6>
                                              <div className="flex flex-col items-end gap-1 ml-2">
                                                <Badge variant="secondary" className="text-xs">
                                                  {resource.type}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                  {resource.platform}
                                                </Badge>
                                              </div>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{resource.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                              <span className="flex items-center gap-2">
                                                <span>{resource.provider}</span>
                                                {resource.rating && (
                                                  <span className="flex items-center gap-1">
                                                    ⭐ {resource.rating}
                                                  </span>
                                                )}
                                                {resource.cost && (
                                                  <Badge variant={resource.cost === 'free' ? 'default' : 'destructive'} className="text-xs">
                                                    {resource.cost}
                                                  </Badge>
                                                )}
                                              </span>
                                              <span className="text-xs">
                                                Score: {resource.finalScore || resource.relevanceScore || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              {resource.url && (
                                                <a
                                                  href={resource.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                                                >
                                                  Visit Resource →
                                                </a>
                                              )}
                                              {resource.thumbnail && (
                                                <img 
                                                  src={resource.thumbnail} 
                                                  alt={resource.title}
                                                  className="w-8 h-6 object-cover rounded"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500 italic">
                                        Click "Load Google APIs Resources" to get personalized learning materials from Google Search, YouTube, Books, and more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : selectedRoadmap.steps && selectedRoadmap.steps.length > 0 ? (
                        <div className="space-y-6">
                          {selectedRoadmap.steps.map((step: any, index: number) => (
                            <div key={step.id || index} className="border rounded-lg p-6 bg-white shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {step.title || `Step ${index + 1}`}
                                    </h4>
                                    <Badge variant={step.difficulty === 'beginner' ? 'default' : step.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                                      {step.difficulty || 'beginner'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {step.duration || '2-4 weeks'}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-gray-600 mb-4">
                                    {step.description || 'No description available'}
                                  </p>
                                  
                                  {step.objectives && step.objectives.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.objectives.map((objective: string, objIndex: number) => (
                                          <li key={objIndex} className="text-sm text-gray-600">{objective}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {step.instructions && step.instructions.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.instructions.map((instruction: string, instIndex: number) => (
                                          <li key={instIndex} className="text-sm text-gray-600">{instruction}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {step.exercises && step.exercises.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Exercises:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.exercises.map((exercise: string, exIndex: number) => (
                                          <li key={exIndex} className="text-sm text-gray-600">{exercise}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {step.projects && step.projects.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Projects:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {step.projects.map((project: string, projIndex: number) => (
                                          <li key={projIndex} className="text-sm text-gray-600">{project}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {step.resources && step.resources.length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Resources:</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {step.resources.map((resource: any, resIndex: number) => (
                                          <div key={resIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-700">
                                              {typeof resource === 'string' ? resource : resource.title || resource}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {step.prerequisites && step.prerequisites.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      <strong>Prerequisites:</strong> {step.prerequisites.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No learning steps available for this roadmap.</p>
                          <p className="text-sm">Learning steps are generated in real-time. Try refreshing or generating a new roadmap.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Roadmap</h3>
                    <p className="text-gray-600">
                      Choose a roadmap from the left panel to view its details and learning steps.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

      {/* Edit Roadmap Dialog */}
      {editingRoadmap && (
        <Dialog open={!!editingRoadmap} onOpenChange={handleCancelEdit}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Roadmap</DialogTitle>
            </DialogHeader>
            <EditRoadmapForm
              roadmap={editingRoadmap}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
          <CardHeader>
              <CardTitle className="text-red-600">Delete Roadmap</CardTitle>
            <CardDescription>
                Are you sure you want to delete this roadmap? This action cannot be undone.
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRoadmap(showDeleteConfirm)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
              </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      </div>
    </div>
  );
};

// Edit Roadmap Form Component
const EditRoadmapForm: React.FC<{
  roadmap: Roadmap;
  onSave: (roadmap: Roadmap) => void;
  onCancel: () => void;
}> = ({ roadmap, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: roadmap.title,
    description: roadmap.description,
    category: roadmap.category,
    difficulty: roadmap.difficulty as "beginner" | "intermediate" | "advanced",
    estimatedDuration: roadmap.estimatedDuration,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRoadmap = {
      ...roadmap,
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    onSave(updatedRoadmap);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as "beginner" | "intermediate" | "advanced" }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Estimated Duration</Label>
          <Input
            id="duration"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
            placeholder="e.g., 8 weeks"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AIRoadmap;
