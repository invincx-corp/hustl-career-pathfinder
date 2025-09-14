import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { MentorProfile } from './MentorProfile';

interface Mentor {
  id: string;
  mentor_id: string;
  user_id: string;
  expertise_areas: string[];
  years_experience: number;
  credentials: string[];
  specializations: string[];
  achievements: string[];
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  matchScore?: number;
  matchReasons?: string[];
  mentors: {
    is_verified: boolean;
    rating: number;
    total_sessions: number;
  };
  profiles: {
    full_name: string;
    avatar_url?: string;
    industry: string;
    experience_level: string;
    location: string;
  };
}

interface MentorMatchingProps {
  userId: string;
  onBookSession?: (mentorId: string) => void;
  onSendMessage?: (mentorId: string) => void;
}

export function MentorMatching({ userId, onBookSession, onSendMessage }: MentorMatchingProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    experienceLevel: '',
    maxRate: '',
    verifiedOnly: false,
    availableOnly: true
  });
  const [sortBy, setSortBy] = useState('matchScore');

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mentors, searchTerm, filters, sortBy]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors');
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          interests: [], // This would come from user profile
          skills: [], // This would come from user profile
          goals: [], // This would come from user profile
          experienceLevel: 'intermediate', // This would come from user profile
          budget: filters.maxRate ? parseInt(filters.maxRate) : undefined
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.matches);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...mentors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise_areas.some(area => 
          area.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        mentor.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter(mentor =>
        mentor.expertise_areas.includes(filters.specialization) ||
        mentor.specializations.includes(filters.specialization)
      );
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(mentor =>
        mentor.profiles.experience_level === filters.experienceLevel
      );
    }

    // Max rate filter
    if (filters.maxRate) {
      filtered = filtered.filter(mentor =>
        mentor.hourly_rate <= parseInt(filters.maxRate)
      );
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(mentor => mentor.mentors.is_verified);
    }

    // Available only filter
    if (filters.availableOnly) {
      filtered = filtered.filter(mentor => mentor.is_available);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'rating':
          return b.mentors.rating - a.mentors.rating;
        case 'experience':
          return b.years_experience - a.years_experience;
        case 'rate':
          return a.hourly_rate - b.hourly_rate;
        case 'sessions':
          return b.mentors.total_sessions - a.mentors.total_sessions;
        default:
          return 0;
      }
    });

    setFilteredMentors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      specialization: '',
      experienceLevel: '',
      maxRate: '',
      verifiedOnly: false,
      availableOnly: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find Your Mentor</h2>
          <p className="text-muted-foreground">
            Connect with experienced professionals who can guide your career journey
          </p>
        </div>
        <Button onClick={findMatches} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Find Matches
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, expertise, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={filters.specialization}
                onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any specialization</SelectItem>
                  <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                  <SelectItem value="Backend Development">Backend Development</SelectItem>
                  <SelectItem value="Full Stack">Full Stack</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Product Management">Product Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={filters.experienceLevel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any level</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxRate">Max Rate (per hour)</Label>
              <Input
                id="maxRate"
                type="number"
                placeholder="e.g. 100"
                value={filters.maxRate}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matchScore">Best Match</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="rate">Lowest Rate</SelectItem>
                  <SelectItem value="sessions">Most Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.verifiedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            >
              Verified Only
            </Button>
            <Button
              variant={filters.availableOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
            >
              Available Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredMentors.length} Mentor{filteredMentors.length !== 1 ? 's' : ''} Found
          </h3>
        </div>

        {filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No mentors found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="relative">
                {mentor.matchScore && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {mentor.matchScore}% Match
                    </Badge>
                  </div>
                )}
                <MentorProfile
                  mentor={mentor}
                  onBookSession={onBookSession}
                  onSendMessage={onSendMessage}
                />
                {mentor.matchReasons && mentor.matchReasons.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Why this match:</strong> {mentor.matchReasons.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
