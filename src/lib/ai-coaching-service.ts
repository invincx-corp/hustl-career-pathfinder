import { supabase } from './supabase';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface AIConversation {
  id: string;
  user_id: string;
  session_id: string;
  message_type: 'user' | 'ai' | 'system';
  content: string;
  context: Record<string, any>;
  sentiment_score?: number;
  intent_category?: string;
  confidence_score?: number;
  response_time_ms?: number;
  created_at: string;
}

export interface AICoachingSession {
  id: string;
  user_id: string;
  session_type: 'general' | 'career_planning' | 'skill_development' | 'crisis_support';
  initial_context: Record<string, any>;
  goals: string[];
  topics_discussed: string[];
  insights_generated: Record<string, any>;
  recommendations: Record<string, any>;
  escalation_triggered: boolean;
  escalation_reason?: string;
  escalation_to_human: boolean;
  session_rating?: number;
  user_feedback?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
}

export interface AIModelConfig {
  id: string;
  model_name: string;
  model_version: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  api_endpoint?: string;
  api_key_encrypted?: string;
  model_parameters: Record<string, any>;
  context_window: number;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachingContext {
  userProfile?: Record<string, any>;
  currentGoals?: string[];
  recentActivity?: Record<string, any>;
  emotionalState?: string;
  currentChallenges?: string[];
  learningProgress?: Record<string, any>;
  careerStage?: string;
  interests?: string[];
  skills?: string[];
}

export interface AIResponse {
  content: string;
  intent: string;
  confidence: number;
  suggestions?: string[];
  escalation_needed?: boolean;
  context_updates?: Record<string, any>;
}

// =====================================================
// AI COACHING SERVICE
// =====================================================

export const aiCoachingService = {
  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  async startCoachingSession(userId: string, sessionType: AICoachingSession['session_type'], context: CoachingContext = {}): Promise<AICoachingSession | null> {
    try {
      const session: Partial<AICoachingSession> = {
        user_id: userId,
        session_type: sessionType,
        initial_context: context,
        goals: context.currentGoals || [],
        topics_discussed: [],
        insights_generated: {},
        recommendations: {},
        escalation_triggered: false,
        escalation_to_human: false,
        started_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ai_coaching_sessions')
        .insert(session)
        .select()
        .single();

      if (error) {
        console.error('Error starting coaching session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error starting coaching session:', error);
      return null;
    }
  },

  async endCoachingSession(sessionId: string, rating?: number, feedback?: string): Promise<AICoachingSession | null> {
    try {
      const session = await this.getCoachingSession(sessionId);
      if (!session) return null;

      const endedAt = new Date().toISOString();
      const startedAt = new Date(session.started_at);
      const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));

      const updates: Partial<AICoachingSession> = {
        ended_at: endedAt,
        duration_minutes: durationMinutes,
        session_rating: rating,
        user_feedback: feedback
      };

      const { data, error } = await supabase
        .from('ai_coaching_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error ending coaching session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error ending coaching session:', error);
      return null;
    }
  },

  async getCoachingSession(sessionId: string): Promise<AICoachingSession | null> {
    try {
      const { data, error } = await supabase
        .from('ai_coaching_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching coaching session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching coaching session:', error);
      return null;
    }
  },

  async getUserCoachingSessions(userId: string, limit: number = 10): Promise<AICoachingSession[]> {
    try {
      const { data, error } = await supabase
        .from('ai_coaching_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user coaching sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user coaching sessions:', error);
      return [];
    }
  },

  // =====================================================
  // MESSAGE HANDLING
  // =====================================================

  async sendMessage(userId: string, sessionId: string, content: string, context: Record<string, any> = {}): Promise<AIResponse | null> {
    try {
      const startTime = Date.now();

      // Save user message
      await this.saveMessage(userId, sessionId, 'user', content, context);

      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(sessionId, 10);

      // Generate AI response
      const aiResponse = await this.generateAIResponse(content, conversationHistory, context);

      // Save AI response
      await this.saveMessage(userId, sessionId, 'ai', aiResponse.content, {
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        escalation_needed: aiResponse.escalation_needed
      });

      // Update session if needed
      if (aiResponse.escalation_needed) {
        await this.triggerEscalation(sessionId, 'AI detected need for human intervention');
      }

      const responseTime = Date.now() - startTime;
      
      return {
        ...aiResponse,
        response_time_ms: responseTime
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async saveMessage(userId: string, sessionId: string, messageType: 'user' | 'ai' | 'system', content: string, context: Record<string, any> = {}): Promise<AIConversation | null> {
    try {
      const message: Partial<AIConversation> = {
        user_id: userId,
        session_id: sessionId,
        message_type: messageType,
        content,
        context,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert(message)
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  },

  async getConversationHistory(sessionId: string, limit: number = 20): Promise<AIConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  },

  // =====================================================
  // AI RESPONSE GENERATION
  // =====================================================

  async generateAIResponse(userMessage: string, conversationHistory: AIConversation[], context: Record<string, any>): Promise<AIResponse> {
    try {
      // Use the backend AI service for real AI responses
      const response = await fetch('/api/ai-coaching/sessions/mock-session/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user', // This will be replaced with actual user ID
          content: userMessage,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.response.content,
        intent: data.response.intent,
        confidence: data.response.confidence,
        suggestions: data.response.suggestions,
        escalation_needed: data.response.escalation_needed,
        context_updates: {
          last_intent: data.response.intent,
          sentiment_score: data.response.sentiment_score,
          conversation_count: conversationHistory.length + 1
        }
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to rule-based responses if AI service fails
      return this.generateFallbackResponse(userMessage, context);
    }
  },

  generateFallbackResponse(userMessage: string, context: Record<string, any>): AIResponse {
    const intent = this.analyzeIntent(userMessage);
    const sentiment = this.analyzeSentiment(userMessage);
    
    let response = '';
    let suggestions: string[] = [];
    let escalation_needed = false;

    switch (intent) {
      case 'career_guidance':
        response = this.generateCareerGuidanceResponse(userMessage, context);
        suggestions = [
          'Explore career paths in your field',
          'Update your resume and portfolio',
          'Connect with industry professionals',
          'Take relevant skill assessments'
        ];
        break;

      case 'skill_development':
        response = this.generateSkillDevelopmentResponse(userMessage, context);
        suggestions = [
          'Find relevant learning resources',
          'Join study groups',
          'Practice with projects',
          'Get feedback from mentors'
        ];
        break;

      case 'crisis_support':
        response = this.generateCrisisSupportResponse(userMessage, context);
        escalation_needed = sentiment < -0.5;
        suggestions = [
          'Take a break and practice self-care',
          'Connect with a human mentor',
          'Join a support community',
          'Consider professional counseling'
        ];
        break;

      case 'goal_setting':
        response = this.generateGoalSettingResponse(userMessage, context);
        suggestions = [
          'Break down your goals into smaller steps',
          'Set specific deadlines',
          'Track your progress regularly',
          'Celebrate small wins'
        ];
        break;

      default:
        response = this.generateGeneralResponse(userMessage, context);
        suggestions = [
          'How can I help you today?',
          'What would you like to work on?',
          'Tell me about your current challenges'
        ];
    }

    return {
      content: response,
      intent,
      confidence: 0.8,
      suggestions,
      escalation_needed,
      context_updates: {
        last_intent: intent,
        sentiment_score: sentiment,
        conversation_count: 1
      }
    };
  },

  // =====================================================
  // INTENT & SENTIMENT ANALYSIS
  // =====================================================

  analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return 'career_guidance';
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
      return 'skill_development';
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelmed')) {
      return 'crisis_support';
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('plan') || lowerMessage.includes('achieve')) {
      return 'goal_setting';
    }
    
    return 'general';
  },

  analyzeSentiment(message: string): number {
    // Simple sentiment analysis based on keywords
    // In production, use a proper sentiment analysis service
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'confident', 'motivated'];
    const negativeWords = ['bad', 'terrible', 'sad', 'frustrated', 'stressed', 'anxious', 'overwhelmed'];
    
    const lowerMessage = message.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) score += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) score -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, score));
  },

  // =====================================================
  // RESPONSE GENERATORS
  // =====================================================

  generateCareerGuidanceResponse(message: string, context: Record<string, any>): string {
    const responses = [
      "I'd be happy to help you with your career guidance! Based on your message, it sounds like you're looking for direction in your professional journey. Let me help you explore your options and create a plan.",
      "Career development is an exciting journey! I can help you identify your strengths, explore different career paths, and create a roadmap to achieve your professional goals.",
      "It's great that you're thinking about your career development! Let's work together to identify opportunities that align with your skills and interests."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  generateSkillDevelopmentResponse(message: string, context: Record<string, any>): string {
    const responses = [
      "Skill development is a key part of personal and professional growth! I can help you identify the skills you need to develop and find the best resources to learn them.",
      "Learning new skills is an investment in your future! Let's create a personalized learning plan that fits your schedule and learning style.",
      "I'm excited to help you develop new skills! Whether you're looking to advance in your current role or explore new opportunities, we can create a plan together."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  generateCrisisSupportResponse(message: string, context: Record<string, any>): string {
    const responses = [
      "I understand you're going through a challenging time. It's important to remember that you're not alone, and it's okay to ask for help. Let's work through this together.",
      "I'm here to support you during this difficult period. Sometimes talking through our challenges can help us find new perspectives and solutions.",
      "It sounds like you're dealing with some significant stress. Remember that taking care of your mental health is just as important as your professional development."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  generateGoalSettingResponse(message: string, context: Record<string, any>): string {
    const responses = [
      "Setting clear goals is the first step toward achieving your dreams! I can help you break down your big goals into manageable steps and create a timeline for success.",
      "Goal setting is a powerful tool for personal and professional growth! Let's work together to create SMART goals that will help you stay motivated and on track.",
      "I love helping people set and achieve their goals! Whether they're short-term or long-term, we can create a plan that works for you."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  generateGeneralResponse(message: string, context: Record<string, any>): string {
    const responses = [
      "I'm here to help you on your learning and career journey! What would you like to work on today?",
      "Hello! I'm your AI career coach, and I'm excited to help you achieve your goals. What's on your mind?",
      "I'm ready to support you in your personal and professional development! How can I assist you today?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // =====================================================
  // ESCALATION HANDLING
  // =====================================================

  async triggerEscalation(sessionId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('ai_coaching_sessions')
        .update({
          escalation_triggered: true,
          escalation_reason: reason,
          escalation_to_human: true
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error triggering escalation:', error);
    }
  },

  // =====================================================
  // ANALYTICS & INSIGHTS
  // =====================================================

  async getCoachingAnalytics(userId: string): Promise<Record<string, any>> {
    try {
      const sessions = await this.getUserCoachingSessions(userId, 50);
      
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.ended_at).length;
      const averageRating = sessions
        .filter(s => s.session_rating)
        .reduce((sum, s) => sum + (s.session_rating || 0), 0) / sessions.length || 0;
      
      const sessionTypes = sessions.reduce((acc, s) => {
        acc[s.session_type] = (acc[s.session_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const escalationRate = sessions.filter(s => s.escalation_triggered).length / totalSessions * 100;

      return {
        totalSessions,
        completedSessions,
        averageRating,
        sessionTypes,
        escalationRate,
        totalDuration: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      };
    } catch (error) {
      console.error('Error getting coaching analytics:', error);
      return {};
    }
  }
};
