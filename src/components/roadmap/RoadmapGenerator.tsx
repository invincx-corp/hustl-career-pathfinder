import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Play,
  ArrowRight,
  BookOpen,
  Target,
  Zap,
  Award,
  Calendar
} from 'lucide-react';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'project' | 'quiz' | 'practice';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  resources: {
    type: 'video' | 'article' | 'tutorial' | 'project';
    title: string;
    url: string;
  }[];
  completed?: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalSteps: number;
  completedSteps: number;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
  isRecommended: boolean;
  tags: string[];
}

interface RoadmapGeneratorProps {
  userInterests: string[];
  userSkills: string[];
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  skillAssessmentResults: any[];
  onRoadmapSelect: (roadmap: Roadmap) => void;
}

const ROADMAP_TEMPLATES: Record<string, Roadmap> = {
  'web-development': {
    id: 'web-development',
    title: 'Full-Stack Web Development',
    description: 'Learn to build modern web applications from frontend to backend',
    category: 'Programming',
    totalSteps: 15,
    completedSteps: 0,
    estimatedDuration: '3-4 months',
    difficulty: 'beginner',
    steps: [
      {
        id: 'html-css-basics',
        title: 'HTML & CSS Fundamentals',
        description: 'Learn the building blocks of web development',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'beginner',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'HTML Crash Course', url: '#' },
          { type: 'tutorial', title: 'CSS Flexbox Guide', url: '#' }
        ]
      },
      {
        id: 'javascript-basics',
        title: 'JavaScript Fundamentals',
        description: 'Master the language of the web',
        type: 'lesson',
        duration: '3 weeks',
        difficulty: 'beginner',
        prerequisites: ['html-css-basics'],
        resources: [
          { type: 'video', title: 'JavaScript ES6+', url: '#' },
          { type: 'tutorial', title: 'DOM Manipulation', url: '#' }
        ]
      },
      {
        id: 'first-project',
        title: 'Build Your First Website',
        description: 'Create a personal portfolio website',
        type: 'project',
        duration: '1 week',
        difficulty: 'beginner',
        prerequisites: ['html-css-basics', 'javascript-basics'],
        resources: [
          { type: 'project', title: 'Portfolio Template', url: '#' }
        ]
      },
      {
        id: 'react-intro',
        title: 'React Introduction',
        description: 'Learn the most popular frontend framework',
        type: 'lesson',
        duration: '4 weeks',
        difficulty: 'intermediate',
        prerequisites: ['javascript-basics'],
        resources: [
          { type: 'video', title: 'React Tutorial', url: '#' },
          { type: 'tutorial', title: 'React Hooks', url: '#' }
        ]
      },
      {
        id: 'node-js-basics',
        title: 'Node.js & Express',
        description: 'Build server-side applications with JavaScript',
        type: 'lesson',
        duration: '3 weeks',
        difficulty: 'intermediate',
        prerequisites: ['javascript-basics'],
        resources: [
          { type: 'video', title: 'Node.js Crash Course', url: '#' },
          { type: 'tutorial', title: 'Express.js Guide', url: '#' }
        ]
      },
      {
        id: 'database-basics',
        title: 'Database Fundamentals',
        description: 'Learn SQL and database design',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'SQL Tutorial', url: '#' },
          { type: 'tutorial', title: 'Database Design', url: '#' }
        ]
      },
      {
        id: 'fullstack-project',
        title: 'Full-Stack Application',
        description: 'Build a complete web application',
        type: 'project',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: ['react-intro', 'node-js-basics', 'database-basics'],
        resources: [
          { type: 'project', title: 'Todo App Template', url: '#' }
        ]
      }
    ],
    isRecommended: false,
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL']
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science with Python',
    description: 'Learn to analyze data and build predictive models',
    category: 'Data Science',
    totalSteps: 12,
    completedSteps: 0,
    estimatedDuration: '4-5 months',
    difficulty: 'intermediate',
    steps: [
      {
        id: 'python-basics',
        title: 'Python Fundamentals',
        description: 'Master Python programming basics',
        type: 'lesson',
        duration: '3 weeks',
        difficulty: 'beginner',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'Python Crash Course', url: '#' },
          { type: 'tutorial', title: 'Python Data Types', url: '#' }
        ]
      },
      {
        id: 'pandas-numpy',
        title: 'Data Manipulation with Pandas & NumPy',
        description: 'Learn essential data science libraries',
        type: 'lesson',
        duration: '3 weeks',
        difficulty: 'intermediate',
        prerequisites: ['python-basics'],
        resources: [
          { type: 'video', title: 'Pandas Tutorial', url: '#' },
          { type: 'tutorial', title: 'NumPy Arrays', url: '#' }
        ]
      },
      {
        id: 'data-visualization',
        title: 'Data Visualization',
        description: 'Create compelling charts and graphs',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: ['pandas-numpy'],
        resources: [
          { type: 'video', title: 'Matplotlib & Seaborn', url: '#' },
          { type: 'tutorial', title: 'Plotly Interactive Charts', url: '#' }
        ]
      },
      {
        id: 'statistics',
        title: 'Statistics for Data Science',
        description: 'Learn statistical concepts and methods',
        type: 'lesson',
        duration: '3 weeks',
        difficulty: 'intermediate',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'Statistics Fundamentals', url: '#' },
          { type: 'tutorial', title: 'Hypothesis Testing', url: '#' }
        ]
      },
      {
        id: 'machine-learning',
        title: 'Machine Learning Basics',
        description: 'Introduction to ML algorithms',
        type: 'lesson',
        duration: '4 weeks',
        difficulty: 'advanced',
        prerequisites: ['pandas-numpy', 'statistics'],
        resources: [
          { type: 'video', title: 'Scikit-learn Tutorial', url: '#' },
          { type: 'tutorial', title: 'ML Algorithms', url: '#' }
        ]
      },
      {
        id: 'data-project',
        title: 'Data Analysis Project',
        description: 'Analyze a real-world dataset',
        type: 'project',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: ['data-visualization', 'statistics'],
        resources: [
          { type: 'project', title: 'Sales Data Analysis', url: '#' }
        ]
      }
    ],
    isRecommended: false,
    tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Statistics', 'Machine Learning']
  },
  'ui-ux-design': {
    id: 'ui-ux-design',
    title: 'UI/UX Design Mastery',
    description: 'Learn to create beautiful and user-friendly interfaces',
    category: 'Design',
    totalSteps: 10,
    completedSteps: 0,
    estimatedDuration: '3-4 months',
    difficulty: 'beginner',
    steps: [
      {
        id: 'design-principles',
        title: 'Design Principles',
        description: 'Learn fundamental design concepts',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'beginner',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'Design Thinking', url: '#' },
          { type: 'article', title: 'Color Theory', url: '#' }
        ]
      },
      {
        id: 'figma-basics',
        title: 'Figma Fundamentals',
        description: 'Master the industry-standard design tool',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'beginner',
        prerequisites: ['design-principles'],
        resources: [
          { type: 'video', title: 'Figma Tutorial', url: '#' },
          { type: 'tutorial', title: 'Figma Components', url: '#' }
        ]
      },
      {
        id: 'wireframing',
        title: 'Wireframing & Prototyping',
        description: 'Create user flows and interactive prototypes',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: ['figma-basics'],
        resources: [
          { type: 'video', title: 'Wireframing Guide', url: '#' },
          { type: 'tutorial', title: 'Prototyping in Figma', url: '#' }
        ]
      },
      {
        id: 'user-research',
        title: 'User Research & Testing',
        description: 'Understand your users and validate designs',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'intermediate',
        prerequisites: [],
        resources: [
          { type: 'video', title: 'User Research Methods', url: '#' },
          { type: 'tutorial', title: 'Usability Testing', url: '#' }
        ]
      },
      {
        id: 'design-system',
        title: 'Design Systems',
        description: 'Create consistent and scalable design systems',
        type: 'lesson',
        duration: '2 weeks',
        difficulty: 'advanced',
        prerequisites: ['figma-basics', 'wireframing'],
        resources: [
          { type: 'video', title: 'Design System Guide', url: '#' },
          { type: 'tutorial', title: 'Component Libraries', url: '#' }
        ]
      },
      {
        id: 'portfolio-project',
        title: 'Design Portfolio Project',
        description: 'Create a complete app design from research to prototype',
        type: 'project',
        duration: '3 weeks',
        difficulty: 'intermediate',
        prerequisites: ['wireframing', 'user-research'],
        resources: [
          { type: 'project', title: 'Mobile App Design', url: '#' }
        ]
      }
    ],
    isRecommended: false,
    tags: ['Figma', 'Design Thinking', 'User Research', 'Prototyping', 'Design Systems']
  }
};

// Function to generate personalized roadmaps based on skill assessment results
const generateRoadmapsFromAssessment = (assessmentResults: any[], interests: string[], skills: string[]): Roadmap[] => {
  if (!assessmentResults || assessmentResults.length === 0 || !Array.isArray(assessmentResults)) {
    // Fallback to template roadmaps if no assessment results
    return Object.values(ROADMAP_TEMPLATES).map(roadmap => ({
      ...roadmap,
      isRecommended: false
    }));
  }

  // Analyze assessment results to determine strengths and weaknesses
  const strengths = assessmentResults
    .filter(result => result && result.score >= 7 && result.skill)
    .map(result => result.skill.toLowerCase());
  
  const weaknesses = assessmentResults
    .filter(result => result && result.score <= 4 && result.skill)
    .map(result => result.skill.toLowerCase());

  const moderateSkills = assessmentResults
    .filter(result => result && result.score > 4 && result.score < 7 && result.skill)
    .map(result => result.skill.toLowerCase());

  // Generate personalized roadmaps based on assessment
  const personalizedRoadmaps: Roadmap[] = [];

  // 1. Strengthen weak areas
  weaknesses.forEach(weakness => {
    const roadmap = createRoadmapForSkill(weakness, 'improvement', assessmentResults);
    if (roadmap) {
      personalizedRoadmaps.push(roadmap);
    }
  });

  // 2. Build on strengths
  strengths.forEach(strength => {
    const roadmap = createRoadmapForSkill(strength, 'advancement', assessmentResults);
    if (roadmap) {
      personalizedRoadmaps.push(roadmap);
    }
  });

  // 3. Develop moderate skills
  moderateSkills.slice(0, 2).forEach(skill => { // Limit to top 2 moderate skills
    const roadmap = createRoadmapForSkill(skill, 'development', assessmentResults);
    if (roadmap) {
      personalizedRoadmaps.push(roadmap);
    }
  });

  // 4. Add interest-based roadmaps if not covered by assessment
  if (interests && Array.isArray(interests)) {
    interests.forEach(interest => {
      if (interest && typeof interest === 'string') {
        const hasRelatedRoadmap = personalizedRoadmaps.some(roadmap => 
          roadmap.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
        );
        
        if (!hasRelatedRoadmap) {
          const roadmap = createRoadmapForInterest(interest, assessmentResults);
          if (roadmap) {
            personalizedRoadmaps.push(roadmap);
          }
        }
      }
    });
  }

  // Mark as recommended based on assessment results
  return personalizedRoadmaps.map(roadmap => ({
    ...roadmap,
    isRecommended: true // All generated roadmaps are recommended based on assessment
  }));
};

// Helper function to create roadmap for a specific skill
const createRoadmapForSkill = (skill: string, type: 'improvement' | 'advancement' | 'development', assessmentResults: any[]): Roadmap | null => {
  if (!skill || !assessmentResults || assessmentResults.length === 0) return null;
  
  const skillResult = assessmentResults.find(result => 
    result && result.skill && result.skill.toLowerCase() === skill.toLowerCase()
  );
  
  if (!skillResult) return null;

  const baseScore = skillResult.score;
  const roadmapId = `${skill.toLowerCase().replace(/\s+/g, '-')}-${type}`;
  
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let steps: LearningStep[] = [];
  let estimatedDuration = '2-3 weeks';

  if (type === 'improvement') {
    difficulty = 'beginner';
    steps = [
      {
        id: `${roadmapId}-fundamentals`,
        title: `${skill} Fundamentals`,
        description: `Build a strong foundation in ${skill}`,
        type: 'lesson',
        duration: '1 week',
        difficulty: 'beginner',
        prerequisites: [],
        resources: [
          { type: 'video', title: `${skill} Basics Tutorial`, url: '#' },
          { type: 'tutorial', title: `${skill} Getting Started Guide`, url: '#' }
        ]
      },
      {
        id: `${roadmapId}-practice`,
        title: `${skill} Practice Exercises`,
        description: `Hands-on practice with ${skill}`,
        type: 'practice',
        duration: '1 week',
        difficulty: 'beginner',
        prerequisites: [`${roadmapId}-fundamentals`],
        resources: [
          { type: 'tutorial', title: `${skill} Practice Projects`, url: '#' }
        ]
      }
    ];
  } else if (type === 'advancement') {
    difficulty = baseScore >= 8 ? 'advanced' : 'intermediate';
    estimatedDuration = '3-4 weeks';
    steps = [
      {
        id: `${roadmapId}-advanced`,
        title: `Advanced ${skill}`,
        description: `Take your ${skill} skills to the next level`,
        type: 'lesson',
        duration: '2 weeks',
        difficulty: difficulty,
        prerequisites: [],
        resources: [
          { type: 'video', title: `Advanced ${skill} Techniques`, url: '#' },
          { type: 'tutorial', title: `${skill} Best Practices`, url: '#' }
        ]
      },
      {
        id: `${roadmapId}-project`,
        title: `${skill} Mastery Project`,
        description: `Build something impressive with ${skill}`,
        type: 'project',
        duration: '2 weeks',
        difficulty: difficulty,
        prerequisites: [`${roadmapId}-advanced`],
        resources: [
          { type: 'project', title: `${skill} Project Ideas`, url: '#' }
        ]
      }
    ];
  } else { // development
    difficulty = 'intermediate';
    estimatedDuration = '2-3 weeks';
    steps = [
      {
        id: `${roadmapId}-intermediate`,
        title: `${skill} Intermediate Level`,
        description: `Develop your ${skill} skills further`,
        type: 'lesson',
        duration: '1 week',
        difficulty: 'intermediate',
        prerequisites: [],
        resources: [
          { type: 'video', title: `${skill} Intermediate Concepts`, url: '#' }
        ]
      },
      {
        id: `${roadmapId}-application`,
        title: `${skill} Real-world Application`,
        description: `Apply ${skill} in practical scenarios`,
        type: 'project',
        duration: '1-2 weeks',
        difficulty: 'intermediate',
        prerequisites: [`${roadmapId}-intermediate`],
        resources: [
          { type: 'tutorial', title: `${skill} Application Examples`, url: '#' }
        ]
      }
    ];
  }

  return {
    id: roadmapId,
    title: `${skill} ${type.charAt(0).toUpperCase() + type.slice(1)} Path`,
    description: `Personalized learning path for ${skill} based on your assessment results`,
    category: skill,
    totalSteps: steps.length,
    completedSteps: 0,
    estimatedDuration,
    difficulty,
    steps,
    isRecommended: true,
    tags: [skill, type, 'personalized']
  };
};

// Helper function to create roadmap for interests
const createRoadmapForInterest = (interest: string, assessmentResults: any[]): Roadmap | null => {
  if (!interest) return null;
  
  const roadmapId = `${interest.toLowerCase().replace(/\s+/g, '-')}-interest`;
  
  return {
    id: roadmapId,
    title: `${interest} Learning Path`,
    description: `Explore ${interest} based on your interests`,
    category: interest,
    totalSteps: 3,
    completedSteps: 0,
    estimatedDuration: '2-3 weeks',
    difficulty: 'beginner',
    steps: [
      {
        id: `${roadmapId}-introduction`,
        title: `Introduction to ${interest}`,
        description: `Learn the basics of ${interest}`,
        type: 'lesson',
        duration: '1 week',
        difficulty: 'beginner',
        prerequisites: [],
        resources: [
          { type: 'video', title: `${interest} Introduction`, url: '#' },
          { type: 'article', title: `${interest} Overview`, url: '#' }
        ]
      },
      {
        id: `${roadmapId}-exploration`,
        title: `${interest} Deep Dive`,
        description: `Explore ${interest} in more detail`,
        type: 'lesson',
        duration: '1 week',
        difficulty: 'intermediate',
        prerequisites: [`${roadmapId}-introduction`],
        resources: [
          { type: 'tutorial', title: `${interest} Advanced Topics`, url: '#' }
        ]
      },
      {
        id: `${roadmapId}-project`,
        title: `${interest} Project`,
        description: `Create something with ${interest}`,
        type: 'project',
        duration: '1 week',
        difficulty: 'intermediate',
        prerequisites: [`${roadmapId}-exploration`],
        resources: [
          { type: 'project', title: `${interest} Project Ideas`, url: '#' }
        ]
      }
    ],
    isRecommended: true,
    tags: [interest, 'interest-based', 'exploration']
  };
};

export default function RoadmapGenerator({ 
  userInterests, 
  userSkills, 
  skillLevels, 
  skillAssessmentResults,
  onRoadmapSelect 
}: RoadmapGeneratorProps) {
  const [recommendedRoadmaps, setRecommendedRoadmaps] = useState<Roadmap[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    generatePersonalizedRoadmaps();
  }, [userInterests, userSkills, skillLevels, skillAssessmentResults]);

  const generatePersonalizedRoadmaps = () => {
    // Generate roadmaps based on actual skill assessment results
    const personalizedRoadmaps = generateRoadmapsFromAssessment(skillAssessmentResults, userInterests, userSkills);
    
    // Sort by recommendation status
    const sortedRoadmaps = personalizedRoadmaps.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return 0;
    });

    setRecommendedRoadmaps(sortedRoadmaps.filter(r => r.isRecommended));
    setAllRoadmaps(sortedRoadmaps);
  };

  const determineDifficulty = (category: string, skillLevels: Record<string, string>) => {
    const categoryKey = category.toLowerCase().replace(' ', '-');
    const userLevel = skillLevels[categoryKey];
    
    if (userLevel === 'beginner') return 'beginner';
    if (userLevel === 'intermediate') return 'intermediate';
    return 'advanced';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'quiz': return <Zap className="h-4 w-4" />;
      case 'practice': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredRoadmaps = selectedCategory === 'all' 
    ? allRoadmaps 
    : allRoadmaps.filter(roadmap => roadmap.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(allRoadmaps.map(r => r.category)))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Map className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Learning Roadmaps</h2>
        <p className="text-gray-600">
          Personalized learning paths based on your interests and skill level
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Recommended Roadmaps */}
      {selectedCategory === 'all' && recommendedRoadmaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {recommendedRoadmaps.map(roadmap => (
              <Card key={roadmap.id} className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                      <CardDescription className="mt-2">{roadmap.description}</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {roadmap.estimatedDuration}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {roadmap.totalSteps} steps
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(roadmap.difficulty)}>
                        {roadmap.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {roadmap.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {roadmap.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{roadmap.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => onRoadmapSelect(roadmap)}
                    >
                      Start Learning Path
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Roadmaps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'All Learning Paths' : `${selectedCategory} Paths`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoadmaps.map(roadmap => (
            <Card key={roadmap.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                <CardDescription>{roadmap.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {roadmap.estimatedDuration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {roadmap.totalSteps} steps
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(roadmap.difficulty)}>
                      {roadmap.difficulty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {roadmap.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {roadmap.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{roadmap.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onRoadmapSelect(roadmap)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

