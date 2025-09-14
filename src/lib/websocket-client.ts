// WebSocket Client for Real-time Features
// Handles live messaging, notifications, and real-time updates

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export class WebSocketClient {
  private config: WebSocketConfig;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private messageQueue: WebSocketMessage[] = [];
  private isConnected = false;
  private isConnecting = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:3001/ws',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      timeout: config.timeout || 10000
    };
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        const timeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.eventHandlers.onOpen?.();
          resolve();
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          this.eventHandlers.onClose?.(event);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.eventHandlers.onError?.(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.eventHandlers.onMessage?.(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  // Send message
  send(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.ws) {
      this.messageQueue.push(message);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.messageQueue.push(message);
      return false;
    }
  }

  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.send({
      type: 'typing_indicator',
      data: { conversationId, isTyping },
      timestamp: new Date().toISOString()
    });
  }

  // Send message to conversation
  sendMessage(conversationId: string, content: string, type: string = 'text'): void {
    this.send({
      type: 'message',
      data: { conversationId, content, type },
      timestamp: new Date().toISOString()
    });
  }

  // Join conversation
  joinConversation(conversationId: string): void {
    this.send({
      type: 'join_conversation',
      data: { conversationId },
      timestamp: new Date().toISOString()
    });
  }

  // Leave conversation
  leaveConversation(conversationId: string): void {
    this.send({
      type: 'leave_conversation',
      data: { conversationId },
      timestamp: new Date().toISOString()
    });
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string): void {
    this.send({
      type: 'subscribe_notifications',
      data: { userId },
      timestamp: new Date().toISOString()
    });
  }

  // Subscribe to user updates
  subscribeToUserUpdates(userId: string): void {
    this.send({
      type: 'subscribe_user_updates',
      data: { userId },
      timestamp: new Date().toISOString()
    });
  }

  // Subscribe to mentor updates
  subscribeToMentorUpdates(mentorId: string): void {
    this.send({
      type: 'subscribe_mentor_updates',
      data: { mentorId },
      timestamp: new Date().toISOString()
    });
  }

  // Subscribe to study group updates
  subscribeToStudyGroupUpdates(groupId: string): void {
    this.send({
      type: 'subscribe_study_group_updates',
      data: { groupId },
      timestamp: new Date().toISOString()
    });
  }

  // Set event handlers
  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({
          type: 'ping',
          data: {},
          timestamp: new Date().toISOString()
        });
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.eventHandlers.onReconnectFailed?.();
      return;
    }

    this.reconnectAttempts++;
    this.eventHandlers.onReconnect?.(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will be handled by onclose
      });
    }, this.config.reconnectInterval);
  }

  // Clear reconnect timer
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Flush message queue
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  // Connection
  PING: 'ping',
  PONG: 'pong',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Messaging
  MESSAGE: 'message',
  MESSAGE_READ: 'message_read',
  TYPING_INDICATOR: 'typing_indicator',
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',

  // Notifications
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  SUBSCRIBE_NOTIFICATIONS: 'subscribe_notifications',

  // User Updates
  USER_UPDATE: 'user_update',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  SUBSCRIBE_USER_UPDATES: 'subscribe_user_updates',

  // Mentor Updates
  MENTOR_UPDATE: 'mentor_update',
  MENTOR_AVAILABILITY: 'mentor_availability',
  SUBSCRIBE_MENTOR_UPDATES: 'subscribe_mentor_updates',

  // Session Updates
  SESSION_UPDATE: 'session_update',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  SESSION_JOIN: 'session_join',
  SESSION_LEAVE: 'session_leave',

  // Study Group Updates
  STUDY_GROUP_UPDATE: 'study_group_update',
  STUDY_GROUP_EVENT: 'study_group_event',
  SUBSCRIBE_STUDY_GROUP_UPDATES: 'subscribe_study_group_updates',

  // Forum Updates
  FORUM_TOPIC_UPDATE: 'forum_topic_update',
  FORUM_POST_UPDATE: 'forum_post_update',

  // Peer Review Updates
  PEER_REVIEW_UPDATE: 'peer_review_update',
  PEER_REVIEW_ASSIGNMENT: 'peer_review_assignment',

  // Social Updates
  SOCIAL_UPDATE: 'social_update',
  SOCIAL_INTERACTION: 'social_interaction',

  // Error
  ERROR: 'error'
} as const;
