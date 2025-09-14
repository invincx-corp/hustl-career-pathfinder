// Mentor Matching Interface Component
// Advanced AI-powered mentor matching interface

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Brain,
  Target,
  Clock,
  DollarSign,
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { MentorProfileCard } from './MentorProfileCard';
import { mentorMatchingEngine, MenteeProfile, MatchResult } from '@/lib/mentor-matching-engine';
import { mentorProfileManager } from '@/lib/mentor-profile-manager';
import { useAuth } from '@/hooks/useAuth';

interface MentorMatchingInterfaceProps {
  onBookSession?: (mentorId: string) => void;
  onSendMessage?: (mentorId: string) => void;
  onViewProfile?: (mentorId: string) => void;
}

export const MentorMatchingInterface: React.FC<MentorMatchingInterfaceProps> = ({
  onBookSession,
  onSendMessage,
  onViewProfile
}) => {
  const { user } = useAuth();
  const [menteeProfile, setMenteeProfile] = useState<MenteeProfile | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [matchingCriteria, setMatchingCriteria] = useState({
    skills: 25,
    availability: 20,
    communication: 15,
    experience: 15,
    personality: 10,
    learning: 10,
    budget: 3,
    location: 2
  });

  // Load mentee profile and find matches on component mount
  useEffect(() => {
    if (user) {
      loadMenteeProfile();
    }
  }, [user]);

  const loadMenteeProfile = () => {
    if (!user) return;

    // Create a mentee profile from user data
    const mentee: MenteeProfile = {
      id: user.id,
      userId: user.id,
      personalInfo: {
        age: (user as any).user_metadata?.age || '15-18',
        location: (user as any).user_metadata?.location || 'Unknown',
        timezone: (user as any).user_metadata?.timezone || 'UTC',
        bio: (user as any).user_metadata?.bio || ''
      },
      professionalInfo: {
        currentRole: (user as any).user_metadata?.currentRole || '',
        industry: (user as any).user_metadata?.industry || '',
        experienceLevel: (user as any).user_metadata?.experienceLevel || 'beginner',
        skills: (user as any).user_metadata?.skills || [],
        goals: (user as any).user_metadata?.goals || [],
        interests: (user as any).user_metadata?.interests || []
      },
      learningPreferences: {
        pace: (user as any).user_metadata?.learningPace || 'moderate',
        format: (user as any).user_metadata?.learningFormat || 'mixed',
        timeOfDay: (user as any).user_metadata?.preferredTime || 'flexible',
        duration: (user as any).user_metadata?.sessionDuration || 'medium'
      },
      mentoringNeeds: {
        areasOfFocus: (user as any).user_metadata?.focusAreas || [],
        sessionTypes: (user as any).user_metadata?.sessionTypes || ['video', 'phone'],
        frequency: (user as any).user_metadata?.sessionFrequency || 'weekly',
        budget: {
          min: (user as any).user_metadata?.budgetMin || 0,
          max: (user as any).user_metadata?.budgetMax || 100,
          currency: 'USD'
        },
        timeCommitment: (user as any).user_metadata?.timeCommitment || 2
      },
      communicationStyle: {
        preferredMethods: (user as any).user_metadata?.communicationMethods || ['video', 'chat'],
        responseTime: (user as any).user_metadata?.responseTime || 'within-hours',
        communicationFrequency: (user as any).user_metadata?.communicationFrequency || 'medium'
      },
      personalityTraits: (user as any).user_metadata?.personalityTraits || [],
      learningHistory: {
        completedCourses: (user as any).user_metadata?.completedCourses || 0,
        projectsBuilt: (user as any).user_metadata?.projectsBuilt || 0,
        skillsMastered: (user as any).user_metadata?.skillsMastered || 0,
        learningStreak: (user as any).user_metadata?.learningStreak || 0
      }
    };

    setMenteeProfile(mentee);
    findMatches(mentee);
  };

  const findMatches = async (mentee: MenteeProfile) => {
    setIsLoading(true);
    
    try {
      // Get all verified mentors
      const mentors = mentorProfileManager.getVerifiedMentors();
      
      // Convert mentor profiles to the format expected by matching engine
      const mentorProfiles = mentors.map(mentor => ({
        id: mentor.id,
        userId: mentor.userId,
        personalInfo: mentor.personalInfo,
        professionalInfo: mentor.professionalInfo,
        mentoringInfo: mentor.mentoringInfo,
        stats: mentor.stats,
        preferences: mentor.preferences
      }));

      // Find matches using the AI matching engine
      const matches = mentorMatchingEngine.findBestMatches(
        mentee,
        mentorProfiles,
        {
          skills: matchingCriteria.skills / 100,
          availability: matchingCriteria.availability / 100,
          communication: matchingCriteria.communication / 100,
          experience: matchingCriteria.experience / 100,
          personality: matchingCriteria.personality / 100,
          learning: matchingCriteria.learning / 100,
          budget: matchingCriteria.budget / 100,
          location: matchingCriteria.location / 100
        }
      );

      setMatchResults(matches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriteriaChange = (key: string, value: number) => {
    setMatchingCriteria(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRefineMatches = () => {
    if (menteeProfile) {
      findMatches(menteeProfile);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!menteeProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI-Powered Mentor Matching
        </h2>
        <p className="text-gray-600">
          Find the perfect mentor based on your profile and preferences
        </p>
      </div>

      {/* Matching Criteria Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Matching Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Skills Match ({matchingCriteria.skills}%)
                </label>
                <Slider
                  value={[matchingCriteria.skills]}
                  onValueChange={([value]) => handleCriteriaChange('skills', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Availability ({matchingCriteria.availability}%)
                </label>
                <Slider
                  value={[matchingCriteria.availability]}
                  onValueChange={([value]) => handleCriteriaChange('availability', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Communication ({matchingCriteria.communication}%)
                </label>
                <Slider
                  value={[matchingCriteria.communication]}
                  onValueChange={([value]) => handleCriteriaChange('communication', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Experience Level ({matchingCriteria.experience}%)
                </label>
                <Slider
                  value={[matchingCriteria.experience]}
                  onValueChange={([value]) => handleCriteriaChange('experience', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleRefineMatches} disabled={isLoading}>
                {isLoading ? 'Finding Matches...' : 'Refine Matches'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Analyzing mentors with AI...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {matchResults.length} matches found
              </h3>
              <p className="text-sm text-gray-600">
                Based on your profile and preferences
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>AI Powered</span>
            </Badge>
          </div>

          {/* Match Results */}
          {matchResults.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your matching criteria or check back later for new mentors
                </p>
                <Button onClick={handleRefineMatches}>
                  Try Different Criteria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchResults.map((match, index) => (
                <Card key={match.mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {match.matchScore}%
                          </div>
                          <div className="text-xs text-gray-500">Match Score</div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {match.mentor.personalInfo.firstName} {match.mentor.personalInfo.lastName}
                          </h3>
                          <p className="text-gray-600">
                            {match.mentor.professionalInfo.currentRole} at {match.mentor.professionalInfo.company}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getConfidenceColor(match.confidence)}>
                              {match.confidence} confidence
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">
                                {match.mentor.stats.averageRating.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({match.mentor.stats.totalReviews})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMatch(selectedMatch?.mentor.id === match.mentor.id ? null : match)}
                        >
                          {selectedMatch?.mentor.id === match.mentor.id ? 'Hide Details' : 'View Details'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onBookSession?.(match.mentor.id)}
                        >
                          Book Session
                        </Button>
                      </div>
                    </div>

                    {/* Compatibility Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getCompatibilityColor(match.compatibility.skills)}`}>
                          {Math.round(match.compatibility.skills * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getCompatibilityColor(match.compatibility.availability)}`}>
                          {Math.round(match.compatibility.availability * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Availability</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getCompatibilityColor(match.compatibility.communication)}`}>
                          {Math.round(match.compatibility.communication * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Communication</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getCompatibilityColor(match.compatibility.experience)}`}>
                          {Math.round(match.compatibility.experience * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Experience</div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Why this match?</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.matchReasons.slice(0, 3).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    {selectedMatch?.mentor.id === match.mentor.id && (
                      <div className="border-t pt-4 space-y-4">
                        <Tabs defaultValue="compatibility" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                            <TabsTrigger value="challenges">Challenges</TabsTrigger>
                          </TabsList>

                          <TabsContent value="compatibility" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(match.compatibility).map(([key, score]) => (
                                <div key={key} className="flex items-center justify-between">
                                  <span className="text-sm capitalize text-gray-700">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={score * 100} className="w-20 h-2" />
                                    <span className={`text-sm font-medium ${getCompatibilityColor(score)}`}>
                                      {Math.round(score * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="recommendations" className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Session Frequency</h4>
                                <p className="text-sm text-gray-600">{match.recommendations.sessionFrequency}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Session Duration</h4>
                                <p className="text-sm text-gray-600">{match.recommendations.sessionDuration}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Focus Areas</h4>
                                <div className="flex flex-wrap gap-1">
                                  {match.recommendations.focusAreas.map((area, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Communication Strategy</h4>
                                <p className="text-sm text-gray-600">{match.recommendations.communicationStrategy}</p>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="challenges" className="space-y-4">
                            {match.potentialChallenges.length > 0 ? (
                              <div className="space-y-2">
                                {match.potentialChallenges.map((challenge, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600">{challenge}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No significant challenges identified</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
