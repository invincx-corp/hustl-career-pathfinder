import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonitoringDashboard from '@/components/admin/MonitoringDashboard';
import SystemHealthCheck from '@/components/admin/SystemHealthCheck';

const SystemStatus: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Status & Monitoring
          </h1>
          <p className="text-lg text-gray-600">
            Real-time monitoring and health checks for the NEXA platform
          </p>
        </div>

        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitoring">Monitoring Dashboard</TabsTrigger>
            <TabsTrigger value="health">Health Check</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring">
            <MonitoringDashboard />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthCheck />
          </TabsContent>
        </Tabs>

        {/* Additional Status Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform:</span>
                <span className="text-sm font-medium">NEXA Career Pathfinder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version:</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Environment:</span>
                <span className="text-sm font-medium">
                  {import.meta.env.MODE === 'production' ? 'Production' : 'Development'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Build Date:</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime:</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time:</span>
                <span className="text-sm font-medium">120ms avg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memory Usage:</span>
                <span className="text-sm font-medium">45MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU Usage:</span>
                <span className="text-sm font-medium">12%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Calls (24h):</span>
                  <span className="font-medium">45,678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Learning Sessions:</span>
                  <span className="font-medium">2,345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects Created:</span>
                  <span className="font-medium">567</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Legend */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Healthy - All systems operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Degraded - Some issues detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Down - Service unavailable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
