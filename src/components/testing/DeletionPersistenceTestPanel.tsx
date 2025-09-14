import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Trash2, RefreshCw, Play, Eye } from 'lucide-react';
import { DeletionPersistenceTest } from '@/utils/deletion-persistence-test';

interface TestResult {
  testName: string;
  passed: boolean;
  analysis: string;
  details?: any;
}

export const DeletionPersistenceTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<any>(null);

  const runSingleTest = (testName: string, testFunction: () => { passed: boolean; analysis: string; details?: any }) => {
    try {
      const result = testFunction();
      setTestResults(prev => [...prev, { testName, ...result }]);
    } catch (error) {
      setTestResults(prev => [...prev, { 
        testName, 
        passed: false, 
        analysis: `Error: ${error}` 
      }]);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test 1: Basic Deletion
    runSingleTest('Basic Deletion Test', () => {
      DeletionPersistenceTest.setupTestScenario();
      DeletionPersistenceTest.simulateDeletion('test-roadmap-123');
      const result = DeletionPersistenceTest.simulatePageRefresh();
      return {
        passed: !result.wouldReappear,
        analysis: result.analysis,
        details: result
      };
    });

    // Test 2: Derived Content Deletion
    runSingleTest('Derived Content Deletion Test', () => {
      DeletionPersistenceTest.setupTestScenario();
      DeletionPersistenceTest.simulateDeletion('derived-roadmap-ai-ml-123');
      const result = DeletionPersistenceTest.simulatePageRefresh();
      return {
        passed: !result.wouldReappear,
        analysis: result.analysis,
        details: result
      };
    });

    // Test 3: Multiple Deletions
    runSingleTest('Multiple Deletions Test', () => {
      DeletionPersistenceTest.setupTestScenario();
      DeletionPersistenceTest.simulateDeletion('derived-roadmap-ai-ml-123');
      DeletionPersistenceTest.simulateDeletion('derived-roadmap-web-dev-456');
      const result = DeletionPersistenceTest.simulatePageRefresh();
      return {
        passed: !result.wouldReappear,
        analysis: result.analysis,
        details: result
      };
    });

    // Test 4: Empty localStorage
    runSingleTest('Empty localStorage Test', () => {
      DeletionPersistenceTest.cleanup();
      const result = DeletionPersistenceTest.simulatePageRefresh();
      return {
        passed: !result.wouldReappear,
        analysis: result.analysis,
        details: result
      };
    });

    setIsRunning(false);
  };

  const runConsoleTestSuite = () => {
    DeletionPersistenceTest.runTestSuite();
  };

  const checkCurrentState = () => {
    const state = DeletionPersistenceTest.getCurrentState();
    setCurrentState(state);
  };

  const clearAllTests = () => {
    setTestResults([]);
    setCurrentState(null);
    DeletionPersistenceTest.cleanup();
  };

  const getStatusIcon = (passed: boolean) => {
    if (passed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "PASSED" : "FAILED"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Deletion Persistence Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This test suite verifies that deleted content stays deleted after page refresh.
              It simulates the localStorage persistence issue and tests our fix.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={runConsoleTestSuite} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Run Console Test Suite
            </Button>
            
            <Button 
              onClick={checkCurrentState} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Check Current State
            </Button>
            
            <Button 
              onClick={clearAllTests} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.passed)}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    {getStatusBadge(result.passed)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.analysis}
                  </p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentState && (
        <Card>
          <CardHeader>
            <CardTitle>Current localStorage State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(currentState, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeletionPersistenceTestPanel;
