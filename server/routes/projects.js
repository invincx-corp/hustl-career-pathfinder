import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get user projects
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category } = req.query;

    let query = supabase
      .from('user_projects')
      .select(`
        *,
        project_templates (
          id,
          title,
          description,
          category,
          difficulty_level,
          estimated_duration,
          skills_required,
          learning_objectives,
          resources,
          milestones
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project templates
router.get('/templates/all', async (req, res) => {
  try {
    const { category, difficulty, skills } = req.query;

    let query = supabase
      .from('project_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty);
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query = query.overlaps('skills_required', skillsArray);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching project templates:', error);
      return res.status(500).json({ error: 'Failed to fetch project templates' });
    }

    res.json({ templates: templates || [] });
  } catch (error) {
    console.error('Error fetching project templates:', error);
    res.status(500).json({ error: 'Failed to fetch project templates' });
  }
});

// Create new project
router.post('/:userId/create', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      title, 
      description, 
      template_id, 
      category, 
      difficulty_level, 
      estimated_duration,
      skills_required,
      learning_objectives,
      resources,
      milestones,
      team_members
    } = req.body;

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('user_projects')
      .insert({
        user_id: userId,
        title,
        description,
        template_id,
        category,
        difficulty_level,
        estimated_duration,
        skills_required: skills_required || [],
        learning_objectives: learning_objectives || [],
        resources: resources || [],
        milestones: milestones || [],
        team_members: team_members || [],
        status: 'planning',
        progress_percentage: 0,
        current_milestone: 0
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    res.json({ 
      success: true, 
      message: 'Project created successfully',
      project 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    const { data: project, error } = await supabase
      .from('user_projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json({ 
      success: true, 
      message: 'Project updated successfully',
      project 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Update project progress
router.put('/:projectId/progress', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { progress_percentage, current_milestone, status } = req.body;

    const updateData = {
      progress_percentage,
      updated_at: new Date().toISOString()
    };

    if (current_milestone !== undefined) {
      updateData.current_milestone = current_milestone;
    }

    if (status) {
      updateData.status = status;
    }

    const { data: project, error } = await supabase
      .from('user_projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project progress:', error);
      return res.status(500).json({ error: 'Failed to update project progress' });
    }

    res.json({ 
      success: true, 
      message: 'Project progress updated successfully',
      project 
    });
  } catch (error) {
    console.error('Error updating project progress:', error);
    res.status(500).json({ error: 'Failed to update project progress' });
  }
});

// Delete project
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get project analytics
router.get('/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Get project statistics
    const { data: projects, error: projectsError } = await supabase
      .from('user_projects')
      .select('status, progress_percentage, created_at, completed_at')
      .eq('user_id', userId);

    if (projectsError) {
      console.error('Error fetching project analytics:', projectsError);
      return res.status(500).json({ error: 'Failed to fetch project analytics' });
    }

    const analytics = {
      totalProjects: projects?.length || 0,
      completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
      inProgressProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
      averageProgress: projects?.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length)
        : 0,
      completionRate: projects?.length > 0 
        ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
        : 0,
      recentActivity: projects?.slice(0, 5).map(p => ({
        id: p.id,
        status: p.status,
        progress: p.progress_percentage,
        updatedAt: p.updated_at || p.created_at
      })) || []
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ error: 'Failed to fetch project analytics' });
  }
});

export default router;
