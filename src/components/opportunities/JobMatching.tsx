import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import CareerSearch from '@/components/ui/career-search';
import { CareerAPIResponse } from '@/lib/career-api-service';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
  Send,
  Eye,
  Calendar,
  DollarSign,
  GraduationCap,
  Building,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  applicationDeadline?: string;
  isBookmarked: boolean;
  isApplied: boolean;
  companyLogo?: string;
  remote: boolean;
  domain: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: 'mid',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD'
    },
    matchScore: 92,
    description: 'We are looking for a passionate Frontend Developer to join our team. You will be responsible for building user-facing features and ensuring a great user experience.',
    requirements: [
      '3+ years of React experience',
      'Strong JavaScript skills',
      'Experience with TypeScript',
      'Knowledge of modern CSS frameworks'
    ],
    benefits: [
      'Health insurance',
      '401k matching',
      'Flexible work hours',
      'Remote work options'
    ],
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    postedDate: '2024-01-10',
    applicationDeadline: '2024-02-10',
    isBookmarked: false,
    isApplied: false,
    remote: true,
    domain: 'Frontend Development'
  },
  {
    id: '2',
    title: 'UI/UX Design Intern',
    company: 'DesignStudio',
    location: 'New York, NY',
    type: 'internship',
    experience: 'entry',
    salary: {
      min: 3000,
      max: 4000,
      currency: 'USD'
    },
    matchScore: 85,
    description: 'Join our design team as an intern and work on exciting projects. Learn from experienced designers and contribute to real-world projects.',
    requirements: [
      'Portfolio of design work',
      'Familiarity with Figma',
      'Basic understanding of design principles',
      'Currently enrolled in design program'
    ],
    benefits: [
      'Mentorship program',
      'Learning opportunities',
      'Networking events',
      'Potential full-time offer'
    ],
    skills: ['Figma', 'Adobe Creative Suite', 'Design Thinking', 'Prototyping'],
    postedDate: '2024-01-12',
    applicationDeadline: '2024-01-25',
    isBookmarked: true,
    isApplied: false,
    remote: false,
    domain: 'Design'
  },
  {
    id: '3',
    title: 'Data Analyst',
    company: 'DataCorp',
    location: 'Remote',
    type: 'full-time',
    experience: 'mid',
    salary: {
      min: 70000,
      max: 95000,
      currency: 'USD'
    },
    matchScore: 78,
    description: 'We are seeking a Data Analyst to help us make data-driven decisions. You will work with large datasets and create meaningful insights.',
    requirements: [
      '2+ years of data analysis experience',
      'Proficiency in Python or R',
      'SQL knowledge',
      'Experience with data visualization tools'
    ],
    benefits: [
      'Competitive salary',
      'Health benefits',
      'Professional development',
      'Work-life balance'
    ],
    skills: ['Python', 'SQL', 'Data Visualization', 'Statistics', 'Excel'],
    postedDate: '2024-01-08',
    isBookmarked: false,
    isApplied: true,
    remote: true,
    domain: 'Data Science'
  }
];

const JobMatching = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const jobTypes = ['all', 'full-time', 'part-time', 'internship', 'contract'];
  const experienceLevels = ['all', 'entry', 'mid', 'senior', 'lead'];
  const domains = ['all', 'Frontend Development', 'Design', 'Data Science', 'Backend Development'];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesExperience = selectedExperience === 'all' || job.experience === selectedExperience;
    const matchesDomain = selectedDomain === 'all' || job.domain === selectedDomain;
    
    return matchesSearch && matchesType && matchesExperience && matchesDomain;
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookmark = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked }
        : job
    ));
  };

  const handleApply = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isApplied: true }
        : job
    ));
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Job & Internship Matching
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered job matching based on your skills, interests, and career goals
        </p>
      </div>

      {/* Career Search */}
      <div className="mb-6">
        <CareerSearch
          placeholder="Search careers, skills, or job titles..."
          onCareerSelect={(career: CareerAPIResponse) => {
            setSearchTerm(career.title);
            // You can add more logic here to filter jobs based on selected career
          }}
          showFilters={true}
          maxResults={5}
          className="w-full"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {jobTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.replace('-', ' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {experienceLevels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {domains.map(domain => (
              <option key={domain} value={domain}>
                {domain === 'all' ? 'All Domains' : domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <Badge className={`${getMatchScoreColor(job.matchScore)} px-2 py-1`}>
                              {job.matchScore}% match
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{job.type.replace('-', ' ')}</span>
                            </div>
                            {job.remote && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Remote
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GraduationCap className="h-4 w-4" />
                              <span>{job.experience} level</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 5} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleApply(job.id)}
                              disabled={job.isApplied}
                              className="flex-1"
                            >
                              {job.isApplied ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Apply Now
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleBookmark(job.id)}
                            >
                              {job.isBookmarked ? (
                                <BookmarkCheck className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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

        <TabsContent value="bookmarked" className="space-y-6">
          <div className="grid gap-6">
            {filteredJobs
              .filter(job => job.isBookmarked)
              .map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold">{job.title}</h3>
                              <Badge className={`${getMatchScoreColor(job.matchScore)} px-2 py-1`}>
                                {job.matchScore}% match
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                <BookmarkCheck className="h-3 w-3 mr-1" />
                                Bookmarked
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.type.replace('-', ' ')}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApply(job.id)}
                                disabled={job.isApplied}
                                className="flex-1"
                              >
                                {job.isApplied ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Applied
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Apply Now
                                  </>
                                )}
                              </Button>
                              <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
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

        <TabsContent value="applied" className="space-y-6">
          <div className="grid gap-6">
            {filteredJobs
              .filter(job => job.isApplied)
              .map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold">{job.title}</h3>
                              <Badge className={`${getMatchScoreColor(job.matchScore)} px-2 py-1`}>
                                {job.matchScore}% match
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.type.replace('-', ' ')}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Application
                              </Button>
                              <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Track Status
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

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid gap-6">
            {filteredJobs
              .filter(job => job.matchScore >= 85)
              .map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold">{job.title}</h3>
                              <Badge className={`${getMatchScoreColor(job.matchScore)} px-2 py-1`}>
                                {job.matchScore}% match
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-800">
                                <Target className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.type.replace('-', ' ')}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApply(job.id)}
                                disabled={job.isApplied}
                                className="flex-1"
                              >
                                {job.isApplied ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Applied
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Apply Now
                                  </>
                                )}
                              </Button>
                              <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
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
      </Tabs>
    </div>
  );
};

export default JobMatching;
