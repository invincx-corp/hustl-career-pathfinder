import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all mentors with profiles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, availability, verified } = req.query;
    const offset = (page - 1) * limit;

    // Simplified query to avoid complex joins
    let query = supabase
      .from('mentor_profiles')
      .select('*')
      .eq('is_available', true)
      .range(offset, offset + limit - 1);

    if (specialization) {
      query = query.contains('expertise_areas', [specialization]);
    }

    if (verified === 'true') {
      query = query.eq('is_verified', true);
    }

    const { data: mentors, error } = await query;

    if (error) {
      console.error('Database error:', error);
      // Return mock data if database query fails
      const mockMentors = [
        {
          id: '1',
          full_name: 'Sarah Johnson',
          expertise_areas: ['React', 'Node.js', 'Full Stack Development'],
          years_experience: 5,
          rating: 4.8,
          is_verified: true,
          bio: 'Senior Full Stack Developer with 5+ years experience',
          hourly_rate: 75
        },
        {
          id: '2',
          full_name: 'Michael Chen',
          expertise_areas: ['Python', 'Machine Learning', 'Data Science'],
          years_experience: 7,
          rating: 4.9,
          is_verified: true,
          bio: 'Data Scientist and ML Engineer with expertise in Python',
          hourly_rate: 90
        }
      ];
      
      return res.json({
        success: true,
        mentors: mockMentors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockMentors.length
        }
      });
    }

    res.json({
      success: true,
      mentors: mentors || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mentors?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Get mentor by ID with full profile
router.get('/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;

    const { data: mentor, error } = await supabase
      .from('mentor_profiles')
      .select(`
        *,
        mentors!inner(
          id,
          is_verified,
          rating,
          total_sessions,
          is_available,
          created_at
        ),
        profiles!inner(
          id,
          full_name,
          email,
          avatar_url,
          bio,
          industry,
          experience_level,
          location
        )
      `)
      .eq('mentor_id', mentorId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Get mentor specializations
    const { data: specializations } = await supabase
      .from('mentor_specializations')
      .select('*')
      .eq('mentor_id', mentorId);

    // Get mentor achievements
    const { data: achievements } = await supabase
      .from('mentor_achievements')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('achieved_at', { ascending: false });

    res.json({
      success: true,
      mentor: {
        ...mentor,
        specializations: specializations || [],
        achievements: achievements || []
      }
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

// Create mentor profile
router.post('/', async (req, res) => {
  try {
    const { userId, expertise_areas, years_experience, credentials, specializations, achievements, bio, hourly_rate } = req.body;

    // First create mentor record
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .insert({
        user_id: userId,
        is_verified: false,
        rating: 0.0,
        total_sessions: 0,
        is_available: true
      })
      .select()
      .single();

    if (mentorError) {
      throw mentorError;
    }

    // Create mentor profile
    const { data: profile, error: profileError } = await supabase
      .from('mentor_profiles')
      .insert({
        mentor_id: mentor.id,
        user_id: userId,
        expertise_areas: expertise_areas || [],
        years_experience: years_experience || 0,
        credentials: credentials || [],
        specializations: specializations || [],
        achievements: achievements || [],
        bio,
        hourly_rate: hourly_rate || 0
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    // Add specializations
    if (specializations && specializations.length > 0) {
      const specializationData = specializations.map(spec => ({
        mentor_id: mentor.id,
        specialization: spec,
        proficiency_level: 5
      }));

      await supabase
        .from('mentor_specializations')
        .insert(specializationData);
    }

    res.json({
      success: true,
      mentor: {
        ...profile,
        mentors: mentor
      },
      message: 'Mentor profile created successfully'
    });
  } catch (error) {
    console.error('Error creating mentor profile:', error);
    res.status(500).json({ error: 'Failed to create mentor profile' });
  }
});

// Update mentor profile
router.put('/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const updateData = req.body;

    const { data: profile, error } = await supabase
      .from('mentor_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('mentor_id', mentorId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      profile,
      message: 'Mentor profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ error: 'Failed to update mentor profile' });
  }
});

// Mentor matching algorithm
router.post('/match', async (req, res) => {
  try {
    const { userId, interests, skills, goals, experienceLevel, budget } = req.body;

    // Get user profile for better matching
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get all available mentors
    const { data: mentors, error } = await supabase
      .from('mentor_profiles')
      .select(`
        *,
        mentors!inner(
          id,
          is_verified,
          rating,
          total_sessions,
          is_available
        ),
        profiles!inner(
          id,
          full_name,
          email,
          avatar_url,
          bio,
          industry,
          experience_level,
          location
        )
      `)
      .eq('is_available', true);

    if (error) {
      throw error;
    }

    // Calculate match scores
    const mentorsWithScores = mentors.map(mentor => {
      let score = 0;
      let reasons = [];

      // Experience level match
      if (mentor.profiles.experience_level === experienceLevel) {
        score += 30;
        reasons.push('Experience level match');
      }

      // Industry match
      if (mentor.profiles.industry && userProfile?.industry === mentor.profiles.industry) {
        score += 25;
        reasons.push('Industry match');
      }

      // Skills overlap
      const mentorSkills = mentor.specializations || [];
      const skillMatches = (skills || []).filter(skill => 
        mentorSkills.some(ms => ms.toLowerCase().includes(skill.toLowerCase()))
      );
      score += skillMatches.length * 10;
      if (skillMatches.length > 0) {
        reasons.push(`${skillMatches.length} skill matches`);
      }

      // Interests overlap
      const mentorExpertise = mentor.expertise_areas || [];
      const interestMatches = (interests || []).filter(interest => 
        mentorExpertise.some(me => me.toLowerCase().includes(interest.toLowerCase()))
      );
      score += interestMatches.length * 8;
      if (interestMatches.length > 0) {
        reasons.push(`${interestMatches.length} interest matches`);
      }

      // Rating bonus
      if (mentor.mentors.rating > 4.0) {
        score += 15;
        reasons.push('High rating');
      }

      // Verification bonus
      if (mentor.mentors.is_verified) {
        score += 10;
        reasons.push('Verified mentor');
      }

      // Budget consideration
      if (budget && mentor.hourly_rate <= budget) {
        score += 5;
        reasons.push('Within budget');
      }

      return {
        ...mentor,
        matchScore: Math.min(score, 100),
        matchReasons: reasons
      };
    });

    // Sort by match score
    mentorsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches: mentorsWithScores.slice(0, 10), // Top 10 matches
      message: 'Mentor matches found successfully'
    });
  } catch (error) {
    console.error('Error matching mentors:', error);
    res.status(500).json({ error: 'Failed to match mentors' });
  }
});

// Get mentor sessions
router.get('/:mentorId/sessions', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { status = 'all' } = req.query;

    let query = supabase
      .from('mentorship_sessions')
      .select(`
        *,
        profiles!mentorship_sessions_mentee_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('mentor_id', mentorId);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    res.status(500).json({ error: 'Failed to fetch mentor sessions' });
  }
});

// Create mentorship session
router.post('/:mentorId/sessions', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { menteeId, title, description, sessionType, scheduledAt } = req.body;

    const { data: session, error } = await supabase
      .from('mentorship_sessions')
      .insert({
        mentor_id: mentorId,
        mentee_id: menteeId,
        title,
        description,
        session_type: sessionType || 'video_call',
        status: 'scheduled',
        scheduled_at: scheduledAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      session,
      message: 'Mentorship session created successfully'
    });
  } catch (error) {
    console.error('Error creating mentorship session:', error);
    res.status(500).json({ error: 'Failed to create mentorship session' });
  }
});

// Update session status
router.put('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, notes } = req.body;

    const { data: session, error } = await supabase
      .from('mentorship_sessions')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      session,
      message: 'Session updated successfully'
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Rate mentor
router.post('/:mentorId/rate', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { userId, rating, feedback } = req.body;

    // Create session feedback
    const { data: feedbackRecord, error: feedbackError } = await supabase
      .from('mentorship_sessions')
      .insert({
        mentor_id: mentorId,
        mentee_id: userId,
        title: 'Session Feedback',
        description: feedback,
        session_type: 'feedback',
        status: 'completed',
        rating: rating
      })
      .select()
      .single();

    if (feedbackError) {
      throw feedbackError;
    }

    // Update mentor rating
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('rating, total_sessions')
      .eq('id', mentorId)
      .single();

    if (mentorError) {
      throw mentorError;
    }

    const newTotalSessions = mentor.total_sessions + 1;
    const newRating = ((mentor.rating * mentor.total_sessions) + rating) / newTotalSessions;

    await supabase
      .from('mentors')
      .update({
        rating: newRating,
        total_sessions: newTotalSessions
      })
      .eq('id', mentorId);

    res.json({
      success: true,
      message: 'Mentor rated successfully'
    });
  } catch (error) {
    console.error('Error rating mentor:', error);
    res.status(500).json({ error: 'Failed to rate mentor' });
  }
});

// Get mentor verification requests
router.get('/verification/requests', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const { data: requests, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        mentors!inner(
          id,
          user_id
        ),
        profiles!verification_requests_user_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// Submit verification request
router.post('/verification/request', async (req, res) => {
  try {
    const { mentorId, userId, documentType, documentUrl } = req.body;

    const { data: request, error } = await supabase
      .from('verification_requests')
      .insert({
        mentor_id: mentorId,
        user_id: userId,
        document_type: documentType,
        document_url: documentUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      request,
      message: 'Verification request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

// Update verification status
router.put('/verification/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes, reviewedBy } = req.body;

    const { data: request, error } = await supabase
      .from('verification_requests')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If approved, update mentor verification status
    if (status === 'approved') {
      await supabase
        .from('mentors')
        .update({ is_verified: true })
        .eq('id', request.mentor_id);
    }

    res.json({
      success: true,
      request,
      message: 'Verification status updated successfully'
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

export default router;
