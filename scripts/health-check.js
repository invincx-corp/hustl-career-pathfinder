#!/usr/bin/env node

// System health check script
const axios = require('axios');
const chalk = require('chalk');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Health check endpoints
const endpoints = [
  { name: 'Backend Health', url: `${BACKEND_URL}/health` },
  { name: 'API Status', url: `${BACKEND_URL}/api/status` },
  { name: 'Database Health', url: `${BACKEND_URL}/api/health/database` },
  { name: 'WebSocket Health', url: `${BACKEND_URL}/api/health/websocket` },
  { name: 'AI Services Health', url: `${BACKEND_URL}/api/health/ai` },
  { name: 'File Storage Health', url: `${BACKEND_URL}/api/health/storage` },
  { name: 'Email Service Health', url: `${BACKEND_URL}/api/health/email` },
  { name: 'Frontend Health', url: `${FRONTEND_URL}` }
];

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Run health check
async function runHealthCheck() {
  console.log(chalk.blue.bold('\n🔍 NEXA System Health Check\n'));
  console.log(chalk.gray('Checking system components...\n'));

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      results.passed++;
      results.total++;
      results.details.push({
        name: endpoint.name,
        status: 'PASSED',
        responseTime,
        statusCode: response.status,
        url: endpoint.url
      });

      console.log(chalk.green(`✅ ${endpoint.name}`));
      console.log(chalk.gray(`   Status: ${response.status} | Time: ${responseTime}ms`));
    } catch (error) {
      results.failed++;
      results.total++;
      results.details.push({
        name: endpoint.name,
        status: 'FAILED',
        error: error.message,
        url: endpoint.url
      });

      console.log(chalk.red(`❌ ${endpoint.name}`));
      console.log(chalk.gray(`   Error: ${error.message}`));
    }
  }

  // Print summary
  console.log(chalk.blue.bold('\n📊 Health Check Summary\n'));
  console.log(chalk.green(`✅ Passed: ${results.passed}`));
  console.log(chalk.red(`❌ Failed: ${results.failed}`));
  console.log(chalk.blue(`📈 Total: ${results.total}`));
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(chalk.blue(`🎯 Success Rate: ${successRate}%`));

  // Print detailed results
  if (results.failed > 0) {
    console.log(chalk.red.bold('\n❌ Failed Endpoints:\n'));
    results.details
      .filter(d => d.status === 'FAILED')
      .forEach(detail => {
        console.log(chalk.red(`• ${detail.name}`));
        console.log(chalk.gray(`  URL: ${detail.url}`));
        console.log(chalk.gray(`  Error: ${detail.error}`));
      });
  }

  // Print performance metrics
  const passedDetails = results.details.filter(d => d.status === 'PASSED');
  if (passedDetails.length > 0) {
    const avgResponseTime = passedDetails.reduce((sum, d) => sum + d.responseTime, 0) / passedDetails.length;
    console.log(chalk.blue.bold('\n⚡ Performance Metrics\n'));
    console.log(chalk.blue(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`));
    
    const slowest = passedDetails.reduce((max, d) => d.responseTime > max.responseTime ? d : max, passedDetails[0]);
    console.log(chalk.blue(`Slowest Endpoint: ${slowest.name} (${slowest.responseTime}ms)`));
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the health check
runHealthCheck().catch(error => {
  console.error(chalk.red.bold('\n💥 Health check failed:'), error.message);
  process.exit(1);
});
