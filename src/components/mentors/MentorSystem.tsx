import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Star, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter, 
  Plus,
  Clock,
  DollarSign,
  Award,
  BookOpen,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/lib/api-services';

interface Mentor {
  id: string;
  user_id: string;
  bio: string;
  expertise_areas: string[];
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  availability_schedule: any;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

const MentorSystem: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [sessionRequest, setSessionRequest] = useState({
    session_type: 'consultation',
    scheduled_at: '',
    duration_minutes: 60,
    notes: ''
  });

  const expertiseAreas = [
    'all', 'Frontend Development', 'Backend Development', 'Full Stack', 
    'Data Science', 'Machine Learning', 'DevOps', 'Mobile Development',
    'UI/UX Design', 'Product Management', 'Career Coaching', 'Technical Writing'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [mentorsResult, sessionsResult] = await Promise.all([
        ApiService.getMentors(),
        ApiService.getMentorSessions(user.id)
      ]);

      if (mentorsResult.success) {
        setMentors(mentorsResult.data || []);
      }

      if (sessionsResult.success) {
        setSessions(sessionsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSession = async () => {
    if (!selectedMentor || !sessionRequest.scheduled_at) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await ApiService.requestMentorSession(selectedMentor.id, {
        session_type: sessionRequest.session_type,
        scheduled_at: sessionRequest.scheduled_at,
        duration_minutes: sessionRequest.duration_minutes,
        notes: sessionRequest.notes
      });

      if (result.success) {
        await loadData();
        setIsRequestDialogOpen(false);
        setSessionRequest({
          session_type: 'consultation',
          scheduled_at: '',
          duration_minutes: 60,
          notes: ''
        });
        alert('Session request sent successfully!');
      } else {
        alert('Failed to send session request');
      }
    } catch (error) {
      console.error('Error requesting session:', error);
      alert('Failed to send session request');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise_areas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === 'all' || 
                            mentor.expertise_areas.includes(selectedExpertise);

    return matchesSearch && matchesExpertise && mentor.is_available;
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mentor System</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>{mentors.length} Mentors Available</span>
        </Badge>
      </div>

      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search mentors by name, expertise, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertiseAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area === 'all' ? 'All Expertise' : area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mentors Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.user.avatar_url} />
                      <AvatarFallback>{mentor.user.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mentor.user.full_name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {getRatingStars(mentor.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({mentor.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise_areas.slice(0, 3).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {mentor.expertise_areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise_areas.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{mentor.experience_years} years exp.</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${mentor.hourly_rate}/hr</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setIsRequestDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Mentors Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sessions Yet</h3>
                <p className="text-gray-500">Request a session with a mentor to get started</p>
              </div>
            ) : (
              sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{session.session_type}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{session.duration_minutes} minutes</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          session.status === 'confirmed' ? 'default' :
                          session.status === 'pending' ? 'secondary' :
                          session.status === 'completed' ? 'outline' : 'destructive'
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Reviews Coming Soon</h3>
            <p className="text-gray-500">Review system will be available after your first session</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Session with {selectedMentor?.user.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Type</label>
              <Select
                value={sessionRequest.session_type}
                onValueChange={(value) => setSessionRequest({ ...sessionRequest, session_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="code_review">Code Review</SelectItem>
                  <SelectItem value="career_guidance">Career Guidance</SelectItem>
                  <SelectItem value="project_help">Project Help</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Scheduled Date & Time</label>
              <Input
                type="datetime-local"
                value={sessionRequest.scheduled_at}
                onChange={(e) => setSessionRequest({ ...sessionRequest, scheduled_at: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Select
                value={sessionRequest.duration_minutes.toString()}
                onValueChange={(value) => setSessionRequest({ ...sessionRequest, duration_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                value={sessionRequest.notes}
                onChange={(e) => setSessionRequest({ ...sessionRequest, notes: e.target.value })}
                placeholder="Describe what you'd like to discuss or get help with..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestSession}>
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorSystem;


