import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all forums
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('forums')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: forums, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      forums
    });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

// Get forum by ID with topics
router.get('/:forumId', async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 20, sortBy = 'last_reply_at' } = req.query;
    const offset = (page - 1) * limit;

    // Get forum details
    const { data: forum, error: forumError } = await supabase
      .from('forums')
      .select('*')
      .eq('id', forumId)
      .single();

    if (forumError) {
      return res.status(404).json({ error: 'Forum not found' });
    }

    // Get topics
    let topicsQuery = supabase
      .from('forum_topics')
      .select(`
        *,
        profiles!forum_topics_author_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('forum_id', forumId)
      .order(sortBy, { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: topics, error: topicsError } = await topicsQuery;

    if (topicsError) {
      throw topicsError;
    }

    res.json({
      success: true,
      forum,
      topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: topics.length
      }
    });
  } catch (error) {
    console.error('Error fetching forum:', error);
    res.status(500).json({ error: 'Failed to fetch forum' });
  }
});

// Create new forum
router.post('/', async (req, res) => {
  try {
    const { name, description, category, icon, color } = req.body;

    const { data: forum, error } = await supabase
      .from('forums')
      .insert({
        name,
        description,
        category,
        icon,
        color: color || '#3B82F6',
        is_active: true,
        sort_order: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      forum,
      message: 'Forum created successfully'
    });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ error: 'Failed to create forum' });
  }
});

// Get topic by ID with replies
router.get('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get topic details
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        forums!inner(
          id,
          name,
          category
        ),
        profiles!forum_topics_author_id_fkey(
          id,
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq('id', topicId)
      .single();

    if (topicError) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Get replies
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select(`
        *,
        profiles!forum_replies_author_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (repliesError) {
      throw repliesError;
    }

    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ view_count: topic.view_count + 1 })
      .eq('id', topicId);

    res.json({
      success: true,
      topic,
      replies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: replies.length
      }
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// Create new topic
router.post('/topics', async (req, res) => {
  try {
    const { forumId, authorId, title, content, topicType = 'discussion', tags = [] } = req.body;

    const { data: topic, error } = await supabase
      .from('forum_topics')
      .insert({
        forum_id: forumId,
        author_id: authorId,
        title,
        content,
        topic_type: topicType,
        tags,
        view_count: 0,
        reply_count: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update forum topic count
    const { data: forum } = await supabase
      .from('forums')
      .select('topic_count')
      .eq('id', forumId)
      .single();

    if (forum) {
      await supabase
        .from('forums')
        .update({ topic_count: (forum.topic_count || 0) + 1 })
        .eq('id', forumId);
    }

    res.json({
      success: true,
      topic,
      message: 'Topic created successfully'
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Update topic
router.put('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { authorId, title, content, tags } = req.body;

    const { data: topic, error } = await supabase
      .from('forum_topics')
      .update({
        title,
        content,
        tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', topicId)
      .eq('author_id', authorId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      topic,
      message: 'Topic updated successfully'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Delete topic
router.delete('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { authorId } = req.body;

    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId)
      .eq('author_id', authorId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// Create reply
router.post('/topics/:topicId/replies', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { authorId, content, replyToId } = req.body;

    const { data: reply, error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: topicId,
        author_id: authorId,
        content,
        reply_to_id: replyToId,
        helpful_count: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update topic reply count and last reply info
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('reply_count')
      .eq('id', topicId)
      .single();

    if (topic) {
      await supabase
        .from('forum_topics')
        .update({
          reply_count: topic.reply_count + 1,
          last_reply_at: new Date().toISOString(),
          last_reply_by: authorId
        })
        .eq('id', topicId);
    }

    res.json({
      success: true,
      reply,
      message: 'Reply created successfully'
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Update reply
router.put('/replies/:replyId', async (req, res) => {
  try {
    const { replyId } = req.params;
    const { authorId, content } = req.body;

    const { data: reply, error } = await supabase
      .from('forum_replies')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', replyId)
      .eq('author_id', authorId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      reply,
      message: 'Reply updated successfully'
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

// Delete reply
router.delete('/replies/:replyId', async (req, res) => {
  try {
    const { replyId } = req.params;
    const { authorId } = req.body;

    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId)
      .eq('author_id', authorId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// Vote on topic or reply
router.post('/vote', async (req, res) => {
  try {
    const { userId, topicId, replyId, voteType } = req.body;

    if (!topicId && !replyId) {
      return res.status(400).json({ error: 'Either topicId or replyId is required' });
    }

    const { data: vote, error } = await supabase
      .from('forum_votes')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        reply_id: replyId,
        vote_type: voteType
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      vote,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Mark reply as helpful
router.post('/replies/:replyId/helpful', async (req, res) => {
  try {
    const { replyId } = req.params;
    const { userId } = req.body;

    // Check if already marked as helpful
    const { data: existingVote } = await supabase
      .from('forum_votes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .eq('vote_type', 'helpful')
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'Already marked as helpful' });
    }

    // Add helpful vote
    await supabase
      .from('forum_votes')
      .insert({
        user_id: userId,
        reply_id: replyId,
        vote_type: 'helpful'
      });

    // Update helpful count
    const { data: reply } = await supabase
      .from('forum_replies')
      .select('helpful_count')
      .eq('id', replyId)
      .single();

    if (reply) {
      await supabase
        .from('forum_replies')
        .update({ helpful_count: reply.helpful_count + 1 })
        .eq('id', replyId);
    }

    res.json({
      success: true,
      message: 'Marked as helpful successfully'
    });
  } catch (error) {
    console.error('Error marking as helpful:', error);
    res.status(500).json({ error: 'Failed to mark as helpful' });
  }
});

// Subscribe to forum or topic
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, forumId, topicId, subscriptionType } = req.body;

    if (!forumId && !topicId) {
      return res.status(400).json({ error: 'Either forumId or topicId is required' });
    }

    const { data: subscription, error } = await supabase
      .from('forum_subscriptions')
      .insert({
        user_id: userId,
        forum_id: forumId,
        topic_id: topicId,
        subscription_type: subscriptionType
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      subscription,
      message: 'Subscribed successfully'
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from forum or topic
router.delete('/subscribe', async (req, res) => {
  try {
    const { userId, forumId, topicId } = req.body;

    let query = supabase
      .from('forum_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (forumId) {
      query = query.eq('forum_id', forumId);
    }
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get user subscriptions
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: subscriptions, error } = await supabase
      .from('forum_subscriptions')
      .select(`
        *,
        forums(
          id,
          name,
          category
        ),
        forum_topics(
          id,
          title,
          forum_id
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Report content
router.post('/report', async (req, res) => {
  try {
    const { reporterId, reportedUserId, topicId, replyId, reportType, reportReason } = req.body;

    const { data: report, error } = await supabase
      .from('forum_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        topic_id: topicId,
        reply_id: replyId,
        report_type: reportType,
        report_reason: reportReason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get forum tags
router.get('/tags', async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from('forum_tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: tags, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create or update tag
router.post('/tags', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const { data: tag, error } = await supabase
      .from('forum_tags')
      .upsert({
        name,
        description,
        color: color || '#6B7280',
        usage_count: 1
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      tag,
      message: 'Tag created/updated successfully'
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Search forums and topics
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let results = [];

    if (type === 'all' || type === 'topics') {
      const { data: topics } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forums!inner(
            id,
            name,
            category
          ),
          profiles!forum_topics_author_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results = results.concat(topics || []);
    }

    if (type === 'all' || type === 'forums') {
      const { data: forums } = await supabase
        .from('forums')
        .select('*')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .range(offset, offset + limit - 1);

      results = results.concat(forums || []);
    }

    res.json({
      success: true,
      results,
      query: q,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;
