// Intelligent Content Service
// Frontend service for ML-powered content curation and personalization

class IntelligentContentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Get personalized content recommendations using ML
   * @param {Object} params - Content request parameters
   * @returns {Promise<Object>} Curated content recommendations
   */
  async getPersonalizedContent(params) {
    try {
      const { userId, domain, category, difficulty, contentType, limit } = params;
      
      const response = await fetch(`${this.baseURL}/api/intelligent-content/curate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: domain || 'software_engineering',
          category: category || 'foundation',
          difficulty: difficulty || 'beginner',
          contentType: contentType || 'all',
          limit: limit || 20
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      throw error;
    }
  }

  /**
   * Get ML-powered career recommendations
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {Promise<Object>} Career recommendations
   */
  async getCareerRecommendations(userId, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/api/intelligent-content/careers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching career recommendations:', error);
      throw error;
    }
  }

  /**
   * Get adaptive learning path recommendations
   * @param {string} userId - User ID
   * @param {string} domain - Learning domain
   * @param {string} currentLevel - Current skill level
   * @returns {Promise<Object>} Learning path recommendations
   */
  async getLearningPathRecommendations(userId, domain, currentLevel) {
    try {
      const response = await fetch(`${this.baseURL}/api/intelligent-content/learning-paths`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: domain || 'software_engineering',
          currentLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching learning path recommendations:', error);
      throw error;
    }
  }

  /**
   * Track user content interaction
   * @param {string} userId - User ID
   * @param {string} action - Action type (view, click, complete, skip, rate)
   * @param {string} contentId - Content ID
   * @param {Object} metadata - Additional metadata
   */
  async trackUserBehavior(userId, action, contentId, metadata = {}) {
    try {
      await fetch(`${this.baseURL}/api/intelligent-content/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          contentId,
          metadata
        })
      });
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      // Don't throw error for tracking failures
    }
  }

  /**
   * Analyze content quality
   * @param {string} userId - User ID
   * @param {Object} content - Content to analyze
   * @returns {Promise<Object>} Quality analysis
   */
  async analyzeContentQuality(userId, content) {
    try {
      const response = await fetch(`${this.baseURL}/api/intelligent-content/analyze-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing content quality:', error);
      throw error;
    }
  }

  /**
   * Get user learning insights
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Learning insights
   */
  async getUserInsights(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/intelligent-content/insights/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user insights:', error);
      throw error;
    }
  }

  /**
   * Update user profile with ML insights
   * @param {string} userId - User ID
   * @param {Object} insights - Learning insights
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, insights) {
    try {
      const response = await fetch(`${this.baseURL}/api/intelligent-content/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          insights
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get content for Curiosity Compass with ML curation
   * @param {string} userId - User ID
   * @param {string} domain - Career domain
   * @param {string} category - Content category
   * @returns {Promise<Object>} Curated career content
   */
  async getCuriosityCompassContent(userId, domain, category = 'exploration') {
    try {
      const response = await this.getPersonalizedContent({
        userId,
        domain,
        category,
        contentType: 'all',
        limit: 15
      });

      if (response.success) {
        return {
          success: true,
          careers: this.formatCareerContent(response.data.content),
          insights: response.data.insights,
          metadata: response.data.metadata
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching Curiosity Compass content:', error);
      return {
        success: false,
        careers: [],
        error: error.message
      };
    }
  }

  /**
   * Get content for AI Roadmaps with ML curation
   * @param {string} userId - User ID
   * @param {string} domain - Learning domain
   * @param {string} category - Content category
   * @returns {Promise<Object>} Curated learning content
   */
  async getAIRoadmapContent(userId, domain, category = 'foundation') {
    try {
      const response = await this.getPersonalizedContent({
        userId,
        domain,
        category,
        contentType: 'course',
        limit: 25
      });

      if (response.success) {
        return {
          success: true,
          resources: this.formatLearningContent(response.data.content),
          insights: response.data.insights,
          metadata: response.data.metadata
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching AI Roadmap content:', error);
      return {
        success: false,
        resources: [],
        error: error.message
      };
    }
  }

  /**
   * Format career content for Curiosity Compass
   * @param {Array} content - Raw content from API
   * @returns {Array} Formatted career content
   */
  formatCareerContent(content) {
    return content.map((item, index) => ({
      id: item.id || `career_${index}`,
      title: item.title,
      description: item.description,
      domain: item.domain || 'Technology',
      difficulty: item.difficulty || 'intermediate',
      growth: this.calculateGrowthScore(item),
      image: this.getCareerIcon(item.domain || 'Technology'),
      qualityScore: item.qualityAnalysis?.score || 50,
      qualityGrade: item.qualityAnalysis?.grade || 'C',
      matchScore: item.finalScore || item.personalizationScore || 50,
      recommendationReasons: item.recommendationReasons || [],
      url: item.url,
      platform: item.platform,
      type: item.type,
      skills: item.skills || [],
      marketDemand: this.extractMarketDemand(item),
      salaryRange: this.extractSalaryRange(item),
      remoteOpportunities: this.extractRemoteOpportunities(item),
      futureRelevance: this.extractFutureRelevance(item)
    }));
  }

  /**
   * Format learning content for AI Roadmaps
   * @param {Array} content - Raw content from API
   * @returns {Array} Formatted learning content
   */
  formatLearningContent(content) {
    return content.map((item, index) => ({
      id: item.id || `resource_${index}`,
      title: item.title,
      description: item.description,
      url: item.url,
      type: item.type,
      platform: item.platform,
      duration: item.duration || 'Varies',
      difficulty: item.difficulty || 'intermediate',
      rating: item.rating || 4.0,
      cost: item.cost || 'free',
      qualityScore: item.qualityAnalysis?.score || 50,
      qualityGrade: item.qualityAnalysis?.grade || 'C',
      matchScore: item.finalScore || item.personalizationScore || 50,
      recommendationReasons: item.recommendationReasons || [],
      skills: item.skills || [],
      tags: item.tags || [],
      thumbnail: item.thumbnail,
      provider: item.provider,
      source: item.source,
      finalRank: item.finalRank || index + 1,
      recommendationStrength: item.recommendationStrength || 'moderate'
    }));
  }

  /**
   * Calculate growth score based on content analysis
   * @param {Object} item - Content item
   * @returns {number} Growth score (0-100)
   */
  calculateGrowthScore(item) {
    let score = 50; // Base score
    
    // Market demand factor
    if (item.marketDemand?.currentDemand === 'high') score += 20;
    else if (item.marketDemand?.currentDemand === 'medium') score += 10;
    
    // Future outlook factor
    if (item.marketDemand?.futureOutlook === 'growing') score += 20;
    else if (item.marketDemand?.futureOutlook === 'stable') score += 10;
    
    // Quality factor
    if (item.qualityAnalysis?.score >= 80) score += 10;
    else if (item.qualityAnalysis?.score >= 60) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Get career icon based on domain
   * @param {string} domain - Career domain
   * @returns {string} Icon emoji
   */
  getCareerIcon(domain) {
    const icons = {
      'Technology': '💻',
      'Healthcare': '🏥',
      'Design': '🎨',
      'Business': '💼',
      'Education': '📚',
      'Engineering': '⚙️',
      'Science': '🔬',
      'Arts': '🎭',
      'Finance': '💰',
      'Marketing': '📈'
    };
    
    return icons[domain] || '💼';
  }

  /**
   * Extract market demand from content
   * @param {Object} item - Content item
   * @returns {Object} Market demand info
   */
  extractMarketDemand(item) {
    return {
      currentDemand: item.marketDemand?.currentDemand || 'medium',
      futureOutlook: item.marketDemand?.futureOutlook || 'stable'
    };
  }

  /**
   * Extract salary range from content
   * @param {Object} item - Content item
   * @returns {string} Salary range
   */
  extractSalaryRange(item) {
    return item.salaryRange || item.marketDemand?.salaryRange || '₹5-20 LPA';
  }

  /**
   * Extract remote opportunities from content
   * @param {Object} item - Content item
   * @returns {number} Remote opportunities percentage
   */
  extractRemoteOpportunities(item) {
    return item.remoteOpportunities || item.marketDemand?.remoteOpportunities || 50;
  }

  /**
   * Extract future relevance from content
   * @param {Object} item - Content item
   * @returns {Object} Future relevance info
   */
  extractFutureRelevance(item) {
    return {
      automationResistance: item.futureRelevance?.automationResistance || 'medium',
      aiEnhancement: item.futureRelevance?.aiEnhancement || 'medium',
      emergingTrends: item.futureRelevance?.emergingTrends || []
    };
  }
}

// Create and export singleton instance
const intelligentContentService = new IntelligentContentService();
export default intelligentContentService;

