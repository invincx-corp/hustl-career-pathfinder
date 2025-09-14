// Application Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
    timeout: 10000,
    retries: 3
  },

  // Socket Configuration
  socket: {
    url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    }
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // AI Configuration
  ai: {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      enabled: !!(import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here')
    },
    huggingface: {
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
      enabled: !!(import.meta.env.VITE_HUGGINGFACE_API_KEY && import.meta.env.VITE_HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here')
    },
    cohere: {
      apiKey: import.meta.env.VITE_COHERE_API_KEY || '',
      enabled: !!(import.meta.env.VITE_COHERE_API_KEY && import.meta.env.VITE_COHERE_API_KEY !== 'your_cohere_api_key_here')
    }
  },

  // Feature Flags
  features: {
    realTimeEnabled: true,
    aiEnabled: true,
    databaseEnabled: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    mockDataEnabled: true, // Enable when no real services are configured
    offlineMode: false,
    notifications: true,
    analytics: true
  },

  // App Configuration
  app: {
    name: 'Nexa Career Pathfinder',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    debug: import.meta.env.MODE === 'development'
  },

  // UI Configuration
  ui: {
    theme: 'light',
    language: 'en',
    animations: true,
    sounds: false
  }
};

export default config;
