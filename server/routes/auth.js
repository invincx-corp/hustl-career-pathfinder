import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// User profile management
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.email;
    delete updateData.created_at;
    
    updateData.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    res.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// User onboarding completion
router.post('/onboarding/:userId/complete', async (req, res) => {
  try {
    const { userId } = req.params;
    const onboardingData = req.body;
    
    const updateData = {
      onboarding_completed: true,
      onboarding_step: 100,
      updated_at: new Date().toISOString(),
      ...onboardingData
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error completing onboarding:', error);
      return res.status(400).json({ error: 'Failed to complete onboarding' });
    }

    res.json({ 
      success: true, 
      profile,
      message: 'Onboarding completed successfully' 
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// User activity tracking
router.post('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activity_type, details, metadata } = req.body;
    
    // Update last login
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    // Log activity (you might want to create an activities table)
    const activity = {
      user_id: userId,
      activity_type,
      details,
      metadata,
      timestamp: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      activity,
      message: 'Activity logged successfully' 
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// User statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate stats based on profile data
    const stats = {
      roadmapsCompleted: profile.selected_roadmaps?.length || 0,
      skillsLearned: profile.skills?.length || 0,
      totalPoints: Object.keys(profile.skill_assessment_results || {}).length * 100 + (profile.skills?.length || 0) * 50,
      currentStreak: 7, // TODO: Calculate from activity logs
      mentorshipSessions: 0, // TODO: Get from mentorship sessions
      projectsCompleted: 0 // TODO: Get from projects table
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;
