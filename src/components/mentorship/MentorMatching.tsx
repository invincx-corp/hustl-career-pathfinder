import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  MessageCircle, 
  Star, 
  MapPin, 
  Clock, 
  Calendar,
  Send,
  Search,
  Filter,
  Award,
  BookOpen,
  Briefcase,
  Globe,
  Heart,
  ThumbsUp,
  Video,
  Phone,
  Mail,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  bio: string;
  expertise: string[];
  experience: number;
  rating: number;
  totalSessions: number;
  hourlyRate: number;
  currency: string;
  location: string;
  timezone: string;
  languages: string[];
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  isOnline: boolean;
  lastActive: string;
  specialties: string[];
  education: string[];
  achievements: string[];
  isVerified: boolean;
  responseTime: string;
  successRate: number;
}

interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  message: string;
  goals: string[];
  preferredTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  scheduledAt?: string;
  duration?: number;
  type: 'one-time' | 'ongoing';
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'meeting';
  isRead: boolean;
}

const SAMPLE_MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Frontend Engineer',
    company: 'Google',
    avatar: '/api/placeholder/100/100',
    bio: 'Passionate about helping developers grow their skills in React, TypeScript, and modern web development. I have 8+ years of experience building scalable applications.',
    expertise: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Web Development'],
    experience: 8,
    rating: 4.9,
    totalSessions: 156,
    hourlyRate: 75,
    currency: 'USD',
    location: 'San Francisco, CA',
    timezone: 'PST',
    languages: ['English', 'Mandarin'],
    availability: {
      monday: ['09:00-17:00'],
      tuesday: ['09:00-17:00'],
      wednesday: ['09:00-17:00'],
      thursday: ['09:00-17:00'],
      friday: ['09:00-15:00'],
      saturday: [],
      sunday: []
    },
    isOnline: true,
    lastActive: '2 minutes ago',
    specialties: ['Frontend Development', 'Code Reviews', 'Career Guidance'],
    education: ['MS Computer Science - Stanford University'],
    achievements: ['Google Developer Expert', 'React Core Team Contributor'],
    isVerified: true,
    responseTime: '< 2 hours',
    successRate: 98
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    title: 'Data Science Lead',
    company: 'Netflix',
    avatar: '/api/placeholder/100/100',
    bio: 'Data science enthusiast with expertise in machine learning, Python, and big data technologies. I love mentoring aspiring data scientists.',
    expertise: ['Python', 'Machine Learning', 'Data Science', 'SQL', 'TensorFlow'],
    experience: 10,
    rating: 4.8,
    totalSessions: 203,
    hourlyRate: 90,
    currency: 'USD',
    location: 'Los Angeles, CA',
    timezone: 'PST',
    languages: ['English', 'Spanish'],
    availability: {
      monday: ['10:00-18:00'],
      tuesday: ['10:00-18:00'],
      wednesday: ['10:00-18:00'],
      thursday: ['10:00-18:00'],
      friday: ['10:00-16:00'],
      saturday: ['09:00-13:00'],
      sunday: []
    },
    isOnline: false,
    lastActive: '1 hour ago',
    specialties: ['Machine Learning', 'Data Analysis', 'Career Transition'],
    education: ['PhD Statistics - UC Berkeley'],
    achievements: ['Kaggle Grandmaster', 'Published 15+ Research Papers'],
    isVerified: true,
    responseTime: '< 4 hours',
    successRate: 95
  },
  {
    id: '3',
    name: 'Emily Johnson',
    title: 'UX Design Director',
    company: 'Airbnb',
    avatar: '/api/placeholder/100/100',
    bio: 'Design leader passionate about creating user-centered experiences. I help designers and developers understand the intersection of design and technology.',
    expertise: ['UX Design', 'UI Design', 'Figma', 'Design Systems', 'User Research'],
    experience: 12,
    rating: 4.9,
    totalSessions: 189,
    hourlyRate: 85,
    currency: 'USD',
    location: 'New York, NY',
    timezone: 'EST',
    languages: ['English'],
    availability: {
      monday: ['09:00-17:00'],
      tuesday: ['09:00-17:00'],
      wednesday: ['09:00-17:00'],
      thursday: ['09:00-17:00'],
      friday: ['09:00-15:00'],
      saturday: [],
      sunday: []
    },
    isOnline: true,
    lastActive: '5 minutes ago',
    specialties: ['Design Leadership', 'Portfolio Reviews', 'Design Thinking'],
    education: ['MFA Design - Rhode Island School of Design'],
    achievements: ['Designer of the Year 2023', 'Apple Design Award Winner'],
    isVerified: true,
    responseTime: '< 1 hour',
    successRate: 97
  }
];

interface MentorMatchingProps {
  userId: string;
  userInterests: string[];
  userSkills: string[];
}

export default function MentorMatching({ userId, userInterests, userSkills }: MentorMatchingProps) {
  const [mentors, setMentors] = useState<Mentor[]>(SAMPLE_MENTORS);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>(SAMPLE_MENTORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    filterMentors();
  }, [searchTerm, selectedExpertise, selectedAvailability, mentors]);

  const filterMentors = () => {
    let filtered = mentors;

    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedExpertise !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.expertise.some(skill => skill.toLowerCase().includes(selectedExpertise.toLowerCase()))
      );
    }

    if (selectedAvailability === 'online') {
      filtered = filtered.filter(mentor => mentor.isOnline);
    }

    setFilteredMentors(filtered);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMentor) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: userId,
      receiverId: selectedMentor.id,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleRequestMentorship = (requestData: Partial<MentorshipRequest>) => {
    // In a real app, this would send a request to the backend
    console.log('Mentorship request:', requestData);
    setIsRequestDialogOpen(false);
  };

  const getExpertiseOptions = () => {
    const allExpertise = mentors.flatMap(mentor => mentor.expertise);
    return ['all', ...Array.from(new Set(allExpertise))];
  };

  const getAvailabilityStatus = (mentor: Mentor) => {
    if (mentor.isOnline) return 'Online now';
    return `Last active ${mentor.lastActive}`;
  };

  const getAvailabilityColor = (mentor: Mentor) => {
    if (mentor.isOnline) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Your Mentor</h2>
          <p className="text-gray-600">Connect with experienced professionals in your field</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {mentors.length} mentors available
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search mentors by name, company, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Expertise</option>
            {getExpertiseOptions().slice(1).map(expertise => (
              <option key={expertise} value={expertise}>
                {expertise}
              </option>
            ))}
          </select>
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Availability</option>
            <option value="online">Online Now</option>
          </select>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(mentor => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {mentor.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    {mentor.isVerified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {mentor.title} at {mentor.company}
                  </CardDescription>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium ml-1">{mentor.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({mentor.totalSessions} sessions)</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Bio */}
                <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>

                {/* Expertise */}
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <span className="ml-1 font-medium">{mentor.experience} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <span className="ml-1 font-medium">${mentor.hourlyRate}/{mentor.currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Response:</span>
                    <span className="ml-1 font-medium">{mentor.responseTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success:</span>
                    <span className="ml-1 font-medium">{mentor.successRate}%</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={getAvailabilityColor(mentor)}>
                      {getAvailabilityStatus(mentor)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {mentor.location}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setIsChatOpen(true);
                    }}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setIsRequestDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria to find more mentors.
          </p>
        </div>
      )}

      {/* Mentorship Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship Session</DialogTitle>
            <DialogDescription>
              Send a mentorship request to {selectedMentor?.name}
            </DialogDescription>
          </DialogHeader>
          <MentorshipRequestForm
            mentor={selectedMentor}
            onSubmit={handleRequestMentorship}
            onCancel={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedMentor?.avatar} />
                <AvatarFallback>{selectedMentor?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span>Chat with {selectedMentor?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mentorship Request Form Component
interface MentorshipRequestFormProps {
  mentor: Mentor | null;
  onSubmit: (data: Partial<MentorshipRequest>) => void;
  onCancel: () => void;
}

function MentorshipRequestForm({ mentor, onSubmit, onCancel }: MentorshipRequestFormProps) {
  const [formData, setFormData] = useState({
    message: '',
    goals: '',
    preferredTime: '',
    type: 'one-time' as 'one-time' | 'ongoing',
    duration: 60
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData = {
      mentorId: mentor?.id,
      message: formData.message,
      goals: formData.goals.split('\n').filter(Boolean),
      preferredTime: formData.preferredTime,
      type: formData.type,
      duration: formData.duration
    };

    onSubmit(requestData);
  };

  if (!mentor) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.avatar} />
            <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{mentor.name}</h3>
            <p className="text-sm text-gray-600">{mentor.title} at {mentor.company}</p>
            <p className="text-sm text-gray-500">${mentor.hourlyRate}/{mentor.currency} per hour</p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message to Mentor</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Hi! I'd love to learn more about..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="goals">Your Learning Goals</Label>
        <Textarea
          id="goals"
          value={formData.goals}
          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          placeholder="What do you want to achieve? (one goal per line)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Session Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="one-time">One-time Session</option>
            <option value="ongoing">Ongoing Mentorship</option>
          </select>
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <select
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="preferredTime">Preferred Time</Label>
        <Input
          id="preferredTime"
          value={formData.preferredTime}
          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
          placeholder="e.g., Weekdays after 6 PM PST"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Send Request
        </Button>
      </div>
    </form>
  );
}



