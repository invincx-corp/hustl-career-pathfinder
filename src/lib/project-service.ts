import { supabase } from './supabase';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'data' | 'design' | 'other';
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  technologies: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  progress: number;
  likes: number;
  views: number;
  repository_url?: string;
  live_url?: string;
  thumbnail_url?: string;
  features: string[];
  challenges: string[];
  learnings: string[];
  resources: string[];
  is_public: boolean;
  tags: string[];
  team_members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  estimated_duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  resources: string[];
  is_active: boolean;
  created_at: string;
}

export interface ProjectReview {
  id: string;
  project_id: string;
  reviewer_id: string;
  rating: number;
  feedback?: string;
  is_public: boolean;
  created_at: string;
  reviewer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

class ProjectService {
  // Project Management
  async getProjects(filters?: {
    category?: string;
    status?: string;
    search?: string;
    user_id?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_team_members (
            *,
            user:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.user_id) {
        query = query.eq('created_by', filters.user_id);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
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

      // Transform team members data
      const projects = data?.map(project => ({
        ...project,
        team_members: project.project_team_members?.map(tm => ({
          id: tm.id,
          project_id: tm.project_id,
          user_id: tm.user_id,
          role: tm.role,
          joined_at: tm.joined_at,
          is_active: tm.is_active,
          user: tm.user
        })) || []
      })) || [];

      return { data: projects, error: null };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error: error.message };
    }
  }

  async getProjectById(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_team_members (
            *,
            user:user_id (
              id,
              full_name,
              avatar_url
            )
          ),
          project_reviews (
            *,
            reviewer:reviewer_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      // Transform data
      const project = {
        ...data,
        team_members: data.project_team_members?.map(tm => ({
          id: tm.id,
          project_id: tm.project_id,
          user_id: tm.user_id,
          role: tm.role,
          joined_at: tm.joined_at,
          is_active: tm.is_active,
          user: tm.user
        })) || [],
        reviews: data.project_reviews?.map(review => ({
          id: review.id,
          project_id: review.project_id,
          reviewer_id: review.reviewer_id,
          rating: review.rating,
          feedback: review.feedback,
          is_public: review.is_public,
          created_at: review.created_at,
          reviewer: review.reviewer
        })) || []
      };

      return { data: project, error: null };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { data: null, error: error.message };
    }
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'team_members'>) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error: error.message };
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    try {
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
      console.error('Error updating project:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { data: null, error: error.message };
    }
  }

  // Team Management
  async addTeamMember(projectId: string, userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role,
          joined_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding team member:', error);
      return { data: null, error: error.message };
    }
  }

  async removeTeamMember(projectId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error removing team member:', error);
      return { data: null, error: error.message };
    }
  }

  async updateTeamMemberRole(projectId: string, userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating team member role:', error);
      return { data: null, error: error.message };
    }
  }

  // Project Templates
  async getProjectTemplates(category?: string) {
    try {
      let query = supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching project templates:', error);
      return { data: null, error: error.message };
    }
  }

  async getProjectTemplateById(templateId: string) {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching project template:', error);
      return { data: null, error: error.message };
    }
  }

  // Project Reviews
  async getProjectReviews(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('project_reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviews = data?.map(review => ({
        id: review.id,
        project_id: review.project_id,
        reviewer_id: review.reviewer_id,
        rating: review.rating,
        feedback: review.feedback,
        is_public: review.is_public,
        created_at: review.created_at,
        reviewer: review.reviewer
      })) || [];

      return { data: reviews, error: null };
    } catch (error) {
      console.error('Error fetching project reviews:', error);
      return { data: null, error: error.message };
    }
  }

  async createProjectReview(review: Omit<ProjectReview, 'id' | 'created_at' | 'reviewer'>) {
    try {
      const { data, error } = await supabase
        .from('project_reviews')
        .insert({
          ...review,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project review:', error);
      return { data: null, error: error.message };
    }
  }

  // Project Analytics
  async incrementProjectViews(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ views: supabase.raw('views + 1') })
        .eq('id', projectId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error incrementing project views:', error);
      return { data: null, error: error.message };
    }
  }

  async incrementProjectLikes(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ likes: supabase.raw('likes + 1') })
        .eq('id', projectId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error incrementing project likes:', error);
      return { data: null, error: error.message };
    }
  }

  // User's Projects
  async getUserProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_team_members (
            *,
            user:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .or(`created_by.eq.${userId},project_team_members.user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = data?.map(project => ({
        ...project,
        team_members: project.project_team_members?.map(tm => ({
          id: tm.id,
          project_id: tm.project_id,
          user_id: tm.user_id,
          role: tm.role,
          joined_at: tm.joined_at,
          is_active: tm.is_active,
          user: tm.user
        })) || []
      })) || [];

      return { data: projects, error: null };
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return { data: null, error: error.message };
    }
  }
}

export const projectService = new ProjectService();
