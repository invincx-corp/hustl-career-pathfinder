// Intelligent Content Curator
// Uses advanced ML algorithms to curate and personalize content from multiple APIs

import AdvancedMLEngine from './advanced-ml-engine.js';
import GoogleAPIsService from './google-apis-service.js';
import LearningPlatformService from './learning-platforms.js';

class IntelligentContentCurator {
  constructor() {
    this.mlEngine = new AdvancedMLEngine();
    this.googleAPIs = new GoogleAPIsService();
    this.learningPlatforms = new LearningPlatformService();
    
    // Content curation cache
    this.curationCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    
    // User behavior tracking
    this.userBehavior = new Map();
    
    // Content quality thresholds
    this.qualityThresholds = {
      minimum: 40,
      good: 70,
      excellent: 85
    };
  }

  /**
   * Main method to curate personalized content for a user
   * @param {Object} userProfile - User's complete profile
   * @param {Object} request - Content request parameters
   * @returns {Object} Curated and personalized content recommendations
   */
  async curatePersonalizedContent(userProfile, request) {
    try {
      console.log(`🎯 Curating personalized content for user: ${userProfile.id}`);
      
      const {
        domain = 'software_engineering',
        category = 'foundation',
        difficulty = 'beginner',
        contentType = 'all',
        limit = 20
      } = request;

      // Check cache first
      const cacheKey = this.generateCacheKey(userProfile, request);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('📦 Using cached curated content');
        return cachedResult;
      }

      // Step 1: Gather raw content from multiple APIs
      const rawContent = await this.gatherRawContent(domain, category, difficulty, contentType);
      console.log(`📊 Gathered ${rawContent.length} raw content items`);

      // Step 2: Apply ML-based quality filtering
      const qualityFilteredContent = await this.applyQualityFiltering(rawContent, userProfile);
      console.log(`✅ Quality filtered to ${qualityFilteredContent.length} items`);

      // Step 3: Generate personalized recommendations
      const personalizedContent = this.mlEngine.generatePersonalizedRecommendations(
        qualityFilteredContent, 
        userProfile
      );
      console.log(`🎯 Generated ${personalizedContent.length} personalized recommendations`);

      // Step 4: Apply learning adaptation
      const adaptedContent = await this.applyLearningAdaptation(personalizedContent, userProfile);
      console.log(`🔄 Applied learning adaptation`);

      // Step 5: Final ranking and selection
      const finalContent = this.finalizeContentSelection(adaptedContent, limit);
      console.log(`🏆 Final selection: ${finalContent.length} items`);

      // Step 6: Generate insights and recommendations
      const insights = this.generateContentInsights(finalContent, userProfile);

      const result = {
        content: finalContent,
        insights,
        metadata: {
          totalSources: rawContent.length,
          qualityFiltered: qualityFilteredContent.length,
          personalized: personalizedContent.length,
          final: finalContent.length,
          curationTimestamp: new Date().toISOString(),
          userProfileVersion: userProfile.version || '1.0'
        }
      };

      // Cache the result
      this.setCachedResult(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Error in content curation:', error);
      return this.getFallbackContent(userProfile, request);
    }
  }

  /**
   * Gather raw content from multiple APIs
   */
  async gatherRawContent(domain, category, difficulty, contentType) {
    const allContent = [];
    
    try {
      // Google APIs content
      const googleContent = await this.googleAPIs.searchLearningResources(
        `${domain} ${category} ${difficulty}`,
        domain,
        category,
        difficulty
      );
      
      // Flatten and add source information
      Object.values(googleContent).flat().forEach(item => {
        allContent.push({
          ...item,
          source: 'Google APIs',
          gatheredAt: new Date().toISOString()
        });
      });

      // Learning platforms content
      const platformContent = await this.learningPlatforms.searchResources(
        `${domain} ${category}`,
        domain,
        category,
        difficulty
      );
      
      platformContent.forEach(item => {
        allContent.push({
          ...item,
          source: 'Learning Platforms',
          gatheredAt: new Date().toISOString()
        });
      });

      // Remove duplicates based on URL
      const uniqueContent = this.removeDuplicateContent(allContent);
      
      return uniqueContent;

    } catch (error) {
      console.error('Error gathering raw content:', error);
      return [];
    }
  }

  /**
   * Apply ML-based quality filtering
   */
  async applyQualityFiltering(contentList, userProfile) {
    const qualityFiltered = [];
    
    for (const content of contentList) {
      try {
        // Calculate quality score using ML engine
        const qualityAnalysis = this.mlEngine.calculateContentQuality(content, userProfile);
        
        // Only include content above minimum quality threshold
        if (qualityAnalysis.score >= this.qualityThresholds.minimum) {
          qualityFiltered.push({
            ...content,
            qualityAnalysis
          });
        }
      } catch (error) {
        console.error('Error calculating quality for content:', content.title, error);
        // Include content with default quality if calculation fails
        qualityFiltered.push({
          ...content,
          qualityAnalysis: { score: 50, grade: 'C', breakdown: {}, recommendations: [] }
        });
      }
    }

    return qualityFiltered;
  }

  /**
   * Apply learning adaptation based on user patterns
   */
  async applyLearningAdaptation(contentList, userProfile) {
    try {
      // Get user's learning history
      const learningHistory = userProfile.learning_history || [];
      
      // Analyze learning patterns
      const patternAnalysis = this.mlEngine.analyzeLearningPatterns(userProfile, learningHistory);
      
      // Apply adaptations to content recommendations
      const adaptedContent = contentList.map(content => {
        let adaptedScore = content.finalScore || content.qualityAnalysis?.score || 50;
        
        // Adjust score based on learning patterns
        if (patternAnalysis.adaptations.difficultyAdjustment.direction === 'decrease' && 
            content.difficulty === 'advanced') {
          adaptedScore *= 0.8; // Reduce score for advanced content if user struggles
        }
        
        if (patternAnalysis.adaptations.difficultyAdjustment.direction === 'increase' && 
            content.difficulty === 'beginner') {
          adaptedScore *= 0.9; // Slightly reduce score for beginner content if user is ready for more
        }
        
        // Boost preferred content types
        if (patternAnalysis.adaptations.contentTypeAdjustment.boostTypes.includes(content.type)) {
          adaptedScore *= 1.1;
        }
        
        // Reduce less engaging content types
        if (patternAnalysis.adaptations.contentTypeAdjustment.reduceTypes.includes(content.type)) {
          adaptedScore *= 0.9;
        }

        return {
          ...content,
          adaptedScore: Math.round(adaptedScore),
          adaptationReasons: this.generateAdaptationReasons(patternAnalysis, content)
        };
      });

      return adaptedContent;

    } catch (error) {
      console.error('Error applying learning adaptation:', error);
      return contentList;
    }
  }

  /**
   * Finalize content selection with final ranking
   */
  finalizeContentSelection(contentList, limit) {
    // Sort by adapted score or final score
    const sortedContent = contentList.sort((a, b) => {
      const scoreA = a.adaptedScore || a.finalScore || a.qualityAnalysis?.score || 0;
      const scoreB = b.adaptedScore || b.finalScore || b.qualityAnalysis?.score || 0;
      return scoreB - scoreA;
    });

    // Apply diversity filter to ensure variety
    const diverseContent = this.applyDiversityFilter(sortedContent, limit);
    
    // Add final ranking
    return diverseContent.map((content, index) => ({
      ...content,
      finalRank: index + 1,
      recommendationStrength: this.calculateRecommendationStrength(content)
    }));
  }

  /**
   * Apply diversity filter to ensure content variety
   */
  applyDiversityFilter(contentList, limit) {
    const selected = [];
    const usedTypes = new Set();
    const usedPlatforms = new Set();
    
    for (const content of contentList) {
      if (selected.length >= limit) break;
      
      const contentType = content.type || 'article';
      const platform = content.platform || 'unknown';
      
      // Ensure diversity in content types and platforms
      const typeCount = Array.from(usedTypes).filter(type => type === contentType).length;
      const platformCount = Array.from(usedPlatforms).filter(p => p === platform).length;
      
      // Allow up to 3 items per type and 2 per platform
      if (typeCount < 3 && platformCount < 2) {
        selected.push(content);
        usedTypes.add(contentType);
        usedPlatforms.add(platform);
      }
    }
    
    // Fill remaining slots if needed
    if (selected.length < limit) {
      const remaining = contentList.filter(content => !selected.includes(content));
      selected.push(...remaining.slice(0, limit - selected.length));
    }
    
    return selected;
  }

  /**
   * Generate content insights and recommendations
   */
  generateContentInsights(contentList, userProfile) {
    const insights = {
      qualityDistribution: this.analyzeQualityDistribution(contentList),
      contentTypeDistribution: this.analyzeContentTypeDistribution(contentList),
      platformDistribution: this.analyzePlatformDistribution(contentList),
      difficultyDistribution: this.analyzeDifficultyDistribution(contentList),
      recommendations: this.generateInsightRecommendations(contentList, userProfile),
      learningPathAlignment: this.analyzeLearningPathAlignment(contentList, userProfile)
    };

    return insights;
  }

  analyzeQualityDistribution(contentList) {
    const distribution = {
      excellent: 0, // 85+
      good: 0,      // 70-84
      fair: 0,      // 40-69
      poor: 0       // <40
    };

    contentList.forEach(content => {
      const score = content.qualityAnalysis?.score || content.finalScore || 0;
      if (score >= 85) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 40) distribution.fair++;
      else distribution.poor++;
    });

    return distribution;
  }

  analyzeContentTypeDistribution(contentList) {
    const distribution = {};
    contentList.forEach(content => {
      const type = content.type || 'unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }

  analyzePlatformDistribution(contentList) {
    const distribution = {};
    contentList.forEach(content => {
      const platform = content.platform || 'unknown';
      distribution[platform] = (distribution[platform] || 0) + 1;
    });
    return distribution;
  }

  analyzeDifficultyDistribution(contentList) {
    const distribution = { beginner: 0, intermediate: 0, advanced: 0 };
    contentList.forEach(content => {
      const difficulty = content.difficulty || 'intermediate';
      if (distribution.hasOwnProperty(difficulty)) {
        distribution[difficulty]++;
      }
    });
    return distribution;
  }

  generateInsightRecommendations(contentList, userProfile) {
    const recommendations = [];
    
    // Quality recommendations
    const qualityDistribution = this.analyzeQualityDistribution(contentList);
    if (qualityDistribution.excellent < contentList.length * 0.3) {
      recommendations.push('Consider searching for higher quality content sources');
    }
    
    // Content type recommendations
    const typeDistribution = this.analyzeContentTypeDistribution(contentList);
    const userLearningStyle = userProfile.learning_style || 'visual';
    
    if (userLearningStyle === 'visual' && typeDistribution.video < 3) {
      recommendations.push('Add more video content to match your visual learning style');
    }
    
    if (userLearningStyle === 'kinesthetic' && typeDistribution.project < 2) {
      recommendations.push('Include more hands-on projects and exercises');
    }
    
    // Difficulty recommendations
    const difficultyDistribution = this.analyzeDifficultyDistribution(contentList);
    const userLevel = userProfile.experience_level || 'beginner';
    
    if (userLevel === 'beginner' && difficultyDistribution.advanced > 2) {
      recommendations.push('Consider focusing on beginner-friendly content first');
    }
    
    if (userLevel === 'advanced' && difficultyDistribution.beginner > 3) {
      recommendations.push('You might be ready for more challenging content');
    }

    return recommendations;
  }

  analyzeLearningPathAlignment(contentList, userProfile) {
    const userRoadmaps = userProfile.selected_roadmaps || [];
    const roadmapSkills = userRoadmaps.flatMap(roadmap => roadmap.skills || []);
    
    let alignedCount = 0;
    contentList.forEach(content => {
      const contentSkills = content.skills || [];
      const hasAlignment = contentSkills.some(skill => 
        roadmapSkills.some(roadmapSkill => 
          skill.toLowerCase().includes(roadmapSkill.toLowerCase())
        )
      );
      if (hasAlignment) alignedCount++;
    });
    
    return {
      alignedCount,
      totalCount: contentList.length,
      alignmentPercentage: Math.round((alignedCount / contentList.length) * 100)
    };
  }

  generateAdaptationReasons(patternAnalysis, content) {
    const reasons = [];
    
    if (patternAnalysis.adaptations.difficultyAdjustment.direction === 'decrease' && 
        content.difficulty === 'advanced') {
      reasons.push('Adjusted for your current learning pace');
    }
    
    if (patternAnalysis.adaptations.contentTypeAdjustment.boostTypes.includes(content.type)) {
      reasons.push('Matches your preferred learning style');
    }
    
    return reasons;
  }

  calculateRecommendationStrength(content) {
    const score = content.adaptedScore || content.finalScore || content.qualityAnalysis?.score || 0;
    
    if (score >= 85) return 'very_strong';
    if (score >= 70) return 'strong';
    if (score >= 50) return 'moderate';
    return 'weak';
  }

  /**
   * Generate cache key for content requests
   */
  generateCacheKey(userProfile, request) {
    const userKey = `${userProfile.id}_${userProfile.version || '1.0'}`;
    const requestKey = `${request.domain}_${request.category}_${request.difficulty}_${request.contentType}`;
    return `${userKey}_${requestKey}`;
  }

  /**
   * Cache management methods
   */
  getCachedResult(key) {
    const cached = this.curationCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.curationCache.delete(key);
    }
    return null;
  }

  setCachedResult(key, data) {
    this.curationCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.curationCache.size > 100) {
      this.cleanupCache();
    }
  }

  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.curationCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.curationCache.delete(key);
      }
    }
  }

  /**
   * Remove duplicate content based on URL
   */
  removeDuplicateContent(contentList) {
    const seen = new Set();
    return contentList.filter(content => {
      const url = content.url || content.link;
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  }

  /**
   * Get fallback content when curation fails
   */
  getFallbackContent(userProfile, request) {
    return {
      content: [{
        id: 'fallback_1',
        title: `${request.domain} ${request.category} Learning Resource`,
        description: `Comprehensive learning resource for ${request.domain} ${request.category}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(request.domain + ' ' + request.category + ' ' + request.difficulty)}`,
        type: 'article',
        platform: 'Google Search',
        difficulty: request.difficulty,
        qualityAnalysis: { score: 50, grade: 'C', breakdown: {}, recommendations: [] },
        finalScore: 50,
        finalRank: 1,
        recommendationStrength: 'moderate'
      }],
      insights: {
        qualityDistribution: { excellent: 0, good: 0, fair: 1, poor: 0 },
        contentTypeDistribution: { article: 1 },
        platformDistribution: { 'Google Search': 1 },
        difficultyDistribution: { [request.difficulty]: 1 },
        recommendations: ['Using fallback content - please try again later'],
        learningPathAlignment: { alignedCount: 0, totalCount: 1, alignmentPercentage: 0 }
      },
      metadata: {
        totalSources: 1,
        qualityFiltered: 1,
        personalized: 1,
        final: 1,
        curationTimestamp: new Date().toISOString(),
        userProfileVersion: userProfile.version || '1.0',
        fallback: true
      }
    };
  }

  /**
   * Track user behavior for learning pattern analysis
   */
  trackUserBehavior(userId, action, contentId, metadata = {}) {
    if (!this.userBehavior.has(userId)) {
      this.userBehavior.set(userId, []);
    }
    
    const behavior = this.userBehavior.get(userId);
    behavior.push({
      action, // 'view', 'click', 'complete', 'skip', 'rate'
      contentId,
      timestamp: new Date().toISOString(),
      metadata
    });
    
    // Keep only last 1000 actions per user
    if (behavior.length > 1000) {
      behavior.splice(0, behavior.length - 1000);
    }
  }

  /**
   * Get user behavior data for ML analysis
   */
  getUserBehavior(userId) {
    return this.userBehavior.get(userId) || [];
  }

  /**
   * Update user profile with learning insights
   */
  updateUserProfileWithInsights(userProfile, contentInsights) {
    const updatedProfile = { ...userProfile };
    
    // Update learning preferences based on content interactions
    if (contentInsights.contentTypeDistribution) {
      const preferredTypes = Object.entries(contentInsights.contentTypeDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);
      
      updatedProfile.preferred_content_types = preferredTypes;
    }
    
    // Update difficulty preferences
    if (contentInsights.difficultyDistribution) {
      const preferredDifficulty = Object.entries(contentInsights.difficultyDistribution)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      updatedProfile.preferred_difficulty = preferredDifficulty;
    }
    
    // Update platform preferences
    if (contentInsights.platformDistribution) {
      const preferredPlatforms = Object.entries(contentInsights.platformDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([platform]) => platform);
      
      updatedProfile.preferred_platforms = preferredPlatforms;
    }
    
    return updatedProfile;
  }
}

export default IntelligentContentCurator;

