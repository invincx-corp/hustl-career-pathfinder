import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CalendarDays, Clock, Video, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
}

interface Availability {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  timeZone: string;
  isRecurring: boolean;
  mentorId: string;
}

interface Booking {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description: string;
  sessionType: 'video_call' | 'phone_call' | 'in_person' | 'chat';
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
  notes?: string;
}

interface MentorCalendarProps {
  mentorId: string;
  menteeId: string;
  onBookingCreated?: (booking: Booking) => void;
}

export function MentorCalendar({ mentorId, menteeId, onBookingCreated }: MentorCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingData, setBookingData] = useState({
    title: '',
    description: '',
    sessionType: 'video_call' as const,
    duration: 60,
    notes: ''
  });

  useEffect(() => {
    fetchAvailability();
    fetchTimeSlots();
  }, [mentorId, selectedDate]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/mentors/${mentorId}/availability`);
      const data = await response.json();
      
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/mentors/${mentorId}/time-slots?date=${dateStr}`);
      const data = await response.json();
      
      if (data.success) {
        setTimeSlots(data.timeSlots);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);
    
    if (dayAvailability.length === 0) {
      return slots;
    }

    dayAvailability.forEach(avail => {
      const start = new Date(`${selectedDate.toISOString().split('T')[0]}T${avail.startTime}`);
      const end = new Date(`${selectedDate.toISOString().split('T')[0]}T${avail.endTime}`);
      
      let current = new Date(start);
      while (current < end) {
        const slotEnd = new Date(current.getTime() + 30 * 60000); // 30-minute slots
        
        if (slotEnd <= end) {
          slots.push({
            id: `${avail.id}-${current.getTime()}`,
            startTime: current.toTimeString().slice(0, 5),
            endTime: slotEnd.toTimeString().slice(0, 5),
            isAvailable: true,
            isBooked: false
          });
        }
        
        current = new Date(current.getTime() + 30 * 60000);
      }
    });

    return slots;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isAvailable && !slot.isBooked) {
      setSelectedSlot(slot);
      setShowBookingDialog(true);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) return;

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.startTime.split(':').map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const response = await fetch(`/api/mentors/${mentorId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menteeId,
          title: bookingData.title,
          description: bookingData.description,
          sessionType: bookingData.sessionType,
          scheduledAt: scheduledAt.toISOString(),
          duration: bookingData.duration,
          notes: bookingData.notes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowBookingDialog(false);
        setSelectedSlot(null);
        setBookingData({
          title: '',
          description: '',
          sessionType: 'video_call',
          duration: 60,
          notes: ''
        });
        fetchTimeSlots();
        if (onBookingCreated) onBookingCreated(data.booking);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'phone_call':
        return <Clock className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Book a Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
                disabled={isDateInPast(selectedDate)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(selectedDate)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Available Slots</h3>
              <p className="text-muted-foreground">
                This mentor doesn't have any available time slots for the selected date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={slot.isBooked ? "destructive" : slot.isAvailable ? "default" : "outline"}
                  className="h-12 flex flex-col gap-1"
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.isAvailable || slot.isBooked}
                >
                  <span className="text-sm font-medium">{slot.startTime}</span>
                  <span className="text-xs text-muted-foreground">{slot.endTime}</span>
                  {slot.isBooked && (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  {slot.isAvailable && !slot.isBooked && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {formatDate(selectedDate)} at {selectedSlot.startTime}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={bookingData.title}
                onChange={(e) => setBookingData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Career Guidance Session"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={bookingData.description}
                onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What would you like to discuss?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionType">Session Type</Label>
                <Select
                  value={bookingData.sessionType}
                  onValueChange={(value: 'video_call' | 'phone_call' | 'in_person' | 'chat') => 
                    setBookingData(prev => ({ ...prev, sessionType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video_call">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Call
                      </div>
                    </SelectItem>
                    <SelectItem value="phone_call">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Phone Call
                      </div>
                    </SelectItem>
                    <SelectItem value="in_person">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        In Person
                      </div>
                    </SelectItem>
                    <SelectItem value="chat">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Chat
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={bookingData.duration.toString()}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: parseInt(value) }))}
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
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or questions..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookingSubmit}>
                Book Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
