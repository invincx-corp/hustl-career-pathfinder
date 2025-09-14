// Session Booking Form Component
// Form for booking mentor sessions

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  DollarSign,
  Video,
  Phone,
  MapPin,
  MessageCircle,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { bookingSystem, TimeSlot } from '@/lib/booking-system';

interface SessionBookingFormProps {
  mentorId: string;
  menteeId: string;
  onBookingSuccess?: (session: any) => void;
  onCancel?: () => void;
  initialTimeSlot?: TimeSlot;
}

export const SessionBookingForm: React.FC<SessionBookingFormProps> = ({
  mentorId,
  menteeId,
  onBookingSuccess,
  onCancel,
  initialTimeSlot
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(initialTimeSlot || null);
  const [sessionDetails, setSessionDetails] = useState({
    title: '',
    description: '',
    sessionType: 'video' as 'video' | 'phone' | 'in-person' | 'chat',
    price: 0,
    currency: 'USD',
    meetingLink: '',
    location: '',
    notes: ''
  });
  const [preparation, setPreparation] = useState({
    menteePreparation: [] as string[],
    mentorPreparation: [] as string[],
    resources: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available slots when component mounts
  useEffect(() => {
    loadAvailableSlots();
  }, [mentorId]);

  const loadAvailableSlots = () => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const slots = bookingSystem.getAvailableSlots(mentorId, startDate, endDate);
    setAvailableSlots(slots);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setSessionDetails(prev => ({
      ...prev,
      price: 50, // Default price, should come from mentor profile
      currency: 'USD'
    }));
  };

  const handleSessionDetailsChange = (field: string, value: any) => {
    setSessionDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!selectedTimeSlot) {
          newErrors.timeSlot = 'Please select a time slot';
        }
        break;
      case 2:
        if (!sessionDetails.title.trim()) {
          newErrors.title = 'Session title is required';
        }
        if (!sessionDetails.sessionType) {
          newErrors.sessionType = 'Please select a session type';
        }
        if (sessionDetails.sessionType === 'in-person' && !sessionDetails.location.trim()) {
          newErrors.location = 'Location is required for in-person sessions';
        }
        if (sessionDetails.sessionType === 'video' && !sessionDetails.meetingLink.trim()) {
          newErrors.meetingLink = 'Meeting link is required for video sessions';
        }
        break;
      case 3:
        // No validation needed for preparation step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !selectedTimeSlot) return;

    setIsLoading(true);

    try {
      const session = bookingSystem.bookSession(
        mentorId,
        menteeId,
        selectedTimeSlot.id,
        {
          title: sessionDetails.title,
          description: sessionDetails.description,
          sessionType: sessionDetails.sessionType,
          price: sessionDetails.price,
          currency: sessionDetails.currency,
          meetingLink: sessionDetails.meetingLink,
          location: sessionDetails.location,
          notes: sessionDetails.notes
        }
      );

      if (session) {
        // Add preparation details
        if (preparation.menteePreparation.length > 0 || 
            preparation.mentorPreparation.length > 0 || 
            preparation.resources.length > 0) {
          // This would typically be saved to the session
          console.log('Preparation details:', preparation);
        }

        if (onBookingSuccess) {
          onBookingSuccess(session);
        }
      } else {
        setErrors({ general: 'Failed to book session. Please try again.' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ general: 'An error occurred while booking the session.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    
    return {
      date: start.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: `${start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} - ${end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`,
      duration: `${slot.duration} min`
    };
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped: Record<string, TimeSlot[]> = {};
    
    slots.forEach(slot => {
      const date = new Date(slot.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  };

  const groupedSlots = groupSlotsByDate(availableSlots);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Book a Session</CardTitle>
          <p className="text-center text-gray-600">
            Schedule a mentoring session with your chosen mentor
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">Select Time</TabsTrigger>
              <TabsTrigger value="2">Session Details</TabsTrigger>
              <TabsTrigger value="3">Preparation</TabsTrigger>
            </TabsList>

            {/* Step 1: Select Time Slot */}
            <TabsContent value="1" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No available time slots found</p>
                    <p className="text-sm">Please try a different date range</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div key={date}>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {slots.map(slot => {
                            const formatted = formatTimeSlot(slot);
                            const isSelected = selectedTimeSlot?.id === slot.id;
                            
                            return (
                              <div
                                key={slot.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => handleTimeSlotSelect(slot)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{formatted.time}</div>
                                    <div className="text-sm text-gray-600">{formatted.duration}</div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.timeSlot && (
                  <p className="text-red-500 text-sm mt-2">{errors.timeSlot}</p>
                )}
              </div>
            </TabsContent>

            {/* Step 2: Session Details */}
            <TabsContent value="2" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    value={sessionDetails.title}
                    onChange={(e) => handleSessionDetailsChange('title', e.target.value)}
                    placeholder="e.g., React Development Review"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="sessionType">Session Type *</Label>
                  <Select
                    value={sessionDetails.sessionType}
                    onValueChange={(value) => handleSessionDetailsChange('sessionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sessionType && (
                    <p className="text-red-500 text-sm mt-1">{errors.sessionType}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sessionDetails.description}
                  onChange={(e) => handleSessionDetailsChange('description', e.target.value)}
                  placeholder="Describe what you'd like to discuss in this session..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (per hour)</Label>
                  <div className="flex space-x-2">
                    <DollarSign className="h-4 w-4 mt-3 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      value={sessionDetails.price}
                      onChange={(e) => handleSessionDetailsChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <Select
                      value={sessionDetails.currency}
                      onValueChange={(value) => handleSessionDetailsChange('currency', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={`${selectedTimeSlot?.duration || 0} minutes`}
                    disabled
                  />
                </div>
              </div>

              {sessionDetails.sessionType === 'video' && (
                <div>
                  <Label htmlFor="meetingLink">Meeting Link *</Label>
                  <Input
                    id="meetingLink"
                    value={sessionDetails.meetingLink}
                    onChange={(e) => handleSessionDetailsChange('meetingLink', e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                  />
                  {errors.meetingLink && (
                    <p className="text-red-500 text-sm mt-1">{errors.meetingLink}</p>
                  )}
                </div>
              )}

              {sessionDetails.sessionType === 'in-person' && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={sessionDetails.location}
                    onChange={(e) => handleSessionDetailsChange('location', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={sessionDetails.notes}
                  onChange={(e) => handleSessionDetailsChange('notes', e.target.value)}
                  placeholder="Any special requests or information for the mentor..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Step 3: Preparation */}
            <TabsContent value="3" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Session Preparation</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Let your mentor know what you'd like to prepare for this session
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">What would you like to prepare?</h4>
                  <div className="space-y-2">
                    {[
                      'Review the code/project',
                      'Prepare specific questions',
                      'Research the topic',
                      'Practice exercises',
                      'Review previous session notes'
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={item}
                          checked={preparation.menteePreparation.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreparation(prev => ({
                                ...prev,
                                menteePreparation: [...prev.menteePreparation, item]
                              }));
                            } else {
                              setPreparation(prev => ({
                                ...prev,
                                menteePreparation: prev.menteePreparation.filter(p => p !== item)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={item} className="text-sm">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">What should the mentor prepare?</h4>
                  <div className="space-y-2">
                    {[
                      'Review your profile',
                      'Prepare examples',
                      'Create exercises',
                      'Research resources',
                      'Prepare feedback'
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`mentor-${item}`}
                          checked={preparation.mentorPreparation.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreparation(prev => ({
                                ...prev,
                                mentorPreparation: [...prev.mentorPreparation, item]
                              }));
                            } else {
                              setPreparation(prev => ({
                                ...prev,
                                mentorPreparation: prev.mentorPreparation.filter(p => p !== item)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={`mentor-${item}`} className="text-sm">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Resources to share</h4>
                <Textarea
                  placeholder="List any resources, links, or materials you'd like to share..."
                  rows={3}
                  value={preparation.resources.join('\n')}
                  onChange={(e) => setPreparation(prev => ({
                    ...prev,
                    resources: e.target.value.split('\n').filter(r => r.trim())
                  }))}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Booking...' : 'Book Session'}
                </Button>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
