import express from 'express';
import { supabase } from '../lib/supabase.js';
import aiService from '../lib/ai-service.js';

const router = express.Router();

// =====================================================
// AI COACHING SESSIONS
// =====================================================

// Start coaching session
router.post('/sessions/start', async (req, res) => {
  try {
    const { userId, sessionType, context } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const session = {
      user_id: userId,
      session_type: sessionType || 'general',
      initial_context: context || {},
      goals: context?.currentGoals || [],
      topics_discussed: [],
      insights_generated: {},
      recommendations: {},
      escalation_triggered: false,
      escalation_to_human: false,
      started_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ai_coaching_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      console.error('Error starting coaching session:', error);
      return res.status(500).json({ error: 'Failed to start coaching session' });
    }

    res.json({ 
      success: true, 
      message: 'Coaching session started successfully',
      session: data 
    });
  } catch (error) {
    console.error('Error starting coaching session:', error);
    res.status(500).json({ error: 'Failed to start coaching session' });
  }
});

// End coaching session
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return res.status(404).json({ error: 'Session not found' });
    }

    const endedAt = new Date().toISOString();
    const startedAt = new Date(session.started_at);
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));

    const updates = {
      ended_at: endedAt,
      duration_minutes: durationMinutes,
      session_rating: rating,
      user_feedback: feedback
    };

    const { data: updatedSession, error } = await supabase
      .from('ai_coaching_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending coaching session:', error);
      return res.status(500).json({ error: 'Failed to end coaching session' });
    }

    res.json({ 
      success: true, 
      message: 'Coaching session ended successfully',
      session: updatedSession 
    });
  } catch (error) {
    console.error('Error ending coaching session:', error);
    res.status(500).json({ error: 'Failed to end coaching session' });
  }
});

// Get coaching session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data: session, error } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching coaching session:', error);
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching coaching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get user coaching sessions
router.get('/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const { data: sessions, error } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching user coaching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    res.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Error fetching user coaching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// =====================================================
// AI CONVERSATIONS
// =====================================================

// Send message to AI coach
router.post('/sessions/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, content, context } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'User ID and content are required' });
    }

    const startTime = Date.now();

    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        session_id: sessionId,
        message_type: 'user',
        content,
        context: context || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Error saving user message:', userError);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // Get conversation history for context
    const { data: conversationHistory, error: historyError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Generate AI response using real AI service
    const aiResponse = await aiService.generateAIResponse(content, conversationHistory || [], context || {});

    // Analyze intent and sentiment
    const intent = aiService.analyzeIntent(content);
    const sentiment = aiService.analyzeSentiment(content);
    const suggestions = aiService.generateSuggestions(intent, context);
    const escalation_needed = sentiment < -0.5; // Escalate if very negative sentiment

    // Save AI response
    const { data: aiMessage, error: aiError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        session_id: sessionId,
        message_type: 'ai',
        content: aiResponse,
        context: {
          intent: intent,
          confidence: 0.8,
          suggestions: suggestions,
          escalation_needed: escalation_needed,
          sentiment_score: sentiment
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (aiError) {
      console.error('Error saving AI message:', aiError);
      return res.status(500).json({ error: 'Failed to save AI response' });
    }

    // Update session if needed
    if (escalation_needed) {
      await supabase
        .from('ai_coaching_sessions')
        .update({
          escalation_triggered: true,
          escalation_reason: 'AI detected need for human intervention'
        })
        .eq('id', sessionId);
    }

    const responseTime = Date.now() - startTime;
    
    res.json({ 
      success: true,
      userMessage,
      aiMessage: {
        ...aiMessage,
        response_time_ms: responseTime
      },
      response: {
        content: aiResponse,
        intent: intent,
        confidence: 0.8,
        suggestions: suggestions,
        escalation_needed: escalation_needed,
        sentiment_score: sentiment
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation history
router.get('/sessions/:sessionId/conversation', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;
    
    const { data: messages, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching conversation history:', error);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    res.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// =====================================================
// AI MODEL CONFIGURATION
// =====================================================

// Get active AI model configs
router.get('/models/active', async (req, res) => {
  try {
    const { data: models, error } = await supabase
      .from('ai_model_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI models:', error);
      return res.status(500).json({ error: 'Failed to fetch models' });
    }

    res.json({ models: models || [] });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// =====================================================
// COACHING ANALYTICS
// =====================================================

// Get coaching analytics
router.get('/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: sessions, error } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching sessions for analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }

    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.ended_at).length || 0;
    const averageRating = sessions
      ?.filter(s => s.session_rating)
      .reduce((sum, s) => sum + (s.session_rating || 0), 0) / sessions.length || 0;
    
    const sessionTypes = sessions?.reduce((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {}) || {};

    const escalationRate = sessions?.filter(s => s.escalation_triggered).length / totalSessions * 100 || 0;

    const analytics = {
      totalSessions,
      completedSessions,
      averageRating,
      sessionTypes,
      escalationRate,
      totalDuration: sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error getting coaching analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================
// All AI functionality has been moved to the AI service

export default router;
