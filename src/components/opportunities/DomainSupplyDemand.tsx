import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CareerSearch from '@/components/ui/career-search';
import { CareerAPIResponse } from '@/lib/career-api-service';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Target,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Building,
  GraduationCap,
  Zap,
  Eye,
  Filter,
  Search
} from 'lucide-react';

interface DomainData {
  id: string;
  name: string;
  demand: number;
  supply: number;
  growth: number;
  averageSalary: {
    min: number;
    max: number;
    currency: string;
  };
  topSkills: string[];
  opportunities: number;
  talent: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  companies: string[];
  locations: string[];
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  domain: string;
  type: 'job' | 'internship' | 'project' | 'freelance';
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  postedDate: string;
  applicants: number;
  urgency: 'high' | 'medium' | 'low';
}

const mockDomainData: DomainData[] = [
  {
    id: '1',
    name: 'Frontend Development',
    demand: 85,
    supply: 60,
    growth: 12,
    averageSalary: {
      min: 60000,
      max: 120000,
      currency: 'USD'
    },
    topSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    opportunities: 245,
    talent: 180,
    trend: 'up',
    description: 'High demand for frontend developers with modern framework experience',
    companies: ['Google', 'Meta', 'Netflix', 'Airbnb', 'Stripe'],
    locations: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Remote']
  },
  {
    id: '2',
    name: 'Data Science',
    demand: 78,
    supply: 45,
    growth: 18,
    averageSalary: {
      min: 70000,
      max: 140000,
      currency: 'USD'
    },
    topSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'R'],
    opportunities: 189,
    talent: 120,
    trend: 'up',
    description: 'Growing demand for data scientists across all industries',
    companies: ['Amazon', 'Microsoft', 'Tesla', 'Uber', 'Spotify'],
    locations: ['Seattle', 'San Francisco', 'Boston', 'Chicago', 'Remote']
  },
  {
    id: '3',
    name: 'UI/UX Design',
    demand: 72,
    supply: 55,
    growth: 8,
    averageSalary: {
      min: 55000,
      max: 110000,
      currency: 'USD'
    },
    topSkills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    opportunities: 156,
    talent: 140,
    trend: 'stable',
    description: 'Steady demand for user experience and interface designers',
    companies: ['Apple', 'Adobe', 'Figma', 'Shopify', 'Square'],
    locations: ['San Francisco', 'New York', 'Los Angeles', 'Portland', 'Remote']
  },
  {
    id: '4',
    name: 'Backend Development',
    demand: 80,
    supply: 65,
    growth: 10,
    averageSalary: {
      min: 65000,
      max: 130000,
      currency: 'USD'
    },
    topSkills: ['Node.js', 'Python', 'Java', 'AWS', 'Docker'],
    opportunities: 198,
    talent: 165,
    trend: 'up',
    description: 'Strong demand for backend developers with cloud experience',
    companies: ['Netflix', 'Uber', 'Airbnb', 'Stripe', 'Twilio'],
    locations: ['San Francisco', 'Seattle', 'New York', 'Austin', 'Remote']
  }
];

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    domain: 'Frontend Development',
    type: 'job',
    location: 'San Francisco, CA',
    salary: {
      min: 100000,
      max: 150000,
      currency: 'USD'
    },
    skills: ['React', 'TypeScript', 'GraphQL', 'AWS'],
    postedDate: '2024-01-15',
    applicants: 45,
    urgency: 'high'
  },
  {
    id: '2',
    title: 'Data Science Intern',
    company: 'DataCorp',
    domain: 'Data Science',
    type: 'internship',
    location: 'Remote',
    salary: {
      min: 4000,
      max: 6000,
      currency: 'USD'
    },
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
    postedDate: '2024-01-14',
    applicants: 78,
    urgency: 'medium'
  },
  {
    id: '3',
    title: 'UI/UX Design Project',
    company: 'DesignStudio',
    domain: 'UI/UX Design',
    type: 'project',
    location: 'New York, NY',
    skills: ['Figma', 'User Research', 'Prototyping'],
    postedDate: '2024-01-13',
    applicants: 23,
    urgency: 'low'
  }
];

const DomainSupplyDemand = () => {
  const [domainData, setDomainData] = useState<DomainData[]>(mockDomainData);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100';
      case 'down': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-green-100 text-green-800';
      case 'internship': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (salary: DomainData['averageSalary']) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const calculateDemandSupplyRatio = (demand: number, supply: number) => {
    return (demand / supply).toFixed(2);
  };

  const filteredOpportunities = selectedDomain === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.domain === selectedDomain);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Domain-Specific Demand & Supply
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time insights into talent demand and supply across different domains
        </p>
      </div>

      {/* Career Search */}
      <div className="mb-6">
        <CareerSearch
          placeholder="Search career domains and opportunities..."
          onCareerSelect={(career: CareerAPIResponse) => {
            // Filter domains based on selected career
            const matchingDomain = domainData.find(domain => 
              domain.name.toLowerCase().includes(career.category.toLowerCase()) ||
              career.skills.some(skill => domain.topSkills.includes(skill))
            );
            if (matchingDomain) {
              setSelectedDomain(matchingDomain.id);
            }
          }}
          showFilters={true}
          maxResults={5}
          className="w-full"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Live Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span>Total Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {domainData.reduce((sum, domain) => sum + domain.opportunities, 0)}
                </div>
                <p className="text-sm text-gray-600">
                  Active opportunities across all domains
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Available Talent</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {domainData.reduce((sum, domain) => sum + domain.talent, 0)}
                </div>
                <p className="text-sm text-gray-600">
                  Talented professionals ready to work
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Average Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(domainData.reduce((sum, domain) => sum + domain.growth, 0) / domainData.length)}%
                </div>
                <p className="text-sm text-gray-600">
                  Year-over-year growth across domains
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <span>Avg. Salary Range</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  $65K - $125K
                </div>
                <p className="text-sm text-gray-600">
                  Average salary across all domains
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span>Demand vs Supply Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domainData.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{domain.name}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTrendColor(domain.trend)}`}>
                          {getTrendIcon(domain.trend)}
                          <span className="capitalize">{domain.trend}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Demand</span>
                            <span>{domain.demand}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${domain.demand}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Supply</span>
                            <span>{domain.supply}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${domain.supply}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateDemandSupplyRatio(domain.demand, domain.supply)}x
                      </div>
                      <p className="text-xs text-gray-600">Demand/Supply</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <div className="grid gap-6">
            {domainData.map((domain) => (
              <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-2xl font-semibold">{domain.name}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTrendColor(domain.trend)}`}>
                          {getTrendIcon(domain.trend)}
                          <span className="capitalize">{domain.trend}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          +{domain.growth}% growth
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{domain.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{domain.opportunities}</div>
                          <div className="text-sm text-gray-600">Opportunities</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{domain.talent}</div>
                          <div className="text-sm text-gray-600">Available Talent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{domain.demand}%</div>
                          <div className="text-sm text-gray-600">Demand</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{domain.supply}%</div>
                          <div className="text-sm text-gray-600">Supply</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Top Skills in Demand</h4>
                          <div className="flex flex-wrap gap-2">
                            {domain.topSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Top Companies</h4>
                            <div className="space-y-1">
                              {domain.companies.slice(0, 3).map((company) => (
                                <div key={company} className="text-sm text-gray-600 flex items-center space-x-1">
                                  <Building className="h-3 w-3" />
                                  <span>{company}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Top Locations</h4>
                            <div className="space-y-1">
                              {domain.locations.slice(0, 3).map((location) => (
                                <div key={location} className="text-sm text-gray-600 flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{location}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Average Salary</h4>
                              <p className="text-2xl font-bold text-green-600">{formatSalary(domain.averageSalary)}</p>
                            </div>
                            <Button>
                              <Eye className="h-4 w-4 mr-2" />
                              View Opportunities
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Live Opportunities</h3>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Domains</option>
              {domainData.map(domain => (
                <option key={domain.id} value={domain.name}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold">{opportunity.title}</h3>
                        <Badge className={getTypeColor(opportunity.type)}>
                          {opportunity.type}
                        </Badge>
                        <Badge className={getUrgencyColor(opportunity.urgency)}>
                          {opportunity.urgency} urgency
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{opportunity.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{opportunity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(opportunity.postedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{opportunity.applicants} applicants</span>
                        </div>
                      </div>

                      {opportunity.salary && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(opportunity.salary)}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex-1">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DomainSupplyDemand;
