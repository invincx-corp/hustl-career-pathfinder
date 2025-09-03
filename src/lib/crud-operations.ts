/**
 * Comprehensive CRUD Operations for Nexa Platform
 * Centralized service for all database operations
 */

import { supabase } from './supabase';
import { RBACService, type UserRole, type Permission } from './rbac';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Roadmap {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  goal: string;
  category: string;
  steps: RoadmapStep[];
  estimated_total_time?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills_to_learn: string[];
  prerequisites: string[];
  current_step: number;
  progress_percentage: number;
  steps_completed: number;
  total_steps: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapStep {
  id?: string;
  title: string;
  description: string;
  estimated_time?: string;
  resources?: string[];
  completed: boolean;
  completed_at?: string;
}

export interface Project {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills_required: string[];
  skills_learned: string[];
  estimated_time?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'abandoned';
  is_public: boolean;
  github_url?: string;
  demo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Opportunity {
  id?: string;
  posted_by: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  category: string;
  description: string;
  requirements: string[];
  salary_range?: string;
  application_deadline?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Mentor {
  id?: string;
  user_id: string;
  bio: string;
  expertise_areas: string[];
  experience_years: number;
  hourly_rate: number;
  availability: string;
  languages: string[];
  is_verified: boolean;
  rating: number;
  total_sessions: number;
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipSession {
  id?: string;
  mentor_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  rating?: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// CRUD SERVICE CLASS
// =====================================================

export class CRUDService {
  // =====================================================
  // ROADMAP OPERATIONS
  // =====================================================

  static async createRoadmap(userId: string, userRole: UserRole, roadmapData: Omit<Roadmap, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Roadmap | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'roadmaps:write')) {
      return { data: null, error: 'Insufficient permissions to create roadmaps' };
    }

    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .insert([{
          ...roadmapData,
          user_id: userId,
          total_steps: roadmapData.steps.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create roadmap error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create roadmap' };
    }
  }

  static async getRoadmaps(userId: string, userRole: UserRole, filters?: { category?: string; status?: string; is_public?: boolean }): Promise<{ data: Roadmap[] | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'roadmaps:read')) {
      return { data: null, error: 'Insufficient permissions to read roadmaps' };
    }

    try {
      let query = supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      // Role-based filtering
      if (userRole === 'student') {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else if (userRole === 'mentor') {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get roadmaps error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch roadmaps' };
    }
  }

  static async updateRoadmap(userId: string, userRole: UserRole, roadmapId: string, updates: Partial<Roadmap>): Promise<{ data: Roadmap | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'roadmaps:write')) {
      return { data: null, error: 'Insufficient permissions to update roadmaps' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('roadmaps')
          .select('user_id')
          .eq('id', roadmapId)
          .single();

        if (existing?.user_id !== userId) {
          return { data: null, error: 'You can only update your own roadmaps' };
        }
      }

      const { data, error } = await supabase
        .from('roadmaps')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', roadmapId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update roadmap error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update roadmap' };
    }
  }

  static async deleteRoadmap(userId: string, userRole: UserRole, roadmapId: string): Promise<{ success: boolean; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'roadmaps:delete')) {
      return { success: false, error: 'Insufficient permissions to delete roadmaps' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('roadmaps')
          .select('user_id')
          .eq('id', roadmapId)
          .single();

        if (existing?.user_id !== userId) {
          return { success: false, error: 'You can only delete your own roadmaps' };
        }
      }

      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Delete roadmap error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete roadmap' };
    }
  }

  // =====================================================
  // PROJECT OPERATIONS
  // =====================================================

  static async createProject(userId: string, userRole: UserRole, projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Project | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'projects:write')) {
      return { data: null, error: 'Insufficient permissions to create projects' };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create project error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create project' };
    }
  }

  static async getProjects(userId: string, userRole: UserRole, filters?: { category?: string; status?: string; is_public?: boolean }): Promise<{ data: Project[] | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'projects:read')) {
      return { data: null, error: 'Insufficient permissions to read projects' };
    }

    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      // Role-based filtering
      if (userRole === 'student') {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else if (userRole === 'mentor') {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get projects error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch projects' };
    }
  }

  static async updateProject(userId: string, userRole: UserRole, projectId: string, updates: Partial<Project>): Promise<{ data: Project | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'projects:write')) {
      return { data: null, error: 'Insufficient permissions to update projects' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();

        if (existing?.user_id !== userId) {
          return { data: null, error: 'You can only update your own projects' };
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update project error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update project' };
    }
  }

  static async deleteProject(userId: string, userRole: UserRole, projectId: string): Promise<{ success: boolean; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'projects:delete')) {
      return { success: false, error: 'Insufficient permissions to delete projects' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();

        if (existing?.user_id !== userId) {
          return { success: false, error: 'You can only delete your own projects' };
        }
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' };
    }
  }

  // =====================================================
  // OPPORTUNITY OPERATIONS
  // =====================================================

  static async createOpportunity(userId: string, userRole: UserRole, opportunityData: Omit<Opportunity, 'id' | 'posted_by' | 'created_at' | 'updated_at'>): Promise<{ data: Opportunity | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'opportunities:write')) {
      return { data: null, error: 'Insufficient permissions to create opportunities' };
    }

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityData,
          posted_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create opportunity error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create opportunity' };
    }
  }

  static async getOpportunities(userId: string, userRole: UserRole, filters?: { category?: string; type?: string; is_active?: boolean }): Promise<{ data: Opportunity[] | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'opportunities:read')) {
      return { data: null, error: 'Insufficient permissions to read opportunities' };
    }

    try {
      let query = supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get opportunities error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch opportunities' };
    }
  }

  static async updateOpportunity(userId: string, userRole: UserRole, opportunityId: string, updates: Partial<Opportunity>): Promise<{ data: Opportunity | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'opportunities:write')) {
      return { data: null, error: 'Insufficient permissions to update opportunities' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('opportunities')
          .select('posted_by')
          .eq('id', opportunityId)
          .single();

        if (existing?.posted_by !== userId) {
          return { data: null, error: 'You can only update your own opportunities' };
        }
      }

      const { data, error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update opportunity error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update opportunity' };
    }
  }

  static async deleteOpportunity(userId: string, userRole: UserRole, opportunityId: string): Promise<{ success: boolean; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'opportunities:delete')) {
      return { success: false, error: 'Insufficient permissions to delete opportunities' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('opportunities')
          .select('posted_by')
          .eq('id', opportunityId)
          .single();

        if (existing?.posted_by !== userId) {
          return { success: false, error: 'You can only delete your own opportunities' };
        }
      }

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Delete opportunity error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete opportunity' };
    }
  }

  // =====================================================
  // MENTOR OPERATIONS
  // =====================================================

  static async createMentor(userId: string, userRole: UserRole, mentorData: Omit<Mentor, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Mentor | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:write')) {
      return { data: null, error: 'Insufficient permissions to create mentor profile' };
    }

    try {
      const { data, error } = await supabase
        .from('mentors')
        .insert([{
          ...mentorData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create mentor error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create mentor profile' };
    }
  }

  static async getMentors(userId: string, userRole: UserRole, filters?: { expertise_areas?: string[]; availability?: string; is_verified?: boolean }): Promise<{ data: Mentor[] | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:read')) {
      return { data: null, error: 'Insufficient permissions to read mentors' };
    }

    try {
      let query = supabase
        .from('mentors')
        .select('*')
        .order('rating', { ascending: false });

      // Apply filters
      if (filters?.expertise_areas && filters.expertise_areas.length > 0) {
        query = query.overlaps('expertise_areas', filters.expertise_areas);
      }
      if (filters?.availability) {
        query = query.eq('availability', filters.availability);
      }
      if (filters?.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get mentors error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch mentors' };
    }
  }

  static async updateMentor(userId: string, userRole: UserRole, mentorId: string, updates: Partial<Mentor>): Promise<{ data: Mentor | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:write')) {
      return { data: null, error: 'Insufficient permissions to update mentor profile' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('mentors')
          .select('user_id')
          .eq('id', mentorId)
          .single();

        if (existing?.user_id !== userId) {
          return { data: null, error: 'You can only update your own mentor profile' };
        }
      }

      const { data, error } = await supabase
        .from('mentors')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mentorId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update mentor error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update mentor profile' };
    }
  }

  // =====================================================
  // MENTORSHIP SESSION OPERATIONS
  // =====================================================

  static async createMentorshipSession(userId: string, userRole: UserRole, sessionData: Omit<MentorshipSession, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: MentorshipSession | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:write')) {
      return { data: null, error: 'Insufficient permissions to create mentorship sessions' };
    }

    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert([{
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create mentorship session error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create mentorship session' };
    }
  }

  static async getMentorshipSessions(userId: string, userRole: UserRole, filters?: { status?: string; mentor_id?: string; student_id?: string }): Promise<{ data: MentorshipSession[] | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:read')) {
      return { data: null, error: 'Insufficient permissions to read mentorship sessions' };
    }

    try {
      let query = supabase
        .from('mentorship_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.mentor_id) {
        query = query.eq('mentor_id', filters.mentor_id);
      }
      if (filters?.student_id) {
        query = query.eq('student_id', filters.student_id);
      }

      // Role-based filtering
      if (userRole === 'student') {
        query = query.eq('student_id', userId);
      } else if (userRole === 'mentor') {
        query = query.eq('mentor_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get mentorship sessions error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch mentorship sessions' };
    }
  }

  static async updateMentorshipSession(userId: string, userRole: UserRole, sessionId: string, updates: Partial<MentorshipSession>): Promise<{ data: MentorshipSession | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'mentorship:write')) {
      return { data: null, error: 'Insufficient permissions to update mentorship sessions' };
    }

    try {
      // Check ownership for non-admin users
      if (userRole !== 'admin') {
        const { data: existing } = await supabase
          .from('mentorship_sessions')
          .select('mentor_id, student_id')
          .eq('id', sessionId)
          .single();

        if (existing?.mentor_id !== userId && existing?.student_id !== userId) {
          return { data: null, error: 'You can only update your own mentorship sessions' };
        }
      }

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update mentorship session error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update mentorship session' };
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  static async searchContent(userId: string, userRole: UserRole, query: string, types: ('roadmaps' | 'projects' | 'opportunities')[] = ['roadmaps', 'projects', 'opportunities']): Promise<{ data: any[] | null; error: string | null }> {
    const results: any[] = [];

    try {
      for (const type of types) {
        if (type === 'roadmaps' && RBACService.hasPermission(userRole, 'roadmaps:read')) {
          const { data } = await supabase
            .from('roadmaps')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,goal.ilike.%${query}%`)
            .limit(10);
          
          if (data) results.push(...data.map(item => ({ ...item, type: 'roadmap' })));
        }

        if (type === 'projects' && RBACService.hasPermission(userRole, 'projects:read')) {
          const { data } = await supabase
            .from('projects')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(10);
          
          if (data) results.push(...data.map(item => ({ ...item, type: 'project' })));
        }

        if (type === 'opportunities' && RBACService.hasPermission(userRole, 'opportunities:read')) {
          const { data } = await supabase
            .from('opportunities')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`)
            .limit(10);
          
          if (data) results.push(...data.map(item => ({ ...item, type: 'opportunity' })));
        }
      }

      return { data: results, error: null };
    } catch (error) {
      console.error('Search content error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to search content' };
    }
  }

  static async getAnalytics(userId: string, userRole: UserRole): Promise<{ data: any | null; error: string | null }> {
    if (!RBACService.hasPermission(userRole, 'analytics:read')) {
      return { data: null, error: 'Insufficient permissions to view analytics' };
    }

    try {
      const analytics: any = {};

      // Get user's roadmaps progress
      if (RBACService.hasPermission(userRole, 'roadmaps:read')) {
        const { data: roadmaps } = await supabase
          .from('roadmaps')
          .select('status, progress_percentage')
          .eq('user_id', userId);

        analytics.roadmaps = {
          total: roadmaps?.length || 0,
          completed: roadmaps?.filter(r => r.status === 'completed').length || 0,
          in_progress: roadmaps?.filter(r => r.status === 'active').length || 0,
          average_progress: roadmaps?.reduce((acc, r) => acc + r.progress_percentage, 0) / (roadmaps?.length || 1) || 0
        };
      }

      // Get user's projects
      if (RBACService.hasPermission(userRole, 'projects:read')) {
        const { data: projects } = await supabase
          .from('projects')
          .select('status')
          .eq('user_id', userId);

        analytics.projects = {
          total: projects?.length || 0,
          completed: projects?.filter(p => p.status === 'completed').length || 0,
          in_progress: projects?.filter(p => p.status === 'in-progress').length || 0
        };
      }

      // Get mentorship sessions for mentors
      if (userRole === 'mentor' && RBACService.hasPermission(userRole, 'mentorship:read')) {
        const { data: sessions } = await supabase
          .from('mentorship_sessions')
          .select('status, rating')
          .eq('mentor_id', userId);

        analytics.mentorship = {
          total_sessions: sessions?.length || 0,
          completed_sessions: sessions?.filter(s => s.status === 'completed').length || 0,
          average_rating: sessions?.filter(s => s.rating).reduce((acc, s) => acc + s.rating, 0) / (sessions?.filter(s => s.rating).length || 1) || 0
        };
      }

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Get analytics error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch analytics' };
    }
  }
}

// Export singleton instance
export const crudService = new CRUDService();
