import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Cpu,
  Wifi,
  Users,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { errorHandler } from '@/lib/error-handler';
import { performanceMonitor } from '@/lib/performance-monitor';
import { testFramework } from '@/lib/test-framework';
import { documentationManager } from '@/lib/documentation';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  websocket: 'connected' | 'disconnected' | 'reconnecting';
  ai: 'healthy' | 'degraded' | 'down';
}

interface PerformanceData {
  pageLoad: number;
  apiResponse: number;
  memoryUsage: number;
  renderTime: number;
}

interface ErrorData {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recentCount: number;
}

const MonitoringDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'healthy',
    database: 'healthy',
    websocket: 'connected',
    ai: 'healthy'
  });

  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    pageLoad: 0,
    apiResponse: 0,
    memoryUsage: 0,
    renderTime: 0
  });

  const [errorData, setErrorData] = useState<ErrorData>({
    total: 0,
    byType: {},
    bySeverity: {},
    recentCount: 0
  });

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Refresh system status
      await checkSystemStatus();
      
      // Refresh performance data
      await updatePerformanceData();
      
      // Refresh error data
      await updateErrorData();
      
      // Refresh test results
      await updateTestResults();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check system status
  const checkSystemStatus = async () => {
    try {
      // Check API status
      const apiResponse = await fetch('/api/health');
      const apiStatus = apiResponse.ok ? 'healthy' : 'degraded';
      
      // Check database status
      const dbResponse = await fetch('/api/health/database');
      const dbStatus = dbResponse.ok ? 'healthy' : 'degraded';
      
      // Check WebSocket status
      const wsStatus = 'connected'; // This would be checked from socket service
      
      // Check AI status
      const aiResponse = await fetch('/api/health/ai');
      const aiStatus = aiResponse.ok ? 'healthy' : 'degraded';
      
      setSystemStatus({
        api: apiStatus,
        database: dbStatus,
        websocket: wsStatus as any,
        ai: aiStatus
      });
    } catch (error) {
      setSystemStatus({
        api: 'down',
        database: 'down',
        websocket: 'disconnected',
        ai: 'down'
      });
    }
  };

  // Update performance data
  const updatePerformanceData = () => {
    const stats = performanceMonitor.getStats();
    const memoryUsage = performanceMonitor.getMemoryUsage();
    
    setPerformanceData({
      pageLoad: stats?.pageLoad || 0,
      apiResponse: stats?.apiResponse || 0,
      memoryUsage: memoryUsage?.used || 0,
      renderTime: stats?.renderTime || 0
    });
  };

  // Update error data
  const updateErrorData = () => {
    const stats = errorHandler.getErrorStats();
    setErrorData(stats);
  };

  // Update test results
  const updateTestResults = () => {
    const results = testFramework.getResults();
    setTestResults(results);
  };

  // Run tests
  const runTests = async () => {
    try {
      const results = await testFramework.runAllTests([]);
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run tests:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-green-500';
      case 'degraded':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'down':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
      case 'reconnecting':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format memory usage
  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Format time
  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)} ms`;
  };

  useEffect(() => {
    refreshData();
    
    // Set up auto-refresh
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitoring Dashboard</h1>
        <Button 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Status</CardTitle>
                {getStatusIcon(systemStatus.api)}
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(systemStatus.api)}>
                  {systemStatus.api.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                <Database className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(systemStatus.database)}>
                  {systemStatus.database.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WebSocket Status</CardTitle>
                <Wifi className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(systemStatus.websocket)}>
                  {systemStatus.websocket.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Status</CardTitle>
                <Cpu className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(systemStatus.ai)}>
                  {systemStatus.ai.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Page Load Time</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(performanceData.pageLoad)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(performanceData.apiResponse)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {formatMemoryUsage(performanceData.memoryUsage)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Render Time</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(performanceData.renderTime)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Errors</span>
                  <span className="text-sm text-muted-foreground">
                    {errorData.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recent Errors (24h)</span>
                  <span className="text-sm text-muted-foreground">
                    {errorData.recentCount}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Errors by Type</span>
                  {Object.entries(errorData.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{type}</span>
                      <span className="text-xs">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Page Load Time</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(performanceData.pageLoad)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((performanceData.pageLoad / 4000) * 100, 100)} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(performanceData.apiResponse)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((performanceData.apiResponse / 3000) * 100, 100)} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {formatMemoryUsage(performanceData.memoryUsage)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((performanceData.memoryUsage / (100 * 1024 * 1024)) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Errors by Type</h4>
                    {Object.entries(errorData.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between py-1">
                        <span className="text-sm">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Errors by Severity</h4>
                    {Object.entries(errorData.bySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between py-1">
                        <span className="text-sm">{severity}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Tests</span>
                  <span className="text-sm text-muted-foreground">
                    {testResults.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Passed</span>
                  <span className="text-sm text-green-600">
                    {testResults.filter(r => r.passed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed</span>
                  <span className="text-sm text-red-600">
                    {testResults.filter(r => !r.passed).length}
                  </span>
                </div>
                <Button onClick={runTests} className="w-full">
                  Run Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
