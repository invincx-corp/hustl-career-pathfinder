// Test script to verify Phase 2 AI integration is working
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testPhase2AIIntegration() {
  console.log('🧪 Testing Phase 2 AI Integration...\n');

  try {
    // Test 1: AI Roadmap Generation (Phase 2 Core Feature)
    console.log('1. Testing AI Roadmap Generation...');
    const roadmapResponse = await fetch(`${API_BASE_URL}/ai/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: 'Become a Frontend Developer',
        category: 'Web Development',
        difficulty: 'beginner',
        userProfile: {
          experience_level: 'beginner',
          skills: ['HTML', 'CSS'],
          interests: ['Web Development', 'JavaScript'],
          goals: ['Get a job as a frontend developer']
        }
      })
    });

    if (roadmapResponse.ok) {
      const roadmapData = await roadmapResponse.json();
      console.log('✅ Roadmap generation successful');
      console.log(`   Generated ${roadmapData.roadmap?.steps?.length || 0} steps`);
      console.log(`   Estimated time: ${roadmapData.roadmap?.estimatedTime || 'N/A'}`);
      console.log(`   Skills to learn: ${roadmapData.roadmap?.skills?.join(', ') || 'N/A'}`);
    } else {
      console.log('❌ Roadmap generation failed:', roadmapResponse.status);
    }

    // Test 2: Skill Gap Analysis (Phase 2 Core Feature)
    console.log('\n2. Testing Skill Gap Analysis...');
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
      console.log(`   Priority skills: ${skillData.analysis?.prioritySkills?.join(', ') || 'N/A'}`);
      console.log(`   Current skill level: ${skillData.analysis?.currentSkillLevel || 0}%`);
      console.log(`   Estimated time: ${skillData.analysis?.estimatedTime || 'N/A'}`);
    } else {
      console.log('❌ Skill gap analysis failed:', skillResponse.status);
    }

    // Test 3: AI Career Coach Chat (Phase 2 Core Feature)
    console.log('\n3. Testing AI Career Coach Chat...');
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
      console.log(`   Action items: ${chatData.response?.actionItems?.length || 0}`);
    } else {
      console.log('❌ Career coach chat failed:', chatResponse.status);
    }

    // Test 4: Personalized Recommendations (Phase 2 Feature)
    console.log('\n4. Testing Personalized Recommendations...');
    const recResponse = await fetch(`${API_BASE_URL}/ai/recommendations/test-user-123?type=all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (recResponse.ok) {
      const recData = await recResponse.json();
      console.log('✅ Personalized recommendations successful');
      console.log(`   Courses: ${recData.recommendations?.courses?.length || 0}`);
      console.log(`   Projects: ${recData.recommendations?.projects?.length || 0}`);
      console.log(`   Resources: ${recData.recommendations?.resources?.length || 0}`);
    } else {
      console.log('❌ Personalized recommendations failed:', recResponse.status);
    }

    // Test 5: Career Path Suggestions (Phase 2 Feature)
    console.log('\n5. Testing Career Path Suggestions...');
    const careerResponse = await fetch(`${API_BASE_URL}/ai/career/paths`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        interests: ['Web Development', 'JavaScript'],
        skills: ['HTML', 'CSS', 'JavaScript'],
        goals: ['Get a job as a developer'],
        experienceLevel: 'beginner'
      })
    });

    if (careerResponse.ok) {
      const careerData = await careerResponse.json();
      console.log('✅ Career path suggestions successful');
      console.log(`   Career paths: ${careerData.careerPaths?.length || 0}`);
      if (careerData.careerPaths?.length > 0) {
        console.log(`   Top match: ${careerData.careerPaths[0].title} (${careerData.careerPaths[0].matchScore}% match)`);
      }
    } else {
      console.log('❌ Career path suggestions failed:', careerResponse.status);
    }

    console.log('\n🎉 Phase 2 AI Integration test completed!');
    console.log('\n📊 Summary:');
    console.log('   - AI Roadmap Generation: Real AI-powered learning paths');
    console.log('   - Skill Gap Analysis: Intelligent skill assessment');
    console.log('   - Career Coach Chat: Empathetic AI responses with sentiment analysis');
    console.log('   - Personalized Recommendations: AI-curated content suggestions');
    console.log('   - Career Path Suggestions: AI-powered career guidance');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhase2AIIntegration();
