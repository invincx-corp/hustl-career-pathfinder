#!/usr/bin/env node

// System monitoring script
const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MONITOR_INTERVAL = process.env.MONITOR_INTERVAL || 30000; // 30 seconds
const LOG_FILE = process.env.LOG_FILE || 'monitor.log';

// Monitoring data
const monitoringData = {
  startTime: new Date(),
  checks: [],
  alerts: [],
  uptime: 0,
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0
};

// Log function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  // Write to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Check system health
async function checkSystemHealth() {
  const checkStartTime = new Date();
  const checkResults = {
    timestamp: checkStartTime,
    backend: { status: 'unknown', responseTime: 0, error: null },
    frontend: { status: 'unknown', responseTime: 0, error: null },
    database: { status: 'unknown', responseTime: 0, error: null },
    websocket: { status: 'unknown', responseTime: 0, error: null },
    ai: { status: 'unknown', responseTime: 0, error: null }
  };

  // Check backend
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    checkResults.backend = {
      status: 'healthy',
      responseTime,
      error: null
    };
  } catch (error) {
    checkResults.backend = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }

  // Check frontend
  try {
    const startTime = Date.now();
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    checkResults.frontend = {
      status: 'healthy',
      responseTime,
      error: null
    };
  } catch (error) {
    checkResults.frontend = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }

  // Check database
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/api/health/database`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    checkResults.database = {
      status: 'healthy',
      responseTime,
      error: null
    };
  } catch (error) {
    checkResults.database = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }

  // Check WebSocket
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/api/health/websocket`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    checkResults.websocket = {
      status: 'healthy',
      responseTime,
      error: null
    };
  } catch (error) {
    checkResults.websocket = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }

  // Check AI services
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/api/health/ai`, { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    
    checkResults.ai = {
      status: 'healthy',
      responseTime,
      error: null
    };
  } catch (error) {
    checkResults.ai = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }

  // Add to monitoring data
  monitoringData.checks.push(checkResults);
  monitoringData.totalChecks++;

  // Count successful and failed checks
  const successful = Object.values(checkResults).filter(r => r.status === 'healthy').length;
  const failed = Object.values(checkResults).filter(r => r.status === 'unhealthy').length;
  
  monitoringData.successfulChecks += successful;
  monitoringData.failedChecks += failed;

  // Check for alerts
  checkForAlerts(checkResults);

  // Log results
  log(`Health check completed - Success: ${successful}, Failed: ${failed}`);
  
  return checkResults;
}

// Check for alerts
function checkForAlerts(checkResults) {
  const alerts = [];

  // Check for unhealthy services
  Object.entries(checkResults).forEach(([service, result]) => {
    if (result.status === 'unhealthy') {
      alerts.push({
        type: 'SERVICE_DOWN',
        service,
        message: `${service} is down: ${result.error}`,
        timestamp: new Date(),
        severity: 'HIGH'
      });
    }
  });

  // Check for slow response times
  Object.entries(checkResults).forEach(([service, result]) => {
    if (result.responseTime > 5000) { // 5 seconds
      alerts.push({
        type: 'SLOW_RESPONSE',
        service,
        message: `${service} is responding slowly: ${result.responseTime}ms`,
        timestamp: new Date(),
        severity: 'MEDIUM'
      });
    }
  });

  // Add alerts to monitoring data
  monitoringData.alerts.push(...alerts);

  // Log alerts
  alerts.forEach(alert => {
    const level = alert.severity === 'HIGH' ? 'ERROR' : 'WARN';
    log(`ALERT: ${alert.message}`, level);
  });
}

// Display monitoring dashboard
function displayDashboard() {
  console.clear();
  console.log(chalk.blue.bold('\n🔍 NEXA System Monitor\n'));
  
  // Uptime
  const uptime = Math.floor((Date.now() - monitoringData.startTime.getTime()) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  console.log(chalk.blue(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`));
  console.log(chalk.blue(`📊 Total Checks: ${monitoringData.totalChecks}`));
  console.log(chalk.green(`✅ Successful: ${monitoringData.successfulChecks}`));
  console.log(chalk.red(`❌ Failed: ${monitoringData.failedChecks}`));
  
  const successRate = monitoringData.totalChecks > 0 
    ? ((monitoringData.successfulChecks / monitoringData.totalChecks) * 100).toFixed(1)
    : 0;
  console.log(chalk.blue(`🎯 Success Rate: ${successRate}%`));

  // Recent checks
  if (monitoringData.checks.length > 0) {
    const latestCheck = monitoringData.checks[monitoringData.checks.length - 1];
    console.log(chalk.blue.bold('\n📋 Latest Check Results:\n'));
    
    Object.entries(latestCheck).forEach(([key, value]) => {
      if (key === 'timestamp') return;
      
      const status = value.status === 'healthy' ? 
        chalk.green('✅ HEALTHY') : 
        chalk.red('❌ UNHEALTHY');
      
      const responseTime = value.responseTime > 0 ? 
        chalk.gray(`(${value.responseTime}ms)`) : 
        '';
      
      console.log(`${key.toUpperCase()}: ${status} ${responseTime}`);
      
      if (value.error) {
        console.log(chalk.red(`  Error: ${value.error}`));
      }
    });
  }

  // Recent alerts
  if (monitoringData.alerts.length > 0) {
    console.log(chalk.red.bold('\n🚨 Recent Alerts:\n'));
    
    const recentAlerts = monitoringData.alerts.slice(-5); // Last 5 alerts
    recentAlerts.forEach(alert => {
      const severity = alert.severity === 'HIGH' ? 
        chalk.red('HIGH') : 
        chalk.yellow('MEDIUM');
      
      console.log(chalk.red(`• ${alert.service}: ${alert.message}`));
      console.log(chalk.gray(`  Severity: ${severity} | Time: ${alert.timestamp.toLocaleTimeString()}`));
    });
  }

  console.log(chalk.gray('\nPress Ctrl+C to stop monitoring\n'));
}

// Start monitoring
async function startMonitoring() {
  log('Starting NEXA system monitoring...');
  
  // Initial health check
  await checkSystemHealth();
  
  // Set up interval
  const interval = setInterval(async () => {
    await checkSystemHealth();
    displayDashboard();
  }, MONITOR_INTERVAL);
  
  // Display initial dashboard
  displayDashboard();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Stopping monitoring...');
    clearInterval(interval);
    
    // Generate final report
    const report = {
      startTime: monitoringData.startTime,
      endTime: new Date(),
      totalChecks: monitoringData.totalChecks,
      successfulChecks: monitoringData.successfulChecks,
      failedChecks: monitoringData.failedChecks,
      successRate: monitoringData.totalChecks > 0 
        ? ((monitoringData.successfulChecks / monitoringData.totalChecks) * 100).toFixed(1)
        : 0,
      alerts: monitoringData.alerts
    };
    
    const reportFile = `monitor-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    log(`Monitoring stopped. Report saved to ${reportFile}`);
    process.exit(0);
  });
}

// Run monitoring
startMonitoring().catch(error => {
  log(`Failed to start monitoring: ${error.message}`, 'ERROR');
  process.exit(1);
});
