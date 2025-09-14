// Booking System for Mentor Sessions
// Handles session scheduling, availability management, and booking operations

export interface TimeSlot {
  id: string;
  mentorId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in minutes
  timezone: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string; // mentee ID
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  timeSlotId: string;
  title: string;
  description?: string;
  sessionType: 'video' | 'phone' | 'in-person' | 'chat';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  duration: number; // in minutes
  price: number;
  currency: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  preparation?: {
    menteePreparation: string[];
    mentorPreparation: string[];
    resources: string[];
  };
  feedback?: {
    menteeRating?: number;
    menteeReview?: string;
    mentorRating?: number;
    mentorReview?: string;
  };
  createdAt: string;
  updatedAt: string;
  scheduledAt: string;
  completedAt?: string;
}

export interface AvailabilityRule {
  id: string;
  mentorId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  isActive: boolean;
  maxSessionsPerDay: number;
  sessionDuration: number; // in minutes
  bufferTime: number; // in minutes between sessions
  advanceBookingDays: number; // how many days in advance can be booked
  lastMinuteBookingHours: number; // how many hours before session can be booked
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  requestedTimeSlot: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  sessionType: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  responseAt?: string;
  responseMessage?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'session' | 'availability' | 'blocked' | 'break';
  status?: string;
  color?: string;
  description?: string;
  location?: string;
  attendees?: string[];
}

export class BookingSystem {
  private timeSlots: Map<string, TimeSlot> = new Map();
  private sessions: Map<string, Session> = new Map();
  private availabilityRules: Map<string, AvailabilityRule> = new Map();
  private bookingRequests: Map<string, BookingRequest> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create availability rule for mentor
  createAvailabilityRule(mentorId: string, rule: Omit<AvailabilityRule, 'id' | 'mentorId' | 'createdAt' | 'updatedAt'>): AvailabilityRule {
    const availabilityRule: AvailabilityRule = {
      id: `rule-${Date.now()}`,
      mentorId,
      ...rule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.availabilityRules.set(availabilityRule.id, availabilityRule);
    this.generateTimeSlots(mentorId);
    this.saveToLocalStorage();
    
    return availabilityRule;
  }

  // Generate time slots based on availability rules
  private generateTimeSlots(mentorId: string, startDate?: Date, endDate?: Date) {
    const rules = Array.from(this.availabilityRules.values())
      .filter(rule => rule.mentorId === mentorId && rule.isActive);

    if (rules.length === 0) return;

    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dayRules = rules.filter(rule => rule.dayOfWeek === dayOfWeek);

      dayRules.forEach(rule => {
        this.generateSlotsForDay(mentorId, currentDate, rule);
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Generate slots for a specific day and rule
  private generateSlotsForDay(mentorId: string, date: Date, rule: AvailabilityRule) {
    const dateStr = date.toISOString().split('T')[0];
    const startTime = new Date(`${dateStr}T${rule.startTime}:00`);
    const endTime = new Date(`${dateStr}T${rule.endTime}:00`);
    
    let currentTime = new Date(startTime);
    let sessionCount = 0;

    while (currentTime < endTime && sessionCount < rule.maxSessionsPerDay) {
      const slotEndTime = new Date(currentTime.getTime() + rule.sessionDuration * 60000);
      
      if (slotEndTime <= endTime) {
        const slotId = `slot-${mentorId}-${dateStr}-${currentTime.getHours()}-${currentTime.getMinutes()}`;
        
        // Check if slot already exists
        if (!this.timeSlots.has(slotId)) {
          const timeSlot: TimeSlot = {
            id: slotId,
            mentorId,
            startTime: currentTime.toISOString(),
            endTime: slotEndTime.toISOString(),
            duration: rule.sessionDuration,
            timezone: rule.timezone,
            isAvailable: true,
            isBooked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.timeSlots.set(slotId, timeSlot);
        }

        sessionCount++;
        currentTime = new Date(slotEndTime.getTime() + rule.bufferTime * 60000);
      } else {
        break;
      }
    }
  }

  // Get available time slots for mentor
  getAvailableSlots(mentorId: string, startDate?: Date, endDate?: Date): TimeSlot[] {
    const slots = Array.from(this.timeSlots.values())
      .filter(slot => 
        slot.mentorId === mentorId && 
        slot.isAvailable && 
        !slot.isBooked
      );

    if (startDate && endDate) {
      return slots.filter(slot => {
        const slotDate = new Date(slot.startTime);
        return slotDate >= startDate && slotDate <= endDate;
      });
    }

    return slots;
  }

  // Book a session
  bookSession(
    mentorId: string,
    menteeId: string,
    timeSlotId: string,
    sessionDetails: {
      title: string;
      description?: string;
      sessionType: 'video' | 'phone' | 'in-person' | 'chat';
      price: number;
      currency: string;
      meetingLink?: string;
      location?: string;
      notes?: string;
    }
  ): Session | null {
    const timeSlot = this.timeSlots.get(timeSlotId);
    
    if (!timeSlot || timeSlot.isBooked || !timeSlot.isAvailable) {
      return null;
    }

    // Create session
    const session: Session = {
      id: `session-${Date.now()}`,
      mentorId,
      menteeId,
      timeSlotId,
      title: sessionDetails.title,
      description: sessionDetails.description,
      sessionType: sessionDetails.sessionType,
      status: 'scheduled',
      duration: timeSlot.duration,
      price: sessionDetails.price,
      currency: sessionDetails.currency,
      meetingLink: sessionDetails.meetingLink,
      location: sessionDetails.location,
      notes: sessionDetails.notes,
      preparation: {
        menteePreparation: [],
        mentorPreparation: [],
        resources: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledAt: timeSlot.startTime
    };

    // Update time slot
    timeSlot.isBooked = true;
    timeSlot.bookedBy = menteeId;
    timeSlot.sessionId = session.id;
    timeSlot.updatedAt = new Date().toISOString();

    // Save session and updated slot
    this.sessions.set(session.id, session);
    this.timeSlots.set(timeSlotId, timeSlot);
    this.saveToLocalStorage();

    return session;
  }

  // Cancel a session
  cancelSession(sessionId: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'completed') {
      return false;
    }

    // Update session status
    session.status = 'cancelled';
    session.updatedAt = new Date().toISOString();
    if (reason) {
      session.notes = (session.notes || '') + `\nCancellation reason: ${reason}`;
    }

    // Free up time slot
    const timeSlot = this.timeSlots.get(session.timeSlotId);
    if (timeSlot) {
      timeSlot.isBooked = false;
      timeSlot.bookedBy = undefined;
      timeSlot.sessionId = undefined;
      timeSlot.updatedAt = new Date().toISOString();
      this.timeSlots.set(session.timeSlotId, timeSlot);
    }

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Reschedule a session
  rescheduleSession(sessionId: string, newTimeSlotId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'completed' || session.status === 'cancelled') {
      return false;
    }

    const newTimeSlot = this.timeSlots.get(newTimeSlotId);
    if (!newTimeSlot || newTimeSlot.isBooked || !newTimeSlot.isAvailable) {
      return false;
    }

    // Free up old time slot
    const oldTimeSlot = this.timeSlots.get(session.timeSlotId);
    if (oldTimeSlot) {
      oldTimeSlot.isBooked = false;
      oldTimeSlot.bookedBy = undefined;
      oldTimeSlot.sessionId = undefined;
      oldTimeSlot.updatedAt = new Date().toISOString();
      this.timeSlots.set(session.timeSlotId, oldTimeSlot);
    }

    // Book new time slot
    newTimeSlot.isBooked = true;
    newTimeSlot.bookedBy = session.menteeId;
    newTimeSlot.sessionId = sessionId;
    newTimeSlot.updatedAt = new Date().toISOString();

    // Update session
    session.timeSlotId = newTimeSlotId;
    session.scheduledAt = newTimeSlot.startTime;
    session.updatedAt = new Date().toISOString();

    this.timeSlots.set(newTimeSlotId, newTimeSlot);
    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Get sessions for mentor
  getMentorSessions(mentorId: string, status?: string): Session[] {
    let sessions = Array.from(this.sessions.values())
      .filter(session => session.mentorId === mentorId);

    if (status) {
      sessions = sessions.filter(session => session.status === status);
    }

    return sessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  // Get sessions for mentee
  getMenteeSessions(menteeId: string, status?: string): Session[] {
    let sessions = Array.from(this.sessions.values())
      .filter(session => session.menteeId === menteeId);

    if (status) {
      sessions = sessions.filter(session => session.status === status);
    }

    return sessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  // Get upcoming sessions
  getUpcomingSessions(userId: string, userType: 'mentor' | 'mentee'): Session[] {
    const now = new Date();
    const sessions = userType === 'mentor' 
      ? this.getMentorSessions(userId)
      : this.getMenteeSessions(userId);

    return sessions.filter(session => 
      new Date(session.scheduledAt) > now && 
      ['scheduled', 'confirmed'].includes(session.status)
    );
  }

  // Update session status
  updateSessionStatus(sessionId: string, status: Session['status'], notes?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = status;
    session.updatedAt = new Date().toISOString();

    if (status === 'completed') {
      session.completedAt = new Date().toISOString();
    }

    if (notes) {
      session.notes = (session.notes || '') + `\n${new Date().toISOString()}: ${notes}`;
    }

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add session feedback
  addSessionFeedback(
    sessionId: string,
    feedback: {
      menteeRating?: number;
      menteeReview?: string;
      mentorRating?: number;
      mentorReview?: string;
    }
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.feedback = {
      ...session.feedback,
      ...feedback
    };
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Get calendar events for a user
  getCalendarEvents(userId: string, userType: 'mentor' | 'mentee', startDate: Date, endDate: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const sessions = userType === 'mentor' 
      ? this.getMentorSessions(userId)
      : this.getMenteeSessions(userId);

    sessions.forEach(session => {
      const sessionDate = new Date(session.scheduledAt);
      if (sessionDate >= startDate && sessionDate <= endDate) {
        events.push({
          id: session.id,
          title: session.title,
          start: session.scheduledAt,
          end: new Date(new Date(session.scheduledAt).getTime() + session.duration * 60000).toISOString(),
          type: 'session',
          status: session.status,
          color: this.getSessionColor(session.status),
          description: session.description,
          location: session.location,
          attendees: [session.mentorId, session.menteeId]
        });
      }
    });

    // Add availability slots for mentors
    if (userType === 'mentor') {
      const availableSlots = this.getAvailableSlots(userId, startDate, endDate);
      availableSlots.forEach(slot => {
        events.push({
          id: slot.id,
          title: 'Available',
          start: slot.startTime,
          end: slot.endTime,
          type: 'availability',
          color: '#10b981',
          description: 'Available for booking'
        });
      });
    }

    return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  // Get session color based on status
  private getSessionColor(status: string): string {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'no-show':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  }

  // Create booking request
  createBookingRequest(
    menteeId: string,
    mentorId: string,
    requestDetails: {
      requestedTimeSlot: {
        startTime: string;
        endTime: string;
        duration: number;
      };
      sessionType: string;
      message?: string;
    }
  ): BookingRequest {
    const bookingRequest: BookingRequest = {
      id: `request-${Date.now()}`,
      menteeId,
      mentorId,
      requestedTimeSlot: requestDetails.requestedTimeSlot,
      sessionType: requestDetails.sessionType,
      message: requestDetails.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.bookingRequests.set(bookingRequest.id, bookingRequest);
    this.saveToLocalStorage();

    return bookingRequest;
  }

  // Respond to booking request
  respondToBookingRequest(
    requestId: string,
    response: 'approved' | 'rejected',
    message?: string
  ): boolean {
    const request = this.bookingRequests.get(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    request.status = response;
    request.responseAt = new Date().toISOString();
    request.responseMessage = message;

    this.bookingRequests.set(requestId, request);
    this.saveToLocalStorage();

    return true;
  }

  // Get booking requests for mentor
  getMentorBookingRequests(mentorId: string): BookingRequest[] {
    return Array.from(this.bookingRequests.values())
      .filter(request => request.mentorId === mentorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get booking requests for mentee
  getMenteeBookingRequests(menteeId: string): BookingRequest[] {
    return Array.from(this.bookingRequests.values())
      .filter(request => request.menteeId === menteeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Check if time slot is available
  isTimeSlotAvailable(timeSlotId: string): boolean {
    const timeSlot = this.timeSlots.get(timeSlotId);
    return timeSlot ? timeSlot.isAvailable && !timeSlot.isBooked : false;
  }

  // Get session statistics
  getSessionStats(userId: string, userType: 'mentor' | 'mentee'): {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    totalRevenue: number;
    averageRating: number;
    upcomingSessions: number;
  } {
    const sessions = userType === 'mentor' 
      ? this.getMentorSessions(userId)
      : this.getMenteeSessions(userId);

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
    const upcomingSessions = this.getUpcomingSessions(userId, userType).length;

    const totalRevenue = userType === 'mentor' 
      ? completedSessions.reduce((sum, session) => sum + session.price, 0)
      : 0;

    const ratings = completedSessions
      .map(s => s.feedback?.menteeRating || s.feedback?.mentorRating)
      .filter(rating => rating !== undefined) as number[];

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      cancelledSessions: cancelledSessions.length,
      totalRevenue,
      averageRating,
      upcomingSessions
    };
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        timeSlots: Object.fromEntries(this.timeSlots),
        sessions: Object.fromEntries(this.sessions),
        availabilityRules: Object.fromEntries(this.availabilityRules),
        bookingRequests: Object.fromEntries(this.bookingRequests)
      };
      localStorage.setItem('booking-system', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save booking data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('booking-system');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.timeSlots) {
        this.timeSlots = new Map(Object.entries(parsed.timeSlots));
      }
      
      if (parsed.sessions) {
        this.sessions = new Map(Object.entries(parsed.sessions));
      }
      
      if (parsed.availabilityRules) {
        this.availabilityRules = new Map(Object.entries(parsed.availabilityRules));
      }
      
      if (parsed.bookingRequests) {
        this.bookingRequests = new Map(Object.entries(parsed.bookingRequests));
      }
    } catch (error) {
      console.error('Failed to load booking data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.timeSlots.clear();
    this.sessions.clear();
    this.availabilityRules.clear();
    this.bookingRequests.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const bookingSystem = new BookingSystem();
