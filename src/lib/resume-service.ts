import { supabase } from './supabase';

export interface ResumeSection {
  id: string;
  user_id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'certifications';
  title: string;
  content: any;
  is_visible: boolean;
  order_index: number;
  last_updated: string;
}

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  bio?: string;
  avatar_url?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  achievements: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  certifications?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  start_date: string;
  end_date?: string;
  is_featured: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'award' | 'certification' | 'publication' | 'recognition';
  issuer?: string;
  url?: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  template_data: any;
  preview_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ResumeAnalytics {
  id: string;
  user_id: string;
  view_count: number;
  last_viewed?: string;
  view_source?: string;
  viewer_location?: string;
  created_at: string;
}

class ResumeService {
  // Resume Sections Management
  async getResumeSections(userId: string) {
    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching resume sections:', error);
      return { data: null, error: error.message };
    }
  }

  async getResumeSection(userId: string, type: string) {
    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching resume section:', error);
      return { data: null, error: error.message };
    }
  }

  async updateResumeSection(userId: string, type: string, content: any, isVisible: boolean = true) {
    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .upsert({
          user_id: userId,
          type: type,
          title: this.getSectionTitle(type),
          content: content,
          is_visible: isVisible,
          order_index: this.getSectionOrder(type),
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating resume section:', error);
      return { data: null, error: error.message };
    }
  }

  async updateResumeSectionVisibility(userId: string, type: string, isVisible: boolean) {
    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .update({ is_visible: isVisible })
        .eq('user_id', userId)
        .eq('type', type)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating resume section visibility:', error);
      return { data: null, error: error.message };
    }
  }

  async reorderResumeSections(userId: string, sections: { type: string; order_index: number }[]) {
    try {
      const updates = sections.map(section => ({
        user_id: userId,
        type: section.type,
        order_index: section.order_index
      }));

      const { data, error } = await supabase
        .from('resume_sections')
        .upsert(updates, { onConflict: 'user_id,type' })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error reordering resume sections:', error);
      return { data: null, error: error.message };
    }
  }

  // Resume Templates
  async getResumeTemplates() {
    try {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching resume templates:', error);
      return { data: null, error: error.message };
    }
  }

  async getResumeTemplateById(templateId: string) {
    try {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching resume template:', error);
      return { data: null, error: error.message };
    }
  }

  // Resume Analytics
  async getResumeAnalytics(userId: string) {
    try {
      const { data, error } = await supabase
        .from('resume_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching resume analytics:', error);
      return { data: null, error: error.message };
    }
  }

  async trackResumeView(userId: string, viewSource?: string, viewerLocation?: string) {
    try {
      const { data, error } = await supabase
        .from('resume_analytics')
        .insert({
          user_id: userId,
          view_count: 1,
          last_viewed: new Date().toISOString(),
          view_source: viewSource,
          viewer_location: viewerLocation,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error tracking resume view:', error);
      return { data: null, error: error.message };
    }
  }

  // Auto-update functionality
  async autoUpdateFromProjects(userId: string) {
    try {
      // Get user's projects from project service
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', userId)
        .eq('status', 'completed')
        .eq('is_public', true);

      if (!projects || projects.length === 0) {
        return { data: null, error: 'No completed projects found' };
      }

      // Transform projects to resume format
      const resumeProjects = projects.map(project => ({
        id: project.id,
        name: project.title,
        description: project.description,
        technologies: project.technologies,
        url: project.live_url,
        github_url: project.repository_url,
        start_date: project.created_at,
        end_date: project.updated_at,
        is_featured: project.likes > 5 // Featured if it has more than 5 likes
      }));

      // Update projects section
      await this.updateResumeSection(userId, 'projects', resumeProjects);

      return { data: resumeProjects, error: null };
    } catch (error) {
      console.error('Error auto-updating from projects:', error);
      return { data: null, error: error.message };
    }
  }

  async autoUpdateFromLearning(userId: string) {
    try {
      // Get user's completed learning content
      const { data: progress } = await supabase
        .from('user_progress')
        .select(`
          *,
          learning_content (
            title,
            category,
            difficulty,
            type
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', true);

      if (!progress || progress.length === 0) {
        return { data: null, error: 'No completed learning content found' };
      }

      // Transform to skills format
      const skills = new Map();
      progress.forEach(p => {
        const content = p.learning_content;
        if (content) {
          const skillName = content.title;
          const category = this.mapCategoryToSkillType(content.category);
          
          if (!skills.has(skillName)) {
            skills.set(skillName, {
              id: `auto-${content.title}`,
              name: skillName,
              category: category,
              level: this.mapDifficultyToLevel(content.difficulty),
              years_experience: 0,
              certifications: []
            });
          }
        }
      });

      // Update skills section
      await this.updateResumeSection(userId, 'skills', Array.from(skills.values()));

      return { data: Array.from(skills.values()), error: null };
    } catch (error) {
      console.error('Error auto-updating from learning:', error);
      return { data: null, error: error.message };
    }
  }

  async autoUpdateFromAchievements(userId: string) {
    try {
      // Get user's badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (
            name,
            description,
            category,
            rarity
          )
        `)
        .eq('user_id', userId);

      if (!userBadges || userBadges.length === 0) {
        return { data: null, error: 'No achievements found' };
      }

      // Transform to achievements format
      const achievements = userBadges.map(ub => ({
        id: ub.id,
        title: ub.badges.name,
        description: ub.badges.description,
        date: ub.earned_at,
        category: this.mapBadgeCategoryToAchievementCategory(ub.badges.category),
        issuer: 'Nexa Learning Platform',
        url: undefined
      }));

      // Update achievements section
      await this.updateResumeSection(userId, 'achievements', achievements);

      return { data: achievements, error: null };
    } catch (error) {
      console.error('Error auto-updating from achievements:', error);
      return { data: null, error: error.message };
    }
  }

  // Export functionality
  async exportResumeToJSON(userId: string) {
    try {
      const { data: sections } = await this.getResumeSections(userId);
      if (!sections) {
        return { data: null, error: 'No resume data found' };
      }

      const resumeData = {
        user_id: userId,
        exported_at: new Date().toISOString(),
        sections: sections.reduce((acc, section) => {
          acc[section.type] = {
            title: section.title,
            content: section.content,
            is_visible: section.is_visible,
            last_updated: section.last_updated
          };
          return acc;
        }, {} as any)
      };

      return { data: resumeData, error: null };
    } catch (error) {
      console.error('Error exporting resume to JSON:', error);
      return { data: null, error: error.message };
    }
  }

  // Helper methods
  private getSectionTitle(type: string): string {
    const titles = {
      personal: 'Personal Information',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      achievements: 'Achievements & Certifications',
      certifications: 'Certifications'
    };
    return titles[type] || type;
  }

  private getSectionOrder(type: string): number {
    const orders = {
      personal: 1,
      experience: 2,
      education: 3,
      skills: 4,
      projects: 5,
      achievements: 6,
      certifications: 7
    };
    return orders[type] || 99;
  }

  private mapCategoryToSkillType(category: string): 'technical' | 'soft' | 'language' | 'tool' {
    const categoryMap = {
      'Frontend Development': 'technical',
      'Backend Development': 'technical',
      'Data Science': 'technical',
      'Mobile Development': 'technical',
      'DevOps': 'technical',
      'Design': 'technical',
      'Business': 'soft',
      'Soft Skills': 'soft'
    };
    return categoryMap[category] || 'technical';
  }

  private mapDifficultyToLevel(difficulty: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const difficultyMap = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    };
    return difficultyMap[difficulty] || 'beginner';
  }

  private mapBadgeCategoryToAchievementCategory(category: string): 'award' | 'certification' | 'publication' | 'recognition' {
    const categoryMap = {
      'learning': 'certification',
      'achievement': 'award',
      'milestone': 'recognition',
      'special': 'award'
    };
    return categoryMap[category] || 'recognition';
  }
}

export const resumeService = new ResumeService();
