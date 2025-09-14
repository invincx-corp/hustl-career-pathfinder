// Mentor Profile Card Component
// Displays mentor information in a card format

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  MessageCircle,
  Calendar,
  Award,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface MentorProfileCardProps {
  mentor: {
    id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      bio: string;
      location: string;
      profileImage?: string;
    };
    professionalInfo: {
      currentRole: string;
      company: string;
      industry: string;
      yearsOfExperience: number;
      skills: string[];
      specializations: string[];
    };
    mentoringInfo: {
      areasOfExpertise: string[];
      experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      pricing: {
        hourlyRate: number;
        currency: string;
        freeSessions: number;
      };
      availability: {
        timeSlots: Array<{
          day: string;
          startTime: string;
          endTime: string;
        }>;
      };
      languages: string[];
    };
    verification: {
      status: 'pending' | 'verified' | 'rejected' | 'suspended';
    };
    stats: {
      averageRating: number;
      totalReviews: number;
      totalSessions: number;
      completionRate: number;
      responseTime: number;
    };
  };
  onBookSession?: (mentorId: string) => void;
  onViewProfile?: (mentorId: string) => void;
  onSendMessage?: (mentorId: string) => void;
  showActions?: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export const MentorProfileCard: React.FC<MentorProfileCardProps> = ({
  mentor,
  onBookSession,
  onViewProfile,
  onSendMessage,
  showActions = true,
  matchScore,
  matchReasons = []
}) => {
  const getVerificationIcon = () => {
    switch (mentor.verification.status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVerificationText = () => {
    switch (mentor.verification.status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'rejected':
        return 'Verification Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Not Verified';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.personalInfo.profileImage} />
              <AvatarFallback>
                {mentor.personalInfo.firstName[0]}{mentor.personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg">
                  {mentor.personalInfo.firstName} {mentor.personalInfo.lastName}
                </CardTitle>
                {getVerificationIcon()}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{mentor.professionalInfo.currentRole}</span>
                <span>•</span>
                <span>{mentor.professionalInfo.company}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{mentor.personalInfo.location}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getExperienceLevelColor(mentor.mentoringInfo.experienceLevel)}>
                  {mentor.mentoringInfo.experienceLevel}
                </Badge>
                <Badge variant="outline">
                  {mentor.professionalInfo.yearsOfExperience} years exp
                </Badge>
                <span className="text-xs text-gray-500">
                  {getVerificationText()}
                </span>
              </div>

              {matchScore && (
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Math.round(matchScore * 100)}% match
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{mentor.stats.averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({mentor.stats.totalReviews})</span>
            </div>
            <div className="text-sm text-gray-600">
              <DollarSign className="h-3 w-3 inline mr-1" />
              {mentor.mentoringInfo.pricing.hourlyRate}/{mentor.mentoringInfo.pricing.currency}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-gray-700 line-clamp-3">
          {mentor.personalInfo.bio}
        </p>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {mentor.professionalInfo.skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {mentor.professionalInfo.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.professionalInfo.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Areas of Expertise</h4>
          <div className="flex flex-wrap gap-1">
            {mentor.mentoringInfo.areasOfExpertise.slice(0, 4).map((area, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
            {mentor.mentoringInfo.areasOfExpertise.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.mentoringInfo.areasOfExpertise.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Why this match?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{mentor.stats.totalSessions} sessions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Responds in {formatResponseTime(mentor.stats.responseTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-gray-400" />
            <span>{mentor.stats.completionRate}% completion</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-gray-400" />
            <span>{mentor.mentoringInfo.languages.join(', ')}</span>
          </div>
        </div>

        {/* Availability Preview */}
        {mentor.mentoringInfo.availability.timeSlots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.mentoringInfo.availability.timeSlots.slice(0, 3).map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slot.day} {slot.startTime}
                </Badge>
              ))}
              {mentor.mentoringInfo.availability.timeSlots.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.mentoringInfo.availability.timeSlots.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Free Sessions */}
        {mentor.mentoringInfo.pricing.freeSessions > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {mentor.mentoringInfo.pricing.freeSessions} free sessions available
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            {onBookSession && (
              <Button
                onClick={() => onBookSession(mentor.id)}
                className="flex-1"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            )}
            {onSendMessage && (
              <Button
                onClick={() => onSendMessage(mentor.id)}
                variant="outline"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
            {onViewProfile && (
              <Button
                onClick={() => onViewProfile(mentor.id)}
                variant="ghost"
                size="sm"
              >
                View Profile
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
