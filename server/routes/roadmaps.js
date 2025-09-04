import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get user's roadmaps
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile to extract selected roadmaps
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('selected_roadmaps')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(404).json({ error: 'User not found' });
    }

    const roadmaps = profile.selected_roadmaps || [];
    
    res.json({ roadmaps });
  } catch (error) {
    console.error('Error fetching user roadmaps:', error);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

// Create a new roadmap
router.post('/create', async (req, res) => {
  try {
    const { userId, title, goal, category, steps, estimatedTime, difficulty, skills } = req.body;
    
    const roadmap = {
      id: `roadmap-${Date.now()}`,
      title,
      goal,
      category,
      steps: steps || [],
      estimatedTime,
      difficulty,
      skills: skills || [],
      currentStep: 0,
      progressPercentage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('selected_roadmaps')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add new roadmap to user's selected roadmaps
    const currentRoadmaps = profile.selected_roadmaps || [];
    currentRoadmaps.push(roadmap);

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        selected_roadmaps: currentRoadmaps,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user roadmaps:', updateError);
      return res.status(400).json({ error: 'Failed to create roadmap' });
    }

    res.json({ 
      success: true, 
      roadmap,
      message: 'Roadmap created successfully' 
    });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({ error: 'Failed to create roadmap' });
  }
});

// Update roadmap progress
router.put('/:roadmapId/progress', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { userId, currentStep, progressPercentage, completedSteps } = req.body;
    
    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('selected_roadmaps')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the specific roadmap
    const roadmaps = profile.selected_roadmaps || [];
    const roadmapIndex = roadmaps.findIndex(r => r.id === roadmapId);
    
    if (roadmapIndex === -1) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    roadmaps[roadmapIndex] = {
      ...roadmaps[roadmapIndex],
      currentStep: currentStep || roadmaps[roadmapIndex].currentStep,
      progressPercentage: progressPercentage || roadmaps[roadmapIndex].progressPercentage,
      completedSteps: completedSteps || roadmaps[roadmapIndex].completedSteps,
      updatedAt: new Date().toISOString()
    };

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        selected_roadmaps: roadmaps,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating roadmap progress:', updateError);
      return res.status(400).json({ error: 'Failed to update roadmap progress' });
    }

    res.json({ 
      success: true, 
      roadmap: roadmaps[roadmapIndex],
      message: 'Roadmap progress updated successfully' 
    });
  } catch (error) {
    console.error('Error updating roadmap progress:', error);
    res.status(500).json({ error: 'Failed to update roadmap progress' });
  }
});

// Delete a roadmap
router.delete('/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { userId } = req.body;
    
    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('selected_roadmaps')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the roadmap
    const roadmaps = profile.selected_roadmaps || [];
    const filteredRoadmaps = roadmaps.filter(r => r.id !== roadmapId);

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        selected_roadmaps: filteredRoadmaps,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error deleting roadmap:', updateError);
      return res.status(400).json({ error: 'Failed to delete roadmap' });
    }

    res.json({ 
      success: true, 
      message: 'Roadmap deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
});

// Get roadmap templates
router.get('/templates', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    // Mock roadmap templates - in a real app, these would be stored in a database
    const templates = [
      {
        id: 'template-1',
        title: 'Frontend Developer Path',
        description: 'Complete roadmap to become a frontend developer',
        category: 'Frontend Development',
        difficulty: 'beginner',
        estimatedTime: '6-8 months',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
        steps: [
          { id: 1, title: 'Learn HTML & CSS', description: 'Master the basics of web markup and styling', duration: '4 weeks' },
          { id: 2, title: 'JavaScript Fundamentals', description: 'Learn programming fundamentals with JavaScript', duration: '6 weeks' },
          { id: 3, title: 'React Basics', description: 'Build your first React applications', duration: '8 weeks' },
          { id: 4, title: 'Advanced React', description: 'State management, hooks, and performance', duration: '6 weeks' },
          { id: 5, title: 'TypeScript', description: 'Add type safety to your JavaScript', duration: '4 weeks' }
        ]
      },
      {
        id: 'template-2',
        title: 'Data Science Journey',
        description: 'From beginner to data scientist',
        category: 'Data Science',
        difficulty: 'intermediate',
        estimatedTime: '8-12 months',
        skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
        steps: [
          { id: 1, title: 'Python Programming', description: 'Learn Python for data analysis', duration: '6 weeks' },
          { id: 2, title: 'Statistics & Math', description: 'Essential statistical concepts', duration: '8 weeks' },
          { id: 3, title: 'SQL & Databases', description: 'Data storage and retrieval', duration: '4 weeks' },
          { id: 4, title: 'Machine Learning', description: 'Build predictive models', duration: '10 weeks' },
          { id: 5, title: 'Data Visualization', description: 'Present insights effectively', duration: '4 weeks' }
        ]
      }
    ];

    let filteredTemplates = templates;

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
    }

    res.json({ templates: filteredTemplates });
  } catch (error) {
    console.error('Error fetching roadmap templates:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap templates' });
  }
});

export default router;
