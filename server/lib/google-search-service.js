// Google Search API Service for Personalized Learning Material Recommendations
// Uses Google Custom Search API to find and rank learning resources

import axios from 'axios';

class GoogleSearchService {
  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
    
    // Cache for search results to avoid rate limiting
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Main method to search for personalized learning materials
  async searchPersonalizedLearningMaterials(query, domain, category, skillLevel, userProfile = {}) {
    try {
      console.log(`🔍 Google Search API: Searching for "${query}" in ${domain} - ${category}`);
      
      // Check cache first
      const cacheKey = `${query}_${domain}_${category}_${skillLevel}`;
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('📦 Using cached Google Search results');
        return cachedResult;
      }

      // Build optimized search queries
      const searchQueries = this.buildPersonalizedQueries(query, domain, category, skillLevel, userProfile);
      
      // Execute searches in parallel
      const searchPromises = searchQueries.map(searchQuery => 
        this.executeGoogleSearch(searchQuery, domain, category, skillLevel)
      );
      
      const searchResults = await Promise.all(searchPromises);
      
      // Merge and rank results
      const allResults = searchResults.flat();
      const rankedResults = this.rankAndPersonalizeResults(allResults, query, domain, category, skillLevel, userProfile);
      
      // Cache the results
      this.setCachedResult(cacheKey, rankedResults);
      
      console.log(`✅ Google Search API: Found ${rankedResults.length} personalized learning materials`);
      return rankedResults;
      
    } catch (error) {
      console.error('Error in Google Search API:', error);
      return this.getFallbackResults(query, domain, category);
    }
  }

  // Build personalized search queries based on user profile and learning goals
  buildPersonalizedQueries(query, domain, category, skillLevel, userProfile) {
    const baseQuery = query.toLowerCase();
    const domainKeywords = this.getDomainKeywords(domain);
    const skillKeywords = this.getSkillLevelKeywords(skillLevel);
    const categoryKeywords = this.getCategoryKeywords(category);
    
    // User profile preferences
    const learningStyle = userProfile.learningStyle || 'visual';
    const experience = userProfile.experience || 'beginner';
    const interests = userProfile.interests || [];
    
    const queries = [
      // Primary query with domain and skill level
      `${baseQuery} ${domainKeywords.join(' ')} ${skillKeywords.join(' ')} tutorial course`,
      
      // Category-specific query
      `${baseQuery} ${categoryKeywords.join(' ')} ${domainKeywords.join(' ')} learning`,
      
      // Hands-on/practical query
      `${baseQuery} ${domainKeywords.join(' ')} hands-on practice project exercises`,
      
      // Video content query
      `${baseQuery} ${domainKeywords.join(' ')} video tutorial course ${skillLevel}`,
      
      // Interactive/community query
      `${baseQuery} ${domainKeywords.join(' ')} community forum discussion examples`
    ];

    // Add personalized queries based on user profile
    if (learningStyle === 'visual') {
      queries.push(`${baseQuery} ${domainKeywords.join(' ')} infographic diagram visual guide`);
    }
    
    if (experience === 'intermediate' || experience === 'advanced') {
      queries.push(`${baseQuery} ${domainKeywords.join(' ')} advanced expert professional`);
    }
    
    if (interests.length > 0) {
      queries.push(`${baseQuery} ${domainKeywords.join(' ')} ${interests.slice(0, 2).join(' ')}`);
    }

    return queries.slice(0, 5); // Limit to 5 queries to avoid rate limiting
  }

  // Execute Google Custom Search
  async executeGoogleSearch(searchQuery, domain, category, skillLevel) {
    if (!this.apiKey || !this.searchEngineId) {
      console.warn('⚠️ Google Search API credentials not configured');
      return [];
    }

    try {
      const params = {
        key: this.apiKey,
        cx: this.searchEngineId,
        q: searchQuery,
        num: 10, // Get 10 results per query
        safe: 'active',
        sort: 'relevance',
        filter: '1', // Enable duplicate filtering
        gl: 'us', // Country
        hl: 'en', // Language
        lr: 'lang_en' // Language restriction
      };

      const response = await axios.get(this.baseUrl, { 
        params,
        timeout: 10000
      });

      return this.formatGoogleSearchResults(response.data, searchQuery, domain, category, skillLevel);
      
    } catch (error) {
      console.error('Google Search API error:', error.message);
      return [];
    }
  }

  // Format Google Search results
  formatGoogleSearchResults(data, searchQuery, domain, category, skillLevel) {
    if (!data.items) return [];
    
    return data.items.map((item, index) => ({
      id: `google_search_${Date.now()}_${index}`,
      title: item.title,
      description: item.snippet,
      url: item.link,
      type: this.detectContentType(item.link, item.title),
      platform: this.extractPlatform(item.link),
      domain: domain,
      category: category,
      skillLevel: skillLevel,
      searchQuery: searchQuery,
      relevanceScore: this.calculateRelevanceScore(item, searchQuery, domain, category),
      qualityScore: this.calculateQualityScore(item),
      personalizedScore: 0, // Will be calculated later
      source: 'Google Search API',
      thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null,
      publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
      author: item.pagemap?.metatags?.[0]?.['article:author'] || null,
      tags: this.extractTags(item.title, item.snippet),
      estimatedDuration: this.estimateContentDuration(item.title, item.snippet),
      difficulty: this.estimateDifficulty(item.title, item.snippet, skillLevel),
      cost: this.estimateCost(item.link, item.title),
      rating: this.estimateRating(item.link, item.title),
      language: 'en',
      lastUpdated: new Date().toISOString()
    }));
  }

  // Detect content type from URL and title
  detectContentType(url, title) {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'video';
    } else if (urlLower.includes('coursera.org') || urlLower.includes('udemy.com') || 
               urlLower.includes('edx.org') || urlLower.includes('khanacademy.org')) {
      return 'course';
    } else if (urlLower.includes('github.com') || titleLower.includes('github')) {
      return 'project';
    } else if (urlLower.includes('stackoverflow.com') || urlLower.includes('stackexchange.com')) {
      return 'community';
    } else if (urlLower.includes('medium.com') || urlLower.includes('dev.to') || 
               titleLower.includes('blog') || titleLower.includes('article')) {
      return 'article';
    } else if (urlLower.includes('docs.') || titleLower.includes('documentation')) {
      return 'documentation';
    } else if (urlLower.includes('book') || titleLower.includes('book')) {
      return 'book';
    } else {
      return 'web';
    }
  }

  // Extract platform from URL
  extractPlatform(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      const platformMap = {
        'youtube.com': 'YouTube',
        'youtu.be': 'YouTube',
        'coursera.org': 'Coursera',
        'udemy.com': 'Udemy',
        'edx.org': 'edX',
        'khanacademy.org': 'Khan Academy',
        'freecodecamp.org': 'FreeCodeCamp',
        'github.com': 'GitHub',
        'stackoverflow.com': 'Stack Overflow',
        'medium.com': 'Medium',
        'dev.to': 'Dev.to',
        'w3schools.com': 'W3Schools',
        'mdn.mozilla.org': 'MDN Web Docs',
        'docs.microsoft.com': 'Microsoft Docs',
        'docs.python.org': 'Python Docs',
        'reactjs.org': 'React Docs',
        'nodejs.org': 'Node.js Docs'
      };
      
      for (const [domainKey, platformName] of Object.entries(platformMap)) {
        if (domain.includes(domainKey)) {
          return platformName;
        }
      }
      
      return 'Web';
    } catch {
      return 'Web';
    }
  }

  // Calculate relevance score based on search query and domain
  calculateRelevanceScore(item, searchQuery, domain, category) {
    let score = 0;
    const title = item.title.toLowerCase();
    const snippet = item.snippet.toLowerCase();
    const query = searchQuery.toLowerCase();
    const domainLower = domain.toLowerCase();
    
    // Title relevance (highest weight)
    const queryWords = query.split(' ').filter(word => word.length > 2);
    queryWords.forEach(word => {
      if (title.includes(word)) score += 10;
      if (snippet.includes(word)) score += 5;
    });
    
    // Domain relevance
    if (title.includes(domainLower) || snippet.includes(domainLower)) {
      score += 15;
    }
    
    // Category relevance
    if (title.includes(category) || snippet.includes(category)) {
      score += 10;
    }
    
    // Platform quality bonus
    const platform = this.extractPlatform(item.link);
    const platformScores = {
      'YouTube': 8,
      'Coursera': 9,
      'Udemy': 8,
      'edX': 9,
      'Khan Academy': 8,
      'FreeCodeCamp': 7,
      'GitHub': 6,
      'Stack Overflow': 7,
      'MDN Web Docs': 9,
      'Microsoft Docs': 8,
      'Web': 5
    };
    
    score += platformScores[platform] || 5;
    
    return Math.min(score, 100); // Cap at 100
  }

  // Calculate quality score based on various factors
  calculateQualityScore(item) {
    let score = 50; // Base score
    
    // URL quality indicators
    const url = item.link.toLowerCase();
    if (url.includes('edu') || url.includes('university')) score += 10;
    if (url.includes('official') || url.includes('docs')) score += 8;
    if (url.includes('github.com')) score += 5;
    
    // Title quality indicators
    const title = item.title.toLowerCase();
    if (title.includes('tutorial') || title.includes('guide')) score += 5;
    if (title.includes('complete') || title.includes('comprehensive')) score += 8;
    if (title.includes('beginner') || title.includes('advanced')) score += 3;
    
    // Snippet quality indicators
    const snippet = item.snippet.toLowerCase();
    if (snippet.includes('step-by-step') || snippet.includes('hands-on')) score += 5;
    if (snippet.includes('examples') || snippet.includes('practical')) score += 3;
    
    return Math.min(score, 100);
  }

  // Rank and personalize results based on user profile
  rankAndPersonalizeResults(results, query, domain, category, skillLevel, userProfile) {
    // Remove duplicates based on URL
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );
    
    // Calculate personalized scores
    const personalizedResults = uniqueResults.map(result => ({
      ...result,
      personalizedScore: this.calculatePersonalizedScore(result, userProfile, skillLevel)
    }));
    
    // Sort by combined score (relevance + quality + personalization)
    const rankedResults = personalizedResults.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.4) + (a.qualityScore * 0.3) + (a.personalizedScore * 0.3);
      const scoreB = (b.relevanceScore * 0.4) + (b.qualityScore * 0.3) + (b.personalizedScore * 0.3);
      return scoreB - scoreA;
    });
    
    // Return top 15 results
    return rankedResults.slice(0, 15);
  }

  // Calculate personalized score based on user profile
  calculatePersonalizedScore(result, userProfile, skillLevel) {
    let score = 50; // Base personalization score
    
    const learningStyle = userProfile.learningStyle || 'visual';
    const experience = userProfile.experience || 'beginner';
    const interests = userProfile.interests || [];
    
    // Learning style preferences
    if (learningStyle === 'visual' && result.type === 'video') score += 15;
    if (learningStyle === 'reading' && (result.type === 'article' || result.type === 'documentation')) score += 15;
    if (learningStyle === 'hands-on' && (result.type === 'project' || result.title.toLowerCase().includes('hands-on'))) score += 15;
    
    // Experience level matching
    if (experience === skillLevel) score += 10;
    if (result.difficulty === skillLevel) score += 15;
    
    // Interest matching
    interests.forEach(interest => {
      if (result.title.toLowerCase().includes(interest.toLowerCase()) || 
          result.description.toLowerCase().includes(interest.toLowerCase())) {
        score += 10;
      }
    });
    
    // Platform preferences
    const preferredPlatforms = userProfile.preferredPlatforms || [];
    if (preferredPlatforms.includes(result.platform)) score += 10;
    
    return Math.min(score, 100);
  }

  // Helper methods for keyword extraction
  getDomainKeywords(domain) {
    const domainMap = {
      'software_engineering': ['programming', 'software', 'development', 'coding', 'computer science'],
      'data_science': ['data science', 'machine learning', 'analytics', 'statistics', 'python'],
      'mechanical_engineering': ['mechanical', 'engineering', 'design', 'manufacturing', 'mechanics'],
      'electrical_engineering': ['electrical', 'electronics', 'circuits', 'power', 'systems'],
      'civil_engineering': ['civil', 'construction', 'infrastructure', 'structural', 'environmental']
    };
    
    return domainMap[domain] || [domain];
  }

  getSkillLevelKeywords(skillLevel) {
    const skillMap = {
      'beginner': ['tutorial', 'introduction', 'basics', 'fundamentals', 'getting started', 'learn'],
      'intermediate': ['intermediate', 'advanced', 'projects', 'applications', 'practical', 'hands-on'],
      'advanced': ['expert', 'mastery', 'specialization', 'research', 'cutting-edge', 'professional']
    };
    
    return skillMap[skillLevel] || [];
  }

  getCategoryKeywords(category) {
    const categoryMap = {
      'foundation': ['fundamentals', 'basics', 'principles', 'concepts'],
      'intermediate': ['intermediate', 'applications', 'projects', 'practical'],
      'advanced': ['advanced', 'expert', 'specialization', 'mastery'],
      'real_world': ['industry', 'professional', 'real-world', 'portfolio', 'career']
    };
    
    return categoryMap[category] || [category];
  }

  // Extract tags from title and snippet
  extractTags(title, snippet) {
    const text = `${title} ${snippet}`.toLowerCase();
    const commonTags = [
      'tutorial', 'guide', 'course', 'project', 'example', 'practice',
      'hands-on', 'beginner', 'intermediate', 'advanced', 'expert',
      'free', 'paid', 'video', 'article', 'documentation', 'book'
    ];
    
    return commonTags.filter(tag => text.includes(tag));
  }

  // Estimate content duration
  estimateContentDuration(title, snippet) {
    const text = `${title} ${snippet}`.toLowerCase();
    
    if (text.includes('minute') || text.includes('min')) {
      const match = text.match(/(\d+)\s*min/);
      return match ? `${match[1]} minutes` : 'Short';
    } else if (text.includes('hour') || text.includes('hr')) {
      const match = text.match(/(\d+)\s*hr/);
      return match ? `${match[1]} hours` : 'Medium';
    } else if (text.includes('week') || text.includes('course')) {
      return 'Long';
    } else {
      return 'Medium';
    }
  }

  // Estimate difficulty level
  estimateDifficulty(title, snippet, skillLevel) {
    const text = `${title} ${snippet}`.toLowerCase();
    
    if (text.includes('beginner') || text.includes('introduction') || text.includes('basics')) {
      return 'beginner';
    } else if (text.includes('advanced') || text.includes('expert') || text.includes('mastery')) {
      return 'advanced';
    } else {
      return skillLevel || 'intermediate';
    }
  }

  // Estimate cost
  estimateCost(url, title) {
    const text = `${url} ${title}`.toLowerCase();
    
    if (text.includes('free') || text.includes('gratis') || 
        url.includes('github.com') || url.includes('youtube.com')) {
      return 'free';
    } else if (text.includes('paid') || text.includes('premium') || 
               url.includes('udemy.com') || url.includes('coursera.org')) {
      return 'paid';
    } else {
      return 'unknown';
    }
  }

  // Estimate rating
  estimateRating(url, title) {
    const platform = this.extractPlatform(url);
    const platformRatings = {
      'YouTube': 4.2,
      'Coursera': 4.6,
      'Udemy': 4.4,
      'edX': 4.5,
      'Khan Academy': 4.7,
      'FreeCodeCamp': 4.3,
      'GitHub': 4.0,
      'Stack Overflow': 4.1,
      'MDN Web Docs': 4.8,
      'Microsoft Docs': 4.6,
      'Web': 4.0
    };
    
    return platformRatings[platform] || 4.0;
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Fallback results when API fails
  getFallbackResults(query, domain, category) {
    return [
      {
        id: 'fallback_1',
        title: `${query} - ${domain} Learning Resource`,
        description: `Comprehensive learning resource for ${query} in ${domain}`,
        url: 'https://www.google.com/search?q=' + encodeURIComponent(query),
        type: 'web',
        platform: 'Google Search',
        domain: domain,
        category: category,
        skillLevel: 'beginner',
        relevanceScore: 50,
        qualityScore: 50,
        personalizedScore: 50,
        source: 'Fallback',
        cost: 'free',
        difficulty: 'beginner',
        rating: 4.0
      }
    ];
  }
}

export default GoogleSearchService;