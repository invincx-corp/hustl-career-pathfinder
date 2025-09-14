import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, DollarSign, CheckCircle, Award, MessageCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MentorProfileProps {
  mentor: {
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
  };
  onBookSession?: (mentorId: string) => void;
  onSendMessage?: (mentorId: string) => void;
}

export function MentorProfile({ mentor, onBookSession, onSendMessage }: MentorProfileProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [sessionType, setSessionType] = useState('video_call');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [message, setMessage] = useState('');

  const handleBookSession = () => {
    if (onBookSession) {
      onBookSession(mentor.mentor_id);
    }
    setIsBookingOpen(false);
  };

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(mentor.mentor_id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.profiles.avatar_url} />
              <AvatarFallback>
                {mentor.profiles.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {mentor.profiles.full_name}
                {mentor.mentors.is_verified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{mentor.profiles.industry}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{mentor.mentors.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({mentor.mentors.total_sessions} sessions)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{mentor.profiles.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{mentor.years_experience} years exp</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">${mentor.hourly_rate}/hr</span>
              </div>
              <Badge variant={mentor.is_available ? "default" : "secondary"}>
                {mentor.is_available ? "Available" : "Busy"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bio */}
        <div>
          <h4 className="font-semibold mb-2">About</h4>
          <p className="text-sm text-muted-foreground">{mentor.bio}</p>
        </div>

        {/* Expertise Areas */}
        <div>
          <h4 className="font-semibold mb-2">Expertise Areas</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise_areas.map((area, index) => (
              <Badge key={index} variant="outline">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <h4 className="font-semibold mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.specializations.map((spec, index) => (
              <Badge key={index} variant="secondary">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Credentials */}
        {mentor.credentials.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Credentials</h4>
            <div className="space-y-1">
              {mentor.credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{credential}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {mentor.achievements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Key Achievements</h4>
            <ul className="space-y-1">
              {mentor.achievements.map((achievement, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a Session with {mentor.profiles.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-type">Session Type</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_call">Video Call</SelectItem>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-date">Date</Label>
                    <input
                      id="session-date"
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-time">Time</Label>
                    <input
                      id="session-time"
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the mentor what you'd like to discuss..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBookSession}>
                    Book Session
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleSendMessage}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
