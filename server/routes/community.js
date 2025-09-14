import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get user profile
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get user stats
    const [projectsResult, skillsResult, mentorsResult, forumResult] = await Promise.all([
      supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed'),
      
      supabase
        .from('user_skills')
        .select('id')
        .eq('user_id', userId),
      
      supabase
        .from('mentor_relationships')
        .select('id')
        .eq('mentee_id', userId)
        .eq('status', 'active'),
      
      supabase
        .from('forum_topics')
        .select('id')
        .eq('author_id', userId)
    ]);

    const stats = {
      projects_completed: projectsResult.data?.length || 0,
      skills_learned: skillsResult.data?.length || 0,
      mentors_connected: mentorsResult.data?.length || 0,
      forum_posts: forumResult.data?.length || 0,
      reputation_score: Math.floor(Math.random() * 100) + 50 // Placeholder
    };

    res.json({
      success: true,
      profile: {
        ...profile,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
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

// Get study groups
router.get('/study-groups', async (req, res) => {
  try {
    const { page = 1, limit = 20, subject, level, meetingType } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('study_groups')
      .select(`
        *,
        profiles!study_groups_created_by_fkey(
          id,
          full_name,
          avatar_url
        ),
        study_group_members(
          id,
          user_id,
          role,
          joined_at,
          profiles!study_group_members_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('is_public', true)
      .range(offset, offset + limit - 1);

    if (subject) {
      query = query.eq('subject', subject);
    }
    if (level) {
      query = query.eq('level', level);
    }
    if (meetingType) {
      query = query.eq('meeting_type', meetingType);
    }

    const { data: groups, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Add current_members count
    const groupsWithCount = groups.map(group => ({
      ...group,
      current_members: group.study_group_members?.length || 0,
      members: group.study_group_members || [],
      creator: group.profiles
    }));

    res.json({
      success: true,
      groups: groupsWithCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: groupsWithCount.length
      }
    });
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ error: 'Failed to fetch study groups' });
  }
});

// Create study group
router.post('/study-groups', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      subject, 
      level, 
      max_members, 
      meeting_schedule, 
      meeting_location, 
      meeting_type, 
      is_public, 
      tags, 
      created_by 
    } = req.body;

    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({
        name,
        description,
        subject,
        level,
        max_members,
        meeting_schedule,
        meeting_location,
        meeting_type,
        is_public,
        tags: tags || [],
        created_by
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Add creator as admin member
    await supabase
      .from('study_group_members')
      .insert({
        study_group_id: group.id,
        user_id: created_by,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    res.json({
      success: true,
      group,
      message: 'Study group created successfully'
    });
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ error: 'Failed to create study group' });
  }
});

// Join study group
router.post('/study-groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Check if group exists and has space
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('max_members')
      .eq('id', groupId)
      .single();

    if (groupError) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    // Check current member count
    const { data: members, error: membersError } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('study_group_id', groupId);

    if (membersError) {
      throw membersError;
    }

    if (members.length >= group.max_members) {
      return res.status(400).json({ error: 'Study group is full' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('study_group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add user to group
    const { data: member, error: memberError } = await supabase
      .from('study_group_members')
      .insert({
        study_group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      throw memberError;
    }

    res.json({
      success: true,
      member,
      message: 'Successfully joined study group'
    });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ error: 'Failed to join study group' });
  }
});

// Leave study group
router.post('/study-groups/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('study_group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Successfully left study group'
    });
  } catch (error) {
    console.error('Error leaving study group:', error);
    res.status(500).json({ error: 'Failed to leave study group' });
  }
});

// Get study group details
router.get('/study-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: group, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        profiles!study_groups_created_by_fkey(
          id,
          full_name,
          avatar_url
        ),
        study_group_members(
          id,
          user_id,
          role,
          joined_at,
          profiles!study_group_members_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    res.json({
      success: true,
      group: {
        ...group,
        current_members: group.study_group_members?.length || 0,
        members: group.study_group_members || [],
        creator: group.profiles
      }
    });
  } catch (error) {
    console.error('Error fetching study group:', error);
    res.status(500).json({ error: 'Failed to fetch study group' });
  }
});

// Update study group
router.put('/study-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const updateData = req.body;

    const { data: group, error } = await supabase
      .from('study_groups')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      group,
      message: 'Study group updated successfully'
    });
  } catch (error) {
    console.error('Error updating study group:', error);
    res.status(500).json({ error: 'Failed to update study group' });
  }
});

// Delete study group
router.delete('/study-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Check if user is admin
    const { data: member, error: memberError } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('study_group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || member.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can delete the group' });
    }

    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Study group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting study group:', error);
    res.status(500).json({ error: 'Failed to delete study group' });
  }
});

// Get user's study groups
router.get('/users/:userId/study-groups', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: memberships, error } = await supabase
      .from('study_group_members')
      .select(`
        *,
        study_groups!inner(
          *,
          profiles!study_groups_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const groups = memberships.map(membership => ({
      ...membership.study_groups,
      role: membership.role,
      joined_at: membership.joined_at,
      creator: membership.study_groups.profiles
    }));

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Error fetching user study groups:', error);
    res.status(500).json({ error: 'Failed to fetch user study groups' });
  }
});

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, industry, experience_level, location, bio')
      .or(`full_name.ilike.%${q}%,industry.ilike.%${q}%,bio.ilike.%${q}%`)
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user connections
router.get('/users/:userId/connections', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: connections, error } = await supabase
      .from('user_connections')
      .select(`
        *,
        profiles!user_connections_connected_user_id_fkey(
          id,
          full_name,
          avatar_url,
          industry,
          experience_level
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'connected');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      connections: connections.map(conn => ({
        ...conn,
        user: conn.profiles
      }))
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Send connection request
router.post('/users/:userId/connect', async (req, res) => {
  try {
    const { userId } = req.params;
    const { requesterId, message } = req.body;

    if (userId === requesterId) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .eq('user_id', userId)
      .eq('connected_user_id', requesterId)
      .single();

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const { data: connection, error } = await supabase
      .from('user_connections')
      .insert({
        user_id: userId,
        connected_user_id: requesterId,
        status: 'pending',
        message,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      connection,
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// Accept connection request
router.put('/connections/:connectionId/accept', async (req, res) => {
  try {
    const { connectionId } = req.params;

    const { data: connection, error } = await supabase
      .from('user_connections')
      .update({
        status: 'connected',
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      connection,
      message: 'Connection request accepted'
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({ error: 'Failed to accept connection' });
  }
});

// Reject connection request
router.put('/connections/:connectionId/reject', async (req, res) => {
  try {
    const { connectionId } = req.params;

    const { data: connection, error } = await supabase
      .from('user_connections')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      connection,
      message: 'Connection request rejected'
    });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    res.status(500).json({ error: 'Failed to reject connection' });
  }
});

export default router;
