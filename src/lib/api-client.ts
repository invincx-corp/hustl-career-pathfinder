import { config } from './config';
import { socketService } from './socket-service';

// API Client for real-time communication
export class APIClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<{ data: T | null; error: string | null; success: boolean }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null, success: true };
    } catch (error: any) {
      console.error(`API request failed (attempt ${retryCount + 1}):`, error);

      // Retry logic
      if (retryCount < this.retries && !error.name === 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        data: null,
        error: error.message || 'Request failed',
        success: false
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<{ data: T | null; error: string | null; success: boolean }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<{ data: T | null; error: string | null; success: boolean }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<{ data: T | null; error: string | null; success: boolean }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<{ data: T | null; error: string | null; success: boolean }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Real-time API methods
  async connectRealtime(userId: string): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.connect(userId);
    }
  }

  async disconnectRealtime(): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.disconnect();
    }
  }

  // Learning progress updates
  async updateLearningProgress(userId: string, progress: any): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.updateLearningProgress(userId, progress);
    }
  }

  // Roadmap progress updates
  async updateRoadmapProgress(userId: string, roadmapId: string, step: string, progress: number): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.updateRoadmapProgress(userId, roadmapId, step, progress);
    }
  }

  // Send notification
  async sendNotification(userId: string, type: string, message: string, priority: string = 'normal'): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.sendNotification(userId, type, message, priority);
    }
  }

  // AI coach request
  async requestAICoach(userId: string, message: string, context: any): Promise<void> {
    if (config.features.realTimeEnabled) {
      socketService.requestAICoach(userId, message, context);
    }
  }

  // Event listeners
  onProgressUpdate(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.onProgressUpdate(callback);
    }
  }

  onRoadmapProgress(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.onRoadmapProgress(callback);
    }
  }

  onNotification(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.onNotification(callback);
    }
  }

  onAICoachResponse(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.onAICoachResponse(callback);
    }
  }

  // Remove event listeners
  offProgressUpdate(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.offProgressUpdate(callback);
    }
  }

  offRoadmapProgress(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.offRoadmapProgress(callback);
    }
  }

  offNotification(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.offNotification(callback);
    }
  }

  offAICoachResponse(callback: (data: any) => void): void {
    if (config.features.realTimeEnabled) {
      socketService.offAICoachResponse(callback);
    }
  }

  // Get connection status
  isRealtimeConnected(): boolean {
    return config.features.realTimeEnabled && socketService.getConnectionStatus();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;