import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Star, 
  MessageCircle, 
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Clock
} from 'lucide-react';

const MentorMatchmaking = () => {
  const mentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior Software Engineer at Google',
      avatar: '/api/placeholder/100/100',
      rating: 4.9,
      reviews: 127,
      location: 'San Francisco, CA',
      experience: '8 years',
      specialties: ['React', 'Node.js', 'System Design'],
      availability: 'Available',
      price: '$80/hour',
      languages: ['English', 'Mandarin'],
      bio: 'Passionate about helping developers grow their careers. I specialize in full-stack development and have mentored 50+ developers.',
      nextAvailable: 'Tomorrow at 2 PM'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'Product Manager at Microsoft',
      avatar: '/api/placeholder/100/100',
      rating: 4.8,
      reviews: 89,
      location: 'Seattle, WA',
      experience: '6 years',
      specialties: ['Product Strategy', 'User Research', 'Agile'],
      availability: 'Available',
      price: '$100/hour',
      languages: ['English', 'Spanish'],
      bio: 'Experienced PM with a track record of launching successful products. Love mentoring aspiring product managers.',
      nextAvailable: 'Today at 4 PM'
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      title: 'Data Science Lead at Netflix',
      avatar: '/api/placeholder/100/100',
      rating: 4.9,
      reviews: 156,
      location: 'Los Angeles, CA',
      experience: '10 years',
      specialties: ['Machine Learning', 'Python', 'Statistics'],
      availability: 'Busy',
      price: '$120/hour',
      languages: ['English'],
      bio: 'PhD in Statistics with extensive experience in ML and data science. Passionate about making data science accessible.',
      nextAvailable: 'Next week'
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-yellow-100 text-yellow-800';
      case 'Offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mentor Matchmaking</h1>
        <p className="text-gray-600 mt-2">Connect with industry experts who can guide your career</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mentors by name, skills, or company..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mentor.avatar} alt={mentor.name} />
                  <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription className="mt-1">{mentor.title}</CardDescription>
                    </div>
                    <Badge className={getAvailabilityColor(mentor.availability)}>
                      {mentor.availability}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{mentor.rating}</span>
                      <span>({mentor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mentor.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{mentor.bio}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>{mentor.experience} experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{mentor.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Next available: {mentor.nextAvailable}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Can't find the right mentor?</h3>
          <p className="text-gray-600 mb-4">
            We're constantly adding new mentors. Let us know what you're looking for and we'll help you find the perfect match.
          </p>
          <Button>
            Request a Mentor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorMatchmaking;
