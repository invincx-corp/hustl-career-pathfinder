// Mentor Discovery Page
// Allows users to search and discover mentors

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { MentorProfileCard } from '@/components/mentorship/MentorProfileCard';
import { mentorProfileManager, MentorSearchFilters } from '@/lib/mentor-profile-manager';
import { useAuth } from '@/hooks/useAuth';

const MentorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MentorSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load mentors on component mount
  useEffect(() => {
    loadMentors();
  }, []);

  // Filter mentors when search or filters change
  useEffect(() => {
    filterMentors();
  }, [mentors, searchQuery, filters, sortBy]);

  const loadMentors = () => {
    const allMentors = mentorProfileManager.getVerifiedMentors();
    setMentors(allMentors);
    setFilteredMentors(allMentors);
  };

  const filterMentors = () => {
    let filtered = [...mentors];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mentor =>
        mentor.personalInfo.firstName.toLowerCase().includes(query) ||
        mentor.personalInfo.lastName.toLowerCase().includes(query) ||
        mentor.professionalInfo.currentRole.toLowerCase().includes(query) ||
        mentor.professionalInfo.company.toLowerCase().includes(query) ||
        mentor.professionalInfo.skills.some((skill: string) =>
          skill.toLowerCase().includes(query)
        ) ||
        mentor.mentoringInfo.areasOfExpertise.some((area: string) =>
          area.toLowerCase().includes(query)
        )
      );
    }

    // Apply filters
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(mentor =>
        filters.skills!.some(skill =>
          mentor.professionalInfo.skills.some((mentorSkill: string) =>
            mentorSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.industries && filters.industries.length > 0) {
      filtered = filtered.filter(mentor =>
        filters.industries!.includes(mentor.professionalInfo.industry)
      );
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      filtered = filtered.filter(mentor =>
        filters.experienceLevel!.includes(mentor.mentoringInfo.experienceLevel)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(mentor =>
        mentor.mentoringInfo.pricing.hourlyRate >= filters.priceRange!.min &&
        mentor.mentoringInfo.pricing.hourlyRate <= filters.priceRange!.max
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(mentor =>
        mentor.stats.averageRating >= filters.rating!
      );
    }

    if (filters.location) {
      filtered = filtered.filter(mentor =>
        mentor.personalInfo.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.stats.averageRating - a.stats.averageRating;
        case 'price_low':
          return a.mentoringInfo.pricing.hourlyRate - b.mentoringInfo.pricing.hourlyRate;
        case 'price_high':
          return b.mentoringInfo.pricing.hourlyRate - a.mentoringInfo.pricing.hourlyRate;
        case 'experience':
          return b.professionalInfo.yearsOfExperience - a.professionalInfo.yearsOfExperience;
        case 'sessions':
          return b.stats.totalSessions - a.stats.totalSessions;
        default:
          return 0;
      }
    });

    setFilteredMentors(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleBookSession = (mentorId: string) => {
    // TODO: Implement booking functionality
    console.log('Book session with mentor:', mentorId);
  };

  const handleSendMessage = (mentorId: string) => {
    // TODO: Implement messaging functionality
    console.log('Send message to mentor:', mentorId);
  };

  const handleViewProfile = (mentorId: string) => {
    // TODO: Implement profile view functionality
    console.log('View mentor profile:', mentorId);
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.industries && filters.industries.length > 0) count++;
    if (filters.experienceLevel && filters.experienceLevel.length > 0) count++;
    if (filters.priceRange) count++;
    if (filters.rating) count++;
    if (filters.location) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Mentor</h1>
          <p className="text-gray-600">
            Connect with experienced professionals who can guide your career journey
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mentors by name, skills, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {getFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="sessions">Most Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Skills Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Skills
                    </label>
                    <Input
                      placeholder="Enter skills..."
                      value={filters.skills?.join(', ') || ''}
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        handleFilterChange('skills', skills);
                      }}
                    />
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Industry
                    </label>
                    <Select
                      value={filters.industries?.[0] || ''}
                      onValueChange={(value) => handleFilterChange('industries', value ? [value] : [])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Experience Level
                    </label>
                    <div className="space-y-2">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={level}
                            checked={filters.experienceLevel?.includes(level) || false}
                            onCheckedChange={(checked) => {
                              const currentLevels = filters.experienceLevel || [];
                              const newLevels = checked
                                ? [...currentLevels, level]
                                : currentLevels.filter(l => l !== level);
                              handleFilterChange('experienceLevel', newLevels);
                            }}
                          />
                          <label htmlFor={level} className="text-sm capitalize">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Price Range (per hour)
                    </label>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.priceRange?.min || 0, filters.priceRange?.max || 200]}
                        onValueChange={([min, max]) => handleFilterChange('priceRange', { min, max })}
                        max={200}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>${filters.priceRange?.min || 0}</span>
                        <span>${filters.priceRange?.max || 200}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredMentors.length} mentors found
            </h2>
            {searchQuery && (
              <p className="text-sm text-gray-600">
                Results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Mentor Cards */}
        {filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No mentors found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredMentors.map((mentor) => (
              <MentorProfileCard
                key={mentor.id}
                mentor={mentor}
                onBookSession={handleBookSession}
                onSendMessage={handleSendMessage}
                onViewProfile={handleViewProfile}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredMentors.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Mentors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDiscovery;
