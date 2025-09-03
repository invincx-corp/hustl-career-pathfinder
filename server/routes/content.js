import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all published content with optional filters
router.get('/content', async (req, res) => {
  try {
    const { category, difficulty, type, search, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('learning_content')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data, count: data.length });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content by ID
router.get('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('learning_content')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress for content
router.get('/content/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return res.status(400).json({ error: error.message });
    }

    res.json({ data: data || null });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user progress
router.post('/content/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { progress_percentage, time_spent, notes, rating } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progressData = {
      user_id: userId,
      content_id: id,
      progress_percentage: progress_percentage || 0,
      time_spent: time_spent || 0,
      last_accessed: new Date().toISOString()
    };

    if (notes !== undefined) progressData.notes = notes;
    if (rating !== undefined) progressData.rating = rating;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(progressData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark content as completed
router.post('/content/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        content_id: id,
        is_completed: true,
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error completing content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's badges
router.get('/badges', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available badges
router.get('/badges/available', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('badges')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Award badge to user
router.post('/badges/:badgeId/award', async (req, res) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get offline content for user
router.get('/offline', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('offline_content')
      .select(`
        *,
        learning_content (*)
      `)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching offline content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download content for offline
router.post('/content/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get content data
    const { data: content, error: contentError } = await supabase
      .from('learning_content')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (contentError) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Store offline content record
    const { data, error } = await supabase
      .from('offline_content')
      .insert({
        user_id: userId,
        content_id: id,
        downloaded_at: new Date().toISOString(),
        file_size: JSON.stringify(content.content_data).length,
        file_path: `offline/${userId}/${id}.json`,
        is_synced: true,
        last_sync: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error downloading content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove offline content
router.delete('/content/:id/offline', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('offline_content')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error removing offline content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommended content for user
router.get('/content/recommended', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's interests and skills from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('interests, skills')
      .eq('id', userId)
      .single();

    if (!profile) {
      return res.json({ data: [] });
    }

    // Get content based on user interests and skills
    const { data, error } = await supabase
      .from('learning_content')
      .select('*')
      .eq('is_published', true)
      .in('category', profile.interests || [])
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching recommended content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning paths
router.get('/learning-paths', async (req, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;
    
    let query = supabase
      .from('learning_paths')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning path content
router.get('/learning-paths/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('learning_path_content')
      .select(`
        *,
        learning_content (*)
      `)
      .eq('learning_path_id', id)
      .order('order_index');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching learning path content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's learning paths
router.get('/user/learning-paths', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_learning_paths')
      .select(`
        *,
        learning_paths (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching user learning paths:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enroll in learning path
router.post('/learning-paths/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('user_learning_paths')
      .insert({
        user_id: userId,
        learning_path_id: id,
        started_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error enrolling in learning path:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
