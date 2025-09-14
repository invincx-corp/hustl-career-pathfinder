// Intelligent Content API Routes
// Uses advanced ML algorithms for content curation and personalization

import express from 'express';
import IntelligentContentCurator from '../lib/intelligent-content-curator.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Initialize the intelligent content curator
const contentCurator = new IntelligentContentCurator();

// Get user profile for content curation
async function getUserProfile(userId) {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Update user profile with learning insights
async function updateUserProfile(userId, updatedProfile) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
  }
}

// Track user behavior
async function trackUserBehavior(userId, action, contentId, metadata = {}) {
  try {
    // Store in database
    const { error } = await supabase
      .from('user_behavior')
      .insert({
        user_id: userId,
        action,
        content_id: contentId,
        metadata,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking user behavior:', error);
    }

    // Also track in memory for real-time analysis
    contentCurator.trackUserBehavior(userId, action, contentId, metadata);
  } catch (error) {
    console.error('Error in trackUserBehavior:', error);
  }
}

// ========================================
// INTELLIGENT CONTENT CURATION ENDPOINTS
// ========================================

/**
 * Get curated content for Curiosity Compass
 * POST /api/intelligent-content/curiosity-compass
 */
router.post('/curiosity-compass', async (req, res) => {
  try {
    const { userId, domain, mode } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log(`🎯 Curiosity Compass content request for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Get curated career content
    const curatedContent = await contentCurator.getCuratedCareerContent(
      userProfile,
      domain || 'software_engineering',
      mode || 'exploration'
    );

    // Track the request
    await trackUserBehavior(userId, 'curiosity_compass_request', null, {
      domain: domain || 'software_engineering',
      mode: mode || 'exploration'
    });

    res.json({
      success: true,
      careers: curatedContent.careers,
      insights: curatedContent.insights,
      message: 'Curiosity Compass content curated successfully'
    });

  } catch (error) {
    console.error('Error in Curiosity Compass content curation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to curate Curiosity Compass content',
      details: error.message
    });
  }
});

/**
 * Get curated learning resources
 * POST /api/intelligent-content/learning-resources
 */
router.post('/learning-resources', async (req, res) => {
  try {
    const { userId, domain, skill, difficulty } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log(`🎯 Learning resources request for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Get curated learning resources
    const curatedResources = await contentCurator.getCuratedLearningResources(
      userProfile,
      domain || 'software_engineering',
      skill || 'programming',
      difficulty || 'beginner'
    );

    // Track the request
    await trackUserBehavior(userId, 'learning_resources_request', null, {
      domain: domain || 'software_engineering',
      skill: skill || 'programming',
      difficulty: difficulty || 'beginner'
    });

    res.json({
      success: true,
      resources: curatedResources.resources,
      insights: curatedResources.insights,
      message: 'Learning resources curated successfully'
    });

  } catch (error) {
    console.error('Error in learning resources curation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to curate learning resources',
      details: error.message
    });
  }
});

/**
 * Get personalized content recommendations using ML
 * POST /api/intelligent-content/curate
 */
router.post('/curate', async (req, res) => {
  try {
    const { userId, domain, category, difficulty, contentType, limit } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log(`🎯 Intelligent content curation request for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Prepare curation request
    const curationRequest = {
      domain: domain || 'software_engineering',
      category: category || 'foundation',
      difficulty: difficulty || 'beginner',
      contentType: contentType || 'all',
      limit: limit || 20
    };

    // Curate personalized content
    const curatedContent = await contentCurator.curatePersonalizedContent(
      userProfile, 
      curationRequest
    );

    // Track the curation request
    await trackUserBehavior(userId, 'content_curation_request', null, {
      domain: curationRequest.domain,
      category: curationRequest.category,
      difficulty: curationRequest.difficulty,
      contentType: curationRequest.contentType
    });

    res.json({
      success: true,
      data: curatedContent,
      message: 'Content curated successfully using ML algorithms'
    });

  } catch (error) {
    console.error('Error in intelligent content curation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to curate content',
      details: error.message
    });
  }
});

/**
 * Get personalized career recommendations using ML
 * POST /api/intelligent-content/careers
 */
router.post('/careers', async (req, res) => {
  try {
    const { userId, limit } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log(`🎯 Career recommendations request for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Get available career options (this would come from your career database)
    const careerOptions = await getCareerOptions();

    // Generate ML-based career recommendations
    const careerRecommendations = contentCurator.mlEngine.generateCareerRecommendations(
      userProfile, 
      careerOptions
    );

    // Limit results
    const limitedRecommendations = careerRecommendations.slice(0, limit || 10);

    // Track the career recommendation request
    await trackUserBehavior(userId, 'career_recommendation_request', null, {
      limit: limit || 10
    });

    res.json({
      success: true,
      data: {
        careers: limitedRecommendations,
        insights: {
          totalAnalyzed: careerOptions.length,
          recommended: limitedRecommendations.length,
          averageMatchScore: Math.round(
            limitedRecommendations.reduce((sum, career) => sum + career.matchScore, 0) / 
            limitedRecommendations.length
          )
        }
      },
      message: 'Career recommendations generated using ML algorithms'
    });

  } catch (error) {
    console.error('Error in career recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate career recommendations',
      details: error.message
    });
  }
});

/**
 * Get learning path recommendations using ML
 * POST /api/intelligent-content/learning-paths
 */
router.post('/learning-paths', async (req, res) => {
  try {
    const { userId, domain, currentLevel } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log(`🎯 Learning path recommendations for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Get user's learning history
    const learningHistory = await getUserLearningHistory(userId);

    // Analyze learning patterns
    const patternAnalysis = contentCurator.mlEngine.analyzeLearningPatterns(
      userProfile, 
      learningHistory
    );

    // Generate adaptive learning path
    const learningPath = await generateAdaptiveLearningPath(
      userProfile, 
      domain || 'software_engineering',
      currentLevel || userProfile.experience_level,
      patternAnalysis
    );

    // Track the learning path request
    await trackUserBehavior(userId, 'learning_path_request', null, {
      domain: domain || 'software_engineering',
      currentLevel: currentLevel || userProfile.experience_level
    });

    res.json({
      success: true,
      data: {
        learningPath,
        patternAnalysis,
        adaptations: patternAnalysis.adaptations,
        confidence: patternAnalysis.confidence
      },
      message: 'Learning path generated using ML analysis'
    });

  } catch (error) {
    console.error('Error in learning path generation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate learning path',
      details: error.message
    });
  }
});

/**
 * Track user content interaction
 * POST /api/intelligent-content/track
 */
router.post('/track', async (req, res) => {
  try {
    const { userId, action, contentId, metadata } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and action are required' 
      });
    }

    // Track the behavior
    await trackUserBehavior(userId, action, contentId, metadata);

    res.json({
      success: true,
      message: 'User behavior tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking user behavior:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track user behavior',
      details: error.message
    });
  }
});

/**
 * Get content quality analysis
 * POST /api/intelligent-content/analyze-quality
 */
router.post('/analyze-quality', async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and content are required' 
      });
    }

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Analyze content quality
    const qualityAnalysis = contentCurator.mlEngine.calculateContentQuality(content, userProfile);

    res.json({
      success: true,
      data: {
        qualityAnalysis,
        content: {
          id: content.id,
          title: content.title,
          url: content.url
        }
      },
      message: 'Content quality analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing content quality:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze content quality',
      details: error.message
    });
  }
});

/**
 * Get user learning insights
 * GET /api/intelligent-content/insights/:userId
 */
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🎯 Learning insights request for user: ${userId}`);

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Get user's learning history
    const learningHistory = await getUserLearningHistory(userId);

    // Analyze learning patterns
    const patternAnalysis = contentCurator.mlEngine.analyzeLearningPatterns(
      userProfile, 
      learningHistory
    );

    // Get user behavior data
    const behaviorData = contentCurator.getUserBehavior(userId);

    // Generate insights
    const insights = {
      learningPatterns: patternAnalysis.patterns,
      adaptations: patternAnalysis.adaptations,
      recommendations: patternAnalysis.recommendations,
      behaviorSummary: generateBehaviorSummary(behaviorData),
      learningStrengths: patternAnalysis.patterns.strongAreas,
      improvementAreas: patternAnalysis.patterns.strugglingAreas,
      confidence: patternAnalysis.confidence
    };

    res.json({
      success: true,
      data: insights,
      message: 'Learning insights generated successfully'
    });

  } catch (error) {
    console.error('Error generating learning insights:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate learning insights',
      details: error.message
    });
  }
});

/**
 * Update user profile with ML insights
 * POST /api/intelligent-content/update-profile
 */
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, insights } = req.body;

    if (!userId || !insights) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and insights are required' 
      });
    }

    // Get current user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    // Update profile with insights
    const updatedProfile = contentCurator.updateUserProfileWithInsights(userProfile, insights);

    // Save updated profile
    await updateUserProfile(userId, updatedProfile);

    res.json({
      success: true,
      data: {
        updatedProfile,
        changes: Object.keys(insights)
      },
      message: 'User profile updated with ML insights'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user profile',
      details: error.message
    });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

async function getCareerOptions() {
  // This would fetch from your career database
  // For now, return a sample set
  return [
    {
      id: 'software_engineer',
      title: 'Software Engineer',
      domain: 'Technology',
      requiredSkills: ['Programming', 'Problem Solving', 'System Design'],
      marketDemand: { currentDemand: 'high', futureOutlook: 'growing' },
      salaryRange: '₹8-40 LPA',
      growthPotential: 85
    },
    {
      id: 'data_scientist',
      title: 'Data Scientist',
      domain: 'Analytics',
      requiredSkills: ['Python', 'Machine Learning', 'Statistics'],
      marketDemand: { currentDemand: 'high', futureOutlook: 'growing' },
      salaryRange: '₹6-30 LPA',
      growthPotential: 90
    },
    {
      id: 'product_manager',
      title: 'Product Manager',
      domain: 'Strategy',
      requiredSkills: ['Product Strategy', 'User Research', 'Analytics'],
      marketDemand: { currentDemand: 'high', futureOutlook: 'growing' },
      salaryRange: '₹10-35 LPA',
      growthPotential: 80
    }
  ];
}

async function getUserLearningHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('learning_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching learning history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserLearningHistory:', error);
    return [];
  }
}

async function generateAdaptiveLearningPath(userProfile, domain, currentLevel, patternAnalysis) {
  // This would generate a comprehensive learning path based on ML analysis
  // For now, return a sample structure
  return {
    domain,
    currentLevel,
    targetLevel: getNextLevel(currentLevel),
    estimatedDuration: calculateEstimatedDuration(currentLevel, patternAnalysis),
    phases: [
      {
        phase: 'foundation',
        duration: '2-4 weeks',
        skills: ['Basic concepts', 'Fundamentals'],
        content: []
      },
      {
        phase: 'intermediate',
        duration: '4-6 weeks',
        skills: ['Practical application', 'Projects'],
        content: []
      },
      {
        phase: 'advanced',
        duration: '6-8 weeks',
        skills: ['Expertise', 'Leadership'],
        content: []
      }
    ],
    adaptations: patternAnalysis.adaptations,
    confidence: patternAnalysis.confidence
  };
}

function getNextLevel(currentLevel) {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(currentLevel);
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

function calculateEstimatedDuration(currentLevel, patternAnalysis) {
  const baseDuration = {
    'beginner': '3-6 months',
    'intermediate': '6-12 months',
    'advanced': '12-18 months'
  };

  let duration = baseDuration[currentLevel] || '6-12 months';

  // Adjust based on learning patterns
  if (patternAnalysis.patterns.completionRate > 0.8) {
    duration = duration.replace('6-12', '4-8').replace('12-18', '8-12');
  } else if (patternAnalysis.patterns.completionRate < 0.4) {
    duration = duration.replace('3-6', '6-9').replace('6-12', '9-15');
  }

  return duration;
}

function generateBehaviorSummary(behaviorData) {
  if (!behaviorData || behaviorData.length === 0) {
    return {
      totalActions: 0,
      mostCommonAction: 'none',
      recentActivity: 'none'
    };
  }

  const actionCounts = {};
  behaviorData.forEach(action => {
    actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
  });

  const mostCommonAction = Object.entries(actionCounts)
    .sort(([,a], [,b]) => b - a)[0][0];

  const recentActivity = behaviorData
    .filter(action => {
      const actionTime = new Date(action.timestamp);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return actionTime > oneWeekAgo;
    }).length;

  return {
    totalActions: behaviorData.length,
    mostCommonAction,
    recentActivity: recentActivity > 0 ? 'active' : 'inactive'
  };
}

export default router;
