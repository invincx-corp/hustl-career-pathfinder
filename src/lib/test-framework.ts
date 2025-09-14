// Testing framework for real-time functionality
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  timestamp: Date;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestFunction[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export type TestFunction = () => Promise<void> | void;

export class TestFramework {
  private static instance: TestFramework;
  private results: TestResult[] = [];
  private isRunning = false;

  private constructor() {}

  public static getInstance(): TestFramework {
    if (!TestFramework.instance) {
      TestFramework.instance = new TestFramework();
    }
    return TestFramework.instance;
  }

  // Run a single test
  public async runTest(name: string, testFn: TestFunction): Promise<TestResult> {
    const start = performance.now();
    const result: TestResult = {
      name,
      passed: false,
      duration: 0,
      timestamp: new Date()
    };

    try {
      await testFn();
      result.passed = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    } finally {
      result.duration = performance.now() - start;
      this.results.push(result);
    }

    return result;
  }

  // Run a test suite
  public async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Setup
      if (suite.setup) {
        await suite.setup();
      }

      // Run tests
      for (const test of suite.tests) {
        const result = await this.runTest(`${suite.name}.${test.name}`, test);
        results.push(result);
      }

      // Teardown
      if (suite.teardown) {
        await suite.teardown();
      }
    } catch (error) {
      console.error(`Test suite ${suite.name} failed:`, error);
    }

    return results;
  }

  // Run all tests
  public async runAllTests(suites: TestSuite[]): Promise<TestResult[]> {
    this.isRunning = true;
    const allResults: TestResult[] = [];

    try {
      for (const suite of suites) {
        const results = await this.runTestSuite(suite);
        allResults.push(...results);
      }
    } finally {
      this.isRunning = false;
    }

    return allResults;
  }

  // Get test results
  public getResults(): TestResult[] {
    return [...this.results];
  }

  // Get test statistics
  public getStats(): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    averageDuration: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    const averageDuration = total > 0 
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / total 
      : 0;

    return {
      total,
      passed,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration: Math.round(averageDuration * 100) / 100
    };
  }

  // Clear results
  public clearResults(): void {
    this.results = [];
  }

  // Check if tests are running
  public isTestRunning(): boolean {
    return this.isRunning;
  }
}

// Test utilities
export class TestUtils {
  // Wait for a condition to be true
  static async waitFor(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  // Wait for an element to exist
  static async waitForElement(
    selector: string,
    timeout: number = 5000
  ): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  // Mock API response
  static mockAPIResponse<T>(data: T, delay: number = 0): Promise<T> {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  }

  // Mock API error
  static mockAPIError(message: string, delay: number = 0): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), delay);
    });
  }

  // Create test data
  static createTestUser(): any {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      age: 25,
      interests: ['technology', 'learning'],
      goals: ['Learn React', 'Build a portfolio'],
      skill_level: 'intermediate'
    };
  }

  static createTestProject(): any {
    return {
      id: 'test-project-123',
      title: 'Test Project',
      description: 'A test project for testing purposes',
      category: 'web-development',
      difficulty: 'intermediate',
      skills: ['React', 'TypeScript'],
      status: 'in-progress'
    };
  }

  static createTestRoadmap(): any {
    return {
      id: 'test-roadmap-123',
      title: 'Test Roadmap',
      description: 'A test roadmap for testing purposes',
      category: 'web-development',
      steps: [
        { id: '1', title: 'Step 1', description: 'First step' },
        { id: '2', title: 'Step 2', description: 'Second step' }
      ],
      difficulty: 'intermediate'
    };
  }
}

// Predefined test suites
export const testSuites: TestSuite[] = [
  {
    name: 'Authentication',
    tests: [
      async () => {
        // Test user login
        const user = TestUtils.createTestUser();
        // Add actual login test logic here
        console.log('Testing user login...');
      },
      async () => {
        // Test user registration
        const user = TestUtils.createTestUser();
        // Add actual registration test logic here
        console.log('Testing user registration...');
      }
    ]
  },
  {
    name: 'API Integration',
    tests: [
      async () => {
        // Test API connectivity
        console.log('Testing API connectivity...');
      },
      async () => {
        // Test data fetching
        console.log('Testing data fetching...');
      }
    ]
  },
  {
    name: 'Real-time Features',
    tests: [
      async () => {
        // Test WebSocket connection
        console.log('Testing WebSocket connection...');
      },
      async () => {
        // Test real-time updates
        console.log('Testing real-time updates...');
      }
    ]
  },
  {
    name: 'UI Components',
    tests: [
      async () => {
        // Test component rendering
        console.log('Testing component rendering...');
      },
      async () => {
        // Test user interactions
        console.log('Testing user interactions...');
      }
    ]
  }
];

// Export singleton instance
export const testFramework = TestFramework.getInstance();
export default testFramework;
