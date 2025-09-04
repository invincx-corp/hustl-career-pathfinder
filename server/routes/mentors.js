import express from 'express';
import { supabase } from '../lib/supabase.js';
import mentorMatchingService from '../lib/mentor-matching-service.js';

const router = express.Router();

// =====================================================
// MENTOR PROFILES
// =====================================================

// Get all active mentor profiles
router.get('/profiles', async (req, res) => {
  try {
    const { 
      expertise, 
      experience_level, 
      location, 
      availability, 
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = supabase
      .from('mentor_profiles')
      .select(`
        *,
        mentor_specializations(*)
      `)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (expertise) {
      query = query.contains('expertise_areas', [expertise]);
    }

    if (experience_level) {
      const minExperience = experience_level === 'junior' ? 0 : 
                           experience_level === 'mid' ? 3 : 
                           experience_level === 'senior' ? 7 : 0;
      query = query.gte('years_of_experience', minExperience);
    }

    if (location) {
      query = query.ilike('company', `%${location}%`);
    }

    const { data: mentors, error } = await query;

    if (error) {
      console.error('Error fetching mentor profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch mentor profiles' });
    }

    res.json({ mentors: mentors || [] });
  } catch (error) {
    console.error('Error fetching mentor profiles:', error);
    res.status(500).json({ error: 'Failed to fetch mentor profiles' });
  }
});

// Get mentor profile by ID
router.get('/profiles/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;

    const { data: mentor, error } = await supabase
      .from('mentor_profiles')
      .select(`
        *,
        mentor_specializations(*),
        mentor_availability(*)
      `)
      .eq('id', mentorId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching mentor profile:', error);
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ mentor });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Failed to fetch mentor profile' });
  }
});

// Create or update mentor profile
router.post('/profiles', async (req, res) => {
  try {
    const { userId, profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let mentor;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
      .from('mentor_profiles')
        .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
        .eq('user_id', userId)
      .select()
      .single();

    if (error) {
        console.error('Error updating mentor profile:', error);
        return res.status(500).json({ error: 'Failed to update mentor profile' });
      }

      mentor = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
      .from('mentor_profiles')
        .insert({
          user_id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating mentor profile:', error);
        return res.status(500).json({ error: 'Failed to create mentor profile' });
      }

      mentor = data;
    }

    res.json({ 
      success: true, 
      message: existingProfile ? 'Mentor profile updated successfully' : 'Mentor profile created successfully',
      mentor 
    });
  } catch (error) {
    console.error('Error managing mentor profile:', error);
    res.status(500).json({ error: 'Failed to manage mentor profile' });
  }
});

// Add mentor specialization
router.post('/profiles/:mentorId/specializations', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { category, skill, proficiency_level, years_experience, certifications } = req.body;

    const { data: specialization, error } = await supabase
      .from('mentor_specializations')
      .insert({
        mentor_id: mentorId,
        category,
        skill,
        proficiency_level,
        years_experience: years_experience || 0,
        certifications: certifications || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding mentor specialization:', error);
      return res.status(500).json({ error: 'Failed to add specialization' });
    }

    res.json({ 
      success: true, 
      message: 'Specialization added successfully',
      specialization 
    });
  } catch (error) {
    console.error('Error adding mentor specialization:', error);
    res.status(500).json({ error: 'Failed to add specialization' });
  }
});

// =====================================================
// MENTOR AVAILABILITY
// =====================================================

// Get mentor availability
router.get('/profiles/:mentorId/availability', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    const { data: availability, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching mentor availability:', error);
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }

    res.json({ availability: availability || [] });
  } catch (error) {
    console.error('Error fetching mentor availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Update mentor availability
router.post('/profiles/:mentorId/availability', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { availability_slots } = req.body;

    // Delete existing availability
    await supabase
      .from('mentor_availability')
      .delete()
      .eq('mentor_id', mentorId);

    // Insert new availability slots
    if (availability_slots && availability_slots.length > 0) {
      const slots = availability_slots.map(slot => ({
        mentor_id: mentorId,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        timezone: slot.timezone || 'UTC',
        is_recurring: slot.is_recurring !== false,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
      .from('mentor_availability')
        .insert(slots);

    if (error) {
        console.error('Error updating mentor availability:', error);
        return res.status(500).json({ error: 'Failed to update availability' });
      }
    }

    res.json({ 
      success: true, 
      message: 'Availability updated successfully' 
    });
  } catch (error) {
    console.error('Error updating mentor availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// =====================================================
// MENTOR SESSIONS
// =====================================================

// Get mentor sessions
router.get('/profiles/:mentorId/sessions', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('mentor_sessions')
      .select(`
        *,
        student:student_id(id, email, user_metadata)
      `)
      .eq('mentor_id', mentorId)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching mentor sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    res.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Create mentor session
router.post('/sessions', async (req, res) => {
  try {
    const { 
      mentor_id, 
      student_id, 
      title, 
      description, 
      session_type, 
      scheduled_at, 
      duration_minutes,
      student_goals 
    } = req.body;

    if (!mentor_id || !student_id || !scheduled_at) {
      return res.status(400).json({ error: 'Mentor ID, student ID, and scheduled time are required' });
    }

    const session = {
      mentor_id,
      student_id,
      title: title || 'Mentoring Session',
      description,
      session_type: session_type || 'one_on_one',
      scheduled_at,
      duration_minutes: duration_minutes || 60,
      status: 'scheduled',
      student_goals: student_goals || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newSession, error } = await supabase
      .from('mentor_sessions')
      .insert(session)
      .select(`
        *,
        mentor:mentor_id(id, user_id, bio, expertise_areas),
        student:student_id(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error creating mentor session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({ 
      success: true, 
      message: 'Session created successfully',
      session: newSession 
    });
  } catch (error) {
    console.error('Error creating mentor session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session status
router.patch('/sessions/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, session_notes, meeting_url, meeting_id, meeting_password } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (session_notes) updates.session_notes = session_notes;
    if (meeting_url) updates.meeting_url = meeting_url;
    if (meeting_id) updates.meeting_id = meeting_id;
    if (meeting_password) updates.meeting_password = meeting_password;

    const { data: updatedSession, error } = await supabase
      .from('mentor_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session status:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    res.json({ 
      success: true, 
      message: 'Session updated successfully',
      session: updatedSession 
    });
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Add session feedback
router.post('/sessions/:sessionId/feedback', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      student_rating, 
      student_feedback, 
      mentor_rating, 
      mentor_feedback,
      topics_covered,
      action_items 
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (student_rating !== undefined) updates.student_rating = student_rating;
    if (student_feedback) updates.student_feedback = student_feedback;
    if (mentor_rating !== undefined) updates.mentor_rating = mentor_rating;
    if (mentor_feedback) updates.mentor_feedback = mentor_feedback;
    if (topics_covered) updates.topics_covered = topics_covered;
    if (action_items) updates.action_items = action_items;

    const { data: updatedSession, error } = await supabase
      .from('mentor_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error adding session feedback:', error);
      return res.status(500).json({ error: 'Failed to add feedback' });
    }

    res.json({ 
      success: true, 
      message: 'Feedback added successfully',
      session: updatedSession 
    });
  } catch (error) {
    console.error('Error adding session feedback:', error);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// =====================================================
// MENTOR MATCHING
// =====================================================

// Get AI-powered mentor recommendations for a student
router.post('/recommendations', async (req, res) => {
  try {
    const { 
      user_id, 
      preferred_expertise, 
      preferred_experience_level, 
      preferred_session_types,
      max_hourly_rate,
      timezone,
      limit = 10
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get student profile for better matching
    const { data: studentProfile, error: studentError } = await supabase
      .from('user_public_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (studentError) {
      console.warn('Could not fetch student profile, using basic matching');
    }

    // Get available mentors with basic filters
    let query = supabase
      .from('mentor_profiles')
      .select(`
        *,
        mentor_specializations(*),
        mentor_availability(*)
      `)
      .eq('is_active', true)
      .eq('current_students', 0); // Only mentors with available slots

    // Apply basic filters
    if (preferred_expertise && preferred_expertise.length > 0) {
      query = query.overlaps('expertise_areas', preferred_expertise);
    }

    if (preferred_experience_level) {
      const minExperience = preferred_experience_level === 'junior' ? 0 : 
                           preferred_experience_level === 'mid' ? 3 : 
                           preferred_experience_level === 'senior' ? 7 : 0;
      query = query.gte('years_of_experience', minExperience);
    }

    if (max_hourly_rate) {
      query = query.lte('hourly_rate', max_hourly_rate);
    }

    if (timezone) {
      query = query.eq('timezone', timezone);
    }

    const { data: mentors, error } = await query.limit(50); // Get more candidates for AI matching

    if (error) {
      console.error('Error fetching mentor recommendations:', error);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }

    if (!mentors || mentors.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Use AI-powered matching service
    const preferences = {
      preferred_expertise,
      preferred_experience_level,
      preferred_session_types,
      max_hourly_rate,
      timezone,
      limit
    };

    const matchedMentors = await mentorMatchingService.findBestMentors(
      studentProfile || { user_id },
      mentors,
      preferences
    );

    // Format response
    const recommendations = matchedMentors.map(match => ({
      mentor: match.mentor,
      match_score: Math.round(match.totalScore * 100),
      match_reasons: match.matchReasons,
      detailed_scores: {
        expertise: Math.round(match.scores.expertise * 100),
        experience: Math.round(match.scores.experience * 100),
        rating: Math.round(match.scores.rating * 100),
        availability: Math.round(match.scores.availability * 100),
        personality: Math.round(match.scores.personality * 100),
        location: Math.round(match.scores.location * 100)
      }
    }));

    res.json({ 
      recommendations,
      total_candidates: mentors.length,
      matching_algorithm: 'AI-powered'
    });
  } catch (error) {
    console.error('Error getting mentor recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// =====================================================
// MENTOR VERIFICATION
// =====================================================

// Submit verification documents
router.post('/profiles/:mentorId/verify', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { verification_documents } = req.body;

    if (!verification_documents) {
      return res.status(400).json({ error: 'Verification documents are required' });
    }
    
    const { data: updatedProfile, error } = await supabase
      .from('mentor_profiles')
      .update({
        verification_documents,
        updated_at: new Date().toISOString()
      })
      .eq('id', mentorId)
      .select()
      .single();

    if (error) {
      console.error('Error submitting verification documents:', error);
      return res.status(500).json({ error: 'Failed to submit verification' });
    }

    res.json({ 
      success: true, 
      message: 'Verification documents submitted successfully',
      mentor: updatedProfile 
    });
  } catch (error) {
    console.error('Error submitting verification documents:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Approve mentor verification
router.patch('/profiles/:mentorId/verify', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { is_verified, verification_notes } = req.body;

    const updates = {
      is_verified: is_verified || false,
      updated_at: new Date().toISOString()
    };

    if (verification_notes) {
      updates.verification_documents = {
        ...updates.verification_documents,
        admin_notes: verification_notes
      };
    }

    const { data: updatedProfile, error } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('id', mentorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating mentor verification:', error);
      return res.status(500).json({ error: 'Failed to update verification' });
    }

    res.json({ 
      success: true, 
      message: `Mentor verification ${is_verified ? 'approved' : 'rejected'} successfully`,
      mentor: updatedProfile 
    });
  } catch (error) {
    console.error('Error updating mentor verification:', error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

export default router;
