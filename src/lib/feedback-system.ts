// Feedback System for Mentor Sessions
// Handles ratings, reviews, and feedback collection

export interface SessionFeedback {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerType: 'mentor' | 'mentee';
  rating: number; // 1-5 stars
  review: string;
  categories: {
    communication: number; // 1-5
    expertise: number; // 1-5
    helpfulness: number; // 1-5
    punctuality: number; // 1-5
    preparation: number; // 1-5
  };
  tags: string[];
  suggestions: string[];
  wouldRecommend: boolean;
  sessionValue: 'excellent' | 'good' | 'average' | 'poor';
  highlights: string[];
  areasForImprovement: string[];
  followUpNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAnalytics {
  sessionId: string;
  overallRating: number;
  categoryRatings: {
    communication: number;
    expertise: number;
    helpfulness: number;
    punctuality: number;
    preparation: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  keyThemes: string[];
  improvementAreas: string[];
  strengths: string[];
  recommendationRate: number;
  responseRate: number;
  feedbackCount: number;
}

export interface MentorFeedbackSummary {
  mentorId: string;
  totalSessions: number;
  totalFeedback: number;
  averageRating: number;
  categoryAverages: {
    communication: number;
    expertise: number;
    helpfulness: number;
    punctuality: number;
    preparation: number;
  };
  recentTrends: {
    rating: number[];
    responseRate: number[];
    recommendationRate: number[];
  };
  topStrengths: string[];
  improvementAreas: string[];
  feedbackDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  lastUpdated: string;
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  questions: Array<{
    id: string;
    type: 'rating' | 'text' | 'multiple-choice' | 'boolean';
    question: string;
    required: boolean;
    options?: string[];
    category?: string;
  }>;
  category: 'session' | 'mentor' | 'mentee' | 'platform';
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequest {
  id: string;
  sessionId: string;
  recipientId: string;
  recipientType: 'mentor' | 'mentee';
  templateId?: string;
  status: 'pending' | 'sent' | 'completed' | 'expired';
  sentAt: string;
  expiresAt: string;
  completedAt?: string;
  reminderSent: boolean;
  reminderCount: number;
}

export class FeedbackSystem {
  private feedback: Map<string, SessionFeedback> = new Map();
  private templates: Map<string, FeedbackTemplate> = new Map();
  private requests: Map<string, FeedbackRequest> = new Map();
  private analytics: Map<string, FeedbackAnalytics> = new Map();

  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultTemplates();
  }

  // Submit feedback for a session
  submitFeedback(
    sessionId: string,
    reviewerId: string,
    revieweeId: string,
    reviewerType: 'mentor' | 'mentee',
    feedbackData: {
      rating: number;
      review: string;
      categories: {
        communication: number;
        expertise: number;
        helpfulness: number;
        punctuality: number;
        preparation: number;
      };
      tags: string[];
      suggestions: string[];
      wouldRecommend: boolean;
      sessionValue: 'excellent' | 'good' | 'average' | 'poor';
      highlights: string[];
      areasForImprovement: string[];
      followUpNeeded: boolean;
    }
  ): SessionFeedback {
    const feedback: SessionFeedback = {
      id: `feedback-${Date.now()}`,
      sessionId,
      reviewerId,
      revieweeId,
      reviewerType,
      rating: feedbackData.rating,
      review: feedbackData.review,
      categories: feedbackData.categories,
      tags: feedbackData.tags,
      suggestions: feedbackData.suggestions,
      wouldRecommend: feedbackData.wouldRecommend,
      sessionValue: feedbackData.sessionValue,
      highlights: feedbackData.highlights,
      areasForImprovement: feedbackData.areasForImprovement,
      followUpNeeded: feedbackData.followUpNeeded,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feedback.set(feedback.id, feedback);
    this.generateFeedbackAnalytics(sessionId);
    this.saveToLocalStorage();

    return feedback;
  }

  // Get feedback for a session
  getSessionFeedback(sessionId: string): SessionFeedback[] {
    return Array.from(this.feedback.values())
      .filter(f => f.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get feedback for a user
  getUserFeedback(userId: string, userType: 'mentor' | 'mentee'): SessionFeedback[] {
    return Array.from(this.feedback.values())
      .filter(f => f.revieweeId === userId && f.reviewerType !== userType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get feedback given by a user
  getFeedbackGivenByUser(userId: string): SessionFeedback[] {
    return Array.from(this.feedback.values())
      .filter(f => f.reviewerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get mentor feedback summary
  getMentorFeedbackSummary(mentorId: string): MentorFeedbackSummary {
    const mentorFeedback = this.getUserFeedback(mentorId, 'mentor');
    const totalSessions = new Set(mentorFeedback.map(f => f.sessionId)).size;
    const totalFeedback = mentorFeedback.length;

    if (totalFeedback === 0) {
      return {
        mentorId,
        totalSessions: 0,
        totalFeedback: 0,
        averageRating: 0,
        categoryAverages: {
          communication: 0,
          expertise: 0,
          helpfulness: 0,
          punctuality: 0,
          preparation: 0
        },
        recentTrends: {
          rating: [],
          responseRate: [],
          recommendationRate: []
        },
        topStrengths: [],
        improvementAreas: [],
        feedbackDistribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }

    const averageRating = mentorFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;

    const categoryAverages = {
      communication: mentorFeedback.reduce((sum, f) => sum + f.categories.communication, 0) / totalFeedback,
      expertise: mentorFeedback.reduce((sum, f) => sum + f.categories.expertise, 0) / totalFeedback,
      helpfulness: mentorFeedback.reduce((sum, f) => sum + f.categories.helpfulness, 0) / totalFeedback,
      punctuality: mentorFeedback.reduce((sum, f) => sum + f.categories.punctuality, 0) / totalFeedback,
      preparation: mentorFeedback.reduce((sum, f) => sum + f.categories.preparation, 0) / totalFeedback
    };

    // Recent trends (last 10 feedback entries)
    const recentFeedback = mentorFeedback.slice(0, 10);
    const recentTrends = {
      rating: recentFeedback.map(f => f.rating),
      responseRate: recentFeedback.map(f => 1), // Simplified - would need session data
      recommendationRate: recentFeedback.map(f => f.wouldRecommend ? 1 : 0)
    };

    // Extract strengths and improvement areas
    const allHighlights = mentorFeedback.flatMap(f => f.highlights);
    const allImprovements = mentorFeedback.flatMap(f => f.areasForImprovement);

    const topStrengths = this.getTopItems(allHighlights, 5);
    const improvementAreas = this.getTopItems(allImprovements, 5);

    // Feedback distribution
    const feedbackDistribution = {
      excellent: mentorFeedback.filter(f => f.sessionValue === 'excellent').length,
      good: mentorFeedback.filter(f => f.sessionValue === 'good').length,
      average: mentorFeedback.filter(f => f.sessionValue === 'average').length,
      poor: mentorFeedback.filter(f => f.sessionValue === 'poor').length
    };

    return {
      mentorId,
      totalSessions,
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryAverages: {
        communication: Math.round(categoryAverages.communication * 10) / 10,
        expertise: Math.round(categoryAverages.expertise * 10) / 10,
        helpfulness: Math.round(categoryAverages.helpfulness * 10) / 10,
        punctuality: Math.round(categoryAverages.punctuality * 10) / 10,
        preparation: Math.round(categoryAverages.preparation * 10) / 10
      },
      recentTrends,
      topStrengths,
      improvementAreas,
      feedbackDistribution,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get top items from array
  private getTopItems(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  // Generate feedback analytics for a session
  private generateFeedbackAnalytics(sessionId: string): void {
    const sessionFeedback = this.getSessionFeedback(sessionId);
    
    if (sessionFeedback.length === 0) return;

    const overallRating = sessionFeedback.reduce((sum, f) => sum + f.rating, 0) / sessionFeedback.length;

    const categoryRatings = {
      communication: sessionFeedback.reduce((sum, f) => sum + f.categories.communication, 0) / sessionFeedback.length,
      expertise: sessionFeedback.reduce((sum, f) => sum + f.categories.expertise, 0) / sessionFeedback.length,
      helpfulness: sessionFeedback.reduce((sum, f) => sum + f.categories.helpfulness, 0) / sessionFeedback.length,
      punctuality: sessionFeedback.reduce((sum, f) => sum + f.categories.punctuality, 0) / sessionFeedback.length,
      preparation: sessionFeedback.reduce((sum, f) => sum + f.categories.preparation, 0) / sessionFeedback.length
    };

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(sessionFeedback);

    // Extract key themes
    const allTags = sessionFeedback.flatMap(f => f.tags);
    const keyThemes = this.getTopItems(allTags, 5);

    // Extract improvement areas
    const allImprovements = sessionFeedback.flatMap(f => f.areasForImprovement);
    const improvementAreas = this.getTopItems(allImprovements, 5);

    // Extract strengths
    const allHighlights = sessionFeedback.flatMap(f => f.highlights);
    const strengths = this.getTopItems(allHighlights, 5);

    const recommendationRate = sessionFeedback.filter(f => f.wouldRecommend).length / sessionFeedback.length;
    const responseRate = sessionFeedback.length / 2; // Assuming 2 participants per session

    const analytics: FeedbackAnalytics = {
      sessionId,
      overallRating: Math.round(overallRating * 10) / 10,
      categoryRatings: {
        communication: Math.round(categoryRatings.communication * 10) / 10,
        expertise: Math.round(categoryRatings.expertise * 10) / 10,
        helpfulness: Math.round(categoryRatings.helpfulness * 10) / 10,
        punctuality: Math.round(categoryRatings.punctuality * 10) / 10,
        preparation: Math.round(categoryRatings.preparation * 10) / 10
      },
      sentiment,
      keyThemes,
      improvementAreas,
      strengths,
      recommendationRate: Math.round(recommendationRate * 100) / 100,
      responseRate: Math.round(responseRate * 100) / 100,
      feedbackCount: sessionFeedback.length
    };

    this.analytics.set(sessionId, analytics);
  }

  // Analyze sentiment from feedback
  private analyzeSentiment(feedback: SessionFeedback[]): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'helpful', 'knowledgeable', 'professional'];
    const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'unhelpful', 'unprofessional', 'disappointing'];

    let positiveScore = 0;
    let negativeScore = 0;

    feedback.forEach(f => {
      const review = f.review.toLowerCase();
      positiveWords.forEach(word => {
        if (review.includes(word)) positiveScore++;
      });
      negativeWords.forEach(word => {
        if (review.includes(word)) negativeScore++;
      });
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  // Create feedback template
  createFeedbackTemplate(template: Omit<FeedbackTemplate, 'id' | 'createdAt' | 'updatedAt'>): FeedbackTemplate {
    const newTemplate: FeedbackTemplate = {
      id: `template-${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveToLocalStorage();

    return newTemplate;
  }

  // Get feedback templates
  getFeedbackTemplates(category?: string): FeedbackTemplate[] {
    let templates = Array.from(this.templates.values());

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates.filter(t => t.isActive);
  }

  // Create feedback request
  createFeedbackRequest(
    sessionId: string,
    recipientId: string,
    recipientType: 'mentor' | 'mentee',
    templateId?: string
  ): FeedbackRequest {
    const request: FeedbackRequest = {
      id: `request-${Date.now()}`,
      sessionId,
      recipientId,
      recipientType,
      templateId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      reminderSent: false,
      reminderCount: 0
    };

    this.requests.set(request.id, request);
    this.saveToLocalStorage();

    return request;
  }

  // Complete feedback request
  completeFeedbackRequest(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request) return false;

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();

    this.requests.set(requestId, request);
    this.saveToLocalStorage();

    return true;
  }

  // Get pending feedback requests
  getPendingFeedbackRequests(userId: string): FeedbackRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.recipientId === userId && r.status === 'pending')
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // Get feedback analytics
  getFeedbackAnalytics(sessionId: string): FeedbackAnalytics | null {
    return this.analytics.get(sessionId) || null;
  }

  // Get platform feedback summary
  getPlatformFeedbackSummary(): {
    totalFeedback: number;
    averageRating: number;
    responseRate: number;
    recommendationRate: number;
    topCategories: Array<{ category: string; rating: number }>;
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  } {
    const allFeedback = Array.from(this.feedback.values());
    const totalFeedback = allFeedback.length;

    if (totalFeedback === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        responseRate: 0,
        recommendationRate: 0,
        topCategories: [],
        sentimentDistribution: {
          positive: 0,
          neutral: 0,
          negative: 0
        }
      };
    }

    const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
    const recommendationRate = allFeedback.filter(f => f.wouldRecommend).length / totalFeedback;

    // Calculate category averages
    const categoryAverages = {
      communication: allFeedback.reduce((sum, f) => sum + f.categories.communication, 0) / totalFeedback,
      expertise: allFeedback.reduce((sum, f) => sum + f.categories.expertise, 0) / totalFeedback,
      helpfulness: allFeedback.reduce((sum, f) => sum + f.categories.helpfulness, 0) / totalFeedback,
      punctuality: allFeedback.reduce((sum, f) => sum + f.categories.punctuality, 0) / totalFeedback,
      preparation: allFeedback.reduce((sum, f) => sum + f.categories.preparation, 0) / totalFeedback
    };

    const topCategories = Object.entries(categoryAverages)
      .map(([category, rating]) => ({ category, rating: Math.round(rating * 10) / 10 }))
      .sort((a, b) => b.rating - a.rating);

    // Analyze sentiment distribution
    const sentimentDistribution = {
      positive: allFeedback.filter(f => f.sessionValue === 'excellent' || f.sessionValue === 'good').length,
      neutral: allFeedback.filter(f => f.sessionValue === 'average').length,
      negative: allFeedback.filter(f => f.sessionValue === 'poor').length
    };

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      responseRate: 0.8, // Placeholder - would need session data
      recommendationRate: Math.round(recommendationRate * 100) / 100,
      topCategories,
      sentimentDistribution
    };
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<FeedbackTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Session Feedback',
        description: 'Standard feedback template for mentor sessions',
        questions: [
          {
            id: 'overall-rating',
            type: 'rating',
            question: 'How would you rate this session overall?',
            required: true,
            category: 'overall'
          },
          {
            id: 'communication',
            type: 'rating',
            question: 'How was the communication?',
            required: true,
            category: 'communication'
          },
          {
            id: 'expertise',
            type: 'rating',
            question: 'How would you rate the mentor\'s expertise?',
            required: true,
            category: 'expertise'
          },
          {
            id: 'helpfulness',
            type: 'rating',
            question: 'How helpful was the session?',
            required: true,
            category: 'helpfulness'
          },
          {
            id: 'review',
            type: 'text',
            question: 'Please share your thoughts about the session',
            required: false,
            category: 'general'
          },
          {
            id: 'recommend',
            type: 'boolean',
            question: 'Would you recommend this mentor to others?',
            required: true,
            category: 'recommendation'
          }
        ],
        category: 'session',
        isDefault: true,
        isActive: true
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.name)) {
        this.createFeedbackTemplate(template);
      }
    });
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        feedback: Object.fromEntries(this.feedback),
        templates: Object.fromEntries(this.templates),
        requests: Object.fromEntries(this.requests),
        analytics: Object.fromEntries(this.analytics)
      };
      localStorage.setItem('feedback-system', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save feedback data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('feedback-system');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.feedback) {
        this.feedback = new Map(Object.entries(parsed.feedback));
      }
      
      if (parsed.templates) {
        this.templates = new Map(Object.entries(parsed.templates));
      }
      
      if (parsed.requests) {
        this.requests = new Map(Object.entries(parsed.requests));
      }
      
      if (parsed.analytics) {
        this.analytics = new Map(Object.entries(parsed.analytics));
      }
    } catch (error) {
      console.error('Failed to load feedback data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.feedback.clear();
    this.templates.clear();
    this.requests.clear();
    this.analytics.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const feedbackSystem = new FeedbackSystem();
