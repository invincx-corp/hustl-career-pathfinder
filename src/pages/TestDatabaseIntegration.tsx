/**
 * Test Database Integration Page
 * This page tests the complete database integration pipeline
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, Database, Trash2, Plus, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ApiService } from '@/lib/api-services';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
}

interface RoadmapRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  user_id: string | null;
}

const TestDatabaseIntegration: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending', message: 'Testing Supabase connection...' },
    { name: 'Create Test Roadmap', status: 'pending', message: 'Creating test roadmap in database...' },
    { name: 'Read Roadmaps', status: 'pending', message: 'Reading roadmaps from database...' },
    { name: 'Update Roadmap', status: 'pending', message: 'Updating roadmap in database...' },
    { name: 'Delete Roadmap', status: 'pending', message: 'Deleting roadmap from database...' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapRecord[]>([]);
  const [testRoadmapId, setTestRoadmapId] = useState<string | null>(null);

  const updateTest = (index: number, status: TestResult['status'], message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ));
  };

  const loadRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('id, title, description, category, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    
    try {
      // Test 1: Database Connection
      updateTest(0, 'running', 'Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('roadmaps')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        updateTest(0, 'error', `Connection failed: ${connectionError.message}`);
        return;
      }
      updateTest(0, 'success', 'Database connection successful');

      // Test 2: Create Test Roadmap
      updateTest(1, 'running', 'Creating test roadmap in database...');
      const testRoadmap = {
        title: 'Test Roadmap - Database Integration',
        description: 'This is a test roadmap created during database integration testing',
        goal: 'Test database functionality',
        category: 'test',
        steps: JSON.stringify([
          { id: 'step1', title: 'Test Step 1', description: 'First test step', type: 'learning' },
          { id: 'step2', title: 'Test Step 2', description: 'Second test step', type: 'project' }
        ]),
        estimated_total_time: '2 weeks',
        difficulty: 'beginner',
        skills_to_learn: ['testing', 'database'],
        prerequisites: [],
        current_step: 0,
        progress_percentage: 0,
        steps_completed: 0,
        total_steps: 2,
        is_public: false,
        user_id: null // Anonymous user for testing
      };

      const { data: createdRoadmap, error: createError } = await supabase
        .from('roadmaps')
        .insert(testRoadmap)
        .select()
        .single();

      if (createError) {
        updateTest(1, 'error', `Create failed: ${createError.message}`);
        return;
      }
      
      setTestRoadmapId(createdRoadmap.id);
      updateTest(1, 'success', 'Test roadmap created successfully', createdRoadmap);
      await loadRoadmaps();

      // Test 3: Read Roadmaps
      updateTest(2, 'running', 'Reading roadmaps from database...');
      const { data: readRoadmaps, error: readError } = await supabase
        .from('roadmaps')
        .select('id, title, description, category, created_at, user_id')
        .order('created_at', { ascending: false });

      if (readError) {
        updateTest(2, 'error', `Read failed: ${readError.message}`);
        return;
      }
      
      updateTest(2, 'success', `Successfully read ${readRoadmaps?.length || 0} roadmaps`, readRoadmaps);
      setRoadmaps(readRoadmaps || []);

      // Test 4: Update Roadmap
      if (createdRoadmap) {
        updateTest(3, 'running', 'Updating roadmap in database...');
        const { data: updatedRoadmap, error: updateError } = await supabase
          .from('roadmaps')
          .update({ 
            title: 'Updated Test Roadmap - Database Integration',
            description: 'This roadmap has been updated during testing',
            updated_at: new Date().toISOString()
          })
          .eq('id', createdRoadmap.id)
          .select()
          .single();

        if (updateError) {
          updateTest(3, 'error', `Update failed: ${updateError.message}`);
        } else {
          updateTest(3, 'success', 'Roadmap updated successfully', updatedRoadmap);
          await loadRoadmaps();
        }
      }

      // Test 5: Delete Roadmap
      if (createdRoadmap) {
        updateTest(4, 'running', 'Deleting roadmap from database...');
        const { error: deleteError } = await supabase
          .from('roadmaps')
          .delete()
          .eq('id', createdRoadmap.id);

        if (deleteError) {
          updateTest(4, 'error', `Delete failed: ${deleteError.message}`);
        } else {
          updateTest(4, 'success', 'Roadmap deleted successfully');
          await loadRoadmaps();
        }
      }

    } catch (error: any) {
      console.error('Test failed:', error);
      updateTest(tests.length - 1, 'error', `Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testApiServiceDelete = async (roadmapId: string) => {
    try {
      const result = await ApiService.deleteRoadmap(roadmapId);
      if (result.success) {
        await loadRoadmaps();
        alert('Roadmap deleted successfully via ApiService');
      } else {
        alert(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Delete error: ${error}`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'running': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Integration Test</h1>
          <p className="text-gray-600">Testing real Supabase database operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Database Roadmaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {roadmaps.length} roadmaps found
                  </span>
                  <Button 
                    onClick={loadRoadmaps} 
                    size="sm" 
                    variant="outline"
                  >
                    Refresh
                  </Button>
                </div>
                
                {roadmaps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No roadmaps found in database
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {roadmaps.map((roadmap) => (
                      <div key={roadmap.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{roadmap.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{roadmap.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {roadmap.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(roadmap.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testApiServiceDelete(roadmap.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Run Database Tests
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestDatabaseIntegration;
