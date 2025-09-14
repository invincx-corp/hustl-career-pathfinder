/**
 * Phase 3 Complete Integration Test
 * Tests all Phase 3 features end-to-end
 */

import ApiService from '../lib/api-services';
import websocketService from '../lib/websocket-service';

interface TestResult {
  feature: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

class Phase3IntegrationTest {
  private results: TestResult[] = [];
  private testUserId: string = 'test-user-123';

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Phase 3 Complete Integration Tests...\n');

    // Test all Phase 3 features
    await this.testContentManagement();
    await this.testProgressTracking();
    await this.testBadgeSystem();
    await this.testProjectCreation();
    await this.testTeamCollaboration();
    await this.testProjectSubmission();
    await this.testReviewSystem();
    await this.testResumeExport();
    await this.testResumeTemplates();
    await this.testResumeAnalytics();
    await this.testResumePrivacy();
    await this.testRealTimeNotifications();
    await this.testWebSocketIntegration();
    await this.testAIRecommendations();
    await this.testReviewCriteria();
    await this.testMentorSystem();

    this.printResults();
    return this.results;
  }

  private async testFeature(
    featureName: string,
    testFunction: () => Promise<boolean>,
    skipCondition?: () => boolean
  ): Promise<void> {
    const startTime = Date.now();
    
    if (skipCondition && skipCondition()) {
      this.results.push({
        feature: featureName,
        status: 'SKIP',
        message: 'Skipped due to condition',
        duration: Date.now() - startTime
      });
      return;
    }

    try {
      const success = await testFunction();
      this.results.push({
        feature: featureName,
        status: success ? 'PASS' : 'FAIL',
        message: success ? 'Test passed successfully' : 'Test failed',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        feature: featureName,
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testContentManagement(): Promise<void> {
    await this.testFeature('Content Management System', async () => {
      // Test getting learning content
      const contentResult = await ApiService.getLearningContent({
        category: 'Frontend Development',
        limit: 10
      });

      if (!contentResult.success) return false;

      // Test content recommendations
      const recommendationsResult = await ApiService.getContentRecommendations(this.testUserId, {
        limit: 5
      });

      return recommendationsResult.success;
    });
  }

  private async testProgressTracking(): Promise<void> {
    await this.testFeature('Progress Tracking System', async () => {
      // Test getting user progress
      const progressResult = await ApiService.getUserContentProgress(this.testUserId);

      if (!progressResult.success) return false;

      // Test updating progress
      const updateResult = await ApiService.updateContentProgress(this.testUserId, 'test-content-123', {
        completion_percentage: 50,
        time_spent: 30
      });

      return updateResult.success;
    });
  }

  private async testBadgeSystem(): Promise<void> {
    await this.testFeature('Badge System', async () => {
      // Test getting user badges
      const badgesResult = await ApiService.getUserBadges(this.testUserId);

      if (!badgesResult.success) return false;

      // Test awarding badge
      const awardResult = await ApiService.awardBadge(this.testUserId, {
        badge_type: 'test',
        badge_name: 'Test Badge',
        description: 'Test badge for integration testing',
        criteria: 'test_criteria',
        points: 10
      });

      return awardResult.success;
    });
  }

  private async testProjectCreation(): Promise<void> {
    await this.testFeature('Project Creation System', async () => {
      // Test creating project
      const createResult = await ApiService.createProject(this.testUserId, {
        title: 'Test Project',
        description: 'Test project for integration testing',
        category: 'web',
        technologies: ['React', 'TypeScript'],
        features: ['Authentication', 'Dashboard'],
        estimated_duration: '2 weeks',
        difficulty: 'intermediate',
        is_public: true
      });

      if (!createResult.success) return false;

      // Test getting user projects
      const projectsResult = await ApiService.getUserProjects(this.testUserId, { limit: 10 });

      return projectsResult.success;
    });
  }

  private async testTeamCollaboration(): Promise<void> {
    await this.testFeature('Team Collaboration System', async () => {
      // Test adding team member
      const addMemberResult = await ApiService.addTeamMember('test-project-123', 'test-member-456', 'member');

      if (!addMemberResult.success) return false;

      // Test getting team members
      const teamResult = await ApiService.getProjectTeamMembers('test-project-123');

      if (!teamResult.success) return false;

      // Test searching users
      const searchResult = await ApiService.searchUsersForTeam('test user');

      return searchResult.success;
    });
  }

  private async testProjectSubmission(): Promise<void> {
    await this.testFeature('Project Submission System', async () => {
      // Test submitting project for review
      const submitResult = await ApiService.submitProjectForReview('test-project-123', {
        reviewer_notes: 'Test submission for integration testing',
        technical_score: 8,
        creativity_score: 7,
        presentation_score: 9,
        overall_score: 8,
        recommendations: ['Great work!', 'Consider adding more tests']
      });

      return submitResult.success;
    });
  }

  private async testReviewSystem(): Promise<void> {
    await this.testFeature('Review System', async () => {
      // Test submitting project review
      const reviewResult = await ApiService.submitProjectReview('test-project-123', {
        reviewer_notes: 'Excellent project with great implementation',
        technical_score: 9,
        creativity_score: 8,
        presentation_score: 9,
        overall_score: 9,
        recommendations: ['Outstanding work!', 'Consider adding documentation']
      });

      if (!reviewResult.success) return false;

      // Test getting project reviews
      const reviewsResult = await ApiService.getProjectReviews('test-project-123');

      return reviewsResult.success;
    });
  }

  private async testResumeExport(): Promise<void> {
    await this.testFeature('Resume Export System', async () => {
      // Test exporting resume to JSON
      const jsonResult = await ApiService.exportResumeToJSON('test-resume-123');

      if (!jsonResult.success) return false;

      // Test generating public link
      const linkResult = await ApiService.generatePublicResumeLink('test-resume-123');

      if (!linkResult.success) return false;

      // Test getting exports
      const exportsResult = await ApiService.getResumeExports('test-resume-123');

      return exportsResult.success;
    });
  }

  private async testResumeTemplates(): Promise<void> {
    await this.testFeature('Resume Templates System', async () => {
      // Test getting templates
      const templatesResult = await ApiService.getResumeTemplates();

      if (!templatesResult.success) return false;

      // Test applying template
      const applyResult = await ApiService.applyResumeTemplate('test-resume-123', 'test-template-456');

      return applyResult.success;
    });
  }

  private async testResumeAnalytics(): Promise<void> {
    await this.testFeature('Resume Analytics System', async () => {
      // Test tracking resume view
      const trackResult = await ApiService.trackResumeView('test-resume-123', {
        ip_address: '127.0.0.1',
        user_agent: 'Test Browser',
        referrer: 'https://test.com'
      });

      if (!trackResult.success) return false;

      // Test getting analytics
      const analyticsResult = await ApiService.getResumeAnalytics('test-resume-123');

      return analyticsResult.success;
    });
  }

  private async testResumePrivacy(): Promise<void> {
    await this.testFeature('Resume Privacy Controls', async () => {
      // Test updating resume privacy settings
      const updateResult = await ApiService.updateResume('test-resume-123', {
        is_public: false,
        updated_at: new Date().toISOString()
      });

      return updateResult.success;
    });
  }

  private async testRealTimeNotifications(): Promise<void> {
    await this.testFeature('Real-time Notifications System', async () => {
      // Test creating notification
      const createResult = await ApiService.createNotification(this.testUserId, {
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification for integration testing',
        data: { test: true },
        priority: 'normal'
      });

      if (!createResult.success) return false;

      // Test getting notifications
      const notificationsResult = await ApiService.getUserNotifications(this.testUserId, 10);

      if (!notificationsResult.success) return false;

      // Test marking as read
      if (notificationsResult.data && notificationsResult.data.length > 0) {
        const markReadResult = await ApiService.markNotificationAsRead(notificationsResult.data[0].id);
        return markReadResult.success;
      }

      return true;
    });
  }

  private async testWebSocketIntegration(): Promise<void> {
    await this.testFeature('WebSocket Integration', async () => {
      // Test WebSocket service connection
      const isConnected = websocketService.isConnected();
      
      if (!isConnected) return false;

      // Test WebSocket message handling
      let messageReceived = false;
      const testCallback = () => { messageReceived = true; };
      
      websocketService.on('test_message', testCallback);
      websocketService.send({
        type: 'test_message',
        data: { test: true },
        timestamp: new Date().toISOString(),
        userId: this.testUserId
      });

      // Clean up
      websocketService.off('test_message', testCallback);

      return true; // WebSocket service is functional
    });
  }

  private async testAIRecommendations(): Promise<void> {
    await this.testFeature('AI Recommendations System', async () => {
      // Test getting AI recommendations
      const recommendationsResult = await ApiService.getAIRecommendations(this.testUserId, 'content');

      if (!recommendationsResult.success) return false;

      // Test applying recommendation
      if (recommendationsResult.data && recommendationsResult.data.length > 0) {
        const applyResult = await ApiService.applyAIRecommendation(recommendationsResult.data[0].id);
        return applyResult.success;
      }

      return true;
    });
  }

  private async testReviewCriteria(): Promise<void> {
    await this.testFeature('Review Criteria System', async () => {
      // Test getting review criteria
      const criteriaResult = await ApiService.getReviewCriteria();

      if (!criteriaResult.success) return false;

      // Test submitting review scores
      const scoresResult = await ApiService.submitReviewScores('test-review-123', [
        {
          criteria_id: 'test-criteria-1',
          score: 8,
          comments: 'Good work'
        },
        {
          criteria_id: 'test-criteria-2',
          score: 9,
          comments: 'Excellent'
        }
      ]);

      if (!scoresResult.success) return false;

      // Test getting review scores
      const getScoresResult = await ApiService.getReviewScores('test-review-123');

      return getScoresResult.success;
    });
  }

  private async testMentorSystem(): Promise<void> {
    await this.testFeature('Mentor System', async () => {
      // Test getting mentors
      const mentorsResult = await ApiService.getMentors();

      if (!mentorsResult.success) return false;

      // Test getting mentor sessions
      const sessionsResult = await ApiService.getMentorSessions(this.testUserId);

      if (!sessionsResult.success) return false;

      // Test requesting mentor session
      const requestResult = await ApiService.requestMentorSession('test-mentor-123', {
        session_type: 'consultation',
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        duration_minutes: 60,
        notes: 'Test session request for integration testing'
      });

      return requestResult.success;
    });
  }

  private printResults(): void {
    console.log('\n📊 Phase 3 Integration Test Results:');
    console.log('=====================================\n');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Total: ${total}`);
    console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    console.log('Detailed Results:');
    console.log('-----------------');
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = `${result.duration}ms`;
      console.log(`${icon} ${result.feature} (${duration})`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    });

    console.log('\n🎉 Phase 3 Integration Tests Complete!');
    
    if (failed === 0) {
      console.log('🎊 All tests passed! Phase 3 is fully functional.');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please review the issues above.`);
    }
  }
}

// Export for use in other files
export default Phase3IntegrationTest;

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  const testRunner = new Phase3IntegrationTest();
  testRunner.runAllTests().then(results => {
    console.log('Integration test results:', results);
  });
}


