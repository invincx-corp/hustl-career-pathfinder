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
    const { category, difficulty, search, userId } = req.query;
    
    // Build query for learning capsules
    let query = supabase
      .from('learning_capsules')
      .select(`
        *,
        user_learning_progress!left(
          user_id,
          progress_percentage,
          is_completed,
          last_accessed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: capsules, error } = await query;

    if (error) {
      console.error('Error fetching capsules:', error);
      return res.status(500).json({ error: 'Failed to fetch capsules' });
    }

    // Transform data to include user progress
    const transformedCapsules = capsules?.map(capsule => {
      const userProgress = capsule.user_learning_progress?.find(p => p.user_id === userId);
      
      return {
        id: capsule.id,
        title: capsule.title,
        description: capsule.description,
        category: capsule.category,
        duration: capsule.estimated_duration,
        difficulty: capsule.difficulty_level,
        rating: capsule.rating || 4.5,
        source: capsule.source || 'Nexa Learning',
        type: capsule.content_type,
        isOffline: capsule.is_offline_available,
        isCompleted: userProgress?.is_completed || false,
        progress: userProgress?.progress_percentage || 0,
        tags: capsule.tags || [],
        content: capsule.content,
        resources: capsule.resources || [],
        learning_objectives: capsule.learning_objectives || [],
        prerequisites: capsule.prerequisites || []
      };
    }) || [];

    res.json({ capsules: transformedCapsules });
  } catch (error) {
    console.error('Error fetching capsules:', error);
    res.status(500).json({ error: 'Failed to fetch capsules' });
  }
});

router.post('/capsules/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, progress } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update or create learning progress
    const { data: progressData, error } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: userId,
        capsule_id: id,
        progress_percentage: progress || 100,
        is_completed: progress >= 100,
        last_accessed_at: new Date().toISOString(),
        completed_at: progress >= 100 ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating learning progress:', error);
      return res.status(500).json({ error: 'Failed to update learning progress' });
    }

    // If completed, check for achievements
    if (progress >= 100) {
      // TODO: Trigger achievement system
      console.log(`User ${userId} completed capsule ${id}`);
    }

    res.json({ 
      success: true, 
      message: 'Capsule progress updated successfully',
      capsuleId: id,
      progress: progressData.progress_percentage,
      isCompleted: progressData.is_completed
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

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if capsule supports offline access
    const { data: capsule, error: capsuleError } = await supabase
      .from('learning_capsules')
      .select('id, title, is_offline_available, content, resources')
      .eq('id', id)
      .single();

    if (capsuleError) {
      console.error('Error fetching capsule:', capsuleError);
      return res.status(404).json({ error: 'Capsule not found' });
    }

    if (!capsule.is_offline_available) {
      return res.status(400).json({ error: 'This capsule is not available for offline use' });
    }

    // Update user's offline content
    const { data: offlineContent, error: offlineError } = await supabase
      .from('user_offline_content')
      .upsert({
        user_id: userId,
        capsule_id: id,
        title: capsule.title,
        content: capsule.content,
        resources: capsule.resources,
        downloaded_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (offlineError) {
      console.error('Error saving offline content:', offlineError);
      return res.status(500).json({ error: 'Failed to save offline content' });
    }

    res.json({ 
      success: true, 
      message: 'Capsule downloaded for offline use',
      capsuleId: id,
      title: capsule.title
    });
  } catch (error) {
    console.error('Error downloading capsule:', error);
    res.status(500).json({ error: 'Failed to download capsule' });
  }
});

export default router;

