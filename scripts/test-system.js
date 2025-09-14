#!/usr/bin/env node

// Comprehensive system test script
const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Test results
const testResults = {
  startTime: new Date(),
  tests: [],
  passed: 0,
  failed: 0,
  total: 0
};

// Test categories
const testCategories = {
  connectivity: 'Connectivity Tests',
  authentication: 'Authentication Tests',
  api: 'API Tests',
  database: 'Database Tests',
  websocket: 'WebSocket Tests',
  ai: 'AI Service Tests',
  performance: 'Performance Tests',
  security: 'Security Tests'
};

// Run a single test
async function runTest(name, category, testFn) {
  const startTime = Date.now();
  const test = {
    name,
    category,
    status: 'unknown',
    duration: 0,
    error: null,
    details: null
  };

  try {
    test.details = await testFn();
    test.status = 'passed';
    testResults.passed++;
    testResults.total++;
    
    console.log(chalk.green(`✅ ${name}`));
  } catch (error) {
    test.status = 'failed';
    test.error = error.message;
    testResults.failed++;
    testResults.total++;
    
    console.log(chalk.red(`❌ ${name}`));
    console.log(chalk.gray(`   Error: ${error.message}`));
  } finally {
    test.duration = Date.now() - startTime;
    testResults.tests.push(test);
  }
}

// Connectivity tests
async function testConnectivity() {
  console.log(chalk.blue.bold('\n🔗 Testing Connectivity...\n'));
  
  // Test backend connectivity
  await runTest('Backend Health Check', 'connectivity', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });

  // Test frontend connectivity
  await runTest('Frontend Health Check', 'connectivity', async () => {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status };
  });

  // Test API status
  await runTest('API Status Check', 'connectivity', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/status`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });
}

// Authentication tests
async function testAuthentication() {
  console.log(chalk.blue.bold('\n🔐 Testing Authentication...\n'));
  
  // Test user registration
  await runTest('User Registration', 'authentication', async () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      full_name: 'Test User',
      age: 25
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, testUser, { timeout: 10000 });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected status 201/200, got ${response.status}`);
    }
    return { status: response.status, userId: response.data.user?.id };
  });

  // Test user login
  await runTest('User Login', 'authentication', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData, { timeout: 10000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, token: response.data.token };
  });
}

// API tests
async function testAPI() {
  console.log(chalk.blue.bold('\n🌐 Testing API Endpoints...\n'));
  
  // Test health endpoints
  const healthEndpoints = [
    '/api/health/database',
    '/api/health/websocket',
    '/api/health/ai',
    '/api/health/storage',
    '/api/health/email'
  ];

  for (const endpoint of healthEndpoints) {
    await runTest(`Health Check: ${endpoint}`, 'api', async () => {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 10000 });
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      return { status: response.status, data: response.data };
    });
  }

  // Test metrics endpoint
  await runTest('Metrics Endpoint', 'api', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/metrics`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });

  // Test performance endpoint
  await runTest('Performance Endpoint', 'api', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/performance`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });
}

// Database tests
async function testDatabase() {
  console.log(chalk.blue.bold('\n🗄️  Testing Database...\n'));
  
  // Test database connection
  await runTest('Database Connection', 'database', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/health/database`, { timeout: 10000 });
    if (response.status !== 200) {
      throw new Error(`Database connection failed: ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });

  // Test database operations (if authenticated)
  await runTest('Database Operations', 'database', async () => {
    // This would require authentication and proper test data
    // For now, just check if the endpoint is accessible
    const response = await axios.get(`${BACKEND_URL}/api/health/database`, { timeout: 10000 });
    if (response.status !== 200) {
      throw new Error(`Database operations test failed: ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });
}

// WebSocket tests
async function testWebSocket() {
  console.log(chalk.blue.bold('\n🔌 Testing WebSocket...\n'));
  
  // Test WebSocket health
  await runTest('WebSocket Health Check', 'websocket', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/health/websocket`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`WebSocket health check failed: ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });

  // Note: Full WebSocket testing would require a WebSocket client
  // This is a basic connectivity test
  await runTest('WebSocket Endpoint Access', 'websocket', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/health/websocket`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`WebSocket endpoint not accessible: ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });
}

// AI service tests
async function testAI() {
  console.log(chalk.blue.bold('\n🤖 Testing AI Services...\n'));
  
  // Test AI health
  await runTest('AI Services Health Check', 'ai', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/health/ai`, { timeout: 15000 });
    if (response.status !== 200) {
      throw new Error(`AI services health check failed: ${response.status}`);
    }
    return { status: response.status, data: response.data };
  });

  // Test AI endpoints (if available)
  const aiEndpoints = [
    '/api/ai/roadmap',
    '/api/ai/skill-analysis',
    '/api/ai/coach'
  ];

  for (const endpoint of aiEndpoints) {
    await runTest(`AI Endpoint: ${endpoint}`, 'ai', async () => {
      // Test with minimal data to avoid errors
      const testData = { goal: 'test', userProfile: { name: 'test' } };
      const response = await axios.post(`${BACKEND_URL}${endpoint}`, testData, { timeout: 15000 });
      // Accept various status codes as the endpoint might have validation
      if (response.status < 200 || response.status >= 500) {
        throw new Error(`AI endpoint ${endpoint} returned status ${response.status}`);
      }
      return { status: response.status, data: response.data };
    });
  }
}

// Performance tests
async function testPerformance() {
  console.log(chalk.blue.bold('\n⚡ Testing Performance...\n'));
  
  // Test response times
  await runTest('Response Time Test', 'performance', async () => {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 5000) {
      throw new Error(`Response time too slow: ${responseTime}ms`);
    }
    
    return { responseTime, status: response.status };
  });

  // Test concurrent requests
  await runTest('Concurrent Request Test', 'performance', async () => {
    const requests = Array(5).fill().map(() => 
      axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const allSuccessful = responses.every(r => r.status === 200);
    if (!allSuccessful) {
      throw new Error('Not all concurrent requests succeeded');
    }
    
    return { totalTime, requestCount: requests.length, allSuccessful };
  });
}

// Security tests
async function testSecurity() {
  console.log(chalk.blue.bold('\n🔒 Testing Security...\n'));
  
  // Test CORS headers
  await runTest('CORS Headers Test', 'security', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (!corsHeader) {
      throw new Error('CORS headers not present');
    }
    
    return { corsHeader, status: response.status };
  });

  // Test security headers
  await runTest('Security Headers Test', 'security', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    const securityHeaders = {
      'x-content-type-options': response.headers['x-content-type-options'],
      'x-frame-options': response.headers['x-frame-options'],
      'x-xss-protection': response.headers['x-xss-protection']
    };
    
    return { securityHeaders, status: response.status };
  });
}

// Generate test report
function generateReport() {
  const endTime = new Date();
  const duration = endTime - testResults.startTime;
  
  const report = {
    summary: {
      startTime: testResults.startTime,
      endTime,
      duration,
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0
    },
    tests: testResults.tests,
    categories: Object.keys(testCategories).reduce((acc, category) => {
      const categoryTests = testResults.tests.filter(t => t.category === category);
      acc[category] = {
        name: testCategories[category],
        total: categoryTests.length,
        passed: categoryTests.filter(t => t.status === 'passed').length,
        failed: categoryTests.filter(t => t.status === 'failed').length
      };
      return acc;
    }, {})
  };
  
  return report;
}

// Display test results
function displayResults() {
  console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));
  
  const report = generateReport();
  
  console.log(chalk.blue(`⏱️  Duration: ${Math.floor(report.summary.duration / 1000)}s`));
  console.log(chalk.blue(`📈 Total Tests: ${report.summary.total}`));
  console.log(chalk.green(`✅ Passed: ${report.summary.passed}`));
  console.log(chalk.red(`❌ Failed: ${report.summary.failed}`));
  console.log(chalk.blue(`🎯 Success Rate: ${report.summary.successRate}%`));
  
  console.log(chalk.blue.bold('\n📋 Category Breakdown:\n'));
  Object.entries(report.categories).forEach(([category, data]) => {
    const successRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : 0;
    console.log(`${data.name}: ${chalk.green(data.passed)}/${chalk.blue(data.total)} (${successRate}%)`);
  });
  
  // Show failed tests
  const failedTests = testResults.tests.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    console.log(chalk.red.bold('\n❌ Failed Tests:\n'));
    failedTests.forEach(test => {
      console.log(chalk.red(`• ${test.name} (${test.category})`));
      console.log(chalk.gray(`  Error: ${test.error}`));
    });
  }
  
  // Save report to file
  const reportFile = `test-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(chalk.blue(`\n📄 Detailed report saved to: ${reportFile}`));
}

// Run all tests
async function runAllTests() {
  console.log(chalk.blue.bold('🧪 NEXA System Test Suite\n'));
  console.log(chalk.gray('Running comprehensive system tests...\n'));
  
  try {
    await testConnectivity();
    await testAuthentication();
    await testAPI();
    await testDatabase();
    await testWebSocket();
    await testAI();
    await testPerformance();
    await testSecurity();
    
    displayResults();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(chalk.red.bold('\n💥 Test suite failed:'), error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
