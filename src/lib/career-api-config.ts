// =====================================================
// CAREER API CONFIGURATION
// =====================================================
// Configuration for various career APIs
// Add your API keys here for production use

export const CAREER_API_CONFIG = {
  // O*NET API (Free, no key required)
  ONET: {
    baseURL: 'https://api.onetcenter.org/ws/online',
    apiKey: null, // No key required
    rateLimit: 1000, // requests per hour
    enabled: true
  },

  // GitHub API for developer jobs and repositories
  GITHUB: {
    baseURL: 'https://api.github.com',
    apiKey: import.meta.env.VITE_GITHUB_API_KEY || '',
    rateLimit: 5000, // requests per hour (authenticated)
    enabled: !!import.meta.env.VITE_GITHUB_API_KEY
  },

  // Twitter API for tech trends and job discussions
  TWITTER: {
    baseURL: 'https://api.twitter.com/2',
    apiKey: import.meta.env.VITE_TWITTER_API_KEY || '',
    rateLimit: 300, // requests per 15 minutes
    enabled: !!import.meta.env.VITE_TWITTER_API_KEY
  },

  // Dev.to API for developer articles and jobs
  DEVTO: {
    baseURL: 'https://dev.to/api',
    apiKey: import.meta.env.VITE_DEVTO_API_KEY || '',
    rateLimit: 1000, // requests per hour
    enabled: !!import.meta.env.VITE_DEVTO_API_KEY
  },

  // Stack Overflow API for Q&A and job insights
  STACKOVERFLOW: {
    baseURL: 'https://api.stackexchange.com/2.3',
    apiKey: import.meta.env.VITE_STACKOVERFLOW_API_KEY || '',
    rateLimit: 10000, // requests per day
    enabled: !!import.meta.env.VITE_STACKOVERFLOW_API_KEY
  },

  // Job Postings API by JobDataFeeds
  JOBDATAFEEDS: {
    baseURL: 'https://api.jobdatafeeds.com',
    apiKey: import.meta.env.VITE_JOBDATAFEEDS_API_KEY || '',
    rateLimit: 50, // requests per hour (free tier)
    enabled: !!import.meta.env.VITE_JOBDATAFEEDS_API_KEY
  },

  // Career Site Job Listing API by Apify
  APIFY: {
    baseURL: 'https://api.apify.com',
    apiKey: import.meta.env.VITE_APIFY_API_KEY || '',
    rateLimit: 100, // requests per hour (free tier)
    enabled: !!import.meta.env.VITE_APIFY_API_KEY
  }
};

// Fallback to local data if no APIs are available
export const FALLBACK_TO_LOCAL = true;

// Cache configuration
export const CACHE_CONFIG = {
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxSize: 100, // Maximum number of cached items
  enabled: true
};

// Search configuration
export const SEARCH_CONFIG = {
  defaultLimit: 50,
  maxLimit: 1000,
  debounceMs: 300,
  minQueryLength: 2
};

export default CAREER_API_CONFIG;
