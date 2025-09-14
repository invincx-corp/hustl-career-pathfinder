import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

export default function CareerExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const careers = [
    {
      id: 1,
      title: 'Software Engineer',
      category: 'Technology',
      salary: '$80,000 - $120,000',
      location: 'Remote/On-site',
      experience: '2-5 years',
      rating: 4.7,
      demand: 'High',
      growth: '+15%',
      description: 'Develop and maintain software applications using various programming languages and frameworks.',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta']
    },
    {
      id: 2,
      title: 'Data Scientist',
      category: 'Technology',
      salary: '$90,000 - $140,000',
      location: 'Hybrid',
      experience: '3-6 years',
      rating: 4.8,
      demand: 'Very High',
      growth: '+22%',
      description: 'Analyze complex data to help organizations make informed decisions using machine learning and statistical methods.',
      skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Statistics'],
      companies: ['Netflix', 'Uber', 'Airbnb', 'Spotify']
    },
    {
      id: 3,
      title: 'UX Designer',
      category: 'Design',
      salary: '$70,000 - $110,000',
      location: 'Remote',
      experience: '2-4 years',
      rating: 4.6,
      demand: 'High',
      growth: '+18%',
      description: 'Create user-centered designs for digital products and services to enhance user experience.',
      skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'UI Design'],
      companies: ['Apple', 'Adobe', 'Figma', 'InVision']
    },
    {
      id: 4,
      title: 'Product Manager',
      category: 'Business',
      salary: '$100,000 - $150,000',
      location: 'On-site',
      experience: '4-7 years',
      rating: 4.5,
      demand: 'High',
      growth: '+12%',
      description: 'Lead product development from conception to launch, working with cross-functional teams.',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership', 'Communication'],
      companies: ['Google', 'Facebook', 'Slack', 'Notion']
    }
  ];

  const categories = ['all', 'Technology', 'Design', 'Business', 'Healthcare', 'Education'];

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || career.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Career Explorer</h1>
          <p className="text-gray-600 mt-2">
            Discover career opportunities and explore different paths
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search careers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCareers.map((career) => (
            <Card key={career.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{career.title}</CardTitle>
                    <CardDescription className="mt-1">{career.description}</CardDescription>
                  </div>
                  <Badge className={getDemandColor(career.demand)}>
                    {career.demand} Demand
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{career.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{career.growth}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{career.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{career.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{career.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{career.category}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {career.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Companies */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Companies</h4>
                    <div className="flex flex-wrap gap-1">
                      {career.companies.map((company) => (
                        <Badge key={company} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full">
                    Explore Career Path
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No careers found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or category filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}










