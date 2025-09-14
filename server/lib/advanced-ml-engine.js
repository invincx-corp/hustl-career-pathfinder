// Advanced ML Engine for Intelligent Data Curation and Personalization
// This system processes API data through sophisticated ML algorithms

import { calculateSkillMatch, calculateInterestMatch } from './ml.js';

class AdvancedMLEngine {
  constructor() {
    this.userProfiles = new Map();
    this.contentQualityScores = new Map();
    this.learningPatterns = new Map();
    this.recommendationWeights = new Map();
    
    // ML Model parameters
    this.models = {
      contentQuality: this.initializeContentQualityModel(),
      personalization: this.initializePersonalizationModel(),
      learningAdaptation: this.initializeLearningAdaptationModel(),
      careerMatching: this.initializeCareerMatchingModel()
    };
  }

  // ========================================
  // CONTENT QUALITY SCORING ALGORITHM
  // ========================================
  
  initializeContentQualityModel() {
    return {
      // Weighted factors for content quality assessment
      factors: {
        relevance: 0.25,        // How relevant to user's goals
        credibility: 0.20,      // Source credibility and accuracy
        freshness: 0.15,        // How recent/up-to-date
        completeness: 0.15,     // How comprehensive the content is
        engagement: 0.10,       // User engagement metrics
        difficulty: 0.10,       // Appropriate difficulty level
        accessibility: 0.05     // How accessible the content is
      },
      
      // Platform credibility scores (0-1)
      platformCredibility: {
        'Coursera': 0.95,
        'edX': 0.93,
        'Udemy': 0.85,
        'YouTube': 0.70,
        'Medium': 0.75,
        'GitHub': 0.90,
        'Stack Overflow': 0.88,
        'Google Scholar': 0.95,
        'Khan Academy': 0.90,
        'freeCodeCamp': 0.85,
        'TED': 0.90,
        'MIT OpenCourseWare': 0.98,
        'Harvard Online': 0.97,
        'Stanford Online': 0.96
      },
      
      // Content type quality weights
      contentTypeWeights: {
        'course': 0.9,
        'tutorial': 0.8,
        'video': 0.7,
        'article': 0.6,
        'book': 0.85,
        'research': 0.9,
        'documentation': 0.8,
        'project': 0.75
      }
    };
  }

  /**
   * Calculate comprehensive quality score for content
   * @param {Object} content - Content item from API
   * @param {Object} userProfile - User's profile and preferences
   * @returns {Object} Quality analysis with score and breakdown
   */
  calculateContentQuality(content, userProfile) {
    const model = this.models.contentQuality;
    let totalScore = 0;
    const breakdown = {};

    // 1. Relevance Score (0-100)
    const relevanceScore = this.calculateRelevanceScore(content, userProfile);
    totalScore += relevanceScore * model.factors.relevance;
    breakdown.relevance = relevanceScore;

    // 2. Credibility Score (0-100)
    const credibilityScore = this.calculateCredibilityScore(content, model);
    totalScore += credibilityScore * model.factors.credibility;
    breakdown.credibility = credibilityScore;

    // 3. Freshness Score (0-100)
    const freshnessScore = this.calculateFreshnessScore(content);
    totalScore += freshnessScore * model.factors.freshness;
    breakdown.freshness = freshnessScore;

    // 4. Completeness Score (0-100)
    const completenessScore = this.calculateCompletenessScore(content);
    totalScore += completenessScore * model.factors.completeness;
    breakdown.completeness = completenessScore;

    // 5. Engagement Score (0-100)
    const engagementScore = this.calculateEngagementScore(content);
    totalScore += engagementScore * model.factors.engagement;
    breakdown.engagement = engagementScore;

    // 6. Difficulty Appropriateness (0-100)
    const difficultyScore = this.calculateDifficultyScore(content, userProfile);
    totalScore += difficultyScore * model.factors.difficulty;
    breakdown.difficulty = difficultyScore;

    // 7. Accessibility Score (0-100)
    const accessibilityScore = this.calculateAccessibilityScore(content);
    totalScore += accessibilityScore * model.factors.accessibility;
    breakdown.accessibility = accessibilityScore;

    const finalScore = Math.round(totalScore);
    
    return {
      score: finalScore,
      grade: this.getQualityGrade(finalScore),
      breakdown,
      recommendations: this.generateQualityRecommendations(breakdown)
    };
  }

  calculateRelevanceScore(content, userProfile) {
    let score = 0;
    const title = (content.title || '').toLowerCase();
    const description = (content.description || '').toLowerCase();
    
    // User interests matching
    const userInterests = userProfile.interests || [];
    const interestMatches = userInterests.filter(interest => 
      title.includes(interest.toLowerCase()) || 
      description.includes(interest.toLowerCase())
    ).length;
    score += (interestMatches / userInterests.length) * 40;

    // User skills matching
    const userSkills = userProfile.skills || [];
    const skillMatches = userSkills.filter(skill => 
      title.includes(skill.toLowerCase()) || 
      description.includes(skill.toLowerCase())
    ).length;
    score += (skillMatches / Math.max(userSkills.length, 1)) * 30;

    // Career goals matching
    const userGoals = userProfile.goals || [];
    const goalMatches = userGoals.filter(goal => 
      title.includes(goal.toLowerCase()) || 
      description.includes(goal.toLowerCase())
    ).length;
    score += (goalMatches / Math.max(userGoals.length, 1)) * 20;

    // Domain matching
    if (userProfile.selected_domains) {
      const domainMatches = userProfile.selected_domains.filter(domain => 
        title.includes(domain.toLowerCase()) || 
        description.includes(domain.toLowerCase())
      ).length;
      score += (domainMatches / userProfile.selected_domains.length) * 10;
    }

    return Math.min(score, 100);
  }

  calculateCredibilityScore(content, model) {
    let score = 0;
    
    // Platform credibility
    const platform = content.platform || content.provider || 'Unknown';
    score += (model.platformCredibility[platform] || 0.5) * 40;

    // Content type credibility
    const contentType = content.type || 'article';
    score += (model.contentTypeWeights[contentType] || 0.5) * 30;

    // Author/creator credibility (if available)
    if (content.author || content.instructor) {
      score += 20; // Bonus for having author info
    }

    // Rating credibility
    if (content.rating && content.rating > 0) {
      score += Math.min(content.rating * 4, 20); // Convert 5-star to 20 points
    }

    // Review count credibility
    if (content.reviewCount && content.reviewCount > 10) {
      score += Math.min(content.reviewCount / 10, 10); // Up to 10 points for reviews
    }

    return Math.min(score, 100);
  }

  calculateFreshnessScore(content) {
    let score = 50; // Default neutral score
    
    // Check for publication date
    if (content.publishedAt || content.publishedDate) {
      const publishedDate = new Date(content.publishedAt || content.publishedDate);
      const now = new Date();
      const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 30) score = 100;      // Very fresh
      else if (daysDiff < 90) score = 90;  // Fresh
      else if (daysDiff < 365) score = 70; // Recent
      else if (daysDiff < 730) score = 50; // Somewhat old
      else score = 30;                     // Old
    }

    // Check for "updated" indicators in title/description
    const title = (content.title || '').toLowerCase();
    const description = (content.description || '').toLowerCase();
    
    if (title.includes('2024') || title.includes('2023') || 
        description.includes('updated') || description.includes('latest')) {
      score = Math.min(score + 20, 100);
    }

    return score;
  }

  calculateCompletenessScore(content) {
    let score = 0;
    
    // Required fields presence
    const requiredFields = ['title', 'description', 'url'];
    const presentFields = requiredFields.filter(field => content[field]).length;
    score += (presentFields / requiredFields.length) * 30;

    // Content length indicators
    const titleLength = (content.title || '').length;
    const descriptionLength = (content.description || '').length;
    
    if (titleLength > 20) score += 10;
    if (descriptionLength > 100) score += 20;
    if (descriptionLength > 500) score += 10;

    // Additional metadata
    if (content.duration) score += 10;
    if (content.difficulty) score += 10;
    if (content.skills || content.tags) score += 10;

    return Math.min(score, 100);
  }

  calculateEngagementScore(content) {
    let score = 50; // Default neutral
    
    // Rating-based engagement
    if (content.rating && content.rating > 0) {
      score += (content.rating - 2.5) * 20; // Convert rating to score
    }

    // View count engagement (if available)
    if (content.viewCount) {
      const views = parseInt(content.viewCount);
      if (views > 10000) score += 20;
      else if (views > 1000) score += 10;
    }

    // Social proof indicators
    const title = (content.title || '').toLowerCase();
    const description = (content.description || '').toLowerCase();
    
    if (title.includes('popular') || title.includes('trending') || 
        description.includes('recommended') || description.includes('best')) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  calculateDifficultyScore(content, userProfile) {
    const userLevel = userProfile.experience_level || 'beginner';
    const contentDifficulty = content.difficulty || 'intermediate';
    
    const levelMap = {
      'entry': 1,
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    const userLevelNum = levelMap[userLevel] || 1;
    const contentLevelNum = levelMap[contentDifficulty] || 2;

    // Perfect match gets 100, close match gets 80, etc.
    const levelDiff = Math.abs(userLevelNum - contentLevelNum);
    if (levelDiff === 0) return 100;
    if (levelDiff === 1) return 80;
    if (levelDiff === 2) return 60;
    return 40;
  }

  calculateAccessibilityScore(content) {
    let score = 50; // Default neutral
    
    // Free content gets higher accessibility
    if (content.cost === 'free' || content.cost === 0) {
      score += 30;
    } else if (content.cost === 'paid') {
      score += 10;
    }

    // Language accessibility
    if (content.language === 'en' || !content.language) {
      score += 10; // English content
    }

    // Platform accessibility
    const platform = content.platform || '';
    if (platform.includes('YouTube') || platform.includes('Khan') || 
        platform.includes('freeCodeCamp')) {
      score += 10; // Highly accessible platforms
    }

    return Math.min(score, 100);
  }

  getQualityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  }

  generateQualityRecommendations(breakdown) {
    const recommendations = [];
    
    if (breakdown.relevance < 60) {
      recommendations.push('Content may not be highly relevant to your interests');
    }
    if (breakdown.credibility < 60) {
      recommendations.push('Consider verifying the source credibility');
    }
    if (breakdown.freshness < 50) {
      recommendations.push('Content may be outdated - look for newer resources');
    }
    if (breakdown.completeness < 60) {
      recommendations.push('Content may lack comprehensive information');
    }
    if (breakdown.difficulty < 60) {
      recommendations.push('Difficulty level may not match your current skills');
    }

    return recommendations;
  }

  // ========================================
  // PERSONALIZATION ENGINE
  // ========================================

  initializePersonalizationModel() {
    return {
      // Learning style preferences
      learningStyles: {
        visual: { weight: 0.3, indicators: ['video', 'infographic', 'diagram'] },
        auditory: { weight: 0.2, indicators: ['podcast', 'audio', 'lecture'] },
        kinesthetic: { weight: 0.3, indicators: ['hands-on', 'project', 'exercise'] },
        reading: { weight: 0.2, indicators: ['article', 'book', 'documentation'] }
      },
      
      // Content format preferences
      contentFormats: {
        'video': 0.9,
        'course': 0.8,
        'tutorial': 0.7,
        'article': 0.6,
        'book': 0.7,
        'project': 0.8,
        'documentation': 0.5
      },
      
      // Time-based preferences
      timePreferences: {
        short: { maxDuration: 30, weight: 0.4 },
        medium: { maxDuration: 120, weight: 0.4 },
        long: { maxDuration: 480, weight: 0.2 }
      }
    };
  }

  /**
   * Generate personalized content recommendations
   * @param {Array} contentList - List of content from APIs
   * @param {Object} userProfile - User's profile and preferences
   * @returns {Array} Personalized and ranked content recommendations
   */
  generatePersonalizedRecommendations(contentList, userProfile) {
    const model = this.models.personalization;
    
    return contentList.map(content => {
      // Calculate quality score
      const qualityAnalysis = this.calculateContentQuality(content, userProfile);
      
      // Calculate personalization score
      const personalizationScore = this.calculatePersonalizationScore(content, userProfile, model);
      
      // Calculate learning path alignment
      const pathAlignment = this.calculateLearningPathAlignment(content, userProfile);
      
      // Calculate final recommendation score
      const finalScore = this.calculateFinalRecommendationScore(
        qualityAnalysis.score,
        personalizationScore,
        pathAlignment,
        userProfile
      );

      return {
        ...content,
        qualityAnalysis,
        personalizationScore,
        pathAlignment,
        finalScore,
        recommendationReasons: this.generateRecommendationReasons(
          qualityAnalysis,
          personalizationScore,
          pathAlignment,
          content,
          userProfile
        )
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 20); // Return top 20 recommendations
  }

  calculatePersonalizationScore(content, userProfile, model) {
    let score = 0;
    
    // Learning style matching
    const userLearningStyle = userProfile.learning_style || 'visual';
    const styleConfig = model.learningStyles[userLearningStyle];
    
    if (styleConfig) {
      const styleMatch = styleConfig.indicators.some(indicator => 
        (content.title || '').toLowerCase().includes(indicator) ||
        (content.description || '').toLowerCase().includes(indicator) ||
        (content.type || '').toLowerCase().includes(indicator)
      );
      
      if (styleMatch) {
        score += styleConfig.weight * 40;
      }
    }

    // Content format preference
    const contentType = content.type || 'article';
    const formatPreference = model.contentFormats[contentType] || 0.5;
    score += formatPreference * 30;

    // Time preference matching
    const duration = this.parseDuration(content.duration);
    if (duration) {
      const timePref = this.getTimePreference(duration, model.timePreferences);
      score += timePref * 20;
    }

    // Platform preference
    const platform = content.platform || '';
    const userPlatforms = userProfile.preferred_platforms || [];
    if (userPlatforms.includes(platform)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  calculateLearningPathAlignment(content, userProfile) {
    let score = 0;
    
    // Check if content aligns with user's selected roadmaps
    const userRoadmaps = userProfile.selected_roadmaps || [];
    const roadmapSkills = userRoadmaps.flatMap(roadmap => roadmap.skills || []);
    
    if (roadmapSkills.length > 0) {
      const skillMatches = roadmapSkills.filter(skill => 
        (content.title || '').toLowerCase().includes(skill.toLowerCase()) ||
        (content.description || '').toLowerCase().includes(skill.toLowerCase()) ||
        (content.skills || []).some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      ).length;
      
      score += (skillMatches / roadmapSkills.length) * 50;
    }

    // Check if content matches user's current learning goals
    const userGoals = userProfile.goals || [];
    const goalMatches = userGoals.filter(goal => 
      (content.title || '').toLowerCase().includes(goal.toLowerCase()) ||
      (content.description || '').toLowerCase().includes(goal.toLowerCase())
    ).length;
    
    score += (goalMatches / Math.max(userGoals.length, 1)) * 30;

    // Check difficulty progression
    const userProgress = userProfile.learning_progress || {};
    const currentLevel = userProgress.current_level || 'beginner';
    const contentDifficulty = content.difficulty || 'intermediate';
    
    if (this.isAppropriateDifficultyProgression(currentLevel, contentDifficulty)) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  calculateFinalRecommendationScore(qualityScore, personalizationScore, pathAlignment, userProfile) {
    // Weighted combination of all scores
    const weights = {
      quality: 0.4,
      personalization: 0.35,
      pathAlignment: 0.25
    };

    return Math.round(
      qualityScore * weights.quality +
      personalizationScore * weights.personalization +
      pathAlignment * weights.pathAlignment
    );
  }

  generateRecommendationReasons(qualityAnalysis, personalizationScore, pathAlignment, content, userProfile) {
    const reasons = [];
    
    if (qualityAnalysis.score >= 80) {
      reasons.push(`High quality content (${qualityAnalysis.grade} grade)`);
    }
    
    if (personalizationScore >= 70) {
      reasons.push('Matches your learning preferences');
    }
    
    if (pathAlignment >= 70) {
      reasons.push('Aligns with your learning path');
    }
    
    if (content.rating && content.rating >= 4.5) {
      reasons.push(`Highly rated (${content.rating}/5 stars)`);
    }
    
    if (content.cost === 'free') {
      reasons.push('Free to access');
    }
    
    if (content.platform && userProfile.preferred_platforms?.includes(content.platform)) {
      reasons.push(`From your preferred platform (${content.platform})`);
    }

    return reasons;
  }

  // ========================================
  // LEARNING ADAPTATION ALGORITHM
  // ========================================

  initializeLearningAdaptationModel() {
    return {
      // Learning pattern analysis
      patternWeights: {
        completionRate: 0.3,
        timeSpent: 0.25,
        difficultyProgression: 0.2,
        engagementLevel: 0.15,
        feedbackQuality: 0.1
      },
      
      // Adaptation triggers
      adaptationTriggers: {
        lowCompletionRate: 0.3,
        highDifficultyStruggle: 0.7,
        fastProgression: 0.8,
        lowEngagement: 0.4
      }
    };
  }

  /**
   * Analyze user learning patterns and adapt recommendations
   * @param {Object} userProfile - User's profile
   * @param {Array} learningHistory - User's learning history
   * @returns {Object} Adaptation recommendations
   */
  analyzeLearningPatterns(userProfile, learningHistory) {
    const model = this.models.learningAdaptation;
    const patterns = this.extractLearningPatterns(learningHistory);
    
    const adaptations = {
      difficultyAdjustment: this.calculateDifficultyAdjustment(patterns),
      contentTypeAdjustment: this.calculateContentTypeAdjustment(patterns),
      pacingAdjustment: this.calculatePacingAdjustment(patterns),
      focusAreas: this.identifyFocusAreas(patterns, userProfile),
      recommendations: this.generateAdaptationRecommendations(patterns)
    };

    return {
      patterns,
      adaptations,
      confidence: this.calculateAdaptationConfidence(patterns)
    };
  }

  extractLearningPatterns(learningHistory) {
    if (!learningHistory || learningHistory.length === 0) {
      return {
        completionRate: 0.5,
        averageTimeSpent: 0,
        difficultyProgression: 'stable',
        engagementLevel: 'medium',
        preferredContentTypes: [],
        strugglingAreas: [],
        strongAreas: []
      };
    }

    const completed = learningHistory.filter(item => item.status === 'completed');
    const completionRate = completed.length / learningHistory.length;

    const averageTimeSpent = learningHistory.reduce((sum, item) => 
      sum + (item.timeSpent || 0), 0) / learningHistory.length;

    const difficultyProgression = this.analyzeDifficultyProgression(learningHistory);
    const engagementLevel = this.analyzeEngagementLevel(learningHistory);
    const preferredContentTypes = this.analyzeContentTypePreferences(learningHistory);
    const strugglingAreas = this.identifyStrugglingAreas(learningHistory);
    const strongAreas = this.identifyStrongAreas(learningHistory);

    return {
      completionRate,
      averageTimeSpent,
      difficultyProgression,
      engagementLevel,
      preferredContentTypes,
      strugglingAreas,
      strongAreas
    };
  }

  calculateDifficultyAdjustment(patterns) {
    const { completionRate, difficultyProgression } = patterns;
    
    if (completionRate < 0.3) {
      return { direction: 'decrease', amount: 0.2, reason: 'Low completion rate' };
    } else if (completionRate > 0.8 && difficultyProgression === 'fast') {
      return { direction: 'increase', amount: 0.15, reason: 'High completion rate, ready for challenge' };
    } else if (difficultyProgression === 'struggling') {
      return { direction: 'decrease', amount: 0.1, reason: 'Struggling with current difficulty' };
    }
    
    return { direction: 'maintain', amount: 0, reason: 'Appropriate difficulty level' };
  }

  calculateContentTypeAdjustment(patterns) {
    const { preferredContentTypes, engagementLevel } = patterns;
    
    return {
      boostTypes: preferredContentTypes.slice(0, 2),
      reduceTypes: this.getLeastEngagingTypes(patterns),
      reason: `Based on ${engagementLevel} engagement with ${preferredContentTypes.join(', ')}`
    };
  }

  calculatePacingAdjustment(patterns) {
    const { averageTimeSpent, completionRate } = patterns;
    
    if (averageTimeSpent < 30 && completionRate > 0.7) {
      return { direction: 'increase', reason: 'Completing content too quickly' };
    } else if (averageTimeSpent > 120 && completionRate < 0.5) {
      return { direction: 'decrease', reason: 'Spending too much time, may be too difficult' };
    }
    
    return { direction: 'maintain', reason: 'Appropriate pacing' };
  }

  identifyFocusAreas(patterns, userProfile) {
    const { strugglingAreas, strongAreas } = patterns;
    const userGoals = userProfile.goals || [];
    
    return {
      strengthen: strugglingAreas.slice(0, 3),
      leverage: strongAreas.slice(0, 2),
      explore: userGoals.filter(goal => 
        !strongAreas.some(area => area.toLowerCase().includes(goal.toLowerCase()))
      ).slice(0, 2)
    };
  }

  generateAdaptationRecommendations(patterns) {
    const recommendations = [];
    
    if (patterns.completionRate < 0.4) {
      recommendations.push('Consider breaking down complex topics into smaller, manageable chunks');
    }
    
    if (patterns.engagementLevel === 'low') {
      recommendations.push('Try different content formats like videos or hands-on projects');
    }
    
    if (patterns.strugglingAreas.length > 0) {
      recommendations.push(`Focus on strengthening: ${patterns.strugglingAreas.join(', ')}`);
    }
    
    if (patterns.strongAreas.length > 0) {
      recommendations.push(`Leverage your strengths in: ${patterns.strongAreas.join(', ')}`);
    }

    return recommendations;
  }

  // ========================================
  // CAREER MATCHING ALGORITHM
  // ========================================

  initializeCareerMatchingModel() {
    return {
      // Career matching weights
      weights: {
        skills: 0.35,
        interests: 0.25,
        personality: 0.15,
        values: 0.10,
        marketDemand: 0.10,
        growthPotential: 0.05
      },
      
      // Career progression paths
      progressionPaths: {
        'software_engineering': ['junior_developer', 'developer', 'senior_developer', 'tech_lead', 'architect'],
        'data_science': ['data_analyst', 'data_scientist', 'senior_data_scientist', 'data_lead', 'chief_data_officer'],
        'product_management': ['associate_pm', 'product_manager', 'senior_pm', 'principal_pm', 'vp_product']
      }
    };
  }

  /**
   * Calculate career match score and generate career recommendations
   * @param {Object} userProfile - User's profile
   * @param {Array} careerOptions - Available career options
   * @returns {Array} Ranked career recommendations
   */
  generateCareerRecommendations(userProfile, careerOptions) {
    const model = this.models.careerMatching;
    
    return careerOptions.map(career => {
      const matchScore = this.calculateCareerMatchScore(career, userProfile, model);
      const progressionPath = this.generateCareerProgressionPath(career, userProfile);
      const skillGaps = this.identifySkillGaps(career, userProfile);
      const learningRecommendations = this.generateCareerLearningRecommendations(career, userProfile);
      
      return {
        ...career,
        matchScore,
        progressionPath,
        skillGaps,
        learningRecommendations,
        matchReasons: this.generateCareerMatchReasons(career, userProfile, matchScore)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
  }

  calculateCareerMatchScore(career, userProfile, model) {
    let totalScore = 0;
    
    // Skills matching
    const skillScore = calculateSkillMatch(userProfile.skills || [], career.requiredSkills || []);
    totalScore += skillScore * model.weights.skills;
    
    // Interests matching
    const interestScore = calculateInterestMatch(userProfile.interests || [], career.domains || []);
    totalScore += interestScore * model.weights.interests;
    
    // Market demand
    const marketScore = this.calculateMarketDemandScore(career);
    totalScore += marketScore * model.weights.marketDemand;
    
    // Growth potential
    const growthScore = this.calculateGrowthPotentialScore(career);
    totalScore += growthScore * model.weights.growthPotential;
    
    // Personality fit (if available)
    if (userProfile.personality_traits) {
      const personalityScore = this.calculatePersonalityFit(career, userProfile.personality_traits);
      totalScore += personalityScore * model.weights.personality;
    }
    
    // Values alignment (if available)
    if (userProfile.values) {
      const valuesScore = this.calculateValuesAlignment(career, userProfile.values);
      totalScore += valuesScore * model.weights.values;
    }

    return Math.round(totalScore);
  }

  calculateMarketDemandScore(career) {
    const demandLevels = {
      'high': 90,
      'medium': 60,
      'low': 30
    };
    
    return demandLevels[career.marketDemand?.currentDemand || 'medium'] || 60;
  }

  calculateGrowthPotentialScore(career) {
    const growthLevels = {
      'growing': 90,
      'stable': 60,
      'declining': 30
    };
    
    return growthLevels[career.marketDemand?.futureOutlook || 'stable'] || 60;
  }

  calculatePersonalityFit(career, personalityTraits) {
    // This would integrate with personality assessment results
    // For now, return a neutral score
    return 50;
  }

  calculateValuesAlignment(career, values) {
    // This would check career values against user values
    // For now, return a neutral score
    return 50;
  }

  generateCareerProgressionPath(career, userProfile) {
    const model = this.models.careerMatching;
    const careerKey = career.id || career.title?.toLowerCase().replace(/\s+/g, '_');
    const progressionPath = model.progressionPaths[careerKey] || [];
    
    if (progressionPath.length === 0) {
      return {
        current: 'entry',
        next: 'mid_level',
        path: ['entry', 'mid_level', 'senior', 'lead']
      };
    }
    
    const userLevel = userProfile.experience_level || 'entry';
    const currentIndex = progressionPath.findIndex(level => 
      level.includes(userLevel) || userLevel.includes(level)
    );
    
    return {
      current: progressionPath[Math.max(0, currentIndex)] || progressionPath[0],
      next: progressionPath[Math.min(currentIndex + 1, progressionPath.length - 1)],
      path: progressionPath
    };
  }

  identifySkillGaps(career, userProfile) {
    const userSkills = (userProfile.skills || []).map(skill => skill.name || skill);
    const requiredSkills = career.requiredSkills || [];
    
    return requiredSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  }

  generateCareerLearningRecommendations(career, userProfile) {
    const skillGaps = this.identifySkillGaps(career, userProfile);
    
    return skillGaps.map(skill => ({
      skill,
      priority: 'high',
      resources: this.findResourcesForSkill(skill),
      estimatedTime: this.estimateLearningTime(skill)
    }));
  }

  generateCareerMatchReasons(career, userProfile, matchScore) {
    const reasons = [];
    
    if (matchScore >= 80) {
      reasons.push('Excellent match with your profile');
    } else if (matchScore >= 60) {
      reasons.push('Good match with your profile');
    }
    
    const skillMatches = (userProfile.skills || []).filter(skill => 
      (career.requiredSkills || []).some(reqSkill => 
        (skill.name || skill).toLowerCase().includes(reqSkill.toLowerCase())
      )
    ).length;
    
    if (skillMatches > 0) {
      reasons.push(`Matches ${skillMatches} of your skills`);
    }
    
    if (career.marketDemand?.currentDemand === 'high') {
      reasons.push('High market demand');
    }
    
    if (career.marketDemand?.futureOutlook === 'growing') {
      reasons.push('Growing field with future opportunities');
    }

    return reasons;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  parseDuration(duration) {
    if (!duration) return null;
    
    const durationStr = duration.toString().toLowerCase();
    const minutes = parseInt(durationStr.match(/\d+/)?.[0] || '0');
    
    if (durationStr.includes('hour')) return minutes * 60;
    if (durationStr.includes('day')) return minutes * 60 * 24;
    return minutes;
  }

  getTimePreference(duration, timePreferences) {
    for (const [pref, config] of Object.entries(timePreferences)) {
      if (duration <= config.maxDuration) {
        return config.weight;
      }
    }
    return 0.1; // Default low weight for very long content
  }

  isAppropriateDifficultyProgression(currentLevel, contentDifficulty) {
    const levelMap = {
      'entry': 1, 'beginner': 1,
      'intermediate': 2,
      'advanced': 3, 'expert': 4
    };
    
    const current = levelMap[currentLevel] || 1;
    const content = levelMap[contentDifficulty] || 2;
    
    // Allow same level or one level up
    return content <= current + 1;
  }

  analyzeDifficultyProgression(learningHistory) {
    // Analyze if user is progressing through difficulty levels
    const difficulties = learningHistory.map(item => item.difficulty).filter(Boolean);
    if (difficulties.length < 2) return 'stable';
    
    // Simple progression analysis
    const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const progression = difficulties.map(d => levelMap[d] || 2);
    
    const isIncreasing = progression.every((level, i) => i === 0 || level >= progression[i-1]);
    const isStruggling = learningHistory.filter(item => item.status === 'incomplete').length > learningHistory.length * 0.5;
    
    if (isStruggling) return 'struggling';
    if (isIncreasing) return 'progressive';
    return 'stable';
  }

  analyzeEngagementLevel(learningHistory) {
    const completed = learningHistory.filter(item => item.status === 'completed').length;
    const completionRate = completed / learningHistory.length;
    
    if (completionRate >= 0.8) return 'high';
    if (completionRate >= 0.5) return 'medium';
    return 'low';
  }

  analyzeContentTypePreferences(learningHistory) {
    const typeCounts = {};
    learningHistory.forEach(item => {
      if (item.contentType) {
        typeCounts[item.contentType] = (typeCounts[item.contentType] || 0) + 1;
      }
    });
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type)
      .slice(0, 3);
  }

  identifyStrugglingAreas(learningHistory) {
    const incomplete = learningHistory.filter(item => item.status === 'incomplete');
    const strugglingSkills = {};
    
    incomplete.forEach(item => {
      if (item.skills) {
        item.skills.forEach(skill => {
          strugglingSkills[skill] = (strugglingSkills[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(strugglingSkills)
      .sort(([,a], [,b]) => b - a)
      .map(([skill]) => skill)
      .slice(0, 3);
  }

  identifyStrongAreas(learningHistory) {
    const completed = learningHistory.filter(item => item.status === 'completed');
    const strongSkills = {};
    
    completed.forEach(item => {
      if (item.skills) {
        item.skills.forEach(skill => {
          strongSkills[skill] = (strongSkills[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(strongSkills)
      .sort(([,a], [,b]) => b - a)
      .map(([skill]) => skill)
      .slice(0, 3);
  }

  getLeastEngagingTypes(patterns) {
    // Return content types with low engagement
    return ['article', 'documentation']; // Simplified for now
  }

  calculateAdaptationConfidence(patterns) {
    // Calculate confidence in adaptation recommendations
    const dataPoints = Object.values(patterns).filter(v => v !== null && v !== undefined).length;
    return Math.min(dataPoints / 7, 1); // Normalize to 0-1
  }

  findResourcesForSkill(skill) {
    // This would integrate with the content search system
    return [`Search for ${skill} tutorials`, `Find ${skill} courses`];
  }

  estimateLearningTime(skill) {
    // Estimate learning time based on skill complexity
    const skillComplexity = {
      'programming': '3-6 months',
      'design': '2-4 months',
      'analysis': '1-3 months',
      'management': '6-12 months'
    };
    
    return skillComplexity[skill.toLowerCase()] || '2-4 months';
  }
}

export default AdvancedMLEngine;

