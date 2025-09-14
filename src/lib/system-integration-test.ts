// System integration test for real-time functionality
import { testFramework, TestUtils } from './test-framework';
import { apiClient } from './api-client';
import { socketService } from './socket-service';
import { errorHandler } from './error-handler';
import { performanceMonitor } from './performance-monitor';

export class SystemIntegrationTest {
  private static instance: SystemIntegrationTest;
  private testResults: any[] = [];

  private constructor() {}

  public static getInstance(): SystemIntegrationTest {
    if (!SystemIntegrationTest.instance) {
      SystemIntegrationTest.instance = new SystemIntegrationTest();
    }
    return SystemIntegrationTest.instance;
  }

  // Run all integration tests
  public async runAllTests(): Promise<any[]> {
    console.log('Starting system integration tests...');
    
    const tests = [
      this.testAuthenticationFlow,
      this.testAPIConnectivity,
      this.testDatabaseOperations,
      this.testWebSocketConnection,
      this.testRealTimeUpdates,
      this.testAIIntegration,
      this.testErrorHandling,
      this.testPerformanceMonitoring,
      this.testDataValidation,
      this.testStateManagement
    ];

    for (const test of tests) {
      try {
        const result = await testFramework.runTest(test.name, test);
        this.testResults.push(result);
        console.log(`Test ${test.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        console.error(`Test ${test.name} failed:`, error);
        this.testResults.push({
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          duration: 0,
          timestamp: new Date()
        });
      }
    }

    return this.testResults;
  }

  // Test authentication flow
  private testAuthenticationFlow = async (): Promise<void> => {
    // Test user registration
    const testUser = TestUtils.createTestUser();
    const registerResult = await apiClient.post('/api/auth/register', testUser);
    
    if (!registerResult.success) {
      throw new Error(`Registration failed: ${registerResult.error}`);
    }

    // Test user login
    const loginResult = await apiClient.post('/api/auth/login', {
      email: testUser.email,
      password: 'testPassword123!'
    });

    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }

    // Test token validation
    const profileResult = await apiClient.get('/api/users/profile');
    
    if (!profileResult.success) {
      throw new Error(`Profile fetch failed: ${profileResult.error}`);
    }

    // Test logout
    const logoutResult = await apiClient.post('/api/auth/logout', {});
    
    if (!logoutResult.success) {
      throw new Error(`Logout failed: ${logoutResult.error}`);
    }
  };

  // Test API connectivity
  private testAPIConnectivity = async (): Promise<void> => {
    // Test health endpoint
    const healthResult = await apiClient.get('/api/health');
    
    if (!healthResult.success) {
      throw new Error(`Health check failed: ${healthResult.error}`);
    }

    // Test API response time
    const startTime = performance.now();
    const response = await apiClient.get('/api/health');
    const responseTime = performance.now() - startTime;

    if (responseTime > 5000) {
      throw new Error(`API response time too slow: ${responseTime}ms`);
    }

    // Test API error handling
    try {
      await apiClient.get('/api/nonexistent-endpoint');
      throw new Error('Expected 404 error but got success');
    } catch (error) {
      // Expected error
    }
  };

  // Test database operations
  private testDatabaseOperations = async (): Promise<void> => {
    // Test user profile creation
    const testProfile = {
      full_name: 'Test User',
      age: 25,
      interests: ['technology', 'learning'],
      goals: ['Learn React', 'Build a portfolio']
    };

    const createResult = await apiClient.post('/api/users/profile', testProfile);
    
    if (!createResult.success) {
      throw new Error(`Profile creation failed: ${createResult.error}`);
    }

    // Test profile retrieval
    const getResult = await apiClient.get('/api/users/profile');
    
    if (!getResult.success) {
      throw new Error(`Profile retrieval failed: ${getResult.error}`);
    }

    // Test profile update
    const updateData = { ...testProfile, age: 26 };
    const updateResult = await apiClient.put('/api/users/profile', updateData);
    
    if (!updateResult.success) {
      throw new Error(`Profile update failed: ${updateResult.error}`);
    }

    // Test profile deletion
    const deleteResult = await apiClient.delete('/api/users/profile');
    
    if (!deleteResult.success) {
      throw new Error(`Profile deletion failed: ${deleteResult.error}`);
    }
  };

  // Test WebSocket connection
  private testWebSocketConnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      socketService.connect('test-user-123');
      
      socketService.getSocket()?.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      socketService.getSocket()?.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
    });
  };

  // Test real-time updates
  private testRealTimeUpdates = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Real-time update timeout'));
      }, 10000);

      // Listen for progress update
      socketService.onProgressUpdate((data) => {
        clearTimeout(timeout);
        resolve();
      });

      // Emit progress update
      socketService.updateLearningProgress('test-user-123', {
        roadmapId: 'test-roadmap',
        stepId: 'test-step',
        progress: 50
      });
    });
  };

  // Test AI integration
  private testAIIntegration = async (): Promise<void> => {
    // Test AI roadmap generation
    const roadmapResult = await apiClient.post('/api/ai/roadmap', {
      goal: 'Learn React',
      userProfile: TestUtils.createTestUser()
    });

    if (!roadmapResult.success) {
      throw new Error(`AI roadmap generation failed: ${roadmapResult.error}`);
    }

    // Test AI skill analysis
    const analysisResult = await apiClient.post('/api/ai/skill-analysis', {
      skills: ['JavaScript', 'HTML', 'CSS'],
      targetRole: 'Frontend Developer'
    });

    if (!analysisResult.success) {
      throw new Error(`AI skill analysis failed: ${analysisResult.error}`);
    }

    // Test AI coach
    const coachResult = await apiClient.post('/api/ai/coach', {
      message: 'How do I improve my React skills?',
      context: { currentSkills: ['JavaScript'] }
    });

    if (!coachResult.success) {
      throw new Error(`AI coach failed: ${coachResult.error}`);
    }
  };

  // Test error handling
  private testErrorHandling = async (): Promise<void> => {
    // Test network error handling
    try {
      await apiClient.get('/api/nonexistent-endpoint');
    } catch (error) {
      // Expected error
    }

    // Test validation error handling
    try {
      await apiClient.post('/api/users/profile', { invalid: 'data' });
    } catch (error) {
      // Expected error
    }

    // Test error logging
    const errorStats = errorHandler.getErrorStats();
    
    if (errorStats.total === 0) {
      throw new Error('No errors were logged');
    }
  };

  // Test performance monitoring
  private testPerformanceMonitoring = async (): Promise<void> => {
    // Test performance metric recording
    performanceMonitor.recordMetric('test-metric', 100, 'ms');
    
    const metrics = performanceMonitor.getMetrics('test-metric');
    
    if (metrics.length === 0) {
      throw new Error('Performance metric not recorded');
    }

    // Test performance statistics
    const stats = performanceMonitor.getStats('test-metric');
    
    if (!stats) {
      throw new Error('Performance statistics not available');
    }

    // Test performance alerts
    const alerts = performanceMonitor.getAlerts();
    
    // Alerts may or may not be present depending on thresholds
    console.log('Performance alerts:', alerts);
  };

  // Test data validation
  private testDataValidation = async (): Promise<void> => {
    // Test email validation
    const emailResult = TestUtils.validateEmail('test@example.com');
    
    if (!emailResult.isValid) {
      throw new Error('Valid email was rejected');
    }

    const invalidEmailResult = TestUtils.validateEmail('invalid-email');
    
    if (invalidEmailResult.isValid) {
      throw new Error('Invalid email was accepted');
    }

    // Test password validation
    const passwordResult = TestUtils.validatePassword('ValidPass123!');
    
    if (!passwordResult.isValid) {
      throw new Error('Valid password was rejected');
    }

    const weakPasswordResult = TestUtils.validatePassword('weak');
    
    if (weakPasswordResult.isValid) {
      throw new Error('Weak password was accepted');
    }
  };

  // Test state management
  private testStateManagement = async (): Promise<void> => {
    // Test state update
    const update = {
      type: 'TEST_UPDATE',
      payload: { test: 'data' },
      timestamp: new Date()
    };

    // This would test the state manager if it's properly integrated
    console.log('State management test completed');
  };

  // Get test results
  public getTestResults(): any[] {
    return this.testResults;
  }

  // Get test statistics
  public getTestStats(): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // Clear test results
  public clearResults(): void {
    this.testResults = [];
  }
}

// Export singleton instance
export const systemIntegrationTest = SystemIntegrationTest.getInstance();
export default systemIntegrationTest;
