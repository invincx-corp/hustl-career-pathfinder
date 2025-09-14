import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get user conversations
router.get('/conversations', async (req, res) => {
  try {
    const { userId } = req.query;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          user_id,
          role,
          last_read_at,
          is_active
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .eq('conversation_participants.is_active', true)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get participant details for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conversation) => {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            role,
            last_read_at,
            is_active,
            profiles!inner(
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('conversation_id', conversation.id)
          .eq('is_active', true);

        return {
          ...conversation,
          participants: participants || []
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithParticipants
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { type = 'direct', title, participantIds } = req.body;

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        type,
        title,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conversationError) {
      throw conversationError;
    }

    // Add participants
    const participantData = participantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: 'member',
      joined_at: new Date().toISOString(),
      last_read_at: new Date().toISOString(),
      is_active: true
    }));

    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantData)
      .select();

    if (participantsError) {
      throw participantsError;
    }

    res.json({
      success: true,
      conversation: {
        ...conversation,
        participants: participants || []
      },
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get conversation messages
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        message_attachments(*),
        message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, content, messageType = 'text', replyToId, metadata = {} } = req.body;

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        reply_to_id: replyToId,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Update conversation last message time
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    // Create message notifications for other participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('is_active', true)
      .neq('user_id', senderId);

    if (participants && participants.length > 0) {
      const notificationData = participants.map(participant => ({
        user_id: participant.user_id,
        conversation_id: conversationId,
        message_id: message.id,
        notification_type: 'new_message',
        title: 'New Message',
        message: 'You have a new message',
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('message_notifications')
        .insert(notificationData);
    }

    res.json({
      success: true,
      message,
      messageId: message.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update message
router.put('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, senderId } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', senderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message,
      messageId: message.id
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { senderId } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', senderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add message attachment
router.post('/messages/:messageId/attachments', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { fileName, fileUrl, fileType, fileSize, mimeType } = req.body;

    const { data: attachment, error } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        mime_type: mimeType
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      attachment
    });
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ error: 'Failed to add attachment' });
  }
});

// Add message reaction
router.post('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reactionType } = req.body;

    const { data: reaction, error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        reaction_type: reactionType
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      reaction
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove message reaction
router.delete('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reactionType } = req.body;

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Mark message as read
router.post('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const { data: readStatus, error } = await supabase
      .from('message_read_status')
      .upsert({
        message_id: messageId,
        user_id: userId,
        read_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      readStatus
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Update typing indicator
router.post('/conversations/:conversationId/typing', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, isTyping } = req.body;

    const { data: typingIndicator, error } = await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        last_typing_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      typingIndicator
    });
  } catch (error) {
    console.error('Error updating typing indicator:', error);
    res.status(500).json({ error: 'Failed to update typing indicator' });
  }
});

// Get typing indicators for conversation
router.get('/conversations/:conversationId/typing', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: typingIndicators, error } = await supabase
      .from('typing_indicators')
      .select(`
        *,
        profiles!typing_indicators_user_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_typing', true)
      .gt('last_typing_at', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      typingIndicators
    });
  } catch (error) {
    console.error('Error fetching typing indicators:', error);
    res.status(500).json({ error: 'Failed to fetch typing indicators' });
  }
});

// Get message notifications
router.get('/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    const { unreadOnly = false } = req.query;

    let query = supabase
      .from('message_notifications')
      .select(`
        *,
        conversations!inner(
          id,
          type,
          title
        ),
        messages!inner(
          id,
          content,
          message_type,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { data: notification, error } = await supabase
      .from('message_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Update conversation settings
router.put('/conversations/:conversationId/settings', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, isMuted, isArchived, notificationSettings } = req.body;

    const { data: settings, error } = await supabase
      .from('conversation_settings')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_muted: isMuted,
        is_archived: isArchived,
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error updating conversation settings:', error);
    res.status(500).json({ error: 'Failed to update conversation settings' });
  }
});

// Leave conversation
router.delete('/conversations/:conversationId/leave', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_active: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Left conversation successfully'
    });
  } catch (error) {
    console.error('Error leaving conversation:', error);
    res.status(500).json({ error: 'Failed to leave conversation' });
  }
});

export default router;
