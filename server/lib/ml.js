// Simple ML algorithms for matching and recommendations
// In a production environment, these would be more sophisticated

/**
 * Calculate skill match score between user and job/mentor
 * @param {Array} userSkills - User's skills with levels
 * @param {Array} requiredSkills - Required skills for job/mentor
 * @returns {number} Match score (0-100)
 */
export function calculateSkillMatch(userSkills, requiredSkills) {
  if (!userSkills || !requiredSkills || requiredSkills.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let matchedSkills = 0;

  requiredSkills.forEach(requiredSkill => {
    const userSkill = userSkills.find(skill => 
      skill.name.toLowerCase() === requiredSkill.toLowerCase()
    );
    
    if (userSkill) {
      // Calculate score based on skill level (assuming 1-10 scale)
      const skillScore = Math.min(userSkill.level * 10, 100);
      totalScore += skillScore;
      matchedSkills++;
    }
  });

  if (matchedSkills === 0) return 0;
  
  // Return average score, weighted by match percentage
  const matchPercentage = matchedSkills / requiredSkills.length;
  return Math.round((totalScore / matchedSkills) * matchPercentage);
}

/**
 * Calculate interest match score
 * @param {Array} userInterests - User's interests with intensity
 * @param {Array} domainInterests - Domain/role interests
 * @returns {number} Match score (0-100)
 */
export function calculateInterestMatch(userInterests, domainInterests) {
  if (!userInterests || !domainInterests || domainInterests.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let matchedInterests = 0;

  domainInterests.forEach(domainInterest => {
    const userInterest = userInterests.find(interest => 
      interest.name.toLowerCase() === domainInterest.toLowerCase()
    );
    
    if (userInterest) {
      // Use intensity as score (assuming 0-100 scale)
      totalScore += userInterest.intensity;
      matchedInterests++;
    }
  });

  if (matchedInterests === 0) return 0;
  
  return Math.round(totalScore / matchedInterests);
}

/**
 * Calculate overall match score for job recommendations
 * @param {Object} userProfile - User's complete profile
 * @param {Object} job - Job details
 * @returns {number} Overall match score (0-100)
 */
export function calculateJobMatch(userProfile, job) {
  const weights = {
    skills: 0.4,      // 40% weight on skills
    interests: 0.3,   // 30% weight on interests
    experience: 0.2,  // 20% weight on experience level
    location: 0.1     // 10% weight on location preference
  };

  let totalScore = 0;

  // Skills match
  const skillScore = calculateSkillMatch(userProfile.skills, job.skills);
  totalScore += skillScore * weights.skills;

  // Interests match
  const interestScore = calculateInterestMatch(userProfile.interests, [job.domain]);
  totalScore += interestScore * weights.interests;

  // Experience level match
  const experienceScore = calculateExperienceMatch(userProfile.experienceLevel, job.experience);
  totalScore += experienceScore * weights.experience;

  // Location match
  const locationScore = calculateLocationMatch(userProfile.preferredLocations, job.location);
  totalScore += locationScore * weights.location;

  return Math.round(totalScore);
}

/**
 * Calculate experience level match
 * @param {string} userExperience - User's experience level
 * @param {string} requiredExperience - Required experience level
 * @returns {number} Match score (0-100)
 */
function calculateExperienceMatch(userExperience, requiredExperience) {
  const levels = {
    'entry': 1,
    'mid': 2,
    'senior': 3,
    'lead': 4
  };

  const userLevel = levels[userExperience] || 1;
  const requiredLevel = levels[requiredExperience] || 1;

  if (userLevel >= requiredLevel) {
    return 100; // Perfect match or overqualified
  } else {
    // Partial match based on how close they are
    return Math.round((userLevel / requiredLevel) * 100);
  }
}

/**
 * Calculate location match
 * @param {Array} preferredLocations - User's preferred locations
 * @param {string} jobLocation - Job location
 * @returns {number} Match score (0-100)
 */
function calculateLocationMatch(preferredLocations, jobLocation) {
  if (!preferredLocations || preferredLocations.length === 0) {
    return 50; // Neutral score if no preference
  }

  // Check for exact match
  if (preferredLocations.includes(jobLocation)) {
    return 100;
  }

  // Check for remote work preference
  if (jobLocation.toLowerCase().includes('remote') && 
      preferredLocations.some(loc => loc.toLowerCase().includes('remote'))) {
    return 100;
  }

  // Check for city/state match
  const jobCity = jobLocation.split(',')[0].trim().toLowerCase();
  const hasCityMatch = preferredLocations.some(loc => 
    loc.toLowerCase().includes(jobCity)
  );

  if (hasCityMatch) {
    return 80;
  }

  return 20; // Low score for no match
}

/**
 * Generate personalized recommendations
 * @param {Object} userProfile - User's profile
 * @param {Array} items - Items to recommend (jobs, mentors, etc.)
 * @param {string} type - Type of recommendation ('job', 'mentor', 'capsule')
 * @returns {Array} Sorted recommendations with scores
 */
export function generateRecommendations(userProfile, items, type = 'job') {
  if (!userProfile || !items || items.length === 0) {
    return [];
  }

  const recommendations = items.map(item => {
    let score = 0;

    switch (type) {
      case 'job':
        score = calculateJobMatch(userProfile, item);
        break;
      case 'mentor':
        score = calculateMentorMatch(userProfile, item);
        break;
      case 'capsule':
        score = calculateCapsuleMatch(userProfile, item);
        break;
      default:
        score = 50; // Default neutral score
    }

    return {
      ...item,
      matchScore: score,
      reasons: generateMatchReasons(userProfile, item, type)
    };
  });

  // Sort by match score (highest first)
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate mentor match score
 * @param {Object} userProfile - User's profile
 * @param {Object} mentor - Mentor details
 * @returns {number} Match score (0-100)
 */
function calculateMentorMatch(userProfile, mentor) {
  const weights = {
    skills: 0.3,
    interests: 0.3,
    experience: 0.2,
    availability: 0.1,
    rating: 0.1
  };

  let totalScore = 0;

  // Skills match
  const skillScore = calculateSkillMatch(userProfile.skills, mentor.skills);
  totalScore += skillScore * weights.skills;

  // Interests match
  const interestScore = calculateInterestMatch(userProfile.interests, mentor.domains);
  totalScore += interestScore * weights.interests;

  // Experience level match (mentor should be more experienced)
  const experienceScore = mentor.experienceLevel >= userProfile.experienceLevel ? 100 : 50;
  totalScore += experienceScore * weights.experience;

  // Availability match
  const availabilityScore = mentor.availability ? 100 : 0;
  totalScore += availabilityScore * weights.availability;

  // Rating match
  const ratingScore = (mentor.rating / 5) * 100; // Assuming 5-star rating
  totalScore += ratingScore * weights.rating;

  return Math.round(totalScore);
}

/**
 * Calculate capsule match score
 * @param {Object} userProfile - User's profile
 * @param {Object} capsule - Capsule details
 * @returns {number} Match score (0-100)
 */
function calculateCapsuleMatch(userProfile, capsule) {
  const weights = {
    skills: 0.4,
    interests: 0.3,
    difficulty: 0.2,
    rating: 0.1
  };

  let totalScore = 0;

  // Skills match
  const skillScore = calculateSkillMatch(userProfile.skills, capsule.skills);
  totalScore += skillScore * weights.skills;

  // Interests match
  const interestScore = calculateInterestMatch(userProfile.interests, [capsule.category]);
  totalScore += interestScore * weights.interests;

  // Difficulty match (should match user's current level)
  const difficultyScore = calculateDifficultyMatch(userProfile.experienceLevel, capsule.difficulty);
  totalScore += difficultyScore * weights.difficulty;

  // Rating match
  const ratingScore = (capsule.rating / 5) * 100;
  totalScore += ratingScore * weights.rating;

  return Math.round(totalScore);
}

/**
 * Calculate difficulty match
 * @param {string} userLevel - User's experience level
 * @param {string} capsuleDifficulty - Capsule difficulty
 * @returns {number} Match score (0-100)
 */
function calculateDifficultyMatch(userLevel, capsuleDifficulty) {
  const levelMap = {
    'entry': 'beginner',
    'mid': 'intermediate',
    'senior': 'advanced',
    'lead': 'advanced'
  };

  const userDifficulty = levelMap[userLevel] || 'beginner';

  if (userDifficulty === capsuleDifficulty) {
    return 100; // Perfect match
  } else if (
    (userDifficulty === 'beginner' && capsuleDifficulty === 'intermediate') ||
    (userDifficulty === 'intermediate' && capsuleDifficulty === 'advanced')
  ) {
    return 80; // Slightly challenging but manageable
  } else if (
    (userDifficulty === 'intermediate' && capsuleDifficulty === 'beginner') ||
    (userDifficulty === 'advanced' && capsuleDifficulty === 'intermediate')
  ) {
    return 60; // Might be too easy
  } else {
    return 40; // Poor match
  }
}

/**
 * Generate match reasons for transparency
 * @param {Object} userProfile - User's profile
 * @param {Object} item - Item being matched
 * @param {string} type - Type of item
 * @returns {Array} Array of match reasons
 */
function generateMatchReasons(userProfile, item, type) {
  const reasons = [];

  switch (type) {
    case 'job':
      // Check skill matches
      const matchedSkills = item.skills.filter(skill => 
        userProfile.skills?.some(userSkill => 
          userSkill.name.toLowerCase() === skill.toLowerCase()
        )
      );
      if (matchedSkills.length > 0) {
        reasons.push(`Matches ${matchedSkills.length} of your skills: ${matchedSkills.join(', ')}`);
      }

      // Check interest match
      if (userProfile.interests?.some(interest => 
        interest.name.toLowerCase() === item.domain.toLowerCase()
      )) {
        reasons.push(`Aligns with your interest in ${item.domain}`);
      }

      // Check experience level
      if (item.experience === userProfile.experienceLevel) {
        reasons.push(`Perfect experience level match`);
      }
      break;

    case 'mentor':
      if (item.rating >= 4.5) {
        reasons.push(`Highly rated mentor (${item.rating}/5 stars)`);
      }
      if (item.domains?.some(domain => 
        userProfile.interests?.some(interest => 
          interest.name.toLowerCase() === domain.toLowerCase()
        )
      )) {
        reasons.push(`Expert in your areas of interest`);
      }
      break;

    case 'capsule':
      if (item.rating >= 4.5) {
        reasons.push(`Highly rated content (${item.rating}/5 stars)`);
      }
      if (item.difficulty === 'beginner' && userProfile.experienceLevel === 'entry') {
        reasons.push(`Perfect for your current level`);
      }
      break;
  }

  return reasons;
}

/**
 * Calculate SelfGraph evolution score
 * @param {Object} currentSnapshot - Current SelfGraph snapshot
 * @param {Object} previousSnapshot - Previous SelfGraph snapshot
 * @returns {Object} Evolution metrics
 */
export function calculateSelfGraphEvolution(currentSnapshot, previousSnapshot) {
  if (!currentSnapshot || !previousSnapshot) {
    return { growth: 0, changes: [] };
  }

  const changes = [];
  let totalGrowth = 0;
  let metricCount = 0;

  // Compare key metrics
  const metrics = ['confidence', 'energy', 'decisionMaking', 'collaboration', 'learning', 'creativity'];
  
  metrics.forEach(metric => {
    if (currentSnapshot[metric] !== undefined && previousSnapshot[metric] !== undefined) {
      const change = currentSnapshot[metric] - previousSnapshot[metric];
      totalGrowth += change;
      metricCount++;
      
      if (Math.abs(change) > 5) { // Significant change
        changes.push({
          metric,
          change: change > 0 ? 'increased' : 'decreased',
          value: Math.abs(change),
          current: currentSnapshot[metric],
          previous: previousSnapshot[metric]
        });
      }
    }
  });

  const averageGrowth = metricCount > 0 ? totalGrowth / metricCount : 0;

  return {
    growth: Math.round(averageGrowth),
    changes,
    overallTrend: averageGrowth > 0 ? 'positive' : averageGrowth < 0 ? 'negative' : 'stable'
  };
}

export default {
  calculateSkillMatch,
  calculateInterestMatch,
  calculateJobMatch,
  generateRecommendations,
  calculateSelfGraphEvolution
};





