// =====================================================
// INTEGRATED API SERVICE
// =====================================================
// Comprehensive API integration using all available keys from .env
// Provides real-time data from multiple sources

import { CAREER_API_CONFIG } from './career-api-config';

export interface IntegratedAPIResponse {
  success: boolean;
  data: any;
  source: string;
  timestamp: string;
  error?: string;
}

export class IntegratedAPIService {
  private static instance: IntegratedAPIService;
  private apiKeys: Record<string, string> = {};

  constructor() {
    this.initializeAPIKeys();
  }

  static getInstance(): IntegratedAPIService {
    if (!IntegratedAPIService.instance) {
      IntegratedAPIService.instance = new IntegratedAPIService();
    }
    return IntegratedAPIService.instance;
  }

  private initializeAPIKeys() {
    // AI Services - Check both VITE_ and non-VITE_ prefixed variables
    this.apiKeys.openai = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || '';
    this.apiKeys.huggingface = import.meta.env.VITE_HUGGINGFACE_API_KEY || import.meta.env.HUGGINGFACE_API_KEY || '';
    this.apiKeys.cohere = import.meta.env.VITE_COHERE_API_KEY || import.meta.env.COHERE_API_KEY || '';

    // Career APIs
    this.apiKeys.github = import.meta.env.VITE_GITHUB_API_KEY || '';
    this.apiKeys.twitter = import.meta.env.VITE_TWITTER_API_KEY || '';
    this.apiKeys.devto = import.meta.env.VITE_DEVTO_API_KEY || '';
    this.apiKeys.stackoverflow = import.meta.env.VITE_STACKOVERFLOW_API_KEY || '';
    this.apiKeys.jobdatafeeds = import.meta.env.VITE_JOBDATAFEEDS_API_KEY || '';
    this.apiKeys.apify = import.meta.env.VITE_APIFY_API_KEY || '';

    // Database
    this.apiKeys.supabase_url = import.meta.env.VITE_SUPABASE_URL || '';
    this.apiKeys.supabase_anon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    console.log('🔑 API Keys initialized:', Object.keys(this.apiKeys).filter(key => this.apiKeys[key]));
  }

  // =====================================================
  // AI SERVICES
  // =====================================================

  async generateAIContent(prompt: string, type: 'roadmap' | 'coaching' | 'analysis' = 'roadmap'): Promise<IntegratedAPIResponse> {
    try {
      // Try OpenAI first
      if (this.apiKeys.openai) {
        return await this.callOpenAI(prompt, type);
      }

      // Try Hugging Face
      if (this.apiKeys.huggingface) {
        return await this.callHuggingFace(prompt, type);
      }

      // Try Cohere
      if (this.apiKeys.cohere) {
        return await this.callCohere(prompt, type);
      }

      // Fallback to simulated response
      return this.generateSimulatedResponse(prompt, type);
    } catch (error) {
      console.error('AI content generation error:', error);
      return this.generateSimulatedResponse(prompt, type);
    }
  }

  private async callOpenAI(prompt: string, type: string): Promise<IntegratedAPIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(type)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      source: 'OpenAI GPT-4',
      timestamp: new Date().toISOString()
    };
  }

  private async callHuggingFace(prompt: string, type: string): Promise<IntegratedAPIResponse> {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.huggingface}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data[0].generated_text : data,
      source: 'Hugging Face DialoGPT',
      timestamp: new Date().toISOString()
    };
  }

  private async callCohere(prompt: string, type: string): Promise<IntegratedAPIResponse> {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.cohere}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.generations[0].text,
      source: 'Cohere Command',
      timestamp: new Date().toISOString()
    };
  }

  private generateSimulatedResponse(prompt: string, type: string): IntegratedAPIResponse {
    // Extract domains and topics from the prompt for more personalized responses
    const likedDomains = prompt.match(/interested in: ([^.]+)/)?.[1]?.split(', ') || [];
    const likedTopics = prompt.match(/topics they like: ([^.]+)/)?.[1]?.split(', ') || [];
    
    const responses = {
      roadmap: `Based on your interests in ${likedDomains.join(', ')}, I recommend a structured learning path focusing on practical projects and real-world applications. Start with foundational concepts in ${likedDomains[0] || 'your chosen field'} and gradually progress to advanced topics. Key areas to focus on: ${likedTopics.slice(0, 3).join(', ')}. Build a strong portfolio with hands-on projects to demonstrate your skills.`,
      coaching: `Great question! Let me help you navigate this career path in ${likedDomains[0] || 'your field'}. Focus on building relevant skills in ${likedTopics.slice(0, 2).join(' and ')} and gaining hands-on experience through projects.`,
      analysis: `Your profile shows strong potential in ${likedDomains[0] || 'this field'}. I recommend focusing on these key areas for growth: ${likedTopics.slice(0, 3).join(', ')}. The market demand for these skills is high, and you have a solid foundation to build upon.`
    };

    return {
      success: true,
      data: responses[type] || 'I understand your request and I\'m here to help you succeed.',
      source: 'Simulated AI Response',
      timestamp: new Date().toISOString()
    };
  }

  private getSystemPrompt(type: string): string {
    const prompts = {
      roadmap: `You are an expert career coach and learning path designer. When creating roadmaps, respond with a structured JSON object containing:

{
  "phases": [
    {
      "id": "phase_1",
      "name": "Phase Name",
      "description": "Detailed description of what to learn",
      "duration": "2-4 weeks",
      "difficulty": "beginner|intermediate|advanced",
      "skills": ["skill1", "skill2"],
      "resources": ["resource1", "resource2"],
      "projects": ["project1", "project2"],
      "prerequisites": ["prereq1", "prereq2"]
    }
  ],
  "estimated_completion": "8-12 weeks",
  "difficulty_level": "beginner|intermediate|advanced",
  "skills": [
    {
      "name": "Skill Name",
      "description": "What this skill involves",
      "importance": "high|medium|low"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What to build",
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time": "1-2 weeks"
    }
  ],
  "resources": [
    {
      "title": "Resource Title",
      "type": "course|book|video|article",
      "url": "https://example.com",
      "description": "What you'll learn"
    }
  ]
}

Make the roadmap highly personalized based on the user's specific interests and goals.`,
      coaching: 'You are a professional career mentor providing guidance and support for career development.',
      analysis: 'You are a career analyst providing insights and recommendations based on user profiles and market data.'
    };
    return prompts[type] || prompts.roadmap;
  }

  // =====================================================
  // CAREER DATA SERVICES
  // =====================================================

  async fetchCareerData(query: string): Promise<IntegratedAPIResponse> {
    try {
      // Try GitHub API for developer jobs
      if (this.apiKeys.github) {
        const githubData = await this.fetchGitHubJobs(query);
        if (githubData.success) {
          return githubData;
        }
      }

      // Try Dev.to API for developer articles and trends
      if (this.apiKeys.devto) {
        const devtoData = await this.fetchDevToData(query);
        if (devtoData.success) {
          return devtoData;
        }
      }

      // Try Stack Overflow API for Q&A insights
      if (this.apiKeys.stackoverflow) {
        const stackData = await this.fetchStackOverflowData(query);
        if (stackData.success) {
          return stackData;
        }
      }

      // Fallback to local data
      return this.fetchLocalCareerData(query);
    } catch (error) {
      console.error('Career data fetch error:', error);
      return this.fetchLocalCareerData(query);
    }
  }

  private async fetchGitHubJobs(query: string): Promise<IntegratedAPIResponse> {
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+jobs&sort=stars&order=desc`, {
        headers: {
          'Authorization': `token ${this.apiKeys.github}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.items.slice(0, 10).map((repo: any) => ({
          title: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          type: 'repository'
        })),
        source: 'GitHub API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'GitHub API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async fetchDevToData(query: string): Promise<IntegratedAPIResponse> {
    try {
      const response = await fetch(`https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=10`, {
        headers: {
          'api-key': this.apiKeys.devto,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.published_at,
          tags: article.tag_list,
          type: 'article'
        })),
        source: 'Dev.to API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'Dev.to API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async fetchStackOverflowData(query: string): Promise<IntegratedAPIResponse> {
    try {
      const response = await fetch(`https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${encodeURIComponent(query)}&site=stackoverflow&key=${this.apiKeys.stackoverflow}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Stack Overflow API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.items.slice(0, 10).map((question: any) => ({
          title: question.title,
          description: question.body,
          url: question.link,
          score: question.score,
          tags: question.tags,
          type: 'question'
        })),
        source: 'Stack Overflow API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'Stack Overflow API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private fetchLocalCareerData(query: string): IntegratedAPIResponse {
    const localData = [
      {
        title: 'Frontend Developer',
        description: 'Build user interfaces and web applications',
        category: 'Web Development',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        type: 'career'
      },
      {
        title: 'Data Scientist',
        description: 'Analyze data and build machine learning models',
        category: 'Data Science',
        skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
        type: 'career'
      }
    ];

    return {
      success: true,
      data: localData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ),
      source: 'Local Data',
      timestamp: new Date().toISOString()
    };
  }

  // =====================================================
  // JOB SEARCH SERVICES
  // =====================================================

  async searchJobs(filters: any): Promise<IntegratedAPIResponse> {
    try {
      // Try JobDataFeeds API
      if (this.apiKeys.jobdatafeeds) {
        const jobData = await this.fetchJobDataFeeds(filters);
        if (jobData.success) {
          return jobData;
        }
      }

      // Try Apify API
      if (this.apiKeys.apify) {
        const apifyData = await this.fetchApifyJobs(filters);
        if (apifyData.success) {
          return apifyData;
        }
      }

      // Fallback to local job data
      return this.fetchLocalJobData(filters);
    } catch (error) {
      console.error('Job search error:', error);
      return this.fetchLocalJobData(filters);
    }
  }

  private async fetchJobDataFeeds(filters: any): Promise<IntegratedAPIResponse> {
    try {
      const query = filters.query || 'developer';
      const response = await fetch(`https://api.jobdatafeeds.com/v1/jobs?q=${encodeURIComponent(query)}&limit=20`, {
        headers: {
          'X-API-Key': this.apiKeys.jobdatafeeds,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`JobDataFeeds API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.jobs || [],
        source: 'JobDataFeeds API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'JobDataFeeds API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async fetchApifyJobs(filters: any): Promise<IntegratedAPIResponse> {
    try {
      const query = filters.query || 'developer';
      const response = await fetch(`https://api.apify.com/v2/acts/jobdatafeeds~job-search/runs?token=${this.apiKeys.apify}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          maxResults: 20
        })
      });

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        source: 'Apify API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'Apify API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private fetchLocalJobData(filters: any): IntegratedAPIResponse {
    const localJobs = [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salary: '$80,000 - $120,000',
        description: 'Build modern web applications using React and TypeScript',
        skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        type: 'full-time'
      },
      {
        title: 'Data Scientist',
        company: 'Data Inc',
        location: 'New York, NY',
        salary: '$90,000 - $130,000',
        description: 'Analyze large datasets and build ML models',
        skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
        type: 'full-time'
      }
    ];

    return {
      success: true,
      data: localJobs.filter(job => 
        !filters.query || job.title.toLowerCase().includes(filters.query.toLowerCase())
      ),
      source: 'Local Job Data',
      timestamp: new Date().toISOString()
    };
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getAPIStatus(): Record<string, boolean> {
    return {
      openai: !!this.apiKeys.openai,
      huggingface: !!this.apiKeys.huggingface,
      cohere: !!this.apiKeys.cohere,
      github: !!this.apiKeys.github,
      twitter: !!this.apiKeys.twitter,
      devto: !!this.apiKeys.devto,
      stackoverflow: !!this.apiKeys.stackoverflow,
      jobdatafeeds: !!this.apiKeys.jobdatafeeds,
      apify: !!this.apiKeys.apify,
      supabase: !!(this.apiKeys.supabase_url && this.apiKeys.supabase_anon)
    };
  }

  async testAllAPIs(): Promise<Record<string, IntegratedAPIResponse>> {
    const results: Record<string, IntegratedAPIResponse> = {};

    // Test AI APIs
    if (this.apiKeys.openai) {
      results.openai = await this.generateAIContent('Test prompt', 'roadmap');
    }

    // Test Career APIs
    if (this.apiKeys.github) {
      results.github = await this.fetchGitHubJobs('javascript');
    }

    if (this.apiKeys.devto) {
      results.devto = await this.fetchDevToData('javascript');
    }

    return results;
  }
}

// Export singleton instance
export const integratedAPIService = IntegratedAPIService.getInstance();





