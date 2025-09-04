import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Briefcase, 
  DollarSign,
  MapPin,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap,
  Globe,
  Building
} from 'lucide-react';

interface DomainData {
  id: string;
  name: string;
  category: string;
  demandScore: number;
  supplyScore: number;
  growthRate: number;
  averageSalary: {
    min: number;
    max: number;
    currency: string;
  };
  jobOpenings: number;
  talentPool: number;
  competitionLevel: 'low' | 'medium' | 'high';
  trendingSkills: string[];
  topCompanies: string[];
  regions: {
    name: string;
    demand: number;
    supply: number;
  }[];
  forecast: {
    next6Months: number;
    nextYear: number;
    next2Years: number;
  };
  color: string;
}

const DomainSupplyDemand = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainData | null>(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockDomains: DomainData[] = [
      {
        id: '1',
        name: 'Artificial Intelligence & Machine Learning',
        category: 'Technology',
        demandScore: 95,
        supplyScore: 45,
        growthRate: 25,
        averageSalary: { min: 1200000, max: 2500000, currency: 'INR' },
        jobOpenings: 15420,
        talentPool: 8500,
        competitionLevel: 'high',
        trendingSkills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP'],
        topCompanies: ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys'],
        regions: [
          { name: 'Bangalore', demand: 95, supply: 40 },
          { name: 'Mumbai', demand: 85, supply: 35 },
          { name: 'Delhi', demand: 80, supply: 30 },
          { name: 'Hyderabad', demand: 90, supply: 45 }
        ],
        forecast: {
          next6Months: 30,
          nextYear: 45,
          next2Years: 65
        },
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: '2',
        name: 'Data Science & Analytics',
        category: 'Technology',
        demandScore: 88,
        supplyScore: 60,
        growthRate: 20,
        averageSalary: { min: 800000, max: 1800000, currency: 'INR' },
        jobOpenings: 12350,
        talentPool: 12000,
        competitionLevel: 'medium',
        trendingSkills: ['Python', 'R', 'SQL', 'Tableau', 'Power BI'],
        topCompanies: ['Accenture', 'Deloitte', 'IBM', 'Wipro', 'Cognizant'],
        regions: [
          { name: 'Bangalore', demand: 90, supply: 55 },
          { name: 'Mumbai', demand: 85, supply: 60 },
          { name: 'Delhi', demand: 80, supply: 50 },
          { name: 'Pune', demand: 85, supply: 65 }
        ],
        forecast: {
          next6Months: 25,
          nextYear: 35,
          next2Years: 50
        },
        color: 'from-blue-500 to-cyan-600'
      },
      {
        id: '3',
        name: 'Cybersecurity',
        category: 'Technology',
        demandScore: 92,
        supplyScore: 35,
        growthRate: 30,
        averageSalary: { min: 1000000, max: 2200000, currency: 'INR' },
        jobOpenings: 8750,
        talentPool: 4200,
        competitionLevel: 'high',
        trendingSkills: ['Ethical Hacking', 'Network Security', 'Cloud Security', 'SIEM', 'Penetration Testing'],
        topCompanies: ['IBM Security', 'Symantec', 'Check Point', 'Palo Alto', 'Cisco'],
        regions: [
          { name: 'Bangalore', demand: 95, supply: 30 },
          { name: 'Mumbai', demand: 85, supply: 25 },
          { name: 'Delhi', demand: 80, supply: 20 },
          { name: 'Hyderabad', demand: 90, supply: 35 }
        ],
        forecast: {
          next6Months: 35,
          nextYear: 50,
          next2Years: 70
        },
        color: 'from-red-500 to-orange-600'
      },
      {
        id: '4',
        name: 'Cloud Computing',
        category: 'Technology',
        demandScore: 85,
        supplyScore: 55,
        growthRate: 22,
        averageSalary: { min: 900000, max: 2000000, currency: 'INR' },
        jobOpenings: 11200,
        talentPool: 9800,
        competitionLevel: 'medium',
        trendingSkills: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
        topCompanies: ['Amazon', 'Microsoft', 'Google', 'IBM', 'Oracle'],
        regions: [
          { name: 'Bangalore', demand: 90, supply: 50 },
          { name: 'Mumbai', demand: 80, supply: 55 },
          { name: 'Delhi', demand: 75, supply: 45 },
          { name: 'Pune', demand: 85, supply: 60 }
        ],
        forecast: {
          next6Months: 28,
          nextYear: 40,
          next2Years: 55
        },
        color: 'from-green-500 to-teal-600'
      },
      {
        id: '5',
        name: 'Digital Marketing',
        category: 'Marketing',
        demandScore: 75,
        supplyScore: 80,
        growthRate: 15,
        averageSalary: { min: 400000, max: 1200000, currency: 'INR' },
        jobOpenings: 18500,
        talentPool: 25000,
        competitionLevel: 'high',
        trendingSkills: ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Analytics'],
        topCompanies: ['Google', 'Facebook', 'Amazon', 'Flipkart', 'Zomato'],
        regions: [
          { name: 'Mumbai', demand: 85, supply: 90 },
          { name: 'Delhi', demand: 80, supply: 85 },
          { name: 'Bangalore', demand: 75, supply: 80 },
          { name: 'Chennai', demand: 70, supply: 75 }
        ],
        forecast: {
          next6Months: 18,
          nextYear: 25,
          next2Years: 35
        },
        color: 'from-yellow-500 to-orange-600'
      },
      {
        id: '6',
        name: 'UI/UX Design',
        category: 'Design',
        demandScore: 82,
        supplyScore: 65,
        growthRate: 18,
        averageSalary: { min: 600000, max: 1500000, currency: 'INR' },
        jobOpenings: 9800,
        talentPool: 12000,
        competitionLevel: 'medium',
        trendingSkills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping'],
        topCompanies: ['Google', 'Microsoft', 'Adobe', 'Figma', 'InVision'],
        regions: [
          { name: 'Bangalore', demand: 85, supply: 60 },
          { name: 'Mumbai', demand: 80, supply: 70 },
          { name: 'Delhi', demand: 75, supply: 65 },
          { name: 'Pune', demand: 80, supply: 60 }
        ],
        forecast: {
          next6Months: 22,
          nextYear: 30,
          next2Years: 40
        },
        color: 'from-pink-500 to-rose-600'
      }
    ];

    setDomains(mockDomains);
    setSelectedDomain(mockDomains[0]);
    setIsLoading(false);
  }, []);

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (growthRate: number) => {
    if (growthRate > 20) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (growthRate < 10) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const formatSalary = (salary: DomainData['averageSalary']) => {
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L`;
  };

  const filteredDomains = filter === 'all' 
    ? domains 
    : domains.filter(domain => domain.category.toLowerCase() === filter.toLowerCase());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading market insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Domain Supply & Demand
              </h1>
              <p className="text-gray-600">Real-time market insights for career planning</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-gradient-to-r from-purple-500 to-blue-600' : ''}
            >
              All Domains
            </Button>
            <Button
              onClick={() => setFilter('technology')}
              variant={filter === 'technology' ? 'default' : 'outline'}
              className={filter === 'technology' ? 'bg-gradient-to-r from-purple-500 to-blue-600' : ''}
            >
              Technology
            </Button>
            <Button
              onClick={() => setFilter('marketing')}
              variant={filter === 'marketing' ? 'default' : 'outline'}
              className={filter === 'marketing' ? 'bg-gradient-to-r from-purple-500 to-blue-600' : ''}
            >
              Marketing
            </Button>
            <Button
              onClick={() => setFilter('design')}
              variant={filter === 'design' ? 'default' : 'outline'}
              className={filter === 'design' ? 'bg-gradient-to-r from-purple-500 to-blue-600' : ''}
            >
              Design
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredDomains.map((domain) => (
                <Card 
                  key={domain.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedDomain?.id === domain.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {domain.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Demand</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{domain.demandScore}%</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Supply</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{domain.supplyScore}%</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              {getTrendIcon(domain.growthRate)}
                              <span className="text-sm font-medium">Growth</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">{domain.growthRate}%</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <DollarSign className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">Salary</span>
                            </div>
                            <div className="text-sm font-bold text-yellow-600">{formatSalary(domain.averageSalary)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {domain.jobOpenings.toLocaleString()} openings
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {domain.talentPool.toLocaleString()} professionals
                          </div>
                          <Badge className={`text-xs ${getCompetitionColor(domain.competitionLevel)}`}>
                            {domain.competitionLevel} competition
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Domain Details */}
          <div className="space-y-6">
            {selectedDomain && (
              <>
                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedDomain.name}</CardTitle>
                    <CardDescription>{selectedDomain.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Demand vs Supply</span>
                          <span className="text-sm text-gray-600">
                            {selectedDomain.demandScore}% / {selectedDomain.supplyScore}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Progress value={selectedDomain.demandScore} className="h-2" />
                          <Progress value={selectedDomain.supplyScore} className="h-2" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Growth Rate</span>
                          <span className="text-sm text-gray-600">{selectedDomain.growthRate}%</span>
                        </div>
                        <Progress value={selectedDomain.growthRate} className="h-2" />
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Average Salary</p>
                        <p className="text-lg font-bold text-green-600">{formatSalary(selectedDomain.averageSalary)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Trending Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedDomain.trendingSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      Top Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDomain.topCompanies.map((company, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {company}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      Regional Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDomain.regions.map((region, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{region.name}</span>
                            <span className="text-xs text-gray-600">
                              D: {region.demand}% | S: {region.supply}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Progress value={region.demand} className="h-1" />
                            <Progress value={region.supply} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Forecast */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Market Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next 6 Months</span>
                        <span className="text-sm font-medium text-green-600">
                          +{selectedDomain.forecast.next6Months}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Year</span>
                        <span className="text-sm font-medium text-green-600">
                          +{selectedDomain.forecast.nextYear}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next 2 Years</span>
                        <span className="text-sm font-medium text-green-600">
                          +{selectedDomain.forecast.next2Years}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainSupplyDemand;
