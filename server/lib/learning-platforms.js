// Learning Platform Integration System
// Comprehensive resource extraction from real learning platforms

import axios from 'axios';
import GoogleSearchService from './google-search-service.js';
import GoogleAPIsService from './google-apis-service.js';

// Platform configurations with API endpoints and search parameters
const LEARNING_PLATFORMS = {
  // Video Learning Platforms
  youtube: {
    name: 'YouTube',
    type: 'video',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    apiKey: process.env.VITE_YOUTUBE_API_KEY,
    searchEndpoint: '/search',
    videoEndpoint: '/videos',
    searchParams: {
      part: 'snippet',
      type: 'video',
      maxResults: 10,
      order: 'relevance'
    }
  },
  
  coursera: {
    name: 'Coursera',
    type: 'course',
    baseUrl: 'https://api.coursera.org/api',
    searchEndpoint: '/courses.v1',
    searchParams: {
      q: '',
      limit: 10,
      fields: 'id,name,description,instructorIds,photoUrl,shortDescription'
    }
  },
  
  udemy: {
    name: 'Udemy',
    type: 'course',
    baseUrl: 'https://www.udemy.com/api-2.0',
    searchEndpoint: '/courses',
    searchParams: {
      search: '',
      page_size: 10,
      ordering: 'relevance'
    }
  },
  
  edx: {
    name: 'edX',
    type: 'course',
    baseUrl: 'https://api.edx.org',
    searchEndpoint: '/catalog/v1/courses',
    searchParams: {
      search: '',
      limit: 10
    }
  },
  
  khan_academy: {
    name: 'Khan Academy',
    type: 'course',
    baseUrl: 'https://www.khanacademy.org/api/v1',
    searchEndpoint: '/search',
    searchParams: {
      query: '',
      kind: 'video'
    }
  },
  
  freecodecamp: {
    name: 'freeCodeCamp',
    type: 'course',
    baseUrl: 'https://www.freecodecamp.org',
    searchEndpoint: '/api/v1/curriculum',
    searchParams: {
      challenge_type: '',
      difficulty: ''
    },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Nexa-Pathfinder/1.0'
    }
  },
  
  linkedin_learning: {
    name: 'LinkedIn Learning',
    type: 'course',
    baseUrl: 'https://api.linkedin.com/v2',
    searchEndpoint: '/learningAssets',
    searchParams: {
      q: '',
      count: 10,
      start: 0
    },
    headers: {
      'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
      'Accept': 'application/json'
    }
  },
  
  // Project Platforms
  github: {
    name: 'GitHub',
    type: 'project',
    baseUrl: 'https://api.github.com',
    searchEndpoint: '/search/repositories',
    searchParams: {
      q: '',
      sort: 'stars',
      order: 'desc',
      per_page: 10
    }
  },
  
  codepen: {
    name: 'CodePen',
    type: 'project',
    baseUrl: 'https://codepen.io/api',
    searchEndpoint: '/pens/popular',
    searchParams: {
      limit: 10
    }
  },
  
  // Documentation and Reference
  mdn: {
    name: 'MDN Web Docs',
    type: 'documentation',
    baseUrl: 'https://developer.mozilla.org',
    searchEndpoint: '/api/v1/search',
    searchParams: {
      q: '',
      locale: 'en-US'
    }
  },
  
  stack_overflow: {
    name: 'Stack Overflow',
    type: 'community',
    baseUrl: 'https://api.stackexchange.com/2.3',
    searchEndpoint: '/search/advanced',
    searchParams: {
      order: 'desc',
      sort: 'relevance',
      site: 'stackoverflow',
      pagesize: 10
    }
  },
  
  // Research and Academic
  arxiv: {
    name: 'arXiv',
    type: 'research',
    baseUrl: 'http://export.arxiv.org/api/query',
    searchParams: {
      search_query: '',
      start: 0,
      max_results: 10,
      sortBy: 'relevance',
      sortOrder: 'descending'
    }
  },
  
  google_scholar: {
    name: 'Google Scholar',
    type: 'research',
    baseUrl: 'https://scholar.google.com',
    searchEndpoint: '/scholar',
    searchParams: {
      q: '',
      hl: 'en',
      as_sdt: '0,5'
    }
  },
  
  // Patent and Innovation
  uspto: {
    name: 'USPTO',
    type: 'patent',
    baseUrl: 'https://developer.uspto.gov',
    searchEndpoint: '/ibd-api/v1/patent/application',
    searchParams: {
      searchText: '',
      start: 0,
      rows: 10
    }
  },
  
  // Blogs and Articles
  medium: {
    name: 'Medium',
    type: 'article',
    baseUrl: 'https://api.medium.com/v1',
    searchEndpoint: '/publications',
    searchParams: {
      query: '',
      limit: 10
    }
  },
  
  dev_to: {
    name: 'Dev.to',
    type: 'article',
    baseUrl: 'https://dev.to/api',
    searchEndpoint: '/articles',
    searchParams: {
      tag: '',
      per_page: 10
    }
  }
};

// Learning Categories with structured progression
const LEARNING_CATEGORIES = {
  foundation: {
    name: 'Foundation Skills and Concepts',
    description: 'Begin with basic skills essential for any engineering discipline',
    duration: '2-4 months',
    skills: [
      'Mathematics (Calculus, Linear Algebra, Statistics)',
      'Fundamental Physics (Mechanics, Thermodynamics)',
      'Computing Basics (Programming, Data Structures)',
      'Problem Solving and Critical Thinking',
      'Technical Communication'
    ],
    platforms: ['khan_academy', 'coursera', 'youtube', 'mdn'],
    difficulty: 'beginner'
  },
  
  intermediate: {
    name: 'Intermediate Topics and Projects',
    description: 'Dive into more complex engineering principles and start working on projects',
    duration: '3-6 months',
    skills: [
      'Specialized Engineering Principles',
      'Project Management',
      'System Design',
      'Data Analysis',
      'Software Development'
    ],
    platforms: ['udemy', 'edx', 'github', 'stack_overflow'],
    difficulty: 'intermediate'
  },
  
  advanced: {
    name: 'Advanced Specializations',
    description: 'Choose a specific field within engineering and master advanced concepts',
    duration: '6-12 months',
    skills: [
      'Domain-Specific Expertise',
      'Advanced Mathematics',
      'Research Methods',
      'Innovation and Design',
      'Leadership Skills'
    ],
    platforms: ['coursera', 'arxiv', 'google_scholar', 'uspto'],
    difficulty: 'advanced'
  },
  
  real_world: {
    name: 'Real-World Applications and Portfolio Building',
    description: 'Engage in internships and projects to gather real-world experience',
    duration: '6-18 months',
    skills: [
      'Industry Experience',
      'Portfolio Development',
      'Professional Networking',
      'Business Acumen',
      'Mentorship and Leadership'
    ],
    platforms: ['github', 'medium', 'dev_to', 'linkedin'],
    difficulty: 'expert'
  }
};

// Domain-specific resource mappings
const DOMAIN_RESOURCES = {
  'software_engineering': {
    foundation: ['programming_basics', 'data_structures', 'algorithms', 'computer_science_fundamentals'],
    intermediate: ['web_development', 'mobile_development', 'database_design', 'system_architecture'],
    advanced: ['machine_learning', 'artificial_intelligence', 'blockchain', 'cloud_computing'],
    real_world: ['open_source_contributions', 'startup_experience', 'tech_leadership', 'product_management']
  },
  
  'mechanical_engineering': {
    foundation: ['mechanics', 'thermodynamics', 'materials_science', 'mathematics'],
    intermediate: ['cad_design', 'manufacturing', 'robotics', 'automotive'],
    advanced: ['aerospace', 'biomedical_engineering', 'renewable_energy', 'nanotechnology'],
    real_world: ['product_design', 'manufacturing_experience', 'research_publications', 'patent_development']
  },
  
  'electrical_engineering': {
    foundation: ['circuit_analysis', 'electronics', 'digital_systems', 'mathematics'],
    intermediate: ['power_systems', 'control_systems', 'communications', 'embedded_systems'],
    advanced: ['renewable_energy', 'smart_grids', 'iot', 'quantum_computing'],
    real_world: ['power_plant_experience', 'telecommunications', 'research_development', 'consulting']
  },
  
  'civil_engineering': {
    foundation: ['structural_analysis', 'materials_science', 'geotechnical_engineering', 'mathematics'],
    intermediate: ['construction_management', 'environmental_engineering', 'transportation', 'urban_planning'],
    advanced: ['sustainable_design', 'disaster_resilience', 'smart_cities', 'infrastructure_technology'],
    real_world: ['construction_projects', 'government_consulting', 'research_institutions', 'international_development']
  }
};

class LearningPlatformService {
  constructor() {
    this.platforms = LEARNING_PLATFORMS;
    this.categories = LEARNING_CATEGORIES;
    this.domainResources = DOMAIN_RESOURCES;
    this.googleSearchService = new GoogleSearchService();
    this.googleAPIsService = new GoogleAPIsService();
  }

  // Search for resources using comprehensive Google APIs as primary method
  async searchResources(query, domain, category, skillLevel) {
    const results = {
      foundation: [],
      intermediate: [],
      advanced: [],
      real_world: []
    };

    try {
      console.log(`🔍 Google APIs Search for: "${query}" in domain: ${domain}, category: ${category}`);
      
      // Primary: Use comprehensive Google APIs service
      const googleAPIsResults = await this.googleAPIsService.searchLearningResources(
        query, domain, category, skillLevel
      );
      
      // Merge results from all categories
      Object.keys(googleAPIsResults).forEach(cat => {
        results[cat] = googleAPIsResults[cat];
      });
      
      // Secondary: Supplement with direct platform APIs for specific platforms (only if Google APIs fail)
      if (results[category].length < 5) {
        console.log(`📡 Supplementing with direct platform APIs...`);
        const categoryInfo = this.categories[category];
        const platforms = categoryInfo.platforms.slice(0, 2); // Limit to top 2 platforms
        
        const platformPromises = platforms.map(async (platformId) => {
          const platform = this.platforms[platformId];
          if (!platform || !platform.apiKey) return [];

          try {
            console.log(`📡 Supplementing with ${platform.name}...`);
            const platformResults = await this.searchPlatform(platform, query, domain, skillLevel);
            console.log(`✅ Found ${platformResults.length} additional results from ${platform.name}`);
            return platformResults;
          } catch (error) {
            console.error(`❌ Error searching ${platform.name}:`, error.message);
            return [];
          }
        });

        // Wait for platform searches to complete
        const platformResults = await Promise.all(platformPromises);
        
        // Add platform results to Google results
        platformResults.forEach(platformResults => {
          results[category].push(...platformResults);
        });
      }

      // Final ranking and deduplication
      results[category] = this.rankAndDeduplicate(results[category], query, skillLevel);
      
      console.log(`🎯 Total results for ${category}: ${results[category].length} (Google APIs: ${googleAPIsResults[category]?.length || 0})`);
      return results;
    } catch (error) {
      console.error('Error in searchResources:', error);
      return results;
    }
  }

  // Search a specific platform
  async searchPlatform(platform, query, domain, skillLevel) {
    const searchQuery = this.buildSearchQuery(query, domain, skillLevel);
    
    switch (platform.type) {
      case 'video':
        return await this.searchVideoPlatform(platform, searchQuery);
      case 'course':
        return await this.searchCoursePlatform(platform, searchQuery);
      case 'project':
        return await this.searchProjectPlatform(platform, searchQuery);
      case 'documentation':
        return await this.searchDocumentationPlatform(platform, searchQuery);
      case 'research':
        return await this.searchResearchPlatform(platform, searchQuery);
      case 'article':
        return await this.searchArticlePlatform(platform, searchQuery);
      default:
        return [];
    }
  }

  // Build optimized search query
  buildSearchQuery(query, domain, skillLevel) {
    const domainKeywords = this.getDomainKeywords(domain);
    const skillKeywords = this.getSkillKeywords(skillLevel);
    
    return `${query} ${domainKeywords.join(' ')} ${skillKeywords.join(' ')}`.trim();
  }

  // Get domain-specific keywords
  getDomainKeywords(domain) {
    const domainMap = {
      'software_engineering': ['programming', 'software', 'development', 'coding', 'computer science'],
      'mechanical_engineering': ['mechanical', 'engineering', 'design', 'manufacturing', 'mechanics'],
      'electrical_engineering': ['electrical', 'electronics', 'circuits', 'power', 'systems'],
      'civil_engineering': ['civil', 'construction', 'infrastructure', 'structural', 'environmental']
    };
    
    return domainMap[domain] || [];
  }

  // Get skill-level keywords
  getSkillKeywords(skillLevel) {
    const skillMap = {
      'beginner': ['tutorial', 'introduction', 'basics', 'fundamentals', 'getting started'],
      'intermediate': ['intermediate', 'advanced', 'projects', 'applications', 'practical'],
      'advanced': ['expert', 'mastery', 'specialization', 'research', 'cutting-edge'],
      'expert': ['professional', 'industry', 'real-world', 'portfolio', 'leadership']
    };
    
    return skillMap[skillLevel] || [];
  }

  // Search video platforms (YouTube, Khan Academy) with REAL API calls
  async searchVideoPlatform(platform, query) {
    if (!platform.apiKey) {
      console.warn(`⚠️ No API key for ${platform.name}, using fallback`);
      return this.getFallbackVideoResources(query);
    }

    try {
      console.log(`📺 Searching ${platform.name} for: "${query}"`);
      
      const params = {
        ...platform.searchParams,
        q: query,
        key: platform.apiKey  // YouTube uses 'key' parameter, not Authorization header
      };

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });

      const results = this.formatVideoResults(response.data, platform);
      console.log(`📺 ${platform.name} returned ${results.length} videos`);
      return results;
    } catch (error) {
      console.error(`❌ Error searching ${platform.name}:`, error.message);
      return this.getFallbackVideoResources(query);
    }
  }

  // Search course platforms (Coursera, Udemy, edX, freeCodeCamp) with REAL API calls
  async searchCoursePlatform(platform, query) {
    try {
      console.log(`🎓 Searching ${platform.name} for: "${query}"`);
      
      const params = {
        ...platform.searchParams,
        search: query
      };

      const config = {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nexa-Pathfinder/1.0'
        }
      };

      // Add platform-specific headers
      if (platform.headers) {
        config.headers = { ...config.headers, ...platform.headers };
      }

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, config);
      const results = this.formatCourseResults(response.data, platform);
      
      console.log(`🎓 ${platform.name} returned ${results.length} courses`);
      return results;
    } catch (error) {
      console.error(`❌ Error searching ${platform.name}:`, error.message);
      return this.getFallbackCourseResources(query);
    }
  }

  // Search project platforms (GitHub, CodePen)
  async searchProjectPlatform(platform, query) {
    try {
      const params = {
        ...platform.searchParams,
        q: query
      };

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, {
        params,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return this.formatProjectResults(response.data, platform);
    } catch (error) {
      console.error(`Error searching ${platform.name}:`, error);
      return this.getFallbackProjectResources(query);
    }
  }

  // Search documentation platforms (MDN, Stack Overflow)
  async searchDocumentationPlatform(platform, query) {
    try {
      const params = {
        ...platform.searchParams,
        q: query
      };

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, {
        params
      });

      return this.formatDocumentationResults(response.data, platform);
    } catch (error) {
      console.error(`Error searching ${platform.name}:`, error);
      return this.getFallbackDocumentationResources(query);
    }
  }

  // Search research platforms (arXiv, Google Scholar)
  async searchResearchPlatform(platform, query) {
    try {
      const params = {
        ...platform.searchParams,
        search_query: query
      };

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, {
        params
      });

      return this.formatResearchResults(response.data, platform);
    } catch (error) {
      console.error(`Error searching ${platform.name}:`, error);
      return this.getFallbackResearchResources(query);
    }
  }

  // Search article platforms (Medium, Dev.to)
  async searchArticlePlatform(platform, query) {
    try {
      const params = {
        ...platform.searchParams,
        query: query
      };

      const response = await axios.get(`${platform.baseUrl}${platform.searchEndpoint}`, {
        params
      });

      return this.formatArticleResults(response.data, platform);
    } catch (error) {
      console.error(`Error searching ${platform.name}:`, error);
      return this.getFallbackArticleResources(query);
    }
  }

  // Format results for different platform types
  formatVideoResults(data, platform) {
    if (!data.items) return [];
    
    return data.items.map(item => ({
      id: item.id.videoId || item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`,
      type: 'video',
      platform: platform.name,
      duration: item.contentDetails?.duration || 'Unknown',
      views: item.statistics?.viewCount || 0,
      rating: 4.5,
      cost: 'free',
      difficulty: 'beginner',
      provider: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url
    }));
  }

  formatCourseResults(data, platform) {
    if (!data.elements) return [];
    
    return data.elements.map(course => ({
      id: course.id,
      title: course.name,
      description: course.shortDescription || course.description,
      url: `https://www.coursera.org/learn/${course.slug}`,
      type: 'course',
      platform: platform.name,
      duration: course.estimatedClassWorkload || 'Unknown',
      rating: course.averageFiveStarRating || 4.0,
      cost: 'paid',
      difficulty: 'intermediate',
      provider: course.partnerIds?.[0] || platform.name,
      instructor: course.instructorIds?.[0] || 'Unknown'
    }));
  }

  formatProjectResults(data, platform) {
    if (!data.items) return [];
    
    return data.items.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description,
      url: project.html_url || project.url,
      type: 'project',
      platform: platform.name,
      duration: 'Ongoing',
      rating: 4.0,
      cost: 'free',
      difficulty: 'intermediate',
      provider: project.owner?.login || 'Unknown',
      stars: project.stargazers_count || 0,
      language: project.language
    }));
  }

  formatDocumentationResults(data, platform) {
    if (!data.documents) return [];
    
    return data.documents.map(doc => ({
      id: doc.slug,
      title: doc.title,
      description: doc.summary,
      url: `https://developer.mozilla.org${doc.url}`,
      type: 'documentation',
      platform: platform.name,
      duration: 'Reference',
      rating: 4.8,
      cost: 'free',
      difficulty: 'beginner',
      provider: 'Mozilla',
      tags: doc.tags || []
    }));
  }

  formatResearchResults(data, platform) {
    if (!data.feed?.entry) return [];
    
    return data.feed.entry.map(paper => ({
      id: paper.id,
      title: paper.title,
      description: paper.summary,
      url: paper.link?.[0]?.href || '#',
      type: 'research',
      platform: platform.name,
      duration: 'Academic',
      rating: 4.2,
      cost: 'free',
      difficulty: 'advanced',
      provider: paper.author?.[0]?.name || 'Unknown',
      published: paper.published,
      authors: paper.author?.map(a => a.name) || []
    }));
  }

  formatArticleResults(data, platform) {
    if (!Array.isArray(data)) return [];
    
    return data.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      type: 'article',
      platform: platform.name,
      duration: '15-30 min read',
      rating: article.public_reactions_count || 4.0,
      cost: 'free',
      difficulty: 'intermediate',
      provider: article.user?.name || 'Unknown',
      published: article.published_at,
      tags: article.tag_list || []
    }));
  }

  // Rank resources by relevance and quality
  rankResources(resources, query, skillLevel) {
    return resources
      .map(resource => ({
        ...resource,
        relevanceScore: this.calculateRelevanceScore(resource, query, skillLevel)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8); // Return top 8 resources
  }

  // Rank and deduplicate resources (enhanced version)
  rankAndDeduplicate(resources, query, skillLevel) {
    // Remove duplicates based on URL
    const uniqueResources = resources.filter((resource, index, self) => 
      index === self.findIndex(r => r.url === resource.url)
    );

    // Calculate relevance scores for resources that don't have them
    const scoredResources = uniqueResources.map(resource => ({
      ...resource,
      relevanceScore: resource.relevanceScore || this.calculateRelevanceScore(resource, query, skillLevel)
    }));

    // Sort by relevance and quality
    return scoredResources
      .sort((a, b) => {
        // Primary sort: final score (if available from Google Search)
        const scoreA = a.finalScore || a.relevanceScore || 0;
        const scoreB = b.finalScore || b.relevanceScore || 0;
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        
        // Secondary sort: rating
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        
        // Tertiary sort: platform priority
        const priorityA = this.getPlatformPriority(a.platform);
        const priorityB = this.getPlatformPriority(b.platform);
        
        return priorityB - priorityA;
      })
      .slice(0, 15); // Return top 15 results
  }

  // Calculate relevance score for ranking
  calculateRelevanceScore(resource, query, skillLevel) {
    let score = 0;
    
    // Title match
    if (resource.title.toLowerCase().includes(query.toLowerCase())) {
      score += 10;
    }
    
    // Description match
    if (resource.description.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    
    // Skill level match
    if (resource.difficulty === skillLevel) {
      score += 8;
    }
    
    // Platform quality
    const platformScores = {
      'YouTube': 7,
      'Coursera': 9,
      'Udemy': 8,
      'edX': 9,
      'Khan Academy': 8,
      'GitHub': 6,
      'MDN Web Docs': 9,
      'Stack Overflow': 7,
      'arXiv': 8,
      'Medium': 6,
      'Dev.to': 7
    };
    
    score += platformScores[resource.platform] || 5;
    
    // Rating bonus
    score += (resource.rating || 4.0) * 2;
    
    return score;
  }

  // Get platform priority for ranking
  getPlatformPriority(platform) {
    const priorities = {
      'YouTube': 9,
      'Coursera': 8,
      'Udemy': 7,
      'edX': 7,
      'Khan Academy': 6,
      'freeCodeCamp': 6,
      'GitHub': 8,
      'Stack Overflow': 7,
      'MDN Web Docs': 6,
      'Medium': 5,
      'Dev.to': 5,
      'arXiv': 4,
      'Google Scholar': 3,
      'Google Search': 5
    };
    return priorities[platform] || 1;
  }

  // Fallback resources when APIs fail
  getFallbackVideoResources(query) {
    return [
      {
        id: 'fallback_1',
        title: `${query} - Complete Tutorial`,
        description: `Comprehensive tutorial covering ${query} from basics to advanced`,
        url: 'https://www.youtube.com',
        type: 'video',
        platform: 'YouTube',
        duration: '2-4 hours',
        rating: 4.5,
        cost: 'free',
        difficulty: 'beginner',
        provider: 'Educational Channel'
      }
    ];
  }

  getFallbackCourseResources(query) {
    return [
      {
        id: 'fallback_2',
        title: `${query} - Professional Course`,
        description: `Professional course covering ${query} with hands-on projects`,
        url: 'https://www.coursera.org',
        type: 'course',
        platform: 'Coursera',
        duration: '4-8 weeks',
        rating: 4.7,
        cost: 'paid',
        difficulty: 'intermediate',
        provider: 'University Partner'
      }
    ];
  }

  getFallbackProjectResources(query) {
    return [
      {
        id: 'fallback_3',
        title: `${query} - Open Source Project`,
        description: `Open source project demonstrating ${query} implementation`,
        url: 'https://github.com',
        type: 'project',
        platform: 'GitHub',
        duration: 'Ongoing',
        rating: 4.2,
        cost: 'free',
        difficulty: 'intermediate',
        provider: 'Open Source Community'
      }
    ];
  }

  getFallbackDocumentationResources(query) {
    return [
      {
        id: 'fallback_4',
        title: `${query} - Official Documentation`,
        description: `Official documentation and reference for ${query}`,
        url: 'https://developer.mozilla.org',
        type: 'documentation',
        platform: 'MDN Web Docs',
        duration: 'Reference',
        rating: 4.8,
        cost: 'free',
        difficulty: 'beginner',
        provider: 'Mozilla'
      }
    ];
  }

  getFallbackResearchResources(query) {
    return [
      {
        id: 'fallback_5',
        title: `${query} - Research Paper`,
        description: `Academic research paper on ${query}`,
        url: 'https://arxiv.org',
        type: 'research',
        platform: 'arXiv',
        duration: 'Academic',
        rating: 4.0,
        cost: 'free',
        difficulty: 'advanced',
        provider: 'Academic Institution'
      }
    ];
  }

  getFallbackArticleResources(query) {
    return [
      {
        id: 'fallback_6',
        title: `${query} - Technical Article`,
        description: `In-depth technical article about ${query}`,
        url: 'https://medium.com',
        type: 'article',
        platform: 'Medium',
        duration: '10-15 min read',
        rating: 4.3,
        cost: 'free',
        difficulty: 'intermediate',
        provider: 'Technical Writer'
      }
    ];
  }

  // Get learning categories
  getLearningCategories() {
    return this.categories;
  }

  // Get domain-specific resources
  getDomainResources(domain) {
    return this.domainResources[domain] || {};
  }
}

export default LearningPlatformService;
