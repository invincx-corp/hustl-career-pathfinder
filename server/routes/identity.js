import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// SelfGraph API routes
router.get('/selfgraph/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock data for now - in real implementation, fetch from database
    const selfGraphData = {
      id: '1',
      timestamp: '2024-01-15',
      interests: [
        { name: 'Frontend Development', intensity: 85, trend: 'up', category: 'Technical' },
        { name: 'UI/UX Design', intensity: 72, trend: 'up', category: 'Creative' },
        { name: 'Data Science', intensity: 45, trend: 'down', category: 'Technical' },
        { name: 'Leadership', intensity: 68, trend: 'stable', category: 'Soft Skills' }
      ],
      skills: [
        { name: 'React', level: 7, confidence: 8, lastPracticed: '2024-01-14', category: 'Technical' },
        { name: 'JavaScript', level: 8, confidence: 9, lastPracticed: '2024-01-15', category: 'Technical' },
        { name: 'Communication', level: 6, confidence: 7, lastPracticed: '2024-01-10', category: 'Soft Skills' },
        { name: 'Problem Solving', level: 8, confidence: 8, lastPracticed: '2024-01-12', category: 'Soft Skills' }
      ],
      values: [
        { name: 'Innovation', importance: 9, alignment: 8, category: 'Work' },
        { name: 'Work-Life Balance', importance: 8, alignment: 6, category: 'Life' },
        { name: 'Learning', importance: 9, alignment: 9, category: 'Growth' },
        { name: 'Impact', importance: 7, alignment: 5, category: 'Purpose' }
      ],
      confidence: 75,
      energy: 80,
      decisionMaking: 70,
      collaboration: 65,
      learning: 85,
      creativity: 78
    };

    res.json({ selfGraphData });
  } catch (error) {
    console.error('Error fetching SelfGraph data:', error);
    res.status(500).json({ error: 'Failed to fetch SelfGraph data' });
  }
});

router.post('/selfgraph/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { interests, skills, values, metrics } = req.body;

    // Mock update - in real implementation, update database
    res.json({ 
      success: true, 
      message: 'SelfGraph updated successfully',
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating SelfGraph:', error);
    res.status(500).json({ error: 'Failed to update SelfGraph' });
  }
});

router.get('/selfgraph/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Mock historical data
    const history = [
      {
        date: '2024-01-15',
        confidence: 75,
        energy: 80,
        decisionMaking: 70,
        collaboration: 65,
        learning: 85,
        creativity: 78
      },
      {
        date: '2024-01-14',
        confidence: 72,
        energy: 75,
        decisionMaking: 68,
        collaboration: 62,
        learning: 82,
        creativity: 75
      },
      {
        date: '2024-01-13',
        confidence: 70,
        energy: 78,
        decisionMaking: 65,
        collaboration: 60,
        learning: 80,
        creativity: 72
      }
    ];

    res.json({ history });
  } catch (error) {
    console.error('Error fetching SelfGraph history:', error);
    res.status(500).json({ error: 'Failed to fetch SelfGraph history' });
  }
});

// Living Resume API routes
router.get('/resume/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get resume sections from database
    const { data: resumeSections, error } = await supabase
      .from('resume_sections')
      .select('*')
      .eq('user_id', userId)
      .order('section_order', { ascending: true });

    if (error) {
      console.error('Error fetching resume sections:', error);
      return res.status(500).json({ error: 'Failed to fetch resume sections' });
    }

    // Get user projects for resume
    const { data: projects, error: projectsError } = await supabase
      .from('user_projects')
      .select('id, title, description, skills_required, status, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (projectsError) {
      console.error('Error fetching user projects:', projectsError);
    }

    // Get user achievements for resume
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('id, title, description, badge_type, earned_at')
      .eq('user_id', userId);

    if (achievementsError) {
      console.error('Error fetching user achievements:', achievementsError);
    }

    // Get learning progress for resume
    const { data: learningProgress, error: learningError } = await supabase
      .from('user_learning_progress')
      .select('capsule_id, progress_percentage, completed_at, learning_capsules(title, category)')
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (learningError) {
      console.error('Error fetching learning progress:', learningError);
    }

    // Structure the resume data
    const resume = {
      id: userId,
      userId,
      sections: resumeSections || [],
      projects: projects || [],
      achievements: achievements || [],
      learningProgress: learningProgress || [],
      lastUpdated: new Date().toISOString()
    };

    res.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

router.post('/resume/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'Invalid sections data' });
    }

    // Update resume sections
    const updates = sections.map(section => 
      supabase
        .from('resume_sections')
        .upsert({
          user_id: userId,
          section_type: section.section_type,
          title: section.title,
          content: section.content,
          is_visible: section.is_visible,
          section_order: section.section_order,
          updated_at: new Date().toISOString()
        })
    );

    const results = await Promise.all(updates);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error updating resume sections:', errors);
      return res.status(500).json({ error: 'Failed to update some resume sections' });
    }

    res.json({ 
      success: true, 
      message: 'Resume updated successfully',
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

router.post('/resume/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.body;

    // Get complete resume data
    const { data: resumeSections, error } = await supabase
      .from('resume_sections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_visible', true)
      .order('section_order', { ascending: true });

    if (error) {
      console.error('Error fetching resume for export:', error);
      return res.status(500).json({ error: 'Failed to fetch resume data' });
    }

    // Get additional data for export
    const { data: projects } = await supabase
      .from('user_projects')
      .select('id, title, description, skills_required, status, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('id, title, description, badge_type, earned_at')
      .eq('user_id', userId);

    const exportData = {
      userId,
      sections: resumeSections || [],
      projects: projects || [],
      achievements: achievements || [],
      exportedAt: new Date().toISOString(),
      format
    };

    if (format === 'json') {
      res.json({ 
        success: true, 
        message: 'Resume exported successfully',
        data: exportData
      });
    } else {
      // For other formats, return the data for client-side processing
      res.json({ 
        success: true, 
        message: 'Resume data ready for export',
        data: exportData
      });
    }
  } catch (error) {
    console.error('Error exporting resume:', error);
    res.status(500).json({ error: 'Failed to export resume' });
  }
});

export default router;





