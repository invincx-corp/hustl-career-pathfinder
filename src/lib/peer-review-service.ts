import { supabase } from './supabase';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  review_type: 'project' | 'skill' | 'portfolio' | 'resume';
  target_id?: string;
  rating?: number;
  feedback: string;
  categories: Record<string, any>;
  is_anonymous: boolean;
  is_public: boolean;
  created_at: string;
  reviewer?: any;
  reviewee?: any;
  ai_analysis?: {
    sentiment_score: number;
    key_strengths: string[];
    areas_for_improvement: string[];
    overall_tone: string;
    actionable_insights: string[];
  };
}

export interface ReviewRequest {
  id: string;
  type: 'project' | 'skill' | 'portfolio' | 'resume';
  title: string;
  description: string;
  author: any;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
  review_types: Record<string, number>;
  recent_reviews: number;
  sentiment_analysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// =====================================================
// PEER REVIEW SERVICE
// =====================================================

export const peerReviewService = {
  // =====================================================
  // REVIEW MANAGEMENT
  // =====================================================

  async getReviewsForUser(userId: string, filters: {
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PeerReview[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/peer-reviews/user/${userId}/reviews?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews for user:', error);
      return [];
    }
  },

  async getReviewsByUser(userId: string, filters: {
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PeerReview[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/peer-reviews/user/${userId}/written?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch written reviews: ${response.status}`);
      }

      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching written reviews:', error);
      return [];
    }
  },

  async createReview(reviewData: {
    reviewer_id: string;
    reviewee_id: string;
    review_type: 'project' | 'skill' | 'portfolio' | 'resume';
    target_id?: string;
    rating?: number;
    feedback: string;
    categories?: Record<string, any>;
    is_anonymous?: boolean;
    is_public?: boolean;
  }): Promise<PeerReview | null> {
    try {
      const response = await fetch('/api/peer-reviews/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create review: ${response.status}`);
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  },

  async updateReview(reviewId: string, updates: {
    userId: string;
    rating?: number;
    feedback?: string;
    categories?: Record<string, any>;
    is_public?: boolean;
  }): Promise<PeerReview | null> {
    try {
      const response = await fetch(`/api/peer-reviews/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update review: ${response.status}`);
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  },

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/peer-reviews/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete review: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  },

  async getReview(reviewId: string): Promise<PeerReview | null> {
    try {
      const response = await fetch(`/api/peer-reviews/reviews/${reviewId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch review: ${response.status}`);
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      console.error('Error fetching review:', error);
      return null;
    }
  },

  // =====================================================
  // REVIEW REQUESTS
  // =====================================================

  async getReviewRequests(userId: string, filters: {
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ requests: ReviewRequest[]; total: number }> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId);
      
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/peer-reviews/requests?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch review requests: ${response.status}`);
      }

      const data = await response.json();
      return {
        requests: data.requests || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching review requests:', error);
      return { requests: [], total: 0 };
    }
  },

  // =====================================================
  // STATISTICS
  // =====================================================

  async getReviewStatistics(userId: string): Promise<ReviewStatistics | null> {
    try {
      const response = await fetch(`/api/peer-reviews/user/${userId}/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch review statistics: ${response.status}`);
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      return null;
    }
  },

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  formatRating(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  },

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  },

  getSentimentColor(sentimentScore: number): string {
    if (sentimentScore > 0.3) return 'text-green-600';
    if (sentimentScore > -0.3) return 'text-yellow-600';
    return 'text-red-600';
  },

  getSentimentLabel(sentimentScore: number): string {
    if (sentimentScore > 0.3) return 'Positive';
    if (sentimentScore > -0.3) return 'Neutral';
    return 'Negative';
  },

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  generateReviewCategories(reviewType: string): Record<string, any> {
    const categories = {
      project: {
        code_quality: 0,
        functionality: 0,
        design: 0,
        documentation: 0,
        innovation: 0
      },
      skill: {
        technical_ability: 0,
        problem_solving: 0,
        communication: 0,
        collaboration: 0,
        learning_attitude: 0
      },
      portfolio: {
        presentation: 0,
        content_quality: 0,
        diversity: 0,
        innovation: 0,
        professionalism: 0
      },
      resume: {
        formatting: 0,
        content_clarity: 0,
        relevance: 0,
        achievements: 0,
        professionalism: 0
      }
    };

    return categories[reviewType] || {};
  },

  calculateOverallScore(categories: Record<string, any>): number {
    const values = Object.values(categories).filter(v => typeof v === 'number' && v > 0);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  },

  getReviewTypeIcon(reviewType: string): string {
    const icons = {
      project: '📁',
      skill: '🎯',
      portfolio: '💼',
      resume: '📄'
    };
    return icons[reviewType] || '📝';
  },

  getReviewTypeColor(reviewType: string): string {
    const colors = {
      project: 'bg-blue-100 text-blue-800',
      skill: 'bg-green-100 text-green-800',
      portfolio: 'bg-purple-100 text-purple-800',
      resume: 'bg-orange-100 text-orange-800'
    };
    return colors[reviewType] || 'bg-gray-100 text-gray-800';
  }
};
