// Test script to verify AI integration is working
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testAIIntegration() {
  console.log('🧪 Testing AI Integration...\n');

  try {
    // Test 1: AI Roadmap Generation
    console.log('1. Testing AI Roadmap Generation...');
    const roadmapResponse = await fetch(`${API_BASE_URL}/ai/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: 'Become a Full Stack Developer',
        category: 'Web Development',
        difficulty: 'beginner',
        userProfile: {
          experience_level: 'beginner',
          skills: ['HTML', 'CSS'],
          interests: ['Web Development', 'JavaScript'],
          goals: ['Get a job as a developer']
        }
      })
    });

    if (roadmapResponse.ok) {
      const roadmapData = await roadmapResponse.json();
      console.log('✅ Roadmap generation successful');
      console.log(`   Generated ${roadmapData.roadmap?.steps?.length || 0} steps`);
      console.log(`   Estimated time: ${roadmapData.roadmap?.estimatedTime || 'N/A'}`);
    } else {
      console.log('❌ Roadmap generation failed:', roadmapResponse.status);
    }

    // Test 2: AI Career Coach Chat
    console.log('\n2. Testing AI Career Coach Chat...');
    const chatResponse = await fetch(`${API_BASE_URL}/ai/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        message: 'I want to learn React but I feel overwhelmed. Where should I start?',
        context: {
          userProfile: {
            experience_level: 'beginner',
            skills: ['HTML', 'CSS'],
            interests: ['Web Development'],
            goals: ['Learn React']
          },
          currentSkills: ['HTML', 'CSS'],
          goals: ['Learn React'],
          experienceLevel: 'beginner'
        }
      })
    });

    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Career coach chat successful');
      console.log(`   Response: ${chatData.response?.content?.substring(0, 100)}...`);
      console.log(`   Sentiment: ${chatData.response?.sentiment?.sentiment || 'N/A'}`);
      console.log(`   Suggestions: ${chatData.response?.suggestions?.length || 0}`);
    } else {
      console.log('❌ Career coach chat failed:', chatResponse.status);
    }

    // Test 3: Skill Gap Analysis
    console.log('\n3. Testing Skill Gap Analysis...');
    const skillResponse = await fetch(`${API_BASE_URL}/ai/skills/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        currentSkills: ['HTML', 'CSS', 'JavaScript'],
        targetRole: 'Frontend Developer',
        userProfile: {
          experience_level: 'beginner',
          skills: ['HTML', 'CSS', 'JavaScript'],
          interests: ['Web Development'],
          goals: ['Become a Frontend Developer']
        }
      })
    });

    if (skillResponse.ok) {
      const skillData = await skillResponse.json();
      console.log('✅ Skill gap analysis successful');
      console.log(`   Missing skills: ${skillData.analysis?.missingSkills?.length || 0}`);
      console.log(`   Priority skills: ${skillData.analysis?.prioritySkills?.length || 0}`);
      console.log(`   Current skill level: ${skillData.analysis?.currentSkillLevel || 0}%`);
    } else {
      console.log('❌ Skill gap analysis failed:', skillResponse.status);
    }

    console.log('\n🎉 AI Integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAIIntegration();
