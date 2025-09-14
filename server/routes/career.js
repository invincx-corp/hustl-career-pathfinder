// Career Data API Routes
// Provides real-time career information using Google APIs

import express from 'express';
import CareerDataService from '../lib/career-data-service.js';

const router = express.Router();
const careerDataService = new CareerDataService();

// Generate real-time career cards
router.post('/cards/generate', async (req, res) => {
  try {
    const { domain, userProfile, count = 25 } = req.body;
    
    console.log(`🎯 Generating real-time career cards for domain: ${domain}`);
    console.log(`👤 User profile:`, userProfile);
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const careerCards = await careerDataService.generateCareerCards(domain, userProfile, count);
    
    res.json({
      success: true,
      cards: careerCards,
      message: 'Real-time career cards generated successfully using Google APIs',
      source: 'Google APIs',
      count: careerCards.length
    });
  } catch (error) {
    console.error('Error generating career cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate career cards',
      details: error.message
    });
  }
});

// Get career insights for a specific career
router.post('/insights', async (req, res) => {
  try {
    const { career, domain, userProfile } = req.body;
    
    console.log(`🔍 Getting career insights for: ${career} in ${domain}`);
    
    if (!career || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Career and domain are required'
      });
    }

    const insights = await careerDataService.googleAPIsService.generateCareerInsights(
      career, domain, userProfile, {}
    );
    
    res.json({
      success: true,
      insights,
      message: 'Career insights generated successfully using Google APIs',
      source: 'Google APIs'
    });
  } catch (error) {
    console.error('Error generating career insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate career insights',
      details: error.message
    });
  }
});

// Get market analysis for a domain
router.post('/market-analysis', async (req, res) => {
  try {
    const { domain, location, userProfile } = req.body;
    
    console.log(`📊 Getting market analysis for: ${domain} in ${location}`);
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const marketAnalysis = await careerDataService.googleAPIsService.generateMarketAnalysis(
      domain, location, userProfile
    );
    
    res.json({
      success: true,
      marketAnalysis,
      message: 'Market analysis generated successfully using Google APIs',
      source: 'Google APIs'
    });
  } catch (error) {
    console.error('Error generating market analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market analysis',
      details: error.message
    });
  }
});

// Get industry trends
router.get('/trends/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const { location = 'global' } = req.query;
    
    console.log(`📈 Getting industry trends for: ${domain} in ${location}`);
    
    const trends = await careerDataService.googleAPIsService.generateAIContent(
      `Generate current industry trends and insights for ${domain} in ${location}`,
      { domain, location }
    );
    
    res.json({
      success: true,
      trends,
      message: 'Industry trends generated successfully using Google APIs',
      source: 'Google APIs'
    });
  } catch (error) {
    console.error('Error generating industry trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate industry trends',
      details: error.message
    });
  }
});

// Get job opportunities
router.post('/opportunities', async (req, res) => {
  try {
    const { career, location, userProfile } = req.body;
    
    console.log(`💼 Getting job opportunities for: ${career} in ${location}`);
    
    if (!career) {
      return res.status(400).json({
        success: false,
        error: 'Career is required'
      });
    }

    const opportunities = await careerDataService.googleAPIsService.generateAIContent(
      `Generate current job opportunities and requirements for ${career} positions in ${location}`,
      { career, location, userProfile }
    );
    
    res.json({
      success: true,
      opportunities,
      message: 'Job opportunities generated successfully using Google APIs',
      source: 'Google APIs'
    });
  } catch (error) {
    console.error('Error generating job opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate job opportunities',
      details: error.message
    });
  }
});

// Test career data service
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing career data service...');
    
    const testDomain = 'software_engineering';
    const testUserProfile = {
      interests: ['technology', 'programming'],
      skills: ['JavaScript', 'Python'],
      experience: 'beginner'
    };
    
    const careerCards = await careerDataService.generateCareerCards(testDomain, testUserProfile, 5);
    
    res.json({
      success: true,
      message: 'Career data service test completed',
      testDomain,
      testUserProfile,
      resultsCount: careerCards.length,
      sampleResults: careerCards.slice(0, 3)
    });
  } catch (error) {
    console.error('Error testing career data service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test career data service',
      details: error.message
    });
  }
});

export default router;
