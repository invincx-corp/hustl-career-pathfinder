// Performance monitoring system
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: any;
}

export interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  unit: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private maxMetrics = 1000;
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.initializeThresholds();
    this.setupPerformanceObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance thresholds
  private initializeThresholds(): void {
    this.thresholds.set('pageLoad', {
      name: 'Page Load Time',
      warning: 5000,
      critical: 10000,
      unit: 'ms'
    });

    this.thresholds.set('apiResponse', {
      name: 'API Response Time',
      warning: 1000,
      critical: 3000,
      unit: 'ms'
    });

    this.thresholds.set('memoryUsage', {
      name: 'Memory Usage',
      warning: 50 * 1024 * 1024, // 50MB
      critical: 100 * 1024 * 1024, // 100MB
      unit: 'bytes'
    });

    this.thresholds.set('renderTime', {
      name: 'Render Time',
      warning: 16, // 60fps
      critical: 33, // 30fps
      unit: 'ms'
    });
  }

  // Setup performance observers
  private setupPerformanceObservers(): void {
    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordMetric('pageLoad', entry.duration, 'ms');
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);
    }

    // Resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordMetric('resourceLoad', entry.duration, 'ms', {
              name: entry.name,
              type: entry.initiatorType
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }

    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('longTask', entry.duration, 'ms', {
              startTime: entry.startTime
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  // Record a performance metric
  public recordMetric(
    name: string,
    value: number,
    unit: string,
    context?: any
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.metrics.unshift(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Check thresholds
    this.checkThresholds(metric);

    // Log in development
    if (import.meta.env.DEV) {
      console.log('Performance metric recorded:', metric);
    }
  }

  // Check performance thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      console.error(`Critical performance issue: ${threshold.name} is ${metric.value}${metric.unit} (threshold: ${threshold.critical}${threshold.unit})`);
    } else if (metric.value >= threshold.warning) {
      console.warn(`Performance warning: ${threshold.name} is ${metric.value}${metric.unit} (threshold: ${threshold.warning}${threshold.unit})`);
    }
  }

  // Measure function execution time
  public measureFunction<T>(
    name: string,
    fn: () => T,
    context?: any
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, 'ms', context);
    return result;
  }

  // Measure async function execution time
  public async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>,
    context?: any
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, 'ms', context);
    return result;
  }

  // Measure API call performance
  public measureAPICall<T>(
    name: string,
    apiCall: () => Promise<T>,
    context?: any
  ): Promise<T> {
    return this.measureAsyncFunction(`api.${name}`, apiCall, context);
  }

  // Get performance metrics
  public getMetrics(name?: string, limit?: number): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (name) {
      filtered = filtered.filter(metric => metric.name === name);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }

  // Get performance statistics
  public getStats(name?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = name ? this.getMetrics(name) : this.metrics;
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = values[0];
    const max = values[count - 1];
    const median = values[Math.floor(count / 2)];
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);

    return {
      count,
      average: Math.round(average * 100) / 100,
      min,
      max,
      median,
      p95: values[p95Index],
      p99: values[p99Index]
    };
  }

  // Get performance alerts
  public getAlerts(): Array<{
    metric: string;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
    timestamp: Date;
  }> {
    const alerts: Array<{
      metric: string;
      value: number;
      threshold: number;
      severity: 'warning' | 'critical';
      timestamp: Date;
    }> = [];

    for (const metric of this.metrics) {
      const threshold = this.thresholds.get(metric.name);
      if (!threshold) continue;

      if (metric.value >= threshold.critical) {
        alerts.push({
          metric: metric.name,
          value: metric.value,
          threshold: threshold.critical,
          severity: 'critical',
          timestamp: metric.timestamp
        });
      } else if (metric.value >= threshold.warning) {
        alerts.push({
          metric: metric.name,
          value: metric.value,
          threshold: threshold.warning,
          severity: 'warning',
          timestamp: metric.timestamp
        });
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Clear metrics
  public clearMetrics(): void {
    this.metrics = [];
  }

  // Get memory usage
  public getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }

  // Get connection information
  public getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    return null;
  }

  // Cleanup
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;
