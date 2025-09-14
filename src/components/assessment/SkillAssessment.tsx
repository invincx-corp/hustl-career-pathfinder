import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Zap,
  BookOpen,
  Code,
  Palette,
  BarChart3,
  Heart,
  Briefcase,
  Leaf,
  MapPin,
  Wrench,
  Music,
  Shield,
  Truck,
  Users
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: {
    value: string;
    label: string;
    points: number;
  }[];
  icon: React.ReactNode;
}

interface AssessmentResult {
  category: string;
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  recommendations: string[];
}

const SKILL_CATEGORIES = [
  { id: 'technology', name: 'Technology & Digital', icon: <Code className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'healthcare', name: 'Healthcare & Medical', icon: <Heart className="h-5 w-5" />, color: 'bg-red-100 text-red-800' },
  { id: 'education', name: 'Education & Training', icon: <BookOpen className="h-5 w-5" />, color: 'bg-green-100 text-green-800' },
  { id: 'creative', name: 'Creative Arts & Design', icon: <Palette className="h-5 w-5" />, color: 'bg-pink-100 text-pink-800' },
  { id: 'business', name: 'Business & Finance', icon: <Briefcase className="h-5 w-5" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'agriculture', name: 'Agriculture & Environment', icon: <Leaf className="h-5 w-5" />, color: 'bg-green-100 text-green-800' },
  { id: 'hospitality', name: 'Hospitality & Tourism', icon: <MapPin className="h-5 w-5" />, color: 'bg-orange-100 text-orange-800' },
  { id: 'engineering', name: 'Manufacturing & Engineering', icon: <Wrench className="h-5 w-5" />, color: 'bg-gray-100 text-gray-800' },
  { id: 'arts', name: 'Arts & Entertainment', icon: <Music className="h-5 w-5" />, color: 'bg-purple-100 text-purple-800' },
  { id: 'public-service', name: 'Public Service & Government', icon: <Shield className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'transportation', name: 'Transportation & Logistics', icon: <Truck className="h-5 w-5" />, color: 'bg-indigo-100 text-indigo-800' }
];

const ASSESSMENT_QUESTIONS: Question[] = [
  // Technology & Digital Questions
  {
    id: 'tech-1',
    category: 'technology',
    question: 'How would you describe your experience with technology and digital tools?',
    options: [
      { value: 'beginner', label: 'I use basic apps and websites', points: 1 },
      { value: 'intermediate', label: 'I can use various software and troubleshoot basic issues', points: 2 },
      { value: 'advanced', label: 'I can program, build websites, or work with complex systems', points: 3 },
      { value: 'expert', label: 'I develop software, manage systems, or lead tech projects', points: 4 }
    ],
    icon: <Code className="h-5 w-5" />
  },
  {
    id: 'tech-2',
    category: 'technology',
    question: 'Which technology skills do you have?',
    options: [
      { value: 'basic', label: 'Basic computer skills (email, web browsing, office apps)', points: 1 },
      { value: 'intermediate', label: 'Programming basics, data analysis, or digital design', points: 2 },
      { value: 'advanced', label: 'Multiple programming languages, cloud platforms, or AI/ML', points: 3 },
      { value: 'expert', label: 'System architecture, cybersecurity, or advanced AI development', points: 4 }
    ],
    icon: <Code className="h-5 w-5" />
  },

  // Healthcare & Medical Questions
  {
    id: 'health-1',
    category: 'healthcare',
    question: 'How would you describe your experience with healthcare or medical knowledge?',
    options: [
      { value: 'none', label: 'No medical or healthcare experience', points: 0 },
      { value: 'basic', label: 'Basic first aid or health knowledge', points: 1 },
      { value: 'intermediate', label: 'Some medical training or healthcare work experience', points: 2 },
      { value: 'advanced', label: 'Professional healthcare experience or medical education', points: 3 }
    ],
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'health-2',
    category: 'healthcare',
    question: 'Which healthcare skills do you have?',
    options: [
      { value: 'none', label: 'None', points: 0 },
      { value: 'basic', label: 'First aid, basic care, or health education', points: 1 },
      { value: 'intermediate', label: 'Patient care, medical terminology, or clinical skills', points: 2 },
      { value: 'advanced', label: 'Diagnosis, treatment, or specialized medical procedures', points: 3 }
    ],
    icon: <Heart className="h-5 w-5" />
  },

  // Education & Training Questions
  {
    id: 'edu-1',
    category: 'education',
    question: 'How would you describe your experience with teaching or education?',
    options: [
      { value: 'none', label: 'No teaching or educational experience', points: 0 },
      { value: 'basic', label: 'Helped others learn informally (tutoring, mentoring)', points: 1 },
      { value: 'intermediate', label: 'Some formal teaching or training experience', points: 2 },
      { value: 'advanced', label: 'Professional teaching, curriculum development, or educational leadership', points: 3 }
    ],
    icon: <BookOpen className="h-5 w-5" />
  },

  // Creative Arts & Design Questions
  {
    id: 'creative-1',
    category: 'creative',
    question: 'How would you describe your creative and design abilities?',
    options: [
      { value: 'beginner', label: 'I enjoy creative activities but have limited experience', points: 1 },
      { value: 'intermediate', label: 'I can create basic designs, art, or content', points: 2 },
      { value: 'advanced', label: 'I can create professional-quality designs, art, or media', points: 3 },
      { value: 'expert', label: 'I lead creative projects or work professionally in creative fields', points: 4 }
    ],
    icon: <Palette className="h-5 w-5" />
  },

  // Business & Finance Questions
  {
    id: 'business-1',
    category: 'business',
    question: 'How would you describe your business and financial knowledge?',
    options: [
      { value: 'basic', label: 'Basic understanding of business concepts', points: 1 },
      { value: 'intermediate', label: 'Some business experience or financial analysis skills', points: 2 },
      { value: 'advanced', label: 'Professional business experience or financial expertise', points: 3 },
      { value: 'expert', label: 'Senior business leadership or advanced financial management', points: 4 }
    ],
    icon: <Briefcase className="h-5 w-5" />
  },

  // Agriculture & Environment Questions
  {
    id: 'agri-1',
    category: 'agriculture',
    question: 'How would you describe your experience with agriculture or environmental work?',
    options: [
      { value: 'none', label: 'No agriculture or environmental experience', points: 0 },
      { value: 'basic', label: 'Gardening, farming, or environmental awareness', points: 1 },
      { value: 'intermediate', label: 'Some agricultural or environmental science knowledge', points: 2 },
      { value: 'advanced', label: 'Professional agriculture, environmental science, or sustainability work', points: 3 }
    ],
    icon: <Leaf className="h-5 w-5" />
  },

  // Hospitality & Tourism Questions
  {
    id: 'hosp-1',
    category: 'hospitality',
    question: 'How would you describe your experience with hospitality or customer service?',
    options: [
      { value: 'basic', label: 'Basic customer service experience', points: 1 },
      { value: 'intermediate', label: 'Some hospitality, tourism, or service industry experience', points: 2 },
      { value: 'advanced', label: 'Professional hospitality management or tourism expertise', points: 3 },
      { value: 'expert', label: 'Senior hospitality leadership or tourism industry expertise', points: 4 }
    ],
    icon: <MapPin className="h-5 w-5" />
  },

  // Manufacturing & Engineering Questions
  {
    id: 'eng-1',
    category: 'engineering',
    question: 'How would you describe your experience with engineering or manufacturing?',
    options: [
      { value: 'none', label: 'No engineering or manufacturing experience', points: 0 },
      { value: 'basic', label: 'Basic technical skills or hands-on work', points: 1 },
      { value: 'intermediate', label: 'Some engineering knowledge or manufacturing experience', points: 2 },
      { value: 'advanced', label: 'Professional engineering or manufacturing expertise', points: 3 }
    ],
    icon: <Wrench className="h-5 w-5" />
  },

  // Arts & Entertainment Questions
  {
    id: 'arts-1',
    category: 'arts',
    question: 'How would you describe your experience with arts and entertainment?',
    options: [
      { value: 'beginner', label: 'I enjoy arts and entertainment as a hobby', points: 1 },
      { value: 'intermediate', label: 'I have some artistic skills or performance experience', points: 2 },
      { value: 'advanced', label: 'I can create professional-quality art or perform professionally', points: 3 },
      { value: 'expert', label: 'I work professionally in arts, entertainment, or media', points: 4 }
    ],
    icon: <Music className="h-5 w-5" />
  },

  // Public Service & Government Questions
  {
    id: 'public-1',
    category: 'public-service',
    question: 'How would you describe your experience with public service or government work?',
    options: [
      { value: 'none', label: 'No public service or government experience', points: 0 },
      { value: 'basic', label: 'Volunteer work or community involvement', points: 1 },
      { value: 'intermediate', label: 'Some public service, non-profit, or government experience', points: 2 },
      { value: 'advanced', label: 'Professional public service or government leadership', points: 3 }
    ],
    icon: <Shield className="h-5 w-5" />
  },

  // Transportation & Logistics Questions
  {
    id: 'trans-1',
    category: 'transportation',
    question: 'How would you describe your experience with transportation or logistics?',
    options: [
      { value: 'none', label: 'No transportation or logistics experience', points: 0 },
      { value: 'basic', label: 'Basic understanding of transportation or supply chain', points: 1 },
      { value: 'intermediate', label: 'Some logistics, transportation, or supply chain experience', points: 2 },
      { value: 'advanced', label: 'Professional logistics, transportation, or supply chain management', points: 3 }
    ],
    icon: <Truck className="h-5 w-5" />
  },

  // General Skills Questions
  {
    id: 'general-1',
    category: 'general',
    question: 'How would you describe your communication and leadership abilities?',
    options: [
      { value: 'basic', label: 'Basic communication skills', points: 1 },
      { value: 'intermediate', label: 'Good communication and some leadership experience', points: 2 },
      { value: 'advanced', label: 'Strong communication and leadership skills', points: 3 },
      { value: 'expert', label: 'Excellent communication and proven leadership experience', points: 4 }
    ],
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'general-2',
    category: 'general',
    question: 'How would you describe your problem-solving and analytical abilities?',
    options: [
      { value: 'basic', label: 'Basic problem-solving skills', points: 1 },
      { value: 'intermediate', label: 'Good analytical thinking and problem-solving', points: 2 },
      { value: 'advanced', label: 'Strong analytical and problem-solving abilities', points: 3 },
      { value: 'expert', label: 'Exceptional analytical thinking and complex problem-solving', points: 4 }
    ],
    icon: <Brain className="h-5 w-5" />
  }
];

interface SkillAssessmentProps {
  onComplete: (results: AssessmentResult[]) => void;
  onSkip?: () => void;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { saveSkillAssessment, isLoading } = useUserContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    const categoryScores: Record<string, { total: number; count: number }> = {};
    
    // Calculate scores for each category
    ASSESSMENT_QUESTIONS.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          if (!categoryScores[question.category]) {
            categoryScores[question.category] = { total: 0, count: 0 };
          }
          categoryScores[question.category].total += option.points;
          categoryScores[question.category].count += 1;
        }
      }
    });

    // Generate results
    const assessmentResults: AssessmentResult[] = Object.entries(categoryScores).map(([category, data]) => {
      const averageScore = data.total / data.count;
      let level: 'beginner' | 'intermediate' | 'advanced';
      let recommendations: string[];

      if (averageScore <= 1) {
        level = 'beginner';
        recommendations = [
          'Start with foundational courses in this area',
          'Look for beginner-friendly resources and tutorials',
          'Consider finding a mentor in this field',
          'Practice regularly to build confidence'
        ];
      } else if (averageScore <= 2.5) {
        level = 'intermediate';
        recommendations = [
          'Take intermediate courses to deepen your knowledge',
          'Work on practical projects to apply your skills',
          'Join communities and networks in this field',
          'Consider certifications to validate your skills'
        ];
      } else {
        level = 'advanced';
        recommendations = [
          'Pursue advanced certifications or specializations',
          'Mentor others to reinforce your expertise',
          'Contribute to open source or professional projects',
          'Consider leadership roles in this domain'
        ];
      }

      return {
        category,
        score: averageScore,
        level,
        recommendations
      };
    });

    setResults(assessmentResults);
    setShowResults(true);

    // Save results to database
    if (user?.id) {
      setIsSaving(true);
      try {
        const success = await saveSkillAssessment({
          answers,
          results: assessmentResults,
          completed_at: new Date().toISOString(),
          total_questions: ASSESSMENT_QUESTIONS.length,
          answered_questions: Object.keys(answers).length
        });

        if (success) {
          console.log('Skill assessment results saved successfully');
        } else {
          console.error('Failed to save skill assessment results');
        }
      } catch (error) {
        console.error('Error saving skill assessment:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleComplete = () => {
    onComplete(results);
  };

  const getCategoryInfo = (categoryId: string) => {
    return SKILL_CATEGORIES.find(cat => cat.id === categoryId);
  };

  if (showResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Skill Assessment Results
          </CardTitle>
          <CardDescription>
            Here's your personalized skill analysis across different career domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {results.map((result) => {
              const categoryInfo = getCategoryInfo(result.category);
              return (
                <div key={result.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {categoryInfo?.icon}
                      <div>
                        <h3 className="font-semibold">{categoryInfo?.name || result.category}</h3>
                        <Badge 
                          variant={result.level === 'advanced' ? 'default' : result.level === 'intermediate' ? 'secondary' : 'outline'}
                          className="mt-1"
                        >
                          {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {result.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recommendations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleComplete} className="flex-1">
              Continue to Learning Paths
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Skill Assessment
        </CardTitle>
        <CardDescription>
          Help us understand your current skills across different career domains
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {currentQuestion.icon}
            <Badge variant="outline" className="text-sm">
              {getCategoryInfo(currentQuestion.category)?.name || currentQuestion.category}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mb-6">
            {currentQuestion.question}
          </h3>
        </div>

        <RadioGroup
          value={answers[currentQuestion.id] || ''}
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {currentQuestion.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Assessment
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] || isSaving}
            >
              {isSaving ? 'Saving...' : (currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? 'Complete' : 'Next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillAssessment;