import aiService from './ai-service.js';

// =====================================================
// AI-POWERED MENTOR MATCHING SERVICE
// =====================================================

class MentorMatchingService {
  constructor() {
    this.matchingWeights = {
      expertise: 0.35,      // 35% - Most important
      experience: 0.20,     // 20% - Experience level match
      rating: 0.15,         // 15% - Mentor quality
      availability: 0.15,   // 15% - Can they meet?
      personality: 0.10,    // 10% - Communication style
      location: 0.05        // 5% - Timezone/location
    };
  }

  // =====================================================
  // MAIN MATCHING ALGORITHM
  // =====================================================

  async findBestMentors(studentProfile, availableMentors, preferences = {}) {
    try {
      // Get AI-powered personality analysis
      const personalityMatch = await this.analyzePersonalityMatch(studentProfile, availableMentors);
      
      // Calculate match scores for each mentor
      const mentorScores = await Promise.all(
        availableMentors.map(async (mentor) => {
          const scores = await this.calculateMatchScores(studentProfile, mentor, preferences, personalityMatch);
          return {
            mentor,
            scores,
            totalScore: this.calculateTotalScore(scores),
            matchReasons: this.generateMatchReasons(scores, mentor)
          };
        })
      );

      // Sort by total score and return top matches
      return mentorScores
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, preferences.limit || 10);
    } catch (error) {
      console.error('Error in mentor matching:', error);
      return this.fallbackMatching(studentProfile, availableMentors, preferences);
    }
  }

  // =====================================================
  // SCORE CALCULATION
  // =====================================================

  async calculateMatchScores(studentProfile, mentor, preferences, personalityMatch) {
    const scores = {};

    // 1. Expertise Match (35%)
    scores.expertise = this.calculateExpertiseScore(studentProfile, mentor, preferences);

    // 2. Experience Level Match (20%)
    scores.experience = this.calculateExperienceScore(studentProfile, mentor, preferences);

    // 3. Rating Score (15%)
    scores.rating = this.calculateRatingScore(mentor);

    // 4. Availability Score (15%)
    scores.availability = this.calculateAvailabilityScore(mentor, preferences);

    // 5. Personality Match (10%)
    scores.personality = personalityMatch[mentor.id] || 0.5;

    // 6. Location/Timezone Score (5%)
    scores.location = this.calculateLocationScore(studentProfile, mentor, preferences);

    return scores;
  }

  calculateExpertiseScore(studentProfile, mentor, preferences) {
    const studentInterests = studentProfile.interests || [];
    const studentSkills = studentProfile.skills || [];
    const preferredExpertise = preferences.preferred_expertise || [];
    
    const mentorExpertise = mentor.expertise_areas || [];
    const mentorSpecializations = mentor.mentor_specializations || [];

    let score = 0;
    let totalChecks = 0;

    // Check direct expertise matches
    if (preferredExpertise.length > 0) {
      const expertiseMatches = preferredExpertise.filter(exp => 
        mentorExpertise.includes(exp)
      ).length;
      score += (expertiseMatches / preferredExpertise.length) * 0.6;
      totalChecks += 0.6;
    }

    // Check skill-based matches
    if (studentSkills.length > 0) {
      const skillMatches = studentSkills.filter(skill => 
        mentorExpertise.some(exp => exp.toLowerCase().includes(skill.toLowerCase()))
      ).length;
      score += (skillMatches / studentSkills.length) * 0.3;
      totalChecks += 0.3;
    }

    // Check interest-based matches
    if (studentInterests.length > 0) {
      const interestMatches = studentInterests.filter(interest => 
        mentorExpertise.some(exp => exp.toLowerCase().includes(interest.toLowerCase()))
      ).length;
      score += (interestMatches / studentInterests.length) * 0.1;
      totalChecks += 0.1;
    }

    return totalChecks > 0 ? score / totalChecks : 0.5;
  }

  calculateExperienceScore(studentProfile, mentor, preferences) {
    const studentLevel = this.determineStudentLevel(studentProfile);
    const mentorLevel = this.determineMentorLevel(mentor);
    const preferredLevel = preferences.preferred_experience_level;

    // Perfect match
    if (mentorLevel === studentLevel || mentorLevel === preferredLevel) {
      return 1.0;
    }

    // Good match (one level difference)
    const levelDifference = Math.abs(this.getLevelNumber(mentorLevel) - this.getLevelNumber(studentLevel));
    if (levelDifference === 1) {
      return 0.8;
    }

    // Acceptable match (two levels difference)
    if (levelDifference === 2) {
      return 0.6;
    }

    // Poor match
    return 0.3;
  }

  calculateRatingScore(mentor) {
    const rating = mentor.rating || 0;
    const totalSessions = mentor.total_sessions || 0;
    
    // Base score from rating
    let score = rating / 5.0;
    
    // Boost for experienced mentors (more sessions = more reliable)
    if (totalSessions > 50) {
      score += 0.1;
    } else if (totalSessions > 20) {
      score += 0.05;
    }
    
    // Boost for verified mentors
    if (mentor.is_verified) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  calculateAvailabilityScore(mentor, preferences) {
    const mentorAvailability = mentor.mentor_availability || [];
    const preferredTimeSlots = preferences.preferred_time_slots || {};
    const studentTimezone = preferences.timezone || 'UTC';

    if (mentorAvailability.length === 0) {
      return 0.3; // Low score if no availability set
    }

    // Check timezone compatibility
    const timezoneMatch = mentor.timezone === studentTimezone ? 1.0 : 0.7;
    
    // Check if mentor has availability in preferred time slots
    let availabilityMatch = 0.5;
    if (Object.keys(preferredTimeSlots).length > 0) {
      const hasPreferredSlots = mentorAvailability.some(slot => {
        const dayName = this.getDayName(slot.day_of_week);
        return preferredTimeSlots[dayName] && preferredTimeSlots[dayName].length > 0;
      });
      availabilityMatch = hasPreferredSlots ? 1.0 : 0.3;
    }

    return (timezoneMatch + availabilityMatch) / 2;
  }

  calculateLocationScore(studentProfile, mentor, preferences) {
    const studentLocation = studentProfile.location || '';
    const mentorCompany = mentor.company || '';
    const studentTimezone = preferences.timezone || 'UTC';
    const mentorTimezone = mentor.timezone || 'UTC';

    let score = 0.5; // Base score

    // Timezone match
    if (studentTimezone === mentorTimezone) {
      score += 0.3;
    }

    // Location match (if both have location info)
    if (studentLocation && mentorCompany) {
      const locationMatch = this.calculateLocationSimilarity(studentLocation, mentorCompany);
      score += locationMatch * 0.2;
    }

    return Math.min(1.0, score);
  }

  // =====================================================
  // AI-POWERED PERSONALITY MATCHING
  // =====================================================

  async analyzePersonalityMatch(studentProfile, mentors) {
    try {
      const studentContext = {
        interests: studentProfile.interests || [],
        skills: studentProfile.skills || [],
        goals: studentProfile.goals || [],
        learning_style: studentProfile.learning_style || 'visual',
        communication_style: studentProfile.communication_style || 'friendly'
      };

      const mentorContexts = mentors.map(mentor => ({
        id: mentor.id,
        bio: mentor.bio || '',
        expertise: mentor.expertise_areas || [],
        experience: mentor.years_of_experience || 0,
        company: mentor.company || '',
        languages: mentor.languages || ['English']
      }));

      const prompt = `Analyze personality compatibility between a student and potential mentors for career coaching.

Student Profile:
- Interests: ${studentContext.interests.join(', ')}
- Skills: ${studentContext.skills.join(', ')}
- Goals: ${studentContext.goals.join(', ')}
- Learning Style: ${studentContext.learning_style}
- Communication Style: ${studentContext.communication_style}

Mentors:
${mentorContexts.map(mentor => `
Mentor ${mentor.id}:
- Bio: ${mentor.bio}
- Expertise: ${mentor.expertise.join(', ')}
- Experience: ${mentor.experience} years
- Company: ${mentor.company}
- Languages: ${mentor.languages.join(', ')}
`).join('\n')}

Rate personality compatibility for each mentor (0.0 to 1.0) based on:
- Communication style alignment
- Teaching approach compatibility
- Industry experience relevance
- Cultural/language compatibility
- Motivational style match

Return JSON format: {"mentor_id": score, ...}`;

      const response = await aiService.generateAIResponse(prompt, [], {});
      
      try {
        const scores = JSON.parse(response);
        return scores;
      } catch (parseError) {
        console.warn('Failed to parse AI personality analysis, using fallback');
        return this.fallbackPersonalityScores(mentors);
      }
    } catch (error) {
      console.error('Error in AI personality analysis:', error);
      return this.fallbackPersonalityScores(mentors);
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  determineStudentLevel(studentProfile) {
    const experience = studentProfile.years_of_experience || 0;
    const education = studentProfile.education_level || '';
    
    if (experience >= 5 || education.includes('Master') || education.includes('PhD')) {
      return 'senior';
    } else if (experience >= 2 || education.includes('Bachelor')) {
      return 'mid';
    } else {
      return 'junior';
    }
  }

  determineMentorLevel(mentor) {
    const experience = mentor.years_of_experience || 0;
    
    if (experience >= 10) return 'senior';
    if (experience >= 5) return 'mid';
    return 'junior';
  }

  getLevelNumber(level) {
    const levels = { 'junior': 1, 'mid': 2, 'senior': 3 };
    return levels[level] || 2;
  }

  getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Monday';
  }

  calculateLocationSimilarity(location1, location2) {
    const loc1 = location1.toLowerCase();
    const loc2 = location2.toLowerCase();
    
    // Check for city matches
    if (loc1.includes(loc2) || loc2.includes(loc1)) {
      return 1.0;
    }
    
    // Check for country/region matches
    const commonRegions = ['north america', 'europe', 'asia', 'africa', 'south america'];
    const region1 = commonRegions.find(region => loc1.includes(region));
    const region2 = commonRegions.find(region => loc2.includes(region));
    
    if (region1 && region2 && region1 === region2) {
      return 0.7;
    }
    
    return 0.3;
  }

  calculateTotalScore(scores) {
    let totalScore = 0;
    for (const [category, score] of Object.entries(scores)) {
      totalScore += score * (this.matchingWeights[category] || 0);
    }
    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  generateMatchReasons(scores, mentor) {
    const reasons = [];
    
    if (scores.expertise > 0.8) {
      reasons.push(`Strong expertise match in ${mentor.expertise_areas?.slice(0, 2).join(' and ')}`);
    }
    
    if (scores.experience > 0.8) {
      reasons.push(`Perfect experience level match (${mentor.years_of_experience} years)`);
    }
    
    if (scores.rating > 0.8) {
      reasons.push(`Highly rated mentor (${mentor.rating}/5 stars)`);
    }
    
    if (scores.availability > 0.8) {
      reasons.push('Excellent availability match');
    }
    
    if (scores.personality > 0.8) {
      reasons.push('Great personality compatibility');
    }
    
    if (mentor.is_verified) {
      reasons.push('Verified mentor credentials');
    }
    
    return reasons.slice(0, 3); // Return top 3 reasons
  }

  // =====================================================
  // FALLBACK METHODS
  // =====================================================

  fallbackMatching(studentProfile, availableMentors, preferences) {
    return availableMentors
      .map(mentor => ({
        mentor,
        scores: {
          expertise: 0.7,
          experience: 0.7,
          rating: (mentor.rating || 0) / 5.0,
          availability: 0.8,
          personality: 0.6,
          location: 0.5
        },
        totalScore: 0.7,
        matchReasons: ['Fallback matching algorithm']
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, preferences.limit || 10);
  }

  fallbackPersonalityScores(mentors) {
    const scores = {};
    mentors.forEach(mentor => {
      scores[mentor.id] = 0.6 + Math.random() * 0.3; // Random score between 0.6-0.9
    });
    return scores;
  }
}

export default new MentorMatchingService();
