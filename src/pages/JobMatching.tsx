import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Filter,
  Search,
  Heart,
  Share2,
  ExternalLink,
  TrendingUp,
  Users,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  matchScore: number;
  postedDate: string;
  applicationDeadline?: string;
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  companyLogo?: string;
  isSaved: boolean;
  isApplied: boolean;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedDate: string;
  lastUpdate: string;
}

const JobMatching = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    experience: 'all',
    location: 'all',
    salary: 'all',
    remote: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'TechCorp India',
        location: 'Bangalore, India',
        type: 'full-time',
        salary: { min: 800000, max: 1200000, currency: 'INR' },
        description: 'We are looking for a passionate Frontend Developer to join our team. You will be responsible for building user-facing web applications using React, TypeScript, and modern web technologies.',
        requirements: ['3+ years React experience', 'TypeScript proficiency', 'CSS/SCSS expertise', 'Git version control'],
        benefits: ['Health insurance', 'Flexible hours', 'Remote work options', 'Learning budget'],
        matchScore: 95,
        postedDate: '2024-01-15',
        applicationDeadline: '2024-02-15',
        isRemote: true,
        experienceLevel: 'mid',
        isSaved: false,
        isApplied: false
      },
      {
        id: '2',
        title: 'UI/UX Designer',
        company: 'DesignStudio',
        location: 'Mumbai, India',
        type: 'full-time',
        salary: { min: 600000, max: 900000, currency: 'INR' },
        description: 'Join our creative team as a UI/UX Designer. You will create beautiful, intuitive user experiences for our digital products.',
        requirements: ['Figma expertise', 'User research skills', 'Prototyping experience', 'Portfolio required'],
        benefits: ['Creative freedom', 'Design tools budget', 'Team outings', 'Career growth'],
        matchScore: 87,
        postedDate: '2024-01-14',
        isRemote: false,
        experienceLevel: 'mid',
        isSaved: true,
        isApplied: false
      },
      {
        id: '3',
        title: 'Data Science Intern',
        company: 'AnalyticsPro',
        location: 'Delhi, India',
        type: 'internship',
        salary: { min: 15000, max: 25000, currency: 'INR' },
        description: 'Exciting internship opportunity for aspiring data scientists. Work on real-world projects and learn from industry experts.',
        requirements: ['Python knowledge', 'Basic statistics', 'Machine learning interest', 'Strong analytical skills'],
        benefits: ['Mentorship program', 'Certificate of completion', 'Potential full-time offer', 'Learning resources'],
        matchScore: 78,
        postedDate: '2024-01-13',
        applicationDeadline: '2024-01-25',
        isRemote: true,
        experienceLevel: 'entry',
        isSaved: false,
        isApplied: true
      },
      {
        id: '4',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Hyderabad, India',
        type: 'full-time',
        salary: { min: 1200000, max: 1800000, currency: 'INR' },
        description: 'Lead product strategy and development for our innovative platform. Work with cross-functional teams to deliver exceptional user experiences.',
        requirements: ['5+ years PM experience', 'Agile methodology', 'Analytics tools', 'Leadership skills'],
        benefits: ['Equity options', 'Health insurance', 'Flexible schedule', 'Professional development'],
        matchScore: 82,
        postedDate: '2024-01-12',
        isRemote: true,
        experienceLevel: 'senior',
        isSaved: false,
        isApplied: false
      },
      {
        id: '5',
        title: 'Backend Developer',
        company: 'CloudTech Solutions',
        location: 'Pune, India',
        type: 'contract',
        salary: { min: 1000000, max: 1500000, currency: 'INR' },
        description: 'Build scalable backend systems using Node.js, Python, and cloud technologies. Work on high-traffic applications.',
        requirements: ['Node.js/Python expertise', 'Database design', 'API development', 'Cloud platforms'],
        benefits: ['Competitive pay', 'Flexible contract terms', 'Latest tech stack', 'Remote work'],
        matchScore: 91,
        postedDate: '2024-01-11',
        isRemote: true,
        experienceLevel: 'mid',
        isSaved: true,
        isApplied: false
      }
    ];

    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: '3',
        jobTitle: 'Data Science Intern',
        company: 'AnalyticsPro',
        status: 'reviewing',
        appliedDate: '2024-01-14',
        lastUpdate: '2024-01-16'
      }
    ];

    setJobs(mockJobs);
    setApplications(mockApplications);
    setFilteredJobs(mockJobs);
    setIsLoading(false);
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    // Experience filter
    if (filters.experience !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === filters.experience);
    }

    // Location filter
    if (filters.location !== 'all') {
      if (filters.location === 'remote') {
        filtered = filtered.filter(job => job.isRemote);
      } else {
        filtered = filtered.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
    }

    // Salary filter
    if (filters.salary !== 'all') {
      filtered = filtered.filter(job => {
        const avgSalary = (job.salary.min + job.salary.max) / 2;
        switch (filters.salary) {
          case 'low': return avgSalary < 500000;
          case 'medium': return avgSalary >= 500000 && avgSalary < 1000000;
          case 'high': return avgSalary >= 1000000;
          default: return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filters]);

  const handleSaveJob = (jobId: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
    ));
  };

  const handleApplyJob = (job: Job) => {
    const newApplication: Application = {
      id: Date.now().toString(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setApplications(prev => [...prev, newApplication]);
    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, isApplied: true } : j
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reviewing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'interview': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-4 w-4" />;
      case 'reviewing': return <AlertCircle className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job opportunities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-600 rounded-full">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Job Matching
              </h1>
              <p className="text-gray-600">Find your perfect career opportunity</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-500" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Job title, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Locations</option>
                    <option value="remote">Remote Only</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="pune">Pune</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Salary Range</label>
                  <select
                    value={filters.salary}
                    onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Ranges</option>
                    <option value="low">Under ₹5L</option>
                    <option value="medium">₹5L - ₹10L</option>
                    <option value="high">Above ₹10L</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedJob(job)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {job.matchScore}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </div>
                          {job.isRemote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salary)}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Posted {new Date(job.postedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          className={job.isSaved ? 'text-red-600 border-red-200' : ''}
                        >
                          <Heart className={`h-4 w-4 ${job.isSaved ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyJob(job);
                          }}
                          disabled={job.isApplied}
                          className={job.isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                        >
                          {job.isApplied ? 'Applied' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Job Details & Applications */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Job Details */}
            {selectedJob && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                  <CardDescription>{selectedJob.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{formatSalary(selectedJob.salary)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm capitalize">{selectedJob.type}</span>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm font-medium mb-2">Requirements:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedJob.requirements.slice(0, 3).map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm font-medium mb-2">Benefits:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedJob.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applications Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className={`p-3 rounded-lg border ${getStatusColor(app.status)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <span className="text-sm font-medium capitalize">{app.status}</span>
                        </div>
                        <span className="text-xs opacity-70">{app.appliedDate}</span>
                      </div>
                      <p className="text-sm font-medium">{app.jobTitle}</p>
                      <p className="text-xs opacity-80">{app.company}</p>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No applications yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMatching;
