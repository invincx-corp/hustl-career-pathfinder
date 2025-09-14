export default {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  database: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  ai: {
    openai: {
      apiKey: process.env.VITE_OPENAI_API_KEY
    },
    huggingface: {
      apiKey: process.env.VITE_HUGGINGFACE_API_KEY
    },
    cohere: {
      apiKey: process.env.VITE_COHERE_API_KEY
    }
  },
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true
  }
};

