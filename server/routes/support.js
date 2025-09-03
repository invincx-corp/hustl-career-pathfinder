import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Virtual Career Coach API routes
router.post('/coach/chat', async (req, res) => {
  try {
    const { userId, message, context } = req.body;
    
    // Mock AI response - in real implementation, integrate with AI service
    const responses = [
      "That's a great question! Based on your current progress, I recommend focusing on React fundamentals first, then moving to state management.",
      "I can help you find the perfect mentor! Based on your interests in frontend development, I've identified several experienced professionals.",
      "Your learning journey is impressive! I notice you're strong in JavaScript but could benefit from more React practice.",
      "Building projects is the best way to learn! I can suggest some projects that align with your current skills."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const suggestions = [
      {
        id: 's1',
        title: 'Create new roadmap',
        type: 'action',
        description: 'Generate a personalized learning path',
        action: 'create_roadmap'
      },
      {
        id: 's2',
        title: 'Find mentors',
        type: 'action',
        description: 'Browse available mentors in your field',
        action: 'find_mentors'
      }
    ];

    res.json({
      success: true,
      response: randomResponse,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing coach chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

router.get('/coach/nudges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock nudges data
    const nudges = [
      {
        id: 'n1',
        title: 'Continue your React learning',
        message: "You're doing great with React! Ready to tackle the next challenge?",
        type: 'encouragement',
        priority: 'medium',
        timestamp: new Date().toISOString()
      },
      {
        id: 'n2',
        title: 'Mentor session reminder',
        message: 'Your mentor session with Sarah is tomorrow at 2 PM. Prepare your questions!',
        type: 'reminder',
        priority: 'high',
        timestamp: new Date().toISOString()
      }
    ];

    res.json({ nudges });
  } catch (error) {
    console.error('Error fetching nudges:', error);
    res.status(500).json({ error: 'Failed to fetch nudges' });
  }
});

router.post('/coach/nudges/:userId/dismiss', async (req, res) => {
  try {
    const { userId } = req.params;
    const { nudgeId } = req.body;

    // Mock dismiss - in real implementation, update database
    res.json({ 
      success: true, 
      message: 'Nudge dismissed successfully',
      nudgeId
    });
  } catch (error) {
    console.error('Error dismissing nudge:', error);
    res.status(500).json({ error: 'Failed to dismiss nudge' });
  }
});

// AI Career Therapist API routes
router.post('/therapist/mood', async (req, res) => {
  try {
    const { userId, mood, energy, stress, notes } = req.body;
    
    // Mock mood entry - in real implementation, store in database
    const moodEntry = {
      id: Date.now().toString(),
      userId,
      mood,
      energy,
      stress,
      notes,
      timestamp: new Date().toISOString()
    };

    // Analyze mood and provide recommendations
    let recommendations = [];
    if (stress > 7) {
      recommendations.push('Consider practicing mindfulness for 10 minutes daily');
    }
    if (energy < 5) {
      recommendations.push('Try light physical activity to boost energy');
    }
    if (mood === 'anxious' || mood === 'frustrated') {
      recommendations.push('Connect with your mentor about your concerns');
    }

    res.json({
      success: true,
      moodEntry,
      recommendations,
      message: 'Mood recorded successfully'
    });
  } catch (error) {
    console.error('Error recording mood:', error);
    res.status(500).json({ error: 'Failed to record mood' });
  }
});

router.get('/therapist/wellness/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock wellness check data
    const wellnessCheck = {
      id: '1',
      userId,
      date: new Date().toISOString().split('T')[0],
      overallScore: 7.5,
      stressLevel: 4,
      motivation: 8,
      confidence: 7,
      sleep: 6,
      social: 8,
      work: 7,
      recommendations: [
        'Consider practicing mindfulness for 10 minutes daily',
        'Schedule regular breaks during work sessions',
        'Connect with your mentor about interview preparation'
      ]
    };

    res.json({ wellnessCheck });
  } catch (error) {
    console.error('Error fetching wellness check:', error);
    res.status(500).json({ error: 'Failed to fetch wellness check' });
  }
});

router.get('/therapist/resources', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Mock resources data
    const resources = [
      {
        id: '1',
        title: '5-Minute Breathing Exercise',
        type: 'meditation',
        description: 'A quick breathing exercise to reduce stress and anxiety',
        duration: '5 minutes',
        category: 'stress',
        url: '#'
      },
      {
        id: '2',
        title: 'Building Confidence in Interviews',
        type: 'article',
        description: 'Tips and techniques to boost your confidence during interviews',
        duration: '10 minutes',
        category: 'anxiety',
        url: '#'
      },
      {
        id: '3',
        title: 'Crisis Support Helpline',
        type: 'helpline',
        description: '24/7 support for immediate help and guidance',
        duration: 'Available 24/7',
        category: 'general',
        url: 'tel:988'
      }
    ];

    let filteredResources = resources;
    if (category && category !== 'all') {
      filteredResources = resources.filter(r => r.category === category);
    }

    res.json({ resources: filteredResources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

router.post('/therapist/escalate', async (req, res) => {
  try {
    const { userId, reason, urgency, details } = req.body;
    
    // Mock escalation - in real implementation, notify human moderators
    const escalation = {
      id: Date.now().toString(),
      userId,
      reason,
      urgency,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    res.json({
      success: true,
      escalation,
      message: 'Escalation submitted successfully. A human moderator will review your case.'
    });
  } catch (error) {
    console.error('Error escalating case:', error);
    res.status(500).json({ error: 'Failed to escalate case' });
  }
});

export default router;



