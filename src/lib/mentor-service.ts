import { supabase } from './supabase';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface MentorProfile {
  id: string;
  user_id: string;
  bio?: string;
  expertise_areas: string[];
  years_of_experience: number;
  current_position?: string;
  company?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  hourly_rate?: number;
  currency: string;
  languages: string[];
  timezone: string;
  availability_schedule: Record<string, any>;
  max_students: number;
  current_students: number;
  rating: number;
  total_sessions: number;
  total_hours: number;
  is_verified: boolean;
  verification_documents: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  mentor_specializations?: MentorSpecialization[];
  mentor_availability?: MentorAvailability[];
}

export interface MentorSpecialization {
  id: string;
  mentor_id: string;
  category: string;
  skill: string;
  proficiency_level: number;
  years_experience: number;
  certifications: string[];
  created_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  student_id: string;
  title: string;
  description?: string;
  session_type: 'one_on_one' | 'group' | 'workshop';
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
  session_notes?: string;
  student_goals: string[];
  topics_covered: string[];
  action_items: Record<string, any>;
  student_rating?: number;
  student_feedback?: string;
  mentor_rating?: number;
  mentor_feedback?: string;
  created_at: string;
  updated_at: string;
  mentor?: MentorProfile;
  student?: any;
}

export interface MentorRecommendation {
  mentor: MentorProfile;
  match_score: number;
}

// =====================================================
// MENTOR SERVICE
// =====================================================

export const mentorService = {
  // =====================================================
  // MENTOR PROFILES
  // =====================================================

  async getMentorProfiles(filters: {
    expertise?: string;
    experience_level?: string;
    location?: string;
    availability?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<MentorProfile[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.expertise) params.append('expertise', filters.expertise);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      if (filters.location) params.append('location', filters.location);
      if (filters.availability) params.append('availability', 'true');
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/mentors/profiles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentor profiles: ${response.status}`);
      }

      const data = await response.json();
      return data.mentors || [];
    } catch (error) {
      console.error('Error fetching mentor profiles:', error);
      return [];
    }
  },

  async getMentorProfile(mentorId: string): Promise<MentorProfile | null> {
    try {
      const response = await fetch(`/api/mentors/profiles/${mentorId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch mentor profile: ${response.status}`);
      }

      const data = await response.json();
      return data.mentor;
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      return null;
    }
  },

  async createOrUpdateMentorProfile(userId: string, profileData: Partial<MentorProfile>): Promise<MentorProfile | null> {
    try {
      const response = await fetch('/api/mentors/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create/update mentor profile: ${response.status}`);
      }

      const data = await response.json();
      return data.mentor;
    } catch (error) {
      console.error('Error creating/updating mentor profile:', error);
      return null;
    }
  },

  async addMentorSpecialization(mentorId: string, specialization: {
    category: string;
    skill: string;
    proficiency_level: number;
    years_experience?: number;
    certifications?: string[];
  }): Promise<MentorSpecialization | null> {
    try {
      const response = await fetch(`/api/mentors/profiles/${mentorId}/specializations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(specialization)
      });

      if (!response.ok) {
        throw new Error(`Failed to add specialization: ${response.status}`);
      }

      const data = await response.json();
      return data.specialization;
    } catch (error) {
      console.error('Error adding mentor specialization:', error);
      return null;
    }
  },

  // =====================================================
  // MENTOR AVAILABILITY
  // =====================================================

  async getMentorAvailability(mentorId: string): Promise<MentorAvailability[]> {
    try {
      const response = await fetch(`/api/mentors/profiles/${mentorId}/availability`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentor availability: ${response.status}`);
      }

      const data = await response.json();
      return data.availability || [];
    } catch (error) {
      console.error('Error fetching mentor availability:', error);
      return [];
    }
  },

  async updateMentorAvailability(mentorId: string, availabilitySlots: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone?: string;
    is_recurring?: boolean;
  }[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/mentors/profiles/${mentorId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability_slots: availabilitySlots
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating mentor availability:', error);
      return false;
    }
  },

  // =====================================================
  // MENTOR SESSIONS
  // =====================================================

  async getMentorSessions(mentorId: string, filters: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<MentorSession[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/mentors/profiles/${mentorId}/sessions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentor sessions: ${response.status}`);
      }

      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching mentor sessions:', error);
      return [];
    }
  },

  async createMentorSession(sessionData: {
    mentor_id: string;
    student_id: string;
    title?: string;
    description?: string;
    session_type?: 'one_on_one' | 'group' | 'workshop';
    scheduled_at: string;
    duration_minutes?: number;
    student_goals?: string[];
  }): Promise<MentorSession | null> {
    try {
      const response = await fetch('/api/mentors/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error creating mentor session:', error);
      return null;
    }
  },

  async updateSessionStatus(sessionId: string, updates: {
    status?: string;
    session_notes?: string;
    meeting_url?: string;
    meeting_id?: string;
    meeting_password?: string;
  }): Promise<MentorSession | null> {
    try {
      const response = await fetch(`/api/mentors/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.status}`);
      }

      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error updating session status:', error);
        return null;
    }
  },

  async addSessionFeedback(sessionId: string, feedback: {
    student_rating?: number;
    student_feedback?: string;
    mentor_rating?: number;
    mentor_feedback?: string;
    topics_covered?: string[];
    action_items?: Record<string, any>;
  }): Promise<MentorSession | null> {
    try {
      const response = await fetch(`/api/mentors/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error(`Failed to add feedback: ${response.status}`);
      }

      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error adding session feedback:', error);
      return null;
    }
  },

  // =====================================================
  // MENTOR MATCHING
  // =====================================================

  async getMentorRecommendations(preferences: {
    user_id: string;
    preferred_expertise?: string[];
    preferred_experience_level?: string;
    preferred_session_types?: string[];
    max_hourly_rate?: number;
    timezone?: string;
  }): Promise<MentorRecommendation[]> {
    try {
      const response = await fetch('/api/mentors/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error getting mentor recommendations:', error);
      return [];
    }
  },

  // =====================================================
  // MENTOR VERIFICATION
  // =====================================================

  async submitVerificationDocuments(mentorId: string, documents: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`/api/mentors/profiles/${mentorId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_documents: documents
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit verification: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error submitting verification documents:', error);
      return false;
    }
  },

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  formatAvailability(availability: MentorAvailability[]): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    availability.forEach(slot => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[slot.day_of_week];
      
      if (!formatted[dayName]) {
        formatted[dayName] = [];
      }
      
      formatted[dayName].push({
        start: slot.start_time,
        end: slot.end_time,
        timezone: slot.timezone,
        is_recurring: slot.is_recurring
      });
    });
    
    return formatted;
  },

  calculateMatchScore(mentor: MentorProfile, preferences: {
    preferred_expertise?: string[];
    preferred_experience_level?: string;
    max_hourly_rate?: number;
  }): number {
        let score = 0;
    
    // Expertise match (40 points max)
    if (preferences.preferred_expertise && mentor.expertise_areas) {
      const expertiseMatches = preferences.preferred_expertise.filter(exp => 
        mentor.expertise_areas.includes(exp)
          ).length;
      score += (expertiseMatches / preferences.preferred_expertise.length) * 40;
    }
    
    // Experience level match (30 points max)
    if (preferences.preferred_experience_level) {
      const mentorLevel = mentor.years_of_experience < 3 ? 'junior' : 
                         mentor.years_of_experience < 7 ? 'mid' : 'senior';
      if (mentorLevel === preferences.preferred_experience_level) {
        score += 30;
      }
    }
    
    // Rating bonus (30 points max)
    score += (mentor.rating || 0) * 6;
    
    // Availability bonus (10 points max)
    if (mentor.mentor_availability && mentor.mentor_availability.length > 0) {
      score += 10;
    }
    
    return Math.min(100, Math.round(score));
  }
};