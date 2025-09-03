import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// SkillStacker API routes
router.get('/skills/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile to extract skills
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('skills, skill_assessment_results')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform user skills into SkillStacker format
    const userSkills = profile.skills || [];
    const assessmentResults = profile.skill_assessment_results || {};
    
    const skills = userSkills.map((skill, index) => ({
      id: `skill-${index}`,
      name: skill,
      category: 'Technical', // TODO: Categorize skills
      currentLevel: assessmentResults[skill]?.level || 1,
      requiredLevel: assessmentResults[skill]?.targetLevel || 5,
      priority: assessmentResults[skill]?.priority || 'medium',
      estimatedTime: assessmentResults[skill]?.estimatedTime || '2-3 months',
      confidence: assessmentResults[skill]?.confidence || 0,
      lastPracticed: assessmentResults[skill]?.lastPracticed || null,
      resources: [
        {
          id: `r-${index}`,
          title: `${skill} Fundamentals`,
          type: 'capsule',
          duration: '2 hours',
          difficulty: 'beginner',
          rating: 4.5,
          source: 'Nexa Learning'
        }
      ]
    }));

    res.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.post('/skills/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skillName, newLevel, confidence, lastPracticed } = req.body;

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('skill_assessment_results')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update skill assessment results
    const currentResults = profile.skill_assessment_results || {};
    currentResults[skillName] = {
      ...currentResults[skillName],
      level: newLevel,
      confidence: confidence || currentResults[skillName]?.confidence || 0,
      lastPracticed: lastPracticed || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update profile with new skill assessment results
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        skill_assessment_results: currentResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating skill assessment:', updateError);
      return res.status(400).json({ error: 'Failed to update skill assessment' });
    }

    res.json({ 
      success: true, 
      message: 'Skill level updated successfully',
      skillName,
      newLevel,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Adaptive Capsules API routes
router.get('/capsules', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    // Mock data for now
    const capsules = [
      {
        id: '1',
        title: 'React Hooks Deep Dive',
        description: 'Master the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
        category: 'Frontend Development',
        duration: '45 min',
        difficulty: 'intermediate',
        rating: 4.8,
        source: 'Nexa Learning',
        type: 'video',
        isOffline: true,
        isCompleted: false,
        progress: 0,
        tags: ['React', 'JavaScript', 'Hooks']
      }
    ];

    let filteredCapsules = capsules;

    if (category && category !== 'all') {
      filteredCapsules = filteredCapsules.filter(c => c.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredCapsules = filteredCapsules.filter(c => c.difficulty === difficulty);
    }

    if (search) {
      filteredCapsules = filteredCapsules.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ capsules: filteredCapsules });
  } catch (error) {
    console.error('Error fetching capsules:', error);
    res.status(500).json({ error: 'Failed to fetch capsules' });
  }
});

router.post('/capsules/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, progress } = req.body;

    // Mock completion - in real implementation, update database
    res.json({ 
      success: true, 
      message: 'Capsule completed successfully',
      capsuleId: id,
      progress
    });
  } catch (error) {
    console.error('Error completing capsule:', error);
    res.status(500).json({ error: 'Failed to complete capsule' });
  }
});

router.post('/capsules/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Mock download - in real implementation, handle offline content
    res.json({ 
      success: true, 
      message: 'Capsule downloaded for offline use',
      capsuleId: id
    });
  } catch (error) {
    console.error('Error downloading capsule:', error);
    res.status(500).json({ error: 'Failed to download capsule' });
  }
});

export default router;

