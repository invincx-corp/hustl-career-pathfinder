import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// =====================================================
// USER PROFILES
// =====================================================

// Get user public profile
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from('user_public_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update user public profile
router.post('/profiles', async (req, res) => {
  try {
    const { userId, profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_public_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let profile;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_public_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      profile = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_public_profiles')
        .insert({
          user_id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return res.status(500).json({ error: 'Failed to create profile' });
      }

      profile = data;
    }

    res.json({ 
      success: true, 
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
      profile 
    });
  } catch (error) {
    console.error('Error managing user profile:', error);
    res.status(500).json({ error: 'Failed to manage profile' });
  }
});

// =====================================================
// USER CONNECTIONS
// =====================================================

// Follow/unfollow user
router.post('/connections', async (req, res) => {
  try {
    const { follower_id, following_id, action } = req.body;

    if (!follower_id || !following_id || !action) {
      return res.status(400).json({ error: 'Follower ID, following ID, and action are required' });
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existingConnection } = await supabase
        .from('user_connections')
        .select('id')
        .eq('follower_id', follower_id)
        .eq('following_id', following_id)
        .single();

      if (existingConnection) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      // Create connection
      const { data: connection, error } = await supabase
        .from('user_connections')
        .insert({
          follower_id,
          following_id,
          connection_type: 'follow',
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating connection:', error);
        return res.status(500).json({ error: 'Failed to follow user' });
      }

      // Update follower counts
      await supabase.rpc('increment_followers_count', { user_id: following_id });
      await supabase.rpc('increment_following_count', { user_id: follower_id });

      res.json({ 
        success: true, 
        message: 'User followed successfully',
        connection 
      });
    } else if (action === 'unfollow') {
      // Remove connection
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('follower_id', follower_id)
        .eq('following_id', following_id);

      if (error) {
        console.error('Error removing connection:', error);
        return res.status(500).json({ error: 'Failed to unfollow user' });
      }

      // Update follower counts
      await supabase.rpc('decrement_followers_count', { user_id: following_id });
      await supabase.rpc('decrement_following_count', { user_id: follower_id });

      res.json({ 
        success: true, 
        message: 'User unfollowed successfully' 
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "follow" or "unfollow"' });
    }
  } catch (error) {
    console.error('Error managing connection:', error);
    res.status(500).json({ error: 'Failed to manage connection' });
  }
});

// Get user connections
router.get('/users/:userId/connections', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'followers', limit = 20, offset = 0 } = req.query;

    let query;
    if (type === 'followers') {
      query = supabase
        .from('user_connections')
        .select(`
          *,
          follower:follower_id(id, email, user_metadata)
        `)
        .eq('following_id', userId)
        .eq('status', 'active');
    } else {
      query = supabase
        .from('user_connections')
        .select(`
          *,
          following:following_id(id, email, user_metadata)
        `)
        .eq('follower_id', userId)
        .eq('status', 'active');
    }

    const { data: connections, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching connections:', error);
      return res.status(500).json({ error: 'Failed to fetch connections' });
    }

    res.json({ connections: connections || [] });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// =====================================================
// DIRECT MESSAGES
// =====================================================

// Send direct message
router.post('/messages', async (req, res) => {
  try {
    const { sender_id, recipient_id, content, message_type, attachment_url, attachment_type } = req.body;

    if (!sender_id || !recipient_id || !content) {
      return res.status(400).json({ error: 'Sender ID, recipient ID, and content are required' });
    }

    const message = {
      sender_id,
      recipient_id,
      content,
      message_type: message_type || 'text',
      attachment_url,
      attachment_type,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: newMessage, error } = await supabase
      .from('direct_messages')
      .insert(message)
      .select(`
        *,
        sender:sender_id(id, email, user_metadata),
        recipient:recipient_id(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      message: newMessage 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation between two users
router.get('/messages/conversation', async (req, res) => {
  try {
    const { user1_id, user2_id, limit = 50, offset = 0 } = req.query;

    if (!user1_id || !user2_id) {
      return res.status(400).json({ error: 'Both user IDs are required' });
    }

    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:sender_id(id, email, user_metadata),
        recipient:recipient_id(id, email, user_metadata)
      `)
      .or(`and(sender_id.eq.${user1_id},recipient_id.eq.${user2_id}),and(sender_id.eq.${user2_id},recipient_id.eq.${user1_id})`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    res.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Mark messages as read
router.patch('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const { data: updatedMessage, error } = await supabase
      .from('direct_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error marking message as read:', error);
      return res.status(500).json({ error: 'Failed to mark message as read' });
    }

    res.json({ 
      success: true, 
      message: 'Message marked as read',
      message: updatedMessage 
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// =====================================================
// FORUM CATEGORIES
// =====================================================

// Get forum categories
router.get('/forum/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching forum categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    res.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// =====================================================
// FORUM POSTS
// =====================================================

// Get forum posts
router.get('/forum/posts', async (req, res) => {
  try {
    const { 
      category_id, 
      author_id, 
      post_type, 
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:author_id(id, email, user_metadata),
        category:category_id(*),
        replies:forum_replies(count)
      `)
      .eq('is_locked', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    if (post_type) {
      query = query.eq('post_type', post_type);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching forum posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    res.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create forum post
router.post('/forum/posts', async (req, res) => {
  try {
    const { 
      author_id, 
      category_id, 
      title, 
      content, 
      post_type, 
      tags 
    } = req.body;

    if (!author_id || !category_id || !title || !content) {
      return res.status(400).json({ error: 'Author ID, category ID, title, and content are required' });
    }

    const post = {
      author_id,
      category_id,
      title,
      content,
      post_type: post_type || 'discussion',
      tags: tags || [],
      is_pinned: false,
      is_locked: false,
      views_count: 0,
      likes_count: 0,
      replies_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newPost, error } = await supabase
      .from('forum_posts')
      .insert(post)
      .select(`
        *,
        author:author_id(id, email, user_metadata),
        category:category_id(*)
      `)
      .single();

    if (error) {
      console.error('Error creating forum post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    res.json({ 
      success: true, 
      message: 'Post created successfully',
      post: newPost 
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get forum post by ID
router.get('/forum/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const { data: post, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:author_id(id, email, user_metadata),
        category:category_id(*)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching forum post:', error);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await supabase
      .from('forum_posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', postId);

    res.json({ post });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// =====================================================
// FORUM REPLIES
// =====================================================

// Get forum replies
router.get('/forum/posts/:postId/replies', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data: replies, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:author_id(id, email, user_metadata),
        parent_reply:parent_reply_id(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching forum replies:', error);
      return res.status(500).json({ error: 'Failed to fetch replies' });
    }

    res.json({ replies: replies || [] });
  } catch (error) {
    console.error('Error fetching forum replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Create forum reply
router.post('/forum/posts/:postId/replies', async (req, res) => {
  try {
    const { postId } = req.params;
    const { author_id, content, parent_reply_id, is_solution } = req.body;

    if (!author_id || !content) {
      return res.status(400).json({ error: 'Author ID and content are required' });
    }

    const reply = {
      post_id: postId,
      author_id,
      parent_reply_id,
      content,
      is_solution: is_solution || false,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newReply, error } = await supabase
      .from('forum_replies')
      .insert(reply)
      .select(`
        *,
        author:author_id(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error creating forum reply:', error);
      return res.status(500).json({ error: 'Failed to create reply' });
    }

    // Update post reply count
    await supabase.rpc('increment_replies_count', { post_id: postId });

    res.json({ 
      success: true, 
      message: 'Reply created successfully',
      reply: newReply 
    });
  } catch (error) {
    console.error('Error creating forum reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// =====================================================
// STUDY GROUPS
// =====================================================

// Get study groups
router.get('/study-groups', async (req, res) => {
  try {
    const { 
      topic, 
      skill_level, 
      is_public, 
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = supabase
      .from('study_groups')
      .select(`
        *,
        creator:created_by(id, email, user_metadata),
        members:study_group_members(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }

    if (skill_level) {
      query = query.eq('skill_level', skill_level);
    }

    if (is_public !== undefined) {
      query = query.eq('is_public', is_public === 'true');
    }

    const { data: groups, error } = await query;

    if (error) {
      console.error('Error fetching study groups:', error);
      return res.status(500).json({ error: 'Failed to fetch study groups' });
    }

    res.json({ groups: groups || [] });
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
      topic, 
      skill_level, 
      max_members, 
      is_public, 
      meeting_schedule, 
      meeting_link, 
      created_by 
    } = req.body;

    if (!name || !topic || !created_by) {
      return res.status(400).json({ error: 'Name, topic, and creator are required' });
    }

    const group = {
      name,
      description,
      topic,
      skill_level: skill_level || 'beginner',
      max_members: max_members || 20,
      current_members: 1, // Creator is the first member
      is_public: is_public !== false,
      is_active: true,
      meeting_schedule: meeting_schedule || {},
      meeting_link,
      created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newGroup, error } = await supabase
      .from('study_groups')
      .insert(group)
      .select(`
        *,
        creator:created_by(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error creating study group:', error);
      return res.status(500).json({ error: 'Failed to create study group' });
    }

    // Add creator as admin member
    await supabase
      .from('study_group_members')
      .insert({
        group_id: newGroup.id,
        user_id: created_by,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    res.json({ 
      success: true, 
      message: 'Study group created successfully',
      group: newGroup 
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
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if group exists and has space
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('max_members, current_members')
      .eq('id', groupId)
      .eq('is_active', true)
      .single();

    if (groupError || !group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.current_members >= group.max_members) {
      return res.status(400).json({ error: 'Study group is full' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user_id)
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this study group' });
    }

    // Add member
    const { data: member, error } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        user_id,
        role: 'member',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error joining study group:', error);
      return res.status(500).json({ error: 'Failed to join study group' });
    }

    // Update member count
    await supabase
      .from('study_groups')
      .update({ 
        current_members: group.current_members + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);

    res.json({ 
      success: true, 
      message: 'Joined study group successfully',
      member 
    });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ error: 'Failed to join study group' });
  }
});

export default router;