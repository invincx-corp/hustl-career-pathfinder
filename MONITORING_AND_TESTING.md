# NEXA System Monitoring & Testing

This document describes the comprehensive monitoring and testing system implemented for the NEXA Career Pathfinder platform.

## Overview

The monitoring and testing system provides:
- Real-time system health monitoring
- Comprehensive integration testing
- Performance monitoring and alerting
- Error tracking and logging
- System status dashboards
- Automated health checks

## Components

### 1. System Status Dashboard (`/system-status`)

A comprehensive dashboard showing:
- Overall system health
- Service status (API, Database, WebSocket, AI)
- Performance metrics
- Error statistics
- Recent activity

### 2. Integration Test Suite (`/system-integration-test`)

Automated testing of:
- Authentication flow
- API connectivity
- Database operations
- WebSocket connections
- Real-time updates
- AI integration
- Error handling
- Performance monitoring
- Data validation
- State management

### 3. Monitoring Scripts

#### Health Check Script (`scripts/health-check.js`)
```bash
npm run health-check
```

Checks all system endpoints and provides a summary of system health.

#### Monitor Script (`scripts/monitor.js`)
```bash
npm run monitor
```

Continuous monitoring with real-time dashboard and alerting.

#### System Test Script (`scripts/test-system.js`)
```bash
npm run test:system
```

Comprehensive system testing including connectivity, authentication, API, database, WebSocket, AI, performance, and security tests.

### 4. Backend Status API

#### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/health/database` - Database health
- `GET /api/health/websocket` - WebSocket health
- `GET /api/health/ai` - AI services health
- `GET /api/health/storage` - File storage health
- `GET /api/health/email` - Email service health

#### Metrics Endpoints
- `GET /api/metrics` - System metrics
- `GET /api/performance` - Performance metrics
- `GET /api/errors` - Error statistics
- `GET /api/tests` - Test statistics

## Usage

### Quick Health Check
```bash
npm run health-check
```

### Continuous Monitoring
```bash
npm run monitor
```

### Full System Test
```bash
npm run test:all
```

### Development with Monitoring
```bash
npm run dev:both
# Then visit /system-status for real-time monitoring
```

## Configuration

### Environment Variables

```bash
# Backend URL
BACKEND_URL=http://localhost:3001

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Monitoring interval (milliseconds)
MONITOR_INTERVAL=30000

# Log file path
LOG_FILE=monitor.log
```

### Feature Flags

The system includes feature flags for enabling/disabling monitoring features:

```typescript
// src/lib/config.ts
export const config = {
  features: {
    realTimeEnabled: true,
    aiEnabled: true,
    databaseEnabled: true,
    mockDataEnabled: false,
  }
};
```

## Monitoring Features

### 1. Real-time Health Monitoring
- Service status tracking
- Response time monitoring
- Error rate tracking
- Uptime monitoring

### 2. Performance Monitoring
- Page load times
- API response times
- Memory usage
- CPU usage
- Render times

### 3. Error Tracking
- Error logging and categorization
- Error rate monitoring
- Alert generation
- Error statistics

### 4. Alert System
- Service down alerts
- Performance degradation alerts
- Error threshold alerts
- Custom alert rules

## Testing Features

### 1. Integration Tests
- End-to-end functionality testing
- API endpoint testing
- Database operation testing
- Real-time feature testing

### 2. Performance Tests
- Response time testing
- Load testing
- Concurrent request testing
- Memory usage testing

### 3. Security Tests
- CORS header testing
- Security header testing
- Authentication testing
- Authorization testing

### 4. AI Service Tests
- AI endpoint testing
- Response validation
- Error handling testing
- Performance testing

## Dashboard Features

### System Status Dashboard
- Real-time service status
- Performance metrics
- Error statistics
- System information
- Recent activity

### Integration Test Dashboard
- Test execution status
- Test results and statistics
- Failed test details
- Performance metrics
- Test categories

## Alerting

### Alert Types
- **Service Down**: When a service becomes unavailable
- **Slow Response**: When response times exceed thresholds
- **High Error Rate**: When error rates exceed thresholds
- **Memory Usage**: When memory usage exceeds limits
- **CPU Usage**: When CPU usage exceeds limits

### Alert Severity
- **HIGH**: Critical issues requiring immediate attention
- **MEDIUM**: Issues that should be addressed soon
- **LOW**: Minor issues that can be addressed later

## Logging

### Log Levels
- **INFO**: General information
- **WARN**: Warning messages
- **ERROR**: Error messages
- **DEBUG**: Debug information

### Log Files
- `monitor.log` - Monitoring logs
- `test-report-*.json` - Test execution reports
- `monitor-report-*.json` - Monitoring session reports

## Best Practices

### 1. Monitoring
- Set up continuous monitoring in production
- Configure appropriate alert thresholds
- Monitor key performance indicators
- Track error rates and response times

### 2. Testing
- Run integration tests before deployment
- Monitor test results and trends
- Fix failing tests immediately
- Maintain test coverage

### 3. Alerting
- Set up appropriate alert thresholds
- Configure alert notifications
- Respond to alerts promptly
- Review and adjust thresholds regularly

### 4. Logging
- Use appropriate log levels
- Rotate log files regularly
- Monitor log file sizes
- Analyze logs for patterns

## Troubleshooting

### Common Issues

#### Health Check Failures
- Check if services are running
- Verify network connectivity
- Check service configurations
- Review error logs

#### Test Failures
- Check test data and setup
- Verify service dependencies
- Review test configurations
- Check for environment issues

#### Monitoring Issues
- Check monitoring script permissions
- Verify log file access
- Check system resources
- Review monitoring configurations

### Debug Mode
Enable debug mode for detailed logging:

```bash
DEBUG=true npm run monitor
```

## Future Enhancements

### Planned Features
- Machine learning-based anomaly detection
- Predictive alerting
- Advanced performance analytics
- Custom dashboard widgets
- Integration with external monitoring tools
- Automated remediation
- Performance optimization recommendations

### Integration Opportunities
- Prometheus/Grafana integration
- ELK stack integration
- Slack/Teams notifications
- Email alerting
- PagerDuty integration
- Custom webhook support

## Support

For issues or questions about the monitoring and testing system:

1. Check the logs for error messages
2. Review the system status dashboard
3. Run the health check script
4. Check the troubleshooting section
5. Contact the development team

## Contributing

To contribute to the monitoring and testing system:

1. Follow the existing code patterns
2. Add appropriate tests for new features
3. Update documentation
4. Test thoroughly before submitting
5. Follow the coding standards

---

*This monitoring and testing system ensures the reliability, performance, and maintainability of the NEXA Career Pathfinder platform.*
