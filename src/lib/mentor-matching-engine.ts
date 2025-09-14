// AI-Powered Mentor Matching Engine
// Advanced matching algorithms for connecting mentees with the best mentors

export interface MenteeProfile {
  id: string;
  userId: string;
  personalInfo: {
    age: string;
    location: string;
    timezone: string;
    bio: string;
  };
  professionalInfo: {
    currentRole?: string;
    industry?: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    skills: string[];
    goals: string[];
    interests: string[];
  };
  learningPreferences: {
    pace: 'slow' | 'moderate' | 'fast';
    format: 'visual' | 'text' | 'hands-on' | 'mixed';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    duration: 'short' | 'medium' | 'long';
  };
  mentoringNeeds: {
    areasOfFocus: string[];
    sessionTypes: string[];
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed';
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    timeCommitment: number; // hours per week
  };
  communicationStyle: {
    preferredMethods: string[];
    responseTime: 'immediate' | 'within-hours' | 'within-days';
    communicationFrequency: 'high' | 'medium' | 'low';
  };
  personalityTraits?: string[];
  learningHistory?: {
    completedCourses: number;
    projectsBuilt: number;
    skillsMastered: number;
    learningStreak: number;
  };
  conversationHistory?: Array<{
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    timestamp: string;
  }>;
}

export interface MentorProfile {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    location: string;
    timezone: string;
    bio: string;
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
    availability: {
      timeSlots: Array<{
        day: string;
        startTime: string;
        endTime: string;
        timezone: string;
      }>;
      maxSessionsPerWeek: number;
      sessionDuration: number;
    };
    pricing: {
      hourlyRate: number;
      currency: string;
      freeSessions: number;
    };
    languages: string[];
    communicationPreferences: string[];
  };
  stats: {
    totalSessions: number;
    totalHours: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    responseTime: number;
  };
  preferences: {
    menteeTypes: string[];
    sessionTypes: string[];
    maxMentees: number;
  };
}

export interface MatchResult {
  mentor: MentorProfile;
  matchScore: number; // 0-100
  compatibility: {
    skills: number;
    availability: number;
    communication: number;
    experience: number;
    personality: number;
    learning: number;
    budget: number;
    location: number;
  };
  matchReasons: string[];
  potentialChallenges: string[];
  recommendations: {
    sessionFrequency: string;
    sessionDuration: string;
    focusAreas: string[];
    communicationStrategy: string;
  };
  confidence: 'low' | 'medium' | 'high';
}

export interface MatchingCriteria {
  skills: number; // Weight for skills matching
  availability: number; // Weight for availability matching
  communication: number; // Weight for communication style matching
  experience: number; // Weight for experience level matching
  personality: number; // Weight for personality matching
  learning: number; // Weight for learning style matching
  budget: number; // Weight for budget compatibility
  location: number; // Weight for location preference
}

export class MentorMatchingEngine {
  private defaultCriteria: MatchingCriteria = {
    skills: 0.25,
    availability: 0.20,
    communication: 0.15,
    experience: 0.15,
    personality: 0.10,
    learning: 0.10,
    budget: 0.03,
    location: 0.02
  };

  // Main matching function
  findBestMatches(
    mentee: MenteeProfile,
    mentors: MentorProfile[],
    criteria?: Partial<MatchingCriteria>,
    maxResults: number = 10
  ): MatchResult[] {
    const matchingCriteria = { ...this.defaultCriteria, ...criteria };
    const results: MatchResult[] = [];

    mentors.forEach(mentor => {
      const matchScore = this.calculateOverallMatchScore(mentee, mentor, matchingCriteria);
      
      if (matchScore > 0.3) { // Only include matches with score > 30%
        const compatibility = this.calculateCompatibility(mentee, mentor);
        const matchReasons = this.generateMatchReasons(mentee, mentor, compatibility);
        const potentialChallenges = this.identifyPotentialChallenges(mentee, mentor);
        const recommendations = this.generateRecommendations(mentee, mentor, compatibility);
        const confidence = this.calculateConfidence(matchScore, compatibility);

        results.push({
          mentor,
          matchScore: Math.round(matchScore * 100),
          compatibility,
          matchReasons,
          potentialChallenges,
          recommendations,
          confidence
        });
      }
    });

    // Sort by match score and return top results
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  // Calculate overall match score
  private calculateOverallMatchScore(
    mentee: MenteeProfile,
    mentor: MentorProfile,
    criteria: MatchingCriteria
  ): number {
    const compatibility = this.calculateCompatibility(mentee, mentor);
    
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(compatibility).forEach(([key, value]) => {
      const weight = criteria[key as keyof MatchingCriteria] || 0;
      totalScore += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // Calculate detailed compatibility scores
  private calculateCompatibility(mentee: MenteeProfile, mentor: MentorProfile): MatchResult['compatibility'] {
    return {
      skills: this.calculateSkillsCompatibility(mentee, mentor),
      availability: this.calculateAvailabilityCompatibility(mentee, mentor),
      communication: this.calculateCommunicationCompatibility(mentee, mentor),
      experience: this.calculateExperienceCompatibility(mentee, mentor),
      personality: this.calculatePersonalityCompatibility(mentee, mentor),
      learning: this.calculateLearningCompatibility(mentee, mentor),
      budget: this.calculateBudgetCompatibility(mentee, mentor),
      location: this.calculateLocationCompatibility(mentee, mentor)
    };
  }

  // Skills compatibility calculation
  private calculateSkillsCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeSkills = mentee.professionalInfo.skills;
    const mentorSkills = mentor.professionalInfo.skills;
    const mentorSpecializations = mentor.professionalInfo.specializations;
    const mentorExpertise = mentor.mentoringInfo.areasOfExpertise;

    if (menteeSkills.length === 0) return 0.5; // Neutral if no skills specified

    // Direct skills match
    const directMatches = menteeSkills.filter(skill =>
      mentorSkills.some(mentorSkill =>
        this.isSkillMatch(skill, mentorSkill)
      )
    ).length;

    // Specialization match
    const specializationMatches = menteeSkills.filter(skill =>
      mentorSpecializations.some(spec =>
        this.isSkillMatch(skill, spec)
      )
    ).length;

    // Expertise area match
    const expertiseMatches = mentee.professionalInfo.goals.filter(goal =>
      mentorExpertise.some(expertise =>
        this.isSkillMatch(goal, expertise)
      )
    ).length;

    const totalMatches = directMatches + (specializationMatches * 0.8) + (expertiseMatches * 0.6);
    const maxPossibleMatches = menteeSkills.length + mentee.professionalInfo.goals.length;

    return Math.min(totalMatches / maxPossibleMatches, 1);
  }

  // Availability compatibility calculation
  private calculateAvailabilityCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeTimeCommitment = mentee.mentoringNeeds.timeCommitment;
    const mentorMaxSessions = mentor.mentoringInfo.availability.maxSessionsPerWeek;
    const mentorSessionDuration = mentor.mentoringInfo.availability.sessionDuration;

    // Check if mentor can accommodate mentee's time commitment
    const mentorWeeklyHours = mentorMaxSessions * (mentorSessionDuration / 60);
    const timeCompatibility = menteeTimeCommitment <= mentorWeeklyHours ? 1 : 0.5;

    // Check time zone compatibility
    const timezoneCompatibility = this.calculateTimezoneCompatibility(
      mentee.personalInfo.timezone,
      mentor.personalInfo.timezone
    );

    // Check if mentor has availability for mentee's preferred times
    const timeSlotCompatibility = this.calculateTimeSlotCompatibility(mentee, mentor);

    return (timeCompatibility * 0.4 + timezoneCompatibility * 0.3 + timeSlotCompatibility * 0.3);
  }

  // Communication compatibility calculation
  private calculateCommunicationCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeMethods = mentee.communicationStyle.preferredMethods;
    const mentorMethods = mentor.mentoringInfo.communicationPreferences;

    if (menteeMethods.length === 0) return 0.5;

    const methodMatches = menteeMethods.filter(method =>
      mentorMethods.includes(method)
    ).length;

    const methodCompatibility = methodMatches / menteeMethods.length;

    // Response time compatibility
    const responseTimeCompatibility = this.calculateResponseTimeCompatibility(
      mentee.communicationStyle.responseTime,
      mentor.stats.responseTime
    );

    return (methodCompatibility * 0.7 + responseTimeCompatibility * 0.3);
  }

  // Experience compatibility calculation
  private calculateExperienceCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeLevel = mentee.professionalInfo.experienceLevel;
    const mentorLevel = mentor.mentoringInfo.experienceLevel;

    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const menteeIndex = levelOrder.indexOf(menteeLevel);
    const mentorIndex = levelOrder.indexOf(mentorLevel);

    if (menteeIndex === -1 || mentorIndex === -1) return 0.5;

    const levelDiff = mentorIndex - menteeIndex;

    // Ideal: mentor is 1-2 levels above mentee
    if (levelDiff >= 1 && levelDiff <= 2) return 1.0;
    if (levelDiff === 0) return 0.8; // Same level is okay
    if (levelDiff === 3) return 0.6; // Mentor too advanced
    if (levelDiff < 0) return 0.3; // Mentor less experienced

    return 0.5;
  }

  // Personality compatibility calculation
  private calculatePersonalityCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    // This would typically use personality assessment data
    // For now, we'll use a simplified approach based on communication style
    
    const menteeFrequency = mentee.communicationStyle.communicationFrequency;
    const mentorMenteeTypes = mentor.preferences.menteeTypes;

    // Check if mentor prefers mentees with similar communication frequency
    if (mentorMenteeTypes.includes(menteeFrequency)) return 1.0;
    if (mentorMenteeTypes.length === 0) return 0.5; // No preference specified

    return 0.3; // Different communication frequency
  }

  // Learning style compatibility calculation
  private calculateLearningCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeFormat = mentee.learningPreferences.format;
    const mentorSessionTypes = mentor.preferences.sessionTypes;

    // Check if mentor offers sessions compatible with mentee's learning style
    const formatMapping: Record<string, string[]> = {
      'visual': ['video', 'in-person'],
      'text': ['chat', 'email'],
      'hands-on': ['in-person', 'video'],
      'mixed': ['video', 'phone', 'chat', 'in-person']
    };

    const compatibleTypes = formatMapping[menteeFormat] || [];
    const hasCompatibleType = compatibleTypes.some(type => mentorSessionTypes.includes(type));

    return hasCompatibleType ? 1.0 : 0.5;
  }

  // Budget compatibility calculation
  private calculateBudgetCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeBudget = mentee.mentoringNeeds.budget;
    const mentorRate = mentor.mentoringInfo.pricing.hourlyRate;
    const mentorCurrency = mentor.mentoringInfo.pricing.currency;

    // Simple currency conversion (in real app, use proper exchange rates)
    const rateInMenteeCurrency = this.convertCurrency(mentorRate, mentorCurrency, menteeBudget.currency);

    if (rateInMenteeCurrency <= menteeBudget.max && rateInMenteeCurrency >= menteeBudget.min) {
      return 1.0; // Perfect match
    }

    if (rateInMenteeCurrency <= menteeBudget.max * 1.2) {
      return 0.8; // Slightly over budget but acceptable
    }

    if (rateInMenteeCurrency <= menteeBudget.max * 1.5) {
      return 0.5; // Moderately over budget
    }

    return 0.2; // Significantly over budget
  }

  // Location compatibility calculation
  private calculateLocationCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteeLocation = mentee.personalInfo.location.toLowerCase();
    const mentorLocation = mentor.personalInfo.location.toLowerCase();

    // Exact match
    if (menteeLocation === mentorLocation) return 1.0;

    // Same country (simplified check)
    const menteeCountry = menteeLocation.split(',').pop()?.trim();
    const mentorCountry = mentorLocation.split(',').pop()?.trim();

    if (menteeCountry === mentorCountry) return 0.8;

    // Same continent (simplified check)
    const menteeContinent = this.getContinent(menteeCountry || '');
    const mentorContinent = this.getContinent(mentorCountry || '');

    if (menteeContinent === mentorContinent) return 0.6;

    return 0.3; // Different continents
  }

  // Helper methods
  private isSkillMatch(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase();
    const s2 = skill2.toLowerCase();
    
    return s1.includes(s2) || s2.includes(s1) || this.areSimilarSkills(s1, s2);
  }

  private areSimilarSkills(skill1: string, skill2: string): boolean {
    // Define skill synonyms and variations
    const skillGroups = [
      ['javascript', 'js', 'ecmascript'],
      ['react', 'reactjs', 'react.js'],
      ['node', 'nodejs', 'node.js'],
      ['python', 'py'],
      ['machine learning', 'ml', 'ai'],
      ['data science', 'data analysis', 'analytics'],
      ['web development', 'frontend', 'backend', 'full stack'],
      ['mobile development', 'ios', 'android', 'react native', 'flutter']
    ];

    for (const group of skillGroups) {
      if (group.includes(skill1) && group.includes(skill2)) {
        return true;
      }
    }

    return false;
  }

  private calculateTimezoneCompatibility(timezone1: string, timezone2: string): number {
    // Simplified timezone compatibility
    if (timezone1 === timezone2) return 1.0;
    
    const timezoneOffsets: Record<string, number> = {
      'UTC': 0,
      'EST': -5,
      'PST': -8,
      'GMT': 0,
      'CET': 1,
      'JST': 9
    };

    const offset1 = timezoneOffsets[timezone1] || 0;
    const offset2 = timezoneOffsets[timezone2] || 0;
    const hourDiff = Math.abs(offset1 - offset2);

    if (hourDiff <= 2) return 0.9;
    if (hourDiff <= 4) return 0.7;
    if (hourDiff <= 6) return 0.5;
    if (hourDiff <= 8) return 0.3;

    return 0.1;
  }

  private calculateTimeSlotCompatibility(mentee: MenteeProfile, mentor: MentorProfile): number {
    const menteePreferredTime = mentee.learningPreferences.timeOfDay;
    const mentorSlots = mentor.mentoringInfo.availability.timeSlots;

    if (mentorSlots.length === 0) return 0.5;

    const timeMapping: Record<string, string[]> = {
      'morning': ['08:00', '09:00', '10:00', '11:00'],
      'afternoon': ['12:00', '13:00', '14:00', '15:00', '16:00'],
      'evening': ['17:00', '18:00', '19:00', '20:00'],
      'flexible': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    };

    const preferredTimes = timeMapping[menteePreferredTime] || [];
    const hasMatchingSlot = mentorSlots.some(slot =>
      preferredTimes.some(time => slot.startTime.includes(time))
    );

    return hasMatchingSlot ? 1.0 : 0.5;
  }

  private calculateResponseTimeCompatibility(menteeResponseTime: string, mentorResponseTime: number): number {
    const menteeExpectations: Record<string, number> = {
      'immediate': 0.5,
      'within-hours': 4,
      'within-days': 24
    };

    const expectedHours = menteeExpectations[menteeResponseTime] || 24;
    const actualHours = mentorResponseTime;

    if (actualHours <= expectedHours) return 1.0;
    if (actualHours <= expectedHours * 2) return 0.7;
    if (actualHours <= expectedHours * 4) return 0.4;

    return 0.1;
  }

  private convertCurrency(amount: number, from: string, to: string): number {
    // Simplified currency conversion (in real app, use proper exchange rates)
    const rates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110
    };

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    return (amount / fromRate) * toRate;
  }

  private getContinent(country: string): string {
    const continentMap: Record<string, string> = {
      'usa': 'north-america',
      'canada': 'north-america',
      'mexico': 'north-america',
      'uk': 'europe',
      'germany': 'europe',
      'france': 'europe',
      'spain': 'europe',
      'italy': 'europe',
      'china': 'asia',
      'japan': 'asia',
      'india': 'asia',
      'australia': 'oceania'
    };

    return continentMap[country.toLowerCase()] || 'unknown';
  }

  private generateMatchReasons(mentee: MenteeProfile, mentor: MentorProfile, compatibility: MatchResult['compatibility']): string[] {
    const reasons: string[] = [];

    if (compatibility.skills > 0.8) {
      const matchingSkills = mentee.professionalInfo.skills.filter(skill =>
        mentor.professionalInfo.skills.some(mentorSkill => this.isSkillMatch(skill, mentorSkill))
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Shares expertise in: ${matchingSkills.slice(0, 3).join(', ')}`);
      }
    }

    if (compatibility.experience > 0.8) {
      reasons.push(`Perfect experience level match (${mentor.mentoringInfo.experienceLevel})`);
    }

    if (compatibility.availability > 0.8) {
      reasons.push('Excellent availability alignment');
    }

    if (compatibility.communication > 0.8) {
      reasons.push('Compatible communication preferences');
    }

    if (mentor.stats.averageRating >= 4.5) {
      reasons.push(`Highly rated mentor (${mentor.stats.averageRating.toFixed(1)}/5)`);
    }

    if (mentor.professionalInfo.yearsOfExperience >= 10) {
      reasons.push(`${mentor.professionalInfo.yearsOfExperience}+ years of experience`);
    }

    if (mentor.mentoringInfo.pricing.freeSessions > 0) {
      reasons.push(`${mentor.mentoringInfo.pricing.freeSessions} free sessions available`);
    }

    return reasons.slice(0, 5); // Limit to 5 reasons
  }

  private identifyPotentialChallenges(mentee: MenteeProfile, mentor: MentorProfile): string[] {
    const challenges: string[] = [];

    if (mentee.personalInfo.timezone !== mentor.personalInfo.timezone) {
      challenges.push('Different time zones may require flexible scheduling');
    }

    if (mentee.mentoringNeeds.budget.max < mentor.mentoringInfo.pricing.hourlyRate) {
      challenges.push('Mentor rate exceeds your budget');
    }

    if (mentee.communicationStyle.communicationFrequency === 'high' && mentor.stats.responseTime > 24) {
      challenges.push('Mentor may not respond as quickly as you prefer');
    }

    if (mentee.learningPreferences.format === 'hands-on' && !mentor.preferences.sessionTypes.includes('in-person')) {
      challenges.push('Mentor may not offer in-person sessions');
    }

    return challenges;
  }

  private generateRecommendations(mentee: MenteeProfile, mentor: MentorProfile, compatibility: MatchResult['compatibility']): MatchResult['recommendations'] {
    const recommendations: MatchResult['recommendations'] = {
      sessionFrequency: this.recommendSessionFrequency(mentee, mentor),
      sessionDuration: this.recommendSessionDuration(mentee, mentor),
      focusAreas: this.recommendFocusAreas(mentee, mentor),
      communicationStrategy: this.recommendCommunicationStrategy(mentee, mentor)
    };

    return recommendations;
  }

  private recommendSessionFrequency(mentee: MenteeProfile, mentor: MentorProfile): string {
    const menteeFrequency = mentee.mentoringNeeds.frequency;
    const mentorMaxSessions = mentor.mentoringInfo.availability.maxSessionsPerWeek;

    if (menteeFrequency === 'weekly' && mentorMaxSessions >= 1) {
      return 'Weekly sessions recommended';
    } else if (menteeFrequency === 'bi-weekly' && mentorMaxSessions >= 2) {
      return 'Bi-weekly sessions recommended';
    } else if (menteeFrequency === 'monthly') {
      return 'Monthly sessions recommended';
    }

    return 'Flexible scheduling based on availability';
  }

  private recommendSessionDuration(mentee: MenteeProfile, mentor: MentorProfile): string {
    const mentorDuration = mentor.mentoringInfo.availability.sessionDuration;
    const menteeCommitment = mentee.mentoringNeeds.timeCommitment;

    if (mentorDuration >= 60) {
      return '60+ minute sessions for deep discussions';
    } else if (mentorDuration >= 30) {
      return '30-45 minute sessions for focused topics';
    }

    return 'Short sessions for quick check-ins';
  }

  private recommendFocusAreas(mentee: MenteeProfile, mentor: MentorProfile): string[] {
    const menteeGoals = mentee.professionalInfo.goals;
    const mentorExpertise = mentor.mentoringInfo.areasOfExpertise;

    return menteeGoals.filter(goal =>
      mentorExpertise.some(expertise => this.isSkillMatch(goal, expertise))
    ).slice(0, 3);
  }

  private recommendCommunicationStrategy(mentee: MenteeProfile, mentor: MentorProfile): string {
    const menteeMethods = mentee.communicationStyle.preferredMethods;
    const mentorMethods = mentor.mentoringInfo.communicationPreferences;

    const commonMethods = menteeMethods.filter(method => mentorMethods.includes(method));

    if (commonMethods.includes('video')) {
      return 'Use video calls for detailed discussions';
    } else if (commonMethods.includes('phone')) {
      return 'Use phone calls for regular check-ins';
    } else if (commonMethods.includes('chat')) {
      return 'Use chat for quick questions and updates';
    }

    return 'Mix of communication methods based on needs';
  }

  private calculateConfidence(matchScore: number, compatibility: MatchResult['compatibility']): 'low' | 'medium' | 'high' {
    const avgCompatibility = Object.values(compatibility).reduce((sum, score) => sum + score, 0) / Object.values(compatibility).length;
    
    if (matchScore >= 0.8 && avgCompatibility >= 0.8) return 'high';
    if (matchScore >= 0.6 && avgCompatibility >= 0.6) return 'medium';
    return 'low';
  }

  // Public methods for external use
  public updateMatchingCriteria(criteria: Partial<MatchingCriteria>): void {
    this.defaultCriteria = { ...this.defaultCriteria, ...criteria };
  }

  public getMatchingCriteria(): MatchingCriteria {
    return { ...this.defaultCriteria };
  }

  public analyzeMenteeProfile(mentee: MenteeProfile): {
    strengths: string[];
    areasForImprovement: string[];
    recommendedMentorTypes: string[];
  } {
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const recommendedMentorTypes: string[] = [];

    // Analyze skills
    if (mentee.professionalInfo.skills.length >= 5) {
      strengths.push('Strong technical foundation');
    } else {
      areasForImprovement.push('Consider developing more technical skills');
    }

    // Analyze goals
    if (mentee.professionalInfo.goals.length >= 3) {
      strengths.push('Clear career objectives');
    } else {
      areasForImprovement.push('Define more specific career goals');
    }

    // Analyze learning history
    if (mentee.learningHistory) {
      if (mentee.learningHistory.completedCourses >= 5) {
        strengths.push('Consistent learner');
      }
      if (mentee.learningHistory.learningStreak >= 30) {
        strengths.push('Maintains learning momentum');
      }
    }

    // Recommend mentor types based on experience level
    if (mentee.professionalInfo.experienceLevel === 'beginner') {
      recommendedMentorTypes.push('Patient and encouraging mentors');
      recommendedMentorTypes.push('Mentors with teaching experience');
    } else if (mentee.professionalInfo.experienceLevel === 'intermediate') {
      recommendedMentorTypes.push('Industry experts');
      recommendedMentorTypes.push('Mentors with leadership experience');
    } else {
      recommendedMentorTypes.push('Senior executives');
      recommendedMentorTypes.push('Mentors with strategic expertise');
    }

    return {
      strengths,
      areasForImprovement,
      recommendedMentorTypes
    };
  }
}

// Export singleton instance
export const mentorMatchingEngine = new MentorMatchingEngine();
