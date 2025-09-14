import express from 'express';
import { supabase } from '../lib/supabase.js';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import LearningPlatformService from '../lib/learning-platforms.js';
import RealTimeContentGenerator from '../lib/real-time-content-generator.js';

const router = express.Router();

// Initialize AI providers
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize learning platform service
const learningPlatformService = new LearningPlatformService();

// Initialize real-time content generator
const realTimeContentGenerator = new RealTimeContentGenerator();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Helper function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Rate limiting and quota management
const rateLimiter = {
  requests: new Map(),
  maxRequests: 5,
  windowMs: 60000,
  quotaExceeded: false,
  quotaResetTime: null,
  
  canMakeRequest() {
    const now = Date.now();
    
    if (this.quotaExceeded && this.quotaResetTime && now > this.quotaResetTime) {
      this.quotaExceeded = false;
      this.quotaResetTime = null;
      console.log('OpenAI quota reset, resuming API calls');
    }
    
    if (this.quotaExceeded) {
      return false;
    }
    
    const windowStart = now - this.windowMs;
    
    for (const [timestamp, count] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(timestamp);
      }
    }
    
    const currentRequests = Array.from(this.requests.values()).reduce((sum, count) => sum + count, 0);
    
    if (currentRequests >= this.maxRequests) {
      return false;
    }
    
    const currentMinute = Math.floor(now / 60000);
    this.requests.set(currentMinute, (this.requests.get(currentMinute) || 0) + 1);
    
    return true;
  },
  
  markQuotaExceeded() {
    this.quotaExceeded = true;
    this.quotaResetTime = Date.now() + (60 * 60 * 1000);
    console.log('OpenAI quota exceeded, switching to Google APIs for 1 hour');
  }
};

// Generate learning steps using Google APIs exclusively
async function generateGoogleAPIsLearningSteps(stepId, domain, goal, category) {
  try {
    console.log(`🔍 Generating learning steps using Google APIs for: ${domain} - ${goal}`);
    
    // Use the real-time content generator to create domain-specific content
    const learningSteps = await realTimeContentGenerator.generateRealTimeLearningSteps(
      stepId, 
      domain, 
      goal, 
      category
    );
    
    console.log(`✅ Generated ${learningSteps.length} REAL-TIME Google APIs learning steps for ${domain}`);
    return learningSteps;
  } catch (error) {
    console.error('Error generating Google APIs learning steps:', error);
    return [];
  }
}

// Legacy function - keeping for reference but not used
async function generateGoogleAPIsLearningStepsLegacy(stepId, domain, goal, category) {
  try {
    console.log(`🔍 Generating learning steps using Google APIs for: ${domain} - ${goal}`);
    
    const searchQuery = `${domain} ${goal} ${category} learning steps tutorial course`;
    const results = await learningPlatformService.searchResources(searchQuery, domain, category, 'beginner');
    
    // Always generate 4-tier learning steps regardless of API results
    const learningSteps = [
      {
        id: `${stepId}_foundation_1`,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Foundation Skills and Concepts`,
        description: `Begin with basic skills essential for any ${domain} discipline. This includes mathematics, fundamental physics, and computing basics.`,
        category: 'foundation',
        objectives: [
          `Master fundamental concepts in ${domain}`,
          `Understand basic principles and theories`,
          `Build a strong foundation for advanced learning`
        ],
        instructions: [
          `Study fundamental ${domain} concepts and principles`,
          `Complete basic exercises and tutorials`,
          `Practice with simple ${domain} problems`
        ],
        exercises: [
          `Complete introductory ${domain} courses`,
          `Practice basic ${domain} exercises`,
          `Build simple ${domain} projects`
        ],
        projects: [
          `Create a basic ${domain} project`,
          `Document your learning progress`,
          `Build a portfolio foundation`
        ],
        assessment: `Demonstrate understanding through basic project completion`,
        estimatedTime: '2-4 weeks',
        difficulty: 'beginner',
        prerequisites: [],
        skills: [domain, 'fundamentals', 'basic-concepts'],
        platforms: ['Google APIs', 'Learning Platforms'],
        tools: ['Basic Tools', 'Learning Resources'],
        technologies: [domain, 'fundamentals'],
        resources: []
      },
      {
        id: `${stepId}_intermediate_2`,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Intermediate Topics and Projects`,
        description: `Dive into more complex ${domain} principles. Start working on projects that apply your foundational knowledge to real-world challenges.`,
        category: 'intermediate',
        objectives: [
          `Apply ${domain} knowledge to real-world problems`,
          `Develop intermediate-level skills`,
          `Work on practical projects`
        ],
        instructions: [
          `Study intermediate ${domain} topics`,
          `Work on hands-on projects`,
          `Apply concepts to real-world scenarios`
        ],
        exercises: [
          `Complete intermediate ${domain} courses`,
          `Build practical ${domain} projects`,
          `Solve complex ${domain} problems`
        ],
        projects: [
          `Develop an intermediate ${domain} project`,
          `Collaborate on team projects`,
          `Create a portfolio of work`
        ],
        assessment: `Demonstrate skills through project completion and problem-solving`,
        estimatedTime: '4-6 weeks',
        difficulty: 'intermediate',
        prerequisites: ['Complete foundation level'],
        skills: [domain, 'intermediate-concepts', 'project-work'],
        platforms: ['Google APIs', 'Learning Platforms'],
        tools: ['Intermediate Tools', 'Project Resources'],
        technologies: [domain, 'intermediate-technologies'],
        resources: []
      },
      {
        id: `${stepId}_advanced_3`,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Advanced Specializations`,
        description: `Choose a specific field within ${domain}. Focus on advanced concepts, specialized tools, and industry-specific knowledge.`,
        category: 'advanced',
        objectives: [
          `Master advanced ${domain} concepts`,
          `Specialize in specific ${domain} areas`,
          `Develop expert-level skills`
        ],
        instructions: [
          `Study advanced ${domain} topics`,
          `Focus on specialization areas`,
          `Work on complex projects`
        ],
        exercises: [
          `Complete advanced ${domain} courses`,
          `Work on specialized projects`,
          `Solve complex ${domain} challenges`
        ],
        projects: [
          `Develop an advanced ${domain} project`,
          `Create a specialized portfolio`,
          `Contribute to open-source projects`
        ],
        assessment: `Demonstrate expertise through advanced project completion`,
        estimatedTime: '6-8 weeks',
        difficulty: 'advanced',
        prerequisites: ['Complete intermediate level'],
        skills: [domain, 'advanced-concepts', 'specialization'],
        platforms: ['Google APIs', 'Learning Platforms'],
        tools: ['Advanced Tools', 'Specialized Resources'],
        technologies: [domain, 'advanced-technologies'],
        resources: []
      },
      {
        id: `${stepId}_real_world_4`,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Real-World Applications and Portfolio Building`,
        description: `Engage in internships and projects to gather real-world experience. Build projects that showcase your skills to potential employers.`,
        category: 'real_world',
        objectives: [
          `Apply ${domain} skills in real-world scenarios`,
          `Build a professional portfolio`,
          `Gain industry experience`
        ],
        instructions: [
          `Work on real-world ${domain} projects`,
          `Build a professional portfolio`,
          `Seek industry experience`
        ],
        exercises: [
          `Complete real-world ${domain} projects`,
          `Build a professional portfolio`,
          `Participate in industry events`
        ],
        projects: [
          `Develop a professional ${domain} project`,
          `Create a comprehensive portfolio`,
          `Contribute to industry projects`
        ],
        assessment: `Demonstrate professional readiness through portfolio and project completion`,
        estimatedTime: '8-12 weeks',
        difficulty: 'expert',
        prerequisites: ['Complete advanced level'],
        skills: [domain, 'professional-skills', 'portfolio-building'],
        platforms: ['Google APIs', 'Learning Platforms'],
        tools: ['Professional Tools', 'Industry Resources'],
        technologies: [domain, 'industry-technologies'],
        resources: []
      }
    ];
    
    console.log(`✅ Generated ${learningSteps.length} Google APIs learning steps for ${domain}`);
    return learningSteps;
  } catch (error) {
    console.error('Error generating Google APIs learning steps:', error);
    return [];
  }
}

// Generate detailed learning steps with AI using 4-tier progression
async function generateDetailedLearningSteps(roadmapId, stepId) {
  let roadmapData;
  let domain = 'software_engineering';
  let goal = 'Learn programming';
  let category = 'General';
  
  try {
    roadmapData = await getRoadmapData(roadmapId);
    domain = roadmapData?.domain || 'software_engineering';
    goal = roadmapData?.goal || 'Learn programming';
    category = roadmapData?.category || 'General';
    
    console.log(`🎯 Generating domain-specific steps for: ${domain} - ${goal}`);

    // Always use Google APIs for learning steps generation
    console.log('Using Google APIs for learning steps generation');
    return await generateGoogleAPIsLearningSteps(stepId, domain, goal, category);
  } catch (error) {
    console.error('OpenAI API error, using Google APIs for learning steps:', error);
    return await generateGoogleAPIsLearningSteps(stepId, domain, goal, category);
  }
}

// Helper function to get roadmap data
async function getRoadmapData(roadmapId) {
  try {
    // Extract domain from roadmap ID or use default
    let domain = 'software_engineering';
    let goal = 'Learn programming';
    let category = 'General';
    
    // Extract domain from roadmap ID format: roadmap_{domain}_{timestamp}_{index}
    const domainMatch = roadmapId.match(/roadmap_([^_]+)_/);
    if (domainMatch) {
      domain = domainMatch[1];
      
      // Set appropriate goals based on domain
      switch (domain) {
        case 'data_science':
          goal = 'Learn data science and machine learning';
          break;
        case 'mechanical_engineering':
          goal = 'Learn mechanical engineering';
          break;
        case 'electrical_engineering':
          goal = 'Learn electrical engineering';
          break;
        case 'software_engineering':
        default:
          goal = 'Learn programming';
          break;
      }
    }
    
    console.log(`🎯 Extracted domain from roadmap ID: ${domain} - ${goal}`);
    
    return {
      domain,
      goal,
      category
    };
  } catch (error) {
    console.error('Error getting roadmap data:', error);
    return {
      domain: 'software_engineering',
      goal: 'Learn programming',
      category: 'General'
    };
  }
}

// Get detailed learning steps for a roadmap
router.get('/roadmap/:roadmapId/steps/:stepId/details', async (req, res) => {
  try {
    const { roadmapId, stepId } = req.params;
    
    const detailedSteps = await generateDetailedLearningSteps(roadmapId, stepId);
    
    res.json({
      success: true,
      steps: detailedSteps,
      message: 'Detailed learning steps generated successfully'
    });
  } catch (error) {
    console.error('Error generating detailed learning steps:', error);
    res.status(500).json({ error: 'Failed to generate detailed learning steps' });
  }
});

// Generate resources for learning steps using Google APIs exclusively
router.post('/roadmap/generate-resources', async (req, res) => {
  try {
    const { stepTitle, stepDescription, skills, difficulty, category, domain, learningCategory } = req.body;
    
    console.log('🔄 Generating step resources using Google APIs exclusively:', { stepTitle, domain, learningCategory });
    
    const resources = await learningPlatformService.searchResources(
      stepTitle, 
      domain || 'software_engineering', 
      learningCategory || 'foundation', 
      difficulty || 'beginner'
    );
    
    const categoryResources = resources[learningCategory || 'foundation'] || [];
    
    if (categoryResources.length === 0) {
      console.log('⚠️ No resources found via Google APIs');
      return res.json({
        success: false,
        resources: [],
        message: 'No learning resources found via Google APIs. Please try a different search term or check API configuration.'
      });
    }
    
    res.json({
      success: true,
      resources: categoryResources,
      message: 'Google APIs learning resources generated successfully',
      source: 'Google APIs',
      count: categoryResources.length
    });
  } catch (error) {
    console.error('Error generating step resources with Google APIs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate learning resources via Google APIs',
      details: error.message
    });
  }
});

// Get learning categories and platform information
router.get('/learning/categories', async (req, res) => {
  try {
    const categories = learningPlatformService.getLearningCategories();
    const platforms = learningPlatformService.platforms;
    
    res.json({
      success: true,
      categories,
      platforms,
      message: 'Learning categories and platforms retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting learning categories:', error);
    res.status(500).json({ error: 'Failed to get learning categories' });
  }
});

// Generate AI roadmaps
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { career, experience, goals, domain } = req.body;
    
    console.log('🎯 Generating AI roadmap:', { career, experience, goals, domain });
    
    // Generate 3-5 roadmaps based on the input
    const roadmaps = [];
    const roadmapCount = 3;
    
    for (let i = 0; i < roadmapCount; i++) {
      const roadmapId = `roadmap_${domain || 'software_engineering'}_${Date.now()}_${i + 1}`;
      const roadmap = {
        id: roadmapId,
        title: `${career} Learning Path ${i + 1}`,
        description: `Comprehensive learning path for ${career} focusing on ${goals?.[i % goals.length] || 'core skills'}`,
        domain: domain || 'software_engineering',
        category: experience || 'beginner',
        difficulty: experience || 'beginner',
        estimatedTime: `${4 + i * 2}-${8 + i * 2} weeks`,
        skills: [`${career} fundamentals`, 'practical skills', 'industry knowledge'],
        steps: [
          {
            id: `${roadmapId}_step_1`,
            title: 'Foundation Skills',
            description: 'Build fundamental knowledge and skills',
            category: 'foundation',
            estimatedTime: '2-4 weeks'
          },
          {
            id: `${roadmapId}_step_2`,
            title: 'Intermediate Projects',
            description: 'Apply knowledge through practical projects',
            category: 'intermediate',
            estimatedTime: '4-6 weeks'
          },
          {
            id: `${roadmapId}_step_3`,
            title: 'Advanced Specializations',
            description: 'Focus on specialized areas and advanced concepts',
            category: 'advanced',
            estimatedTime: '6-8 weeks'
          },
          {
            id: `${roadmapId}_step_4`,
            title: 'Real-World Applications',
            description: 'Build portfolio and gain industry experience',
            category: 'real_world',
            estimatedTime: '8-12 weeks'
          }
        ],
        resources: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      roadmaps.push(roadmap);
    }
    
    console.log(`✅ Generated ${roadmaps.length} roadmaps`);
    
    res.json({
      success: true,
      roadmaps,
      message: 'AI roadmaps generated successfully'
    });
  } catch (error) {
    console.error('Error generating roadmaps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate roadmaps',
      details: error.message
    });
  }
});

// Generate real-time learning steps using Google APIs
router.post('/roadmap/:domain/steps/generate', async (req, res) => {
  try {
    const { domain } = req.params;
    const { goal, difficulty, userProfile } = req.body;
    
    console.log(`🔍 Generating REAL-TIME learning steps for domain: ${domain}`);
    console.log(`📊 Goal: ${goal}, Difficulty: ${difficulty}`);
    
    // Use the real-time content generator
    const learningSteps = await realTimeContentGenerator.generateRealTimeLearningSteps(
      `step_${domain}_${Date.now()}`,
      domain,
      goal,
      'foundation' // Start with foundation, we'll generate all 4 categories
    );
    
    if (learningSteps && learningSteps.length > 0) {
      console.log(`✅ Generated ${learningSteps.length} real-time learning steps for ${domain}`);
      
      res.json({
        success: true,
        steps: learningSteps,
        message: 'Real-time learning steps generated successfully using Google APIs',
        source: 'Google APIs',
        count: learningSteps.length
      });
    } else {
      console.log('⚠️ No learning steps generated from Google APIs');
      res.status(500).json({
        success: false,
        error: 'Failed to generate learning steps using Google APIs',
        message: 'Please check API configuration and try again'
      });
    }
  } catch (error) {
    console.error('Error generating real-time learning steps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate learning steps',
      details: error.message
    });
  }
});


// Test Google APIs integration
router.get('/test/google-apis', async (req, res) => {
  try {
    console.log('🧪 Testing Google APIs integration...');
    
    const testQuery = 'JavaScript programming tutorial';
    const testDomain = 'software_engineering';
    const testCategory = 'foundation';
    const testSkillLevel = 'beginner';
    
    const results = await learningPlatformService.searchResources(
      testQuery, 
      testDomain, 
      testCategory, 
      testSkillLevel
    );
    
    console.log(`✅ Google APIs test completed. Found ${results[testCategory]?.length || 0} results`);
    
    res.json({
      success: true,
      message: 'Google APIs integration test completed',
      testQuery,
      testDomain,
      testCategory,
      testSkillLevel,
      resultsCount: results[testCategory]?.length || 0,
      sampleResults: results[testCategory]?.slice(0, 3) || [],
      allCategories: Object.keys(results).reduce((acc, cat) => {
        acc[cat] = results[cat]?.length || 0;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error testing Google APIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Google APIs integration',
      details: error.message
    });
  }
});

// Test Google Books API specifically
router.get('/test/google-books', async (req, res) => {
  try {
    console.log('📚 Testing Google Books API specifically...');
    
    const testQuery = 'JavaScript programming';
    const testDomain = 'software_engineering';
    const testSkillLevel = 'beginner';
    
    // Test Google Books API directly
    const booksResults = await learningPlatformService.googleAPIsService.searchGoogleBooks(
      testQuery, 
      testDomain, 
      testSkillLevel
    );
    
    console.log(`📚 Google Books API returned ${booksResults.length} results`);
    
    res.json({
      success: true,
      message: 'Google Books API test completed',
      testQuery,
      testDomain,
      testSkillLevel,
      resultsCount: booksResults.length,
      sampleResults: booksResults.slice(0, 3),
      apiKey: process.env.GOOGLE_BOOKS_API_KEY ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    console.error('Error testing Google Books API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Google Books API',
      details: error.message
    });
  }
});

export default router;
