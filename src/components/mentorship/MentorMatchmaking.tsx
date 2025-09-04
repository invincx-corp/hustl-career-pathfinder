import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { mentorService, MentorProfile, MentorSearchFilters } from '@/lib/mentor-service';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  MessageCircle, 
  Calendar,
  Award,
  Globe,
  DollarSign,
  CheckCircle,
  X,
  Plus,
  Settings,
  Heart
} from 'lucide-react';

const MentorMatchmaking = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MentorSearchFilters>({});
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchingPreferences, setShowMatchingPreferences] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mentors, searchQuery, filters]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const mentorsData = await mentorService.searchMentors();
      setMentors(mentorsData);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...mentors];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise_areas.some(area => 
          area.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        mentor.current_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.expertise_areas && filters.expertise_areas.length > 0) {
      filtered = filtered.filter(mentor =>
        filters.expertise_areas!.some(area =>
          mentor.expertise_areas.includes(area)
        )
      );
    }

    if (filters.min_rating) {
      filtered = filtered.filter(mentor => mentor.rating >= filters.min_rating!);
    }

    if (filters.hourly_rate_max) {
      filtered = filtered.filter(mentor => 
        !mentor.hourly_rate || mentor.hourly_rate <= filters.hourly_rate_max!
      );
    }

    if (filters.is_verified) {
      filtered = filtered.filter(mentor => mentor.is_verified);
    }

    setFilteredMentors(filtered);
  };

  const handleBookSession = async (mentorId: string) => {
    // TODO: Implement session booking
    console.log('Booking session with mentor:', mentorId);
  };

  const handleSendMessage = async (mentorId: string) => {
    // TODO: Implement messaging
    console.log('Sending message to mentor:', mentorId);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getExperienceLevel = (years: number) => {
    if (years <= 2) return { level: 'Junior', color: 'bg-blue-100 text-blue-800' };
    if (years <= 7) return { level: 'Mid-level', color: 'bg-green-100 text-green-800' };
    if (years <= 15) return { level: 'Senior', color: 'bg-purple-100 text-purple-800' };
    return { level: 'Executive', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Matchmaking</h1>
          <p className="text-gray-600 mt-2">Find the perfect mentor to guide your career journey</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowMatchingPreferences(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search mentors by expertise, role, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center justify-center bg-blue-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredMentors.length}</div>
            <div className="text-sm text-blue-600">Available Mentors</div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => {
          const experience = getExperienceLevel(mentor.years_of_experience);
          
          return (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {mentor.current_role?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{mentor.current_role || 'Mentor'}</CardTitle>
                      <p className="text-sm text-gray-600">{mentor.company}</p>
                    </div>
                  </div>
                  {mentor.is_verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                {mentor.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>
                )}

                {/* Expertise Areas */}
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_areas.slice(0, 3).map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {mentor.expertise_areas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise_areas.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({mentor.total_sessions} sessions)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{mentor.years_of_experience} years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{mentor.current_students}/{mentor.max_students}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">${mentor.hourly_rate}/hr</span>
                  </div>
                </div>

                {/* Experience Level */}
                <div className="flex items-center justify-between">
                  <Badge className={experience.color}>
                    {experience.level}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBookSession(mentor.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Mentor Details Modal */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mentor Profile</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedMentor.current_role?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedMentor.current_role || 'Mentor'}</h3>
                  <p className="text-gray-600">{selectedMentor.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRatingStars(selectedMentor.rating)}
                    <span className="text-sm text-gray-600">
                      {selectedMentor.rating.toFixed(1)} ({selectedMentor.total_sessions} sessions)
                    </span>
                  </div>
                </div>
              </div>

              {selectedMentor.bio && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-gray-600">{selectedMentor.bio}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Expertise Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.expertise_areas.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <p className="text-gray-600">{selectedMentor.years_of_experience} years</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rate</h4>
                  <p className="text-gray-600">${selectedMentor.hourly_rate}/hour</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <p className="text-gray-600">{selectedMentor.languages.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <p className="text-gray-600">{selectedMentor.current_students}/{selectedMentor.max_students} students</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleSendMessage(selectedMentor.id)}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  onClick={() => handleBookSession(selectedMentor.id)}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Mentors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expertise Areas</label>
              <div className="flex flex-wrap gap-2">
                {['React', 'Python', 'Machine Learning', 'Product Management', 'Design', 'Marketing'].map((area) => (
                  <Button
                    key={area}
                    size="sm"
                    variant={filters.expertise_areas?.includes(area) ? 'default' : 'outline'}
                    onClick={() => {
                      const current = filters.expertise_areas || [];
                      const updated = current.includes(area)
                        ? current.filter(a => a !== area)
                        : [...current, area];
                      setFilters({ ...filters, expertise_areas: updated });
                    }}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Minimum Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.min_rating || ''}
                onChange={(e) => setFilters({ ...filters, min_rating: parseFloat(e.target.value) || undefined })}
                placeholder="e.g., 4.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Hourly Rate</label>
              <Input
                type="number"
                min="0"
                value={filters.hourly_rate_max || ''}
                onChange={(e) => setFilters({ ...filters, hourly_rate_max: parseFloat(e.target.value) || undefined })}
                placeholder="e.g., 100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified"
                checked={filters.is_verified || false}
                onChange={(e) => setFilters({ ...filters, is_verified: e.target.checked || undefined })}
              />
              <label htmlFor="verified" className="text-sm font-medium">
                Verified mentors only
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setFilters({})}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorMatchmaking;
