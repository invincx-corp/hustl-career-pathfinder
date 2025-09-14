import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      
      // Join user's personal room
      this.socket?.emit('join-user-room', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Real-time learning progress updates
  updateLearningProgress(userId: string, progress: any): void {
    if (this.socket?.connected) {
      this.socket.emit('learning-progress', {
        userId,
        progress: progress.progress,
        skill: progress.skill,
        level: progress.level
      });
    }
  }

  // Real-time roadmap updates
  updateRoadmapProgress(userId: string, roadmapId: string, step: string, progress: number): void {
    if (this.socket?.connected) {
      this.socket.emit('roadmap-update', {
        userId,
        roadmapId,
        step,
        progress
      });
    }
  }

  // Send notification
  sendNotification(userId: string, type: string, message: string, priority: string = 'normal'): void {
    if (this.socket?.connected) {
      this.socket.emit('send-notification', {
        userId,
        type,
        message,
        priority
      });
    }
  }

  // AI coach request
  requestAICoach(userId: string, message: string, context: any): void {
    if (this.socket?.connected) {
      this.socket.emit('ai-coach-request', {
        userId,
        message,
        context
      });
    }
  }

  // Listen for real-time updates
  onProgressUpdate(callback: (data: any) => void): void {
    this.socket?.on('progress-update', callback);
  }

  onRoadmapProgress(callback: (data: any) => void): void {
    this.socket?.on('roadmap-progress', callback);
  }

  onNotification(callback: (data: any) => void): void {
    this.socket?.on('notification', callback);
  }

  onAICoachResponse(callback: (data: any) => void): void {
    this.socket?.on('ai-coach-response', callback);
  }

  // Remove listeners
  offProgressUpdate(callback: (data: any) => void): void {
    this.socket?.off('progress-update', callback);
  }

  offRoadmapProgress(callback: (data: any) => void): void {
    this.socket?.off('roadmap-progress', callback);
  }

  offNotification(callback: (data: any) => void): void {
    this.socket?.off('notification', callback);
  }

  offAICoachResponse(callback: (data: any) => void): void {
    this.socket?.off('ai-coach-response', callback);
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const socketService = new SocketService();
export default socketService;
