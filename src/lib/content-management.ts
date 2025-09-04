import { supabase } from './supabase';

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'project';
  source: string;
  source_url?: string;
  thumbnail_url?: string;
  tags: string[];
  prerequisites: string[];
  learning_objectives: string[];
  content_data: any; // JSON data for the actual content
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  content_id: string;
  progress_percentage: number;
  time_spent: number; // in minutes
  is_completed: boolean;
  completed_at?: string;
  last_accessed: string;
  notes?: string;
  rating?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: 'learning' | 'achievement' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: any; // JSON data for badge requirements
  xp_reward: number;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress?: number; // for progress-based badges
}

export interface OfflineContent {
  id: string;
  user_id: string;
  content_id: string;
  downloaded_at: string;
  file_size: number;
  file_path: string;
  is_synced: boolean;
  last_sync: string;
}

class ContentManagementService {
  // Content Management
  async getContentList(filters?: {
    category?: string;
    difficulty?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('learning_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching content list:', error);
      return { data: null, error: error.message };
    }
  }

  async getContentById(contentId: string) {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching content:', error);
      return { data: null, error: error.message };
    }
  }

  async getRecommendedContent(userId: string, limit: number = 10) {
    try {
      // Get user's interests and skills from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, skills')
        .eq('id', userId)
        .single();

      if (!profile) {
        return { data: [], error: null };
      }

      // Get content based on user interests and skills
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_published', true)
        .in('category', profile.interests || [])
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recommended content:', error);
      return { data: [], error: error.message };
    }
  }

  // Progress Tracking
  async getUserProgress(userId: string, contentId?: string) {
    try {
      let query = supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (contentId) {
        query = query.eq('content_id', contentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { data: null, error: error.message };
    }
  }

  async updateProgress(userId: string, contentId: string, progress: Partial<UserProgress>) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          ...progress,
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { data: null, error: error.message };
    }
  }

  async markAsCompleted(userId: string, contentId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking as completed:', error);
      return { data: null, error: error.message };
    }
  }

  // Badge System
  async getBadges(category?: string) {
    try {
      let query = supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching badges:', error);
      return { data: null, error: error.message };
    }
  }

  async getUserBadges(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return { data: null, error: error.message };
    }
  }

  async awardBadge(userId: string, badgeId: string) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { data: null, error: error.message };
    }
  }

  // Offline Support
  async getOfflineContent(userId: string) {
    try {
      const { data, error } = await supabase
        .from('offline_content')
        .select(`
          *,
          learning_content (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching offline content:', error);
      return { data: null, error: error.message };
    }
  }

  async downloadForOffline(userId: string, contentId: string) {
    try {
      // Get content data
      const { data: content } = await this.getContentById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Store offline content record
      const { data, error } = await supabase
        .from('offline_content')
        .insert({
          user_id: userId,
          content_id: contentId,
          downloaded_at: new Date().toISOString(),
          file_size: JSON.stringify(content.content_data).length,
          file_path: `offline/${userId}/${contentId}.json`,
          is_synced: true,
          last_sync: new Date().toISOString()
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error downloading for offline:', error);
      return { data: null, error: error.message };
    }
  }

  async removeOfflineContent(userId: string, contentId: string) {
    try {
      const { data, error } = await supabase
        .from('offline_content')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error removing offline content:', error);
      return { data: null, error: error.message };
    }
  }

  // Content Creation (Admin functions)
  async createContent(content: Omit<LearningContent, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .insert({
          ...content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating content:', error);
      return { data: null, error: error.message };
    }
  }

  async updateContent(contentId: string, updates: Partial<LearningContent>) {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating content:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteContent(contentId: string) {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting content:', error);
      return { data: null, error: error.message };
    }
  }
}

export const contentManagementService = new ContentManagementService();
