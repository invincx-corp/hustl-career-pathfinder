import { supabase } from './supabase';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// API Service Class
export class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic HTTP methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth API methods
  async getUserProfile(userId: string) {
    return this.request(`/auth/profile/${userId}`);
  }

  async updateUserProfile(userId: string, profileData: any) {
    return this.request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async completeOnboarding(userId: string, onboardingData: any) {
    return this.request(`/auth/onboarding/${userId}/complete`, {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
  }

  async logUserActivity(userId: string, activity: any) {
    return this.request(`/auth/activity/${userId}`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async getUserStats(userId: string) {
    return this.request(`/auth/stats/${userId}`);
  }

  // Learning API methods
  async getUserSkills(userId: string) {
    return this.request(`/learning/skills/${userId}`);
  }

  async updateSkillLevel(userId: string, skillData: any) {
    return this.request(`/learning/skills/${userId}/update`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async getCapsules(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/learning/capsules?${params}`);
  }

  async completeCapsule(capsuleId: string, completionData: any) {
    return this.request(`/learning/capsules/${capsuleId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async downloadCapsule(capsuleId: string, userId: string) {
    return this.request(`/learning/capsules/${capsuleId}/download`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Roadmap API methods
  async getUserRoadmaps(userId: string) {
    return this.request(`/roadmaps/user/${userId}`);
  }

  async createRoadmap(roadmapData: any) {
    return this.request('/roadmaps/create', {
      method: 'POST',
      body: JSON.stringify(roadmapData),
    });
  }

  async updateRoadmapProgress(roadmapId: string, progressData: any) {
    return this.request(`/roadmaps/${roadmapId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  async deleteRoadmap(roadmapId: string, userId: string) {
    return this.request(`/roadmaps/${roadmapId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  async getRoadmapTemplates(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/roadmaps/templates?${params}`);
  }

  // AI API methods
  async generateAIRoadmap(roadmapData: any) {
    return this.request('/ai/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(roadmapData),
    });
  }

  async analyzeSkillGaps(analysisData: any) {
    return this.request('/ai/skills/analyze', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async chatWithCoach(chatData: any) {
    return this.request('/ai/coach/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async getPersonalizedRecommendations(userId: string, type: string = 'all') {
    return this.request(`/ai/recommendations/${userId}?type=${type}`);
  }

  async getCareerPathSuggestions(careerData: any) {
    return this.request('/ai/career/paths', {
      method: 'POST',
      body: JSON.stringify(careerData),
    });
  }

  // Identity API methods
  async getSelfGraph(userId: string) {
    return this.request(`/identity/selfgraph/${userId}`);
  }

  async updateSelfGraph(userId: string, selfGraphData: any) {
    return this.request(`/identity/selfgraph/${userId}/update`, {
      method: 'POST',
      body: JSON.stringify(selfGraphData),
    });
  }

  async getSelfGraphHistory(userId: string, timeframe: string = '30d') {
    return this.request(`/identity/selfgraph/${userId}/history?timeframe=${timeframe}`);
  }

  async getUserResume(userId: string) {
    return this.request(`/identity/resume/${userId}`);
  }

  async updateUserResume(userId: string, resumeData: any) {
    return this.request(`/identity/resume/${userId}/update`, {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async exportUserResume(userId: string, format: string = 'pdf') {
    return this.request(`/identity/resume/${userId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  // Support API methods
  async chatWithCoachSupport(chatData: any) {
    return this.request('/support/coach/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async getUserNudges(userId: string) {
    return this.request(`/support/coach/nudges/${userId}`);
  }

  async dismissNudge(userId: string, nudgeId: string) {
    return this.request(`/support/coach/nudges/${userId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ nudgeId }),
    });
  }

  async recordMood(moodData: any) {
    return this.request('/support/therapist/mood', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  }

  async getWellnessCheck(userId: string) {
    return this.request(`/support/therapist/wellness/${userId}`);
  }

  async getWellnessResources(category: string = 'all') {
    return this.request(`/support/therapist/resources?category=${category}`);
  }

  async escalateSupport(escalationData: any) {
    return this.request('/support/therapist/escalate', {
      method: 'POST',
      body: JSON.stringify(escalationData),
    });
  }

  // Opportunities API methods
  async getJobs(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/opportunities/jobs?${params}`);
  }

  async bookmarkJob(jobId: string, bookmarkData: any) {
    return this.request(`/opportunities/jobs/${jobId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify(bookmarkData),
    });
  }

  async applyToJob(jobId: string, applicationData: any) {
    return this.request(`/opportunities/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getCareerDomains() {
    return this.request('/opportunities/domains');
  }

  async getDomainOpportunities(domainId: string) {
    return this.request(`/opportunities/domains/${domainId}/opportunities`);
  }

  async getDomainAnalytics(domainId: string, timeframe: string = '30d') {
    return this.request(`/opportunities/domains/${domainId}/analytics?timeframe=${timeframe}`);
  }

  // Utility methods
  async getAPIStatus() {
    return this.request('/status');
  }

  async getHealthCheck() {
    return this.request('/health');
  }
}

// Socket.IO Service for real-time features
export class SocketService {
  private socket: any = null;
  private isConnected = false;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (typeof window !== 'undefined') {
      // Import socket.io-client dynamically to avoid SSR issues
      import('socket.io-client').then(({ io }) => {
        this.socket = io('http://localhost:3001', {
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to real-time server');
          this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Disconnected from real-time server');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error);
        });
      });
    }
  }

  // Join user's personal room for notifications
  joinUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Join learning session room
  joinLearningSession(sessionId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-learning-session', sessionId);
    }
  }

  // Join mentorship room
  joinMentorshipRoom(mentorshipId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-mentorship-room', mentorshipId);
    }
  }

  // Send learning progress update
  sendLearningProgress(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('learning-progress', data);
    }
  }

  // Send roadmap update
  sendRoadmapUpdate(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('roadmap-update', data);
    }
  }

  // Send notification
  sendNotification(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-notification', data);
    }
  }

  // Send mentorship message
  sendMentorshipMessage(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mentorship-message', data);
    }
  }

  // Request AI coach response
  requestAICoach(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('ai-coach-request', data);
    }
  }

  // Listen for events
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Check connection status
  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Create singleton instances
export const apiService = new APIService();
export const socketService = new SocketService();

// Export types for better TypeScript support
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  age?: number;
  interests?: string[];
  skills?: string[];
  goals?: string[];
  experience_level?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  selected_roadmaps?: any[];
  skill_assessment_results?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  goal: string;
  category: string;
  steps: RoadmapStep[];
  estimatedTime: string;
  difficulty: string;
  skills: string[];
  currentStep: number;
  progressPercentage: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  completed: boolean;
  resources?: any[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  priority: string;
  estimatedTime: string;
  confidence?: number;
  lastPracticed?: string;
  resources?: any[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  applicationDeadline: string;
  isBookmarked: boolean;
  isApplied: boolean;
  remote: boolean;
  domain: string;
}

export interface CareerDomain {
  id: string;
  name: string;
  demand: number;
  supply: number;
  growth: number;
  averageSalary: {
    min: number;
    max: number;
    currency: string;
  };
  topSkills: string[];
  opportunities: number;
  talent: number;
  trend: string;
  description: string;
  companies: string[];
  locations: string[];
}
