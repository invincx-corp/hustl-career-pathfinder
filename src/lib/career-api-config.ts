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

  // Job Positions API by SharpAPI
  SHARPAPI: {
    baseURL: 'https://api.sharpapi.com',
    apiKey: process.env.VITE_SHARPAPI_KEY || '',
    rateLimit: 100, // requests per hour (free tier)
    enabled: !!process.env.VITE_SHARPAPI_KEY
  },

  // Job Listings API by Enrich.so
  ENRICH: {
    baseURL: 'https://api.enrich.so',
    apiKey: process.env.VITE_ENRICH_API_KEY || '',
    rateLimit: 50, // requests per hour (free tier)
    enabled: !!process.env.VITE_ENRICH_API_KEY
  },

  // Jobs API by Coresignal
  CORESIGNAL: {
    baseURL: 'https://api.coresignal.com',
    apiKey: process.env.VITE_CORESIGNAL_API_KEY || '',
    rateLimit: 100, // requests per hour (free tier)
    enabled: !!process.env.VITE_CORESIGNAL_API_KEY
  },

  // Job Postings API by JobDataFeeds
  JOBDATAFEEDS: {
    baseURL: 'https://api.jobdatafeeds.com',
    apiKey: process.env.VITE_JOBDATAFEEDS_API_KEY || '',
    rateLimit: 50, // requests per hour (free tier)
    enabled: !!process.env.VITE_JOBDATAFEEDS_API_KEY
  },

  // Career Site Job Listing API by Apify
  APIFY: {
    baseURL: 'https://api.apify.com',
    apiKey: process.env.VITE_APIFY_API_KEY || '',
    rateLimit: 100, // requests per hour (free tier)
    enabled: !!process.env.VITE_APIFY_API_KEY
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
