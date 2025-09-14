import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  X, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  BookOpen,
  Target,
  Briefcase,
  Code,
  Palette,
  Calculator,
  Globe,
  Heart,
  Sparkles
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

interface DomainDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain | null;
  onStartExploration: () => void;
}

const DomainDetailsPopup: React.FC<DomainDetailsPopupProps> = ({
  isOpen,
  onClose,
  domain,
  onStartExploration
}) => {
  if (!domain) return null;

  const Icon = domain.icon;

  const getInterestColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-blue-600';
    if (level >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getInterestLabel = (level: number) => {
    if (level >= 80) return 'Very High';
    if (level >= 60) return 'High';
    if (level >= 40) return 'Medium';
    if (level >= 20) return 'Low';
    return 'Very Low';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSalaryColor = (salary: string) => {
    if (salary.includes('100k+') || salary.includes('₹50L+')) return 'text-green-600';
    if (salary.includes('80k') || salary.includes('₹30L')) return 'text-blue-600';
    if (salary.includes('60k') || salary.includes('₹20L')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Mock career data for the domain
  const domainCareers = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      description: 'Build scalable applications and lead technical initiatives',
      salary: '₹25L - ₹40L',
      difficulty: 'Advanced',
      growth: 15,
      skills: ['React', 'Node.js', 'AWS', 'Docker'],
      image: '💻'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      description: 'Drive product strategy and work with cross-functional teams',
      salary: '₹20L - ₹35L',
      difficulty: 'Intermediate',
      growth: 20,
      skills: ['Strategy', 'Analytics', 'Leadership', 'Agile'],
      image: '📊'
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'Design Studio',
      description: 'Create intuitive user experiences and conduct user research',
      salary: '₹15L - ₹25L',
      difficulty: 'Intermediate',
      growth: 18,
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      image: '🎨'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${domain.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{domain.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {domain.description}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Domain Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Your Interest Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Interest Level</span>
                  <span className={`text-lg font-bold ${getInterestColor(domain.interestLevel)}`}>
                    {getInterestLabel(domain.interestLevel)} ({domain.interestLevel}%)
                  </span>
                </div>
                <Progress value={domain.interestLevel} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Last interaction: {domain.lastInteracted}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Total interactions: {domain.totalInteractions}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span>Key Skills in {domain.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {domain.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span>Career Opportunities</span>
              </CardTitle>
              <CardDescription>
                Explore real career paths in {domain.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domainCareers.map((career) => (
                  <Card key={career.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{career.image}</span>
                            <div>
                              <h4 className="font-semibold text-lg">{career.title}</h4>
                              <p className="text-sm text-gray-600">{career.company}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{career.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex space-x-2">
                          <Badge className={getDifficultyColor(career.difficulty)}>
                            {career.difficulty}
                          </Badge>
                          <Badge variant="outline" className={getSalaryColor(career.salary)}>
                            {career.salary}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            +{career.growth}% growth
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {career.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pb-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                onStartExploration();
                onClose();
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Guided Exploration
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onClose}
            >
              <X className="w-5 h-5 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDetailsPopup;
