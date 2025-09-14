// Test Google APIs Integration
// Comprehensive testing endpoint for all Google APIs functionality

import express from 'express';
import GoogleAPIsService from '../lib/google-apis-service.js';
import CareerDataService from '../lib/career-data-service.js';
import RealTimeContentGenerator from '../lib/real-time-content-generator.js';

const router = express.Router();
const googleAPIsService = new GoogleAPIsService();
const careerDataService = new CareerDataService();
const realTimeContentGenerator = new RealTimeContentGenerator();

// Test all Google APIs integration
router.get('/all', async (req, res) => {
  try {
    console.log('🧪 Running comprehensive Google APIs integration test...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Test 1: Google Search API
    console.log('🔍 Testing Google Search API...');
    try {
      const searchResults = await googleAPIsService.searchPersonalizedLearningMaterials(
        'JavaScript programming tutorial',
        'software_engineering',
        'learning',
        'beginner',
        { interests: ['programming'], skills: ['JavaScript'], experience: 'beginner' }
      );
      
      testResults.tests.googleSearch = {
        status: 'passed',
        message: 'Google Search API working correctly',
        resultsCount: searchResults.length,
        sampleResult: searchResults[0] || null
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.googleSearch = {
        status: 'failed',
        message: `Google Search API failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 2: YouTube API
    console.log('📺 Testing YouTube API...');
    try {
      const youtubeResults = await googleAPIsService.searchYouTube(
        'JavaScript tutorial',
        'software_engineering',
        'beginner'
      );
      
      testResults.tests.youtube = {
        status: 'passed',
        message: 'YouTube API working correctly',
        resultsCount: youtubeResults.length,
        sampleResult: youtubeResults[0] || null
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.youtube = {
        status: 'failed',
        message: `YouTube API failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 3: Google Books API
    console.log('📚 Testing Google Books API...');
    try {
      const booksResults = await googleAPIsService.searchGoogleBooks(
        'JavaScript programming',
        'software_engineering',
        'beginner'
      );
      
      testResults.tests.googleBooks = {
        status: 'passed',
        message: 'Google Books API working correctly',
        resultsCount: booksResults.length,
        sampleResult: booksResults[0] || null
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.googleBooks = {
        status: 'failed',
        message: `Google Books API failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 4: Google Gemini API
    console.log('🤖 Testing Google Gemini API...');
    try {
      const geminiResponse = await googleAPIsService.generateAIContent(
        'Generate a brief learning objective for JavaScript programming',
        { domain: 'software_engineering', category: 'learning' }
      );
      
      testResults.tests.googleGemini = {
        status: 'passed',
        message: 'Google Gemini API working correctly',
        responseLength: geminiResponse.length,
        sampleResponse: geminiResponse.substring(0, 200) + '...'
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.googleGemini = {
        status: 'failed',
        message: `Google Gemini API failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 5: Real-time Content Generator
    console.log('⚡ Testing Real-time Content Generator...');
    try {
      const contentResult = await realTimeContentGenerator.generateRealTimeLearningSteps(
        'test_step_123',
        'software_engineering',
        'Learn JavaScript Programming',
        'foundation'
      );
      
      testResults.tests.realTimeContent = {
        status: 'passed',
        message: 'Real-time Content Generator working correctly',
        stepsCount: contentResult.length,
        sampleStep: contentResult[0] || null
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.realTimeContent = {
        status: 'failed',
        message: `Real-time Content Generator failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 6: Career Data Service
    console.log('💼 Testing Career Data Service...');
    try {
      const careerCards = await careerDataService.generateCareerCards(
        'software_engineering',
        { interests: ['programming'], skills: ['JavaScript'], experience: 'beginner' },
        3
      );
      
      testResults.tests.careerData = {
        status: 'passed',
        message: 'Career Data Service working correctly',
        cardsCount: careerCards.length,
        sampleCard: careerCards[0] || null
      };
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.careerData = {
        status: 'failed',
        message: `Career Data Service failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 7: AI Roadmaps Integration
    console.log('🎯 Testing AI Roadmaps Integration...');
    try {
      const roadmapResponse = await fetch('http://localhost:3001/api/ai/roadmap/software_engineering/steps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'software_engineering',
          goal: 'Learn JavaScript Programming',
          difficulty: 'beginner',
          userProfile: { interests: ['programming'], skills: ['JavaScript'], experience: 'beginner' }
        })
      });
      
      if (roadmapResponse.ok) {
        const roadmapData = await roadmapResponse.json();
        testResults.tests.aiRoadmaps = {
          status: 'passed',
          message: 'AI Roadmaps Integration working correctly',
          stepsCount: roadmapData.steps?.length || 0,
          source: roadmapData.source || 'Unknown'
        };
        testResults.summary.passed++;
      } else {
        throw new Error(`HTTP ${roadmapResponse.status}: ${roadmapResponse.statusText}`);
      }
    } catch (error) {
      testResults.tests.aiRoadmaps = {
        status: 'failed',
        message: `AI Roadmaps Integration failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Test 8: Curiosity Compass Integration
    console.log('🧭 Testing Curiosity Compass Integration...');
    try {
      const careerResponse = await fetch('http://localhost:3001/api/career/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'software_engineering',
          userProfile: { interests: ['programming'], skills: ['JavaScript'], experience: 'beginner' },
          count: 3
        })
      });
      
      if (careerResponse.ok) {
        const careerData = await careerResponse.json();
        testResults.tests.curiosityCompass = {
          status: 'passed',
          message: 'Curiosity Compass Integration working correctly',
          cardsCount: careerData.cards?.length || 0,
          source: careerData.source || 'Unknown'
        };
        testResults.summary.passed++;
      } else {
        throw new Error(`HTTP ${careerResponse.status}: ${careerResponse.statusText}`);
      }
    } catch (error) {
      testResults.tests.curiosityCompass = {
        status: 'failed',
        message: `Curiosity Compass Integration failed: ${error.message}`,
        error: error.message
      };
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Calculate overall status
    const overallStatus = testResults.summary.failed === 0 ? 'PASSED' : 
                         testResults.summary.passed > testResults.summary.failed ? 'PARTIAL' : 'FAILED';

    res.json({
      success: true,
      status: overallStatus,
      message: `Google APIs Integration Test ${overallStatus}`,
      results: testResults,
      recommendations: generateRecommendations(testResults)
    });

  } catch (error) {
    console.error('Error running Google APIs integration test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run integration test',
      details: error.message
    });
  }
});

// Generate recommendations based on test results
function generateRecommendations(testResults) {
  const recommendations = [];
  
  if (testResults.tests.googleGemini?.status === 'failed') {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Google Gemini API not configured',
      solution: 'Add GOOGLE_GEMINI_API_KEY to environment variables',
      impact: 'AI content generation will not work'
    });
  }
  
  if (testResults.tests.googleSearch?.status === 'failed') {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Google Search API not working',
      solution: 'Check GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID',
      impact: 'Real-time content search will not work'
    });
  }
  
  if (testResults.tests.youtube?.status === 'failed') {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'YouTube API not working',
      solution: 'Check VITE_YOUTUBE_API_KEY environment variable',
      impact: 'Video learning resources will not be available'
    });
  }
  
  if (testResults.tests.googleBooks?.status === 'failed') {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Google Books API not working',
      solution: 'Check GOOGLE_BOOKS_API_KEY environment variable',
      impact: 'Book learning resources will not be available'
    });
  }
  
  if (testResults.summary.passed === testResults.summary.total) {
    recommendations.push({
      priority: 'LOW',
      issue: 'All systems operational',
      solution: 'No action required',
      impact: 'All Google APIs are working correctly'
    });
  }
  
  return recommendations;
}

// Test individual API
router.get('/:api', async (req, res) => {
  const { api } = req.params;
  
  try {
    let result = {};
    
    switch (api) {
      case 'search':
        result = await googleAPIsService.searchPersonalizedLearningMaterials(
          'JavaScript tutorial',
          'software_engineering',
          'learning',
          'beginner',
          { interests: ['programming'] }
        );
        break;
        
      case 'youtube':
        result = await googleAPIsService.searchYouTube(
          'JavaScript tutorial',
          'software_engineering',
          'beginner'
        );
        break;
        
      case 'books':
        result = await googleAPIsService.searchGoogleBooks(
          'JavaScript programming',
          'software_engineering',
          'beginner'
        );
        break;
        
      case 'gemini':
        result = await googleAPIsService.generateAIContent(
          'Generate a learning objective for JavaScript',
          { domain: 'software_engineering' }
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid API name',
          available: ['search', 'youtube', 'books', 'gemini']
        });
    }
    
    res.json({
      success: true,
      api,
      result,
      message: `${api} API test completed successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      api,
      error: `${api} API test failed`,
      details: error.message
    });
  }
});

export default router;
