// Booking Calendar Component
// Interactive calendar for viewing and managing mentor sessions

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  MessageCircle,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { bookingSystem, CalendarEvent, Session } from '@/lib/booking-system';

interface BookingCalendarProps {
  userId: string;
  userType: 'mentor' | 'mentee';
  onSessionClick?: (session: Session) => void;
  onTimeSlotClick?: (timeSlot: any) => void;
  onCreateSession?: () => void;
  showCreateButton?: boolean;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  userId,
  userType,
  onSessionClick,
  onTimeSlotClick,
  onCreateSession,
  showCreateButton = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load events when component mounts or date changes
  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode, userId]);

  const loadEvents = () => {
    setIsLoading(true);
    
    const startDate = getViewStartDate();
    const endDate = getViewEndDate();
    
    const calendarEvents = bookingSystem.getCalendarEvents(userId, userType, startDate, endDate);
    setEvents(calendarEvents);
    
    setIsLoading(false);
  };

  const getViewStartDate = (): Date => {
    const date = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        // Go to start of week (Sunday)
        date.setDate(date.getDate() - date.getDay());
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay());
        date.setHours(0, 0, 0, 0);
        break;
      case 'day':
        date.setHours(0, 0, 0, 0);
        break;
    }
    
    return date;
  };

  const getViewEndDate = (): Date => {
    const date = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0);
        date.setHours(23, 59, 59, 999);
        // Go to end of week (Saturday)
        date.setDate(date.getDate() + (6 - date.getDay()));
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay() + 6);
        date.setHours(23, 59, 59, 999);
        break;
      case 'day':
        date.setHours(23, 59, 59, 999);
        break;
    }
    
    return date;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate();
    const days = [];
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const dayEvents = getEventsForDate(date);
          
          return (
            <div
              key={index}
              className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${
                isSelected ? 'bg-blue-100 border-blue-300' : ''
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : ''
                }`}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      event.type === 'session' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (event.type === 'session' && onSessionClick) {
                        // Find the session and call the handler
                        const session = Array.from(bookingSystem['sessions'].values())
                          .find(s => s.id === event.id);
                        if (session) onSessionClick(session);
                      } else if (event.type === 'availability' && onTimeSlotClick) {
                        onTimeSlotClick(event);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      {event.type === 'session' ? getSessionIcon('video') : <Clock className="h-3 w-3" />}
                      <span className="truncate">{event.title}</span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getViewStartDate();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const dayEvents = getEventsForDate(date);
          
          return (
            <div
              key={index}
              className={`min-h-32 p-2 border border-gray-200 ${
                isToday ? 'bg-blue-50 border-blue-200' : ''
              } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : ''
                }`}>
                  {formatDate(date)}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer ${
                      event.type === 'session' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (event.type === 'session' && onSessionClick) {
                        const session = Array.from(bookingSystem['sessions'].values())
                          .find(s => s.id === event.id);
                        if (session) onSessionClick(session);
                      } else if (event.type === 'availability' && onTimeSlotClick) {
                        onTimeSlotClick(event);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      {event.type === 'session' ? getSessionIcon('video') : <Clock className="h-3 w-3" />}
                      <span className="truncate">{event.title}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTime(event.start)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            {formatDate(currentDate)}
          </h3>
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayEvents.map(event => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {event.type === 'session' ? getSessionIcon('video') : <Clock className="h-5 w-5" />}
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.status && getStatusIcon(event.status)}
                      <Badge variant={event.type === 'session' ? 'default' : 'secondary'}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            {showCreateButton && onCreateSession && (
              <Button onClick={onCreateSession} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
