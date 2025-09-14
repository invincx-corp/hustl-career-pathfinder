// Test script to verify Phase 3 AI integration is working
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testPhase3AIIntegration() {
  console.log('🧪 Testing Phase 3 AI Integration...\n');

  try {
    // Test 1: AI Learning Recommendations (Phase 3 Core Feature)
    console.log('1. Testing AI Learning Recommendations...');
    const recResponse = await fetch(`${API_BASE_URL}/ai/recommendations/test-user-123?type=all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (recResponse.ok) {
      const recData = await recResponse.json();
      console.log('✅ AI Learning Recommendations successful');
      console.log(`   Courses: ${recData.recommendations?.courses?.length || 0}`);
      console.log(`   Projects: ${recData.recommendations?.projects?.length || 0}`);
      console.log(`   Resources: ${recData.recommendations?.resources?.length || 0}`);
      console.log(`   Mentors: ${recData.recommendations?.mentors?.length || 0}`);
    } else {
      console.log('❌ AI Learning Recommendations failed:', recResponse.status);
    }

    // Test 2: AI Project Suggestions (Phase 3 Core Feature)
    console.log('\n2. Testing AI Project Suggestions...');
    const projectResponse = await fetch(`${API_BASE_URL}/ai/projects/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userProfile: {
          experience_level: 'intermediate',
          skills: ['JavaScript', 'React', 'Node.js'],
          interests: ['Web Development', 'Full-Stack Development'],
          goals: ['Build a portfolio', 'Get a developer job']
        },
        projectType: 'all'
      })
    });

    if (projectResponse.ok) {
      const projectData = await projectResponse.json();
      console.log('✅ AI Project Suggestions successful');
      console.log(`   Projects suggested: ${projectData.suggestions?.projects?.length || 0}`);
      if (projectData.suggestions?.projects?.length > 0) {
        console.log(`   Top project: ${projectData.suggestions.projects[0].title}`);
        console.log(`   Difficulty: ${projectData.suggestions.projects[0].difficulty}`);
        console.log(`   Estimated time: ${projectData.suggestions.projects[0].estimatedTime}`);
        console.log(`   Match score: ${projectData.suggestions.projects[0].matchScore}%`);
      }
    } else {
      console.log('❌ AI Project Suggestions failed:', projectResponse.status);
    }

    // Test 3: AI Review Feedback (Phase 3 Core Feature)
    console.log('\n3. Testing AI Review Feedback...');
    const reviewResponse = await fetch(`${API_BASE_URL}/ai/reviews/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectData: {
          title: 'Personal Portfolio Website',
          description: 'A responsive portfolio website built with React and Tailwind CSS',
          technologies: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
          skills: ['Frontend Development', 'Responsive Design', 'React Hooks']
        },
        reviewCriteria: {
          codeQuality: 'High',
          functionality: 'Complete',
          design: 'Good',
          documentation: 'Basic'
        }
      })
    });

    if (reviewResponse.ok) {
      const reviewData = await reviewResponse.json();
      console.log('✅ AI Review Feedback successful');
      console.log(`   Overall score: ${reviewData.feedback?.overallScore || 0}/10`);
      console.log(`   Strengths: ${reviewData.feedback?.strengths?.length || 0} identified`);
      console.log(`   Improvements: ${reviewData.feedback?.improvements?.length || 0} suggested`);
      console.log(`   Technical feedback: ${reviewData.feedback?.technicalFeedback?.substring(0, 100)}...`);
      console.log(`   Next steps: ${reviewData.feedback?.nextSteps?.length || 0} recommended`);
    } else {
      console.log('❌ AI Review Feedback failed:', reviewResponse.status);
    }

    // Test 4: AI Content Recommendations (Phase 3 Feature)
    console.log('\n4. Testing AI Content Recommendations...');
    const contentRecResponse = await fetch(`${API_BASE_URL}/ai/recommendations/test-user-123?type=courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (contentRecResponse.ok) {
      const contentRecData = await contentRecResponse.json();
      console.log('✅ AI Content Recommendations successful');
      console.log(`   Course recommendations: ${contentRecData.recommendations?.courses?.length || 0}`);
      if (contentRecData.recommendations?.courses?.length > 0) {
        console.log(`   Top course: ${contentRecData.recommendations.courses[0].title}`);
        console.log(`   Provider: ${contentRecData.recommendations.courses[0].provider}`);
        console.log(`   Duration: ${contentRecData.recommendations.courses[0].duration}`);
        console.log(`   Match score: ${contentRecData.recommendations.courses[0].matchScore}%`);
      }
    } else {
      console.log('❌ AI Content Recommendations failed:', contentRecResponse.status);
    }

    // Test 5: AI Resource Recommendations (Phase 3 Feature)
    console.log('\n5. Testing AI Resource Recommendations...');
    const resourceRecResponse = await fetch(`${API_BASE_URL}/ai/recommendations/test-user-123?type=resources`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (resourceRecResponse.ok) {
      const resourceRecData = await resourceRecResponse.json();
      console.log('✅ AI Resource Recommendations successful');
      console.log(`   Resource recommendations: ${resourceRecData.recommendations?.resources?.length || 0}`);
      if (resourceRecData.recommendations?.resources?.length > 0) {
        console.log(`   Top resource: ${resourceRecData.recommendations.resources[0].title}`);
        console.log(`   Type: ${resourceRecData.recommendations.resources[0].type}`);
        console.log(`   Match score: ${resourceRecData.recommendations.resources[0].matchScore}%`);
      }
    } else {
      console.log('❌ AI Resource Recommendations failed:', resourceRecResponse.status);
    }

    console.log('\n🎉 Phase 3 AI Integration test completed!');
    console.log('\n📊 Summary:');
    console.log('   - AI Learning Recommendations: Personalized content suggestions');
    console.log('   - AI Project Suggestions: Intelligent project recommendations');
    console.log('   - AI Review Feedback: Constructive project feedback');
    console.log('   - AI Content Recommendations: Course and resource suggestions');
    console.log('   - AI Resource Recommendations: Learning material suggestions');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhase3AIIntegration();
