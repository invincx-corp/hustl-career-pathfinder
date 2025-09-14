// Mentor Profile Management System
// Handles mentor registration, profile management, and verification workflow

export interface MentorProfile {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: string;
    timezone: string;
    bio: string;
    profileImage?: string;
  };
  professionalInfo: {
    currentRole: string;
    company: string;
    industry: string;
    yearsOfExperience: number;
    specializations: string[];
    skills: string[];
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      credentialId?: string;
    }>;
    education: Array<{
      degree: string;
      field: string;
      institution: string;
      graduationYear: number;
    }>;
  };
  mentoringInfo: {
    areasOfExpertise: string[];
    mentoringStyle: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    availability: {
      timeSlots: Array<{
        day: string;
        startTime: string;
        endTime: string;
        timezone: string;
      }>;
      maxSessionsPerWeek: number;
      sessionDuration: number; // in minutes
    };
    pricing: {
      hourlyRate: number;
      currency: string;
      freeSessions: number; // Number of free sessions per month
    };
    languages: string[];
    communicationPreferences: string[];
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected' | 'suspended';
    verificationDate?: string;
    verifiedBy?: string;
    documents: Array<{
      type: 'identity' | 'employment' | 'education' | 'certification';
      name: string;
      url: string;
      status: 'pending' | 'verified' | 'rejected';
    }>;
    backgroundCheck: {
      status: 'pending' | 'passed' | 'failed' | 'not_required';
      date?: string;
      provider?: string;
    };
  };
  stats: {
    totalSessions: number;
    totalHours: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    responseTime: number; // in hours
    lastActive: string;
  };
  preferences: {
    menteeTypes: string[];
    sessionTypes: string[];
    maxMentees: number;
    autoAccept: boolean;
    notificationSettings: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface MentorSearchFilters {
  skills?: string[];
  industries?: string[];
  experienceLevel?: string[];
  availability?: {
    day?: string;
    time?: string;
    timezone?: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  location?: string;
  languages?: string[];
  sessionTypes?: string[];
}

export interface MentorMatch {
  mentor: MentorProfile;
  matchScore: number;
  matchReasons: string[];
  compatibility: {
    skills: number;
    availability: number;
    communication: number;
    experience: number;
  };
}

export class MentorProfileManager {
  private mentors: Map<string, MentorProfile> = new Map();
  private verificationQueue: Array<{ mentorId: string; type: string; priority: number }> = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create a new mentor profile
  createMentorProfile(userId: string, profileData: Partial<MentorProfile>): MentorProfile {
    const mentorId = `mentor-${Date.now()}`;
    const now = new Date().toISOString();

    const mentorProfile: MentorProfile = {
      id: mentorId,
      userId,
      personalInfo: {
        firstName: profileData.personalInfo?.firstName || '',
        lastName: profileData.personalInfo?.lastName || '',
        email: profileData.personalInfo?.email || '',
        phone: profileData.personalInfo?.phone || '',
        location: profileData.personalInfo?.location || '',
        timezone: profileData.personalInfo?.timezone || 'UTC',
        bio: profileData.personalInfo?.bio || '',
        profileImage: profileData.personalInfo?.profileImage || ''
      },
      professionalInfo: {
        currentRole: profileData.professionalInfo?.currentRole || '',
        company: profileData.professionalInfo?.company || '',
        industry: profileData.professionalInfo?.industry || '',
        yearsOfExperience: profileData.professionalInfo?.yearsOfExperience || 0,
        specializations: profileData.professionalInfo?.specializations || [],
        skills: profileData.professionalInfo?.skills || [],
        certifications: profileData.professionalInfo?.certifications || [],
        education: profileData.professionalInfo?.education || []
      },
      mentoringInfo: {
        areasOfExpertise: profileData.mentoringInfo?.areasOfExpertise || [],
        mentoringStyle: profileData.mentoringInfo?.mentoringStyle || '',
        experienceLevel: profileData.mentoringInfo?.experienceLevel || 'beginner',
        availability: {
          timeSlots: profileData.mentoringInfo?.availability?.timeSlots || [],
          maxSessionsPerWeek: profileData.mentoringInfo?.availability?.maxSessionsPerWeek || 5,
          sessionDuration: profileData.mentoringInfo?.availability?.sessionDuration || 60
        },
        pricing: {
          hourlyRate: profileData.mentoringInfo?.pricing?.hourlyRate || 0,
          currency: profileData.mentoringInfo?.pricing?.currency || 'USD',
          freeSessions: profileData.mentoringInfo?.pricing?.freeSessions || 2
        },
        languages: profileData.mentoringInfo?.languages || ['English'],
        communicationPreferences: profileData.mentoringInfo?.communicationPreferences || []
      },
      verification: {
        status: 'pending',
        documents: [],
        backgroundCheck: {
          status: 'pending'
        }
      },
      stats: {
        totalSessions: 0,
        totalHours: 0,
        averageRating: 0,
        totalReviews: 0,
        completionRate: 100,
        responseTime: 24,
        lastActive: now
      },
      preferences: {
        menteeTypes: profileData.preferences?.menteeTypes || [],
        sessionTypes: profileData.preferences?.sessionTypes || ['video', 'phone'],
        maxMentees: profileData.preferences?.maxMentees || 10,
        autoAccept: profileData.preferences?.autoAccept || false,
        notificationSettings: {
          email: true,
          sms: false,
          push: true
        }
      },
      createdAt: now,
      updatedAt: now
    };

    this.mentors.set(mentorId, mentorProfile);
    this.saveToLocalStorage();
    
    // Add to verification queue
    this.addToVerificationQueue(mentorId, 'initial_verification', 1);

    return mentorProfile;
  }

  // Get mentor profile by ID
  getMentorProfile(mentorId: string): MentorProfile | null {
    return this.mentors.get(mentorId) || null;
  }

  // Get mentor profile by user ID
  getMentorByUserId(userId: string): MentorProfile | null {
    for (const mentor of this.mentors.values()) {
      if (mentor.userId === userId) {
        return mentor;
      }
    }
    return null;
  }

  // Update mentor profile
  updateMentorProfile(mentorId: string, updates: Partial<MentorProfile>): boolean {
    const mentor = this.mentors.get(mentorId);
    if (!mentor) return false;

    const updatedMentor = {
      ...mentor,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.mentors.set(mentorId, updatedMentor);
    this.saveToLocalStorage();
    return true;
  }

  // Search mentors with filters
  searchMentors(filters: MentorSearchFilters): MentorProfile[] {
    let results = Array.from(this.mentors.values());

    // Filter by verification status (only show verified mentors)
    results = results.filter(mentor => mentor.verification.status === 'verified');

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(mentor =>
        filters.skills!.some(skill =>
          mentor.professionalInfo.skills.some(mentorSkill =>
            mentorSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Filter by industries
    if (filters.industries && filters.industries.length > 0) {
      results = results.filter(mentor =>
        filters.industries!.includes(mentor.professionalInfo.industry)
      );
    }

    // Filter by experience level
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      results = results.filter(mentor =>
        filters.experienceLevel!.includes(mentor.mentoringInfo.experienceLevel)
      );
    }

    // Filter by availability
    if (filters.availability) {
      results = results.filter(mentor => {
        if (filters.availability!.day) {
          return mentor.mentoringInfo.availability.timeSlots.some(slot =>
            slot.day.toLowerCase() === filters.availability!.day!.toLowerCase()
          );
        }
        return true;
      });
    }

    // Filter by price range
    if (filters.priceRange) {
      results = results.filter(mentor =>
        mentor.mentoringInfo.pricing.hourlyRate >= filters.priceRange!.min &&
        mentor.mentoringInfo.pricing.hourlyRate <= filters.priceRange!.max
      );
    }

    // Filter by rating
    if (filters.rating) {
      results = results.filter(mentor =>
        mentor.stats.averageRating >= filters.rating!
      );
    }

    // Filter by location
    if (filters.location) {
      results = results.filter(mentor =>
        mentor.personalInfo.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by languages
    if (filters.languages && filters.languages.length > 0) {
      results = results.filter(mentor =>
        filters.languages!.some(lang =>
          mentor.mentoringInfo.languages.includes(lang)
        )
      );
    }

    // Sort by rating and experience
    results.sort((a, b) => {
      if (b.stats.averageRating !== a.stats.averageRating) {
        return b.stats.averageRating - a.stats.averageRating;
      }
      return b.professionalInfo.yearsOfExperience - a.professionalInfo.yearsOfExperience;
    });

    return results;
  }

  // Find best mentor matches for a mentee
  findMentorMatches(menteeProfile: any, preferences: any): MentorMatch[] {
    const allMentors = Array.from(this.mentors.values())
      .filter(mentor => mentor.verification.status === 'verified');

    const matches: MentorMatch[] = [];

    allMentors.forEach(mentor => {
      const matchScore = this.calculateMatchScore(mentor, menteeProfile, preferences);
      if (matchScore > 0.3) { // Only include matches with score > 30%
        matches.push({
          mentor,
          matchScore,
          matchReasons: this.getMatchReasons(mentor, menteeProfile),
          compatibility: this.calculateCompatibility(mentor, menteeProfile)
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Calculate match score between mentor and mentee
  private calculateMatchScore(mentor: MentorProfile, menteeProfile: any, preferences: any): number {
    let score = 0;
    let totalWeight = 0;

    // Skills match (40% weight)
    const skillsWeight = 0.4;
    const skillsMatch = this.calculateSkillsMatch(mentor.professionalInfo.skills, menteeProfile.skills || []);
    score += skillsMatch * skillsWeight;
    totalWeight += skillsWeight;

    // Experience level match (20% weight)
    const experienceWeight = 0.2;
    const experienceMatch = this.calculateExperienceMatch(mentor.mentoringInfo.experienceLevel, menteeProfile.experienceLevel);
    score += experienceMatch * experienceWeight;
    totalWeight += experienceWeight;

    // Availability match (20% weight)
    const availabilityWeight = 0.2;
    const availabilityMatch = this.calculateAvailabilityMatch(mentor, preferences);
    score += availabilityMatch * availabilityWeight;
    totalWeight += availabilityWeight;

    // Communication preferences (10% weight)
    const communicationWeight = 0.1;
    const communicationMatch = this.calculateCommunicationMatch(mentor, preferences);
    score += communicationMatch * communicationWeight;
    totalWeight += communicationWeight;

    // Rating bonus (10% weight)
    const ratingWeight = 0.1;
    const ratingMatch = Math.min(mentor.stats.averageRating / 5, 1);
    score += ratingMatch * ratingWeight;
    totalWeight += ratingWeight;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // Calculate skills match percentage
  private calculateSkillsMatch(mentorSkills: string[], menteeSkills: string[]): number {
    if (menteeSkills.length === 0) return 0.5; // Neutral if no mentee skills specified

    const matchingSkills = menteeSkills.filter(skill =>
      mentorSkills.some(mentorSkill =>
        mentorSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(mentorSkill.toLowerCase())
      )
    ).length;

    return matchingSkills / menteeSkills.length;
  }

  // Calculate experience level match
  private calculateExperienceMatch(mentorLevel: string, menteeLevel: string): number {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const mentorIndex = levelOrder.indexOf(mentorLevel);
    const menteeIndex = levelOrder.indexOf(menteeLevel);

    if (mentorIndex === -1 || menteeIndex === -1) return 0.5;

    // Prefer mentors who are 1-2 levels above mentee
    const levelDiff = mentorIndex - menteeIndex;
    if (levelDiff >= 1 && levelDiff <= 2) return 1.0;
    if (levelDiff === 0) return 0.8;
    if (levelDiff === 3) return 0.6;
    return 0.3;
  }

  // Calculate availability match
  private calculateAvailabilityMatch(mentor: MentorProfile, preferences: any): number {
    if (!preferences.availability) return 0.5;

    const { day, time, timezone } = preferences.availability;
    const mentorSlots = mentor.mentoringInfo.availability.timeSlots;

    if (day && time) {
      const matchingSlot = mentorSlots.find(slot =>
        slot.day.toLowerCase() === day.toLowerCase() &&
        this.isTimeOverlapping(slot.startTime, slot.endTime, time)
      );
      return matchingSlot ? 1.0 : 0.2;
    }

    if (day) {
      const hasDaySlot = mentorSlots.some(slot =>
        slot.day.toLowerCase() === day.toLowerCase()
      );
      return hasDaySlot ? 0.8 : 0.3;
    }

    return 0.5;
  }

  // Calculate communication match
  private calculateCommunicationMatch(mentor: MentorProfile, preferences: any): number {
    if (!preferences.communicationPreferences) return 0.5;

    const mentorPrefs = mentor.mentoringInfo.communicationPreferences;
    const menteePrefs = preferences.communicationPreferences;

    const matchingPrefs = menteePrefs.filter((pref: string) =>
      mentorPrefs.includes(pref)
    ).length;

    return menteePrefs.length > 0 ? matchingPrefs / menteePrefs.length : 0.5;
  }

  // Check if time ranges overlap
  private isTimeOverlapping(start1: string, end1: string, time2: string): boolean {
    const time1Start = this.parseTime(start1);
    const time1End = this.parseTime(end1);
    const time2Start = this.parseTime(time2);
    const time2End = time2Start + 60; // Assume 1 hour session

    return time1Start <= time2End && time1End >= time2Start;
  }

  // Parse time string to minutes
  private parseTime(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    
    return totalMinutes;
  }

  // Get match reasons
  private getMatchReasons(mentor: MentorProfile, menteeProfile: any): string[] {
    const reasons: string[] = [];

    // Skills match
    const matchingSkills = (menteeProfile.skills || []).filter((skill: string) =>
      mentor.professionalInfo.skills.some(mentorSkill =>
        mentorSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    if (matchingSkills.length > 0) {
      reasons.push(`Shares expertise in: ${matchingSkills.join(', ')}`);
    }

    // Experience level
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const mentorIndex = levelOrder.indexOf(mentor.mentoringInfo.experienceLevel);
    const menteeIndex = levelOrder.indexOf(menteeProfile.experienceLevel);

    if (mentorIndex > menteeIndex) {
      reasons.push(`Has ${mentor.mentoringInfo.experienceLevel} level experience`);
    }

    // High rating
    if (mentor.stats.averageRating >= 4.5) {
      reasons.push(`Highly rated (${mentor.stats.averageRating.toFixed(1)}/5)`);
    }

    // Years of experience
    if (mentor.professionalInfo.yearsOfExperience >= 5) {
      reasons.push(`${mentor.professionalInfo.yearsOfExperience}+ years experience`);
    }

    // Industry match
    if (menteeProfile.interests && menteeProfile.interests.includes(mentor.professionalInfo.industry)) {
      reasons.push(`Works in ${mentor.professionalInfo.industry} industry`);
    }

    return reasons;
  }

  // Calculate compatibility scores
  private calculateCompatibility(mentor: MentorProfile, menteeProfile: any): any {
    return {
      skills: this.calculateSkillsMatch(mentor.professionalInfo.skills, menteeProfile.skills || []),
      availability: this.calculateAvailabilityMatch(mentor, menteeProfile),
      communication: this.calculateCommunicationMatch(mentor, menteeProfile),
      experience: this.calculateExperienceMatch(mentor.mentoringInfo.experienceLevel, menteeProfile.experienceLevel)
    };
  }

  // Verification workflow
  addToVerificationQueue(mentorId: string, type: string, priority: number): void {
    this.verificationQueue.push({ mentorId, type, priority });
    this.verificationQueue.sort((a, b) => b.priority - a.priority);
  }

  // Process verification queue
  processVerificationQueue(): void {
    const queueItem = this.verificationQueue.shift();
    if (queueItem) {
      this.processVerification(queueItem.mentorId, queueItem.type);
    }
  }

  // Process individual verification
  private processVerification(mentorId: string, type: string): void {
    const mentor = this.mentors.get(mentorId);
    if (!mentor) return;

    // Simulate verification process
    setTimeout(() => {
      const isVerified = Math.random() > 0.1; // 90% success rate
      
      if (isVerified) {
        this.updateMentorProfile(mentorId, {
          verification: {
            ...mentor.verification,
            status: 'verified',
            verificationDate: new Date().toISOString(),
            verifiedBy: 'system'
          }
        });
      } else {
        this.updateMentorProfile(mentorId, {
          verification: {
            ...mentor.verification,
            status: 'rejected'
          }
        });
      }
    }, 2000); // 2 second delay to simulate processing
  }

  // Update mentor stats
  updateMentorStats(mentorId: string, stats: Partial<MentorProfile['stats']>): boolean {
    const mentor = this.mentors.get(mentorId);
    if (!mentor) return false;

    const updatedStats = {
      ...mentor.stats,
      ...stats,
      lastActive: new Date().toISOString()
    };

    return this.updateMentorProfile(mentorId, { stats: updatedStats });
  }

  // Get all mentors
  getAllMentors(): MentorProfile[] {
    return Array.from(this.mentors.values());
  }

  // Get verified mentors only
  getVerifiedMentors(): MentorProfile[] {
    return Array.from(this.mentors.values())
      .filter(mentor => mentor.verification.status === 'verified');
  }

  // Get pending verifications
  getPendingVerifications(): MentorProfile[] {
    return Array.from(this.mentors.values())
      .filter(mentor => mentor.verification.status === 'pending');
  }

  // Delete mentor profile
  deleteMentorProfile(mentorId: string): boolean {
    const deleted = this.mentors.delete(mentorId);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        mentors: Object.fromEntries(this.mentors),
        verificationQueue: this.verificationQueue
      };
      localStorage.setItem('mentor-profiles', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save mentor profiles to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('mentor-profiles');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.mentors) {
        this.mentors = new Map(Object.entries(parsed.mentors));
      }
      
      if (parsed.verificationQueue) {
        this.verificationQueue = parsed.verificationQueue;
      }
    } catch (error) {
      console.error('Failed to load mentor profiles from localStorage:', error);
    }
  }

  // Export mentor data
  exportMentorData(mentorId: string): any {
    const mentor = this.mentors.get(mentorId);
    if (!mentor) return null;

    return {
      ...mentor,
      exportDate: new Date().toISOString()
    };
  }

  // Import mentor data
  importMentorData(data: any): boolean {
    try {
      if (!data.id || !data.userId) return false;

      this.mentors.set(data.id, data);
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import mentor data:', error);
      return false;
    }
  }

  // Get mentor analytics
  getMentorAnalytics(mentorId: string): any {
    const mentor = this.mentors.get(mentorId);
    if (!mentor) return null;

    return {
      profileCompleteness: this.calculateProfileCompleteness(mentor),
      verificationStatus: mentor.verification.status,
      performanceMetrics: {
        averageRating: mentor.stats.averageRating,
        totalSessions: mentor.stats.totalSessions,
        completionRate: mentor.stats.completionRate,
        responseTime: mentor.stats.responseTime
      },
      recommendations: this.getMentorRecommendations(mentor)
    };
  }

  // Calculate profile completeness
  private calculateProfileCompleteness(mentor: MentorProfile): number {
    let completed = 0;
    let total = 0;

    // Personal info (25%)
    const personalFields = ['firstName', 'lastName', 'email', 'location', 'bio'];
    personalFields.forEach(field => {
      total++;
      if (mentor.personalInfo[field as keyof typeof mentor.personalInfo]) {
        completed++;
      }
    });

    // Professional info (35%)
    const professionalFields = ['currentRole', 'company', 'industry', 'yearsOfExperience'];
    professionalFields.forEach(field => {
      total++;
      if (mentor.professionalInfo[field as keyof typeof mentor.professionalInfo]) {
        completed++;
      }
    });

    // Skills and specializations (20%)
    total += 2;
    if (mentor.professionalInfo.skills.length > 0) completed++;
    if (mentor.mentoringInfo.areasOfExpertise.length > 0) completed++;

    // Availability (20%)
    total += 2;
    if (mentor.mentoringInfo.availability.timeSlots.length > 0) completed++;
    if (mentor.mentoringInfo.pricing.hourlyRate > 0) completed++;

    return total > 0 ? (completed / total) * 100 : 0;
  }

  // Get mentor recommendations
  private getMentorRecommendations(mentor: MentorProfile): string[] {
    const recommendations: string[] = [];
    const completeness = this.calculateProfileCompleteness(mentor);

    if (completeness < 80) {
      recommendations.push('Complete your profile to increase visibility');
    }

    if (mentor.stats.totalSessions === 0) {
      recommendations.push('Start accepting mentee requests to build your reputation');
    }

    if (mentor.stats.averageRating < 4.0 && mentor.stats.totalReviews > 0) {
      recommendations.push('Focus on improving session quality to increase ratings');
    }

    if (mentor.mentoringInfo.availability.timeSlots.length < 3) {
      recommendations.push('Add more availability slots to increase booking opportunities');
    }

    if (mentor.professionalInfo.certifications.length === 0) {
      recommendations.push('Add relevant certifications to build credibility');
    }

    return recommendations;
  }
}

// Export singleton instance
export const mentorProfileManager = new MentorProfileManager();
