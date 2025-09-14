import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Cpu,
  Wifi,
  Server,
  Clock,
  Activity
} from 'lucide-react';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
  error?: string;
  details?: any;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: HealthCheckResult[];
  lastUpdated: Date;
}

const SystemHealthCheck: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    services: [],
    lastUpdated: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);

  // Health check services
  const healthCheckServices = [
    {
      name: 'API Server',
      endpoint: '/api/health',
      timeout: 5000
    },
    {
      name: 'Database',
      endpoint: '/api/health/database',
      timeout: 5000
    },
    {
      name: 'WebSocket',
      endpoint: '/api/health/websocket',
      timeout: 5000
    },
    {
      name: 'AI Services',
      endpoint: '/api/health/ai',
      timeout: 10000
    },
    {
      name: 'File Storage',
      endpoint: '/api/health/storage',
      timeout: 5000
    },
    {
      name: 'Email Service',
      endpoint: '/api/health/email',
      timeout: 5000
    }
  ];

  // Perform health check
  const performHealthCheck = async (): Promise<HealthCheckResult[]> => {
    const results: HealthCheckResult[] = [];

    for (const service of healthCheckServices) {
      const startTime = Date.now();
      let status: 'healthy' | 'degraded' | 'down' = 'down';
      let error: string | undefined;
      let details: any = {};

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);

        const response = await fetch(service.endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          status = data.status || 'healthy';
          details = data.details || {};
        } else {
          status = 'degraded';
          error = `HTTP ${response.status}: ${response.statusText}`;
        }

        results.push({
          service: service.name,
          status,
          responseTime,
          lastChecked: new Date(),
          error,
          details
        });
      } catch (err: any) {
        const responseTime = Date.now() - startTime;
        
        if (err.name === 'AbortError') {
          error = 'Request timeout';
        } else {
          error = err.message || 'Unknown error';
        }

        results.push({
          service: service.name,
          status: 'down',
          responseTime,
          lastChecked: new Date(),
          error,
          details
        });
      }
    }

    return results;
  };

  // Run health check
  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const results = await performHealthCheck();
      
      // Determine overall status
      const hasDown = results.some(r => r.status === 'down');
      const hasDegraded = results.some(r => r.status === 'degraded');
      
      let overall: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (hasDown) {
        overall = 'down';
      } else if (hasDegraded) {
        overall = 'degraded';
      }

      setHealth({
        overall,
        services: results,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get service icon
  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'api server':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'websocket':
        return <Wifi className="h-4 w-4" />;
      case 'ai services':
        return <Cpu className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Format response time
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format last checked time
  const formatLastChecked = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  // Auto-check effect
  useEffect(() => {
    if (autoCheck) {
      runHealthCheck();
      const interval = setInterval(runHealthCheck, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoCheck]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health Check</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoCheck(!autoCheck)}
            className={autoCheck ? 'bg-green-100' : ''}
          >
            Auto Check: {autoCheck ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={runHealthCheck}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall System Status
            {getStatusIcon(health.overall)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(health.overall)}>
              {health.overall.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Last updated: {formatLastChecked(health.lastUpdated)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.services.map((service) => (
          <Card key={service.service}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {getServiceIcon(service.service)}
                {service.service}
                {getStatusIcon(service.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={getStatusColor(service.status)}>
                  {service.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm text-muted-foreground">
                  {formatResponseTime(service.responseTime)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Checked</span>
                <span className="text-sm text-muted-foreground">
                  {formatLastChecked(service.lastChecked)}
                </span>
              </div>

              {service.error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {service.error}
                  </AlertDescription>
                </Alert>
              )}

              {service.details && Object.keys(service.details).length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium">Details:</span>
                  {Object.entries(service.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {health.services.filter(s => s.status === 'healthy').length}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {health.services.filter(s => s.status === 'degraded').length}
              </div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {health.services.filter(s => s.status === 'down').length}
              </div>
              <div className="text-sm text-muted-foreground">Down</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {health.services.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthCheck;
