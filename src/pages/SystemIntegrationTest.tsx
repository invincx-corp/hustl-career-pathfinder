import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play,
  RefreshCw,
  Activity,
  Database,
  Cpu,
  Wifi,
  Server
} from 'lucide-react';
import { systemIntegrationTest } from '@/lib/system-integration-test';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  timestamp: Date;
  details?: any;
}

const SystemIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Run all integration tests
  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    
    try {
      const results = await systemIntegrationTest.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Integration tests failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  // Get test statistics
  const getTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, successRate };
  };

  // Get status color
  const getStatusColor = (passed: boolean) => {
    return passed ? 'bg-green-500' : 'bg-red-500';
  };

  // Get status icon
  const getStatusIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  // Get test icon
  const getTestIcon = (testName: string) => {
    if (testName.includes('auth')) return <Activity className="h-4 w-4" />;
    if (testName.includes('api')) return <Server className="h-4 w-4" />;
    if (testName.includes('database')) return <Database className="h-4 w-4" />;
    if (testName.includes('websocket')) return <Wifi className="h-4 w-4" />;
    if (testName.includes('ai')) return <Cpu className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const stats = getTestStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Integration Test
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive testing of all system components and integrations
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              {isRunning && (
                <div className="flex-1">
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests run yet. Click "Run All Tests" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTestIcon(result.name)}
                        <span className="font-medium">{result.name}</span>
                        {getStatusIcon(result.passed)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDuration(result.duration)}</span>
                        <span>{formatTimestamp(result.timestamp)}</span>
                        <Badge className={getStatusColor(result.passed)}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </div>
                    
                    {result.error && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.details && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Categories */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• User registration</div>
                <div className="text-sm">• User login</div>
                <div className="text-sm">• Token validation</div>
                <div className="text-sm">• User logout</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Integration Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• Health check</div>
                <div className="text-sm">• Response time</div>
                <div className="text-sm">• Error handling</div>
                <div className="text-sm">• Data validation</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• WebSocket connection</div>
                <div className="text-sm">• Real-time updates</div>
                <div className="text-sm">• Event handling</div>
                <div className="text-sm">• Connection recovery</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• Data creation</div>
                <div className="text-sm">• Data retrieval</div>
                <div className="text-sm">• Data updates</div>
                <div className="text-sm">• Data deletion</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Integration Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• Roadmap generation</div>
                <div className="text-sm">• Skill analysis</div>
                <div className="text-sm">• AI coaching</div>
                <div className="text-sm">• Response handling</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">• Response times</div>
                <div className="text-sm">• Memory usage</div>
                <div className="text-sm">• Error rates</div>
                <div className="text-sm">• Load handling</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemIntegrationTest;
