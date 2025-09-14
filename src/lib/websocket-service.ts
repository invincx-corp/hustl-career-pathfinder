import { supabase } from './supabase';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  userId: string;
  roomId?: string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  roomId?: string;
  isActive: boolean;
  connectedAt: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private connectionId: string | null = null;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      // In a real implementation, you would connect to your WebSocket server
      // For now, we'll simulate the connection and use Supabase real-time features
      this.setupSupabaseRealtime();
      this.connectionId = this.generateConnectionId();
      await this.registerConnection();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupSupabaseRealtime() {
    // Set up Supabase real-time subscriptions for different channels
    this.setupProjectUpdates();
    this.setupTeamCollaboration();
    this.setupNotifications();
  }

  private setupProjectUpdates() {
    // Listen for project updates
    supabase
      .channel('project-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, (payload) => {
        this.emit('project_update', {
          type: 'project_update',
          data: payload,
          timestamp: new Date().toISOString(),
          userId: payload.new?.user_id || payload.old?.user_id
        });
      })
      .subscribe();
  }

  private setupTeamCollaboration() {
    // Listen for team member changes
    supabase
      .channel('team-collaboration')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members'
      }, (payload) => {
        this.emit('team_update', {
          type: 'team_update',
          data: payload,
          timestamp: new Date().toISOString(),
          userId: payload.new?.user_id || payload.old?.user_id
        });
      })
      .subscribe();

    // Listen for project team changes
    supabase
      .channel('project-teams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_teams'
      }, (payload) => {
        this.emit('project_team_update', {
          type: 'project_team_update',
          data: payload,
          timestamp: new Date().toISOString(),
          userId: payload.new?.team_leader_id || payload.old?.team_leader_id
        });
      })
      .subscribe();
  }

  private setupNotifications() {
    // Listen for new notifications
    supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'realtime_notifications'
      }, (payload) => {
        this.emit('notification', {
          type: 'notification',
          data: payload.new,
          timestamp: new Date().toISOString(),
          userId: payload.new.user_id
        });
      })
      .subscribe();
  }

  private async registerConnection() {
    if (!this.connectionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('websocket_connections')
        .insert({
          connection_id: this.connectionId,
          user_id: user.id,
          is_active: true,
          connected_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error registering WebSocket connection:', error);
    }
  }

  private async unregisterConnection() {
    if (!this.connectionId) return;

    try {
      await supabase
        .from('websocket_connections')
        .update({
          is_active: false,
          disconnected_at: new Date().toISOString()
        })
        .eq('connection_id', this.connectionId);
    } catch (error) {
      console.error('Error unregistering WebSocket connection:', error);
    }
  }

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Public methods
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  public send(message: WebSocketMessage) {
    // In a real implementation, you would send the message through WebSocket
    // For now, we'll simulate sending and handle it through Supabase
    this.handleMessage(message);
  }

  private async handleMessage(message: WebSocketMessage) {
    try {
      // Handle different message types
      switch (message.type) {
        case 'project_update':
          await this.handleProjectUpdate(message);
          break;
        case 'team_message':
          await this.handleTeamMessage(message);
          break;
        case 'notification':
          await this.handleNotification(message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private async handleProjectUpdate(message: WebSocketMessage) {
    // Broadcast project updates to team members
    const { data: project } = await supabase
      .from('projects')
      .select('team_members')
      .eq('id', message.data.projectId)
      .single();

    if (project && project.team_members) {
      // Notify all team members
      for (const memberId of project.team_members) {
        await supabase
          .from('realtime_notifications')
          .insert({
            user_id: memberId,
            notification_type: 'project_update',
            title: 'Project Updated',
            message: message.data.message || 'A project you are part of has been updated',
            data: message.data,
            priority: 'normal'
          });
      }
    }
  }

  private async handleTeamMessage(message: WebSocketMessage) {
    // Handle team collaboration messages
    await supabase
      .from('realtime_notifications')
      .insert({
        user_id: message.data.recipientId,
        notification_type: 'message',
        title: 'Team Message',
        message: message.data.message,
        data: message.data,
        priority: 'normal'
      });
  }

  private async handleNotification(message: WebSocketMessage) {
    // Handle notification messages
    await supabase
      .from('realtime_notifications')
      .insert({
        user_id: message.data.userId,
        notification_type: message.data.type,
        title: message.data.title,
        message: message.data.message,
        data: message.data.data,
        priority: message.data.priority || 'normal'
      });
  }

  public joinRoom(roomId: string) {
    // Join a specific room for targeted messaging
    supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'realtime_notifications'
      }, (payload) => {
        if (payload.new?.data?.roomId === roomId) {
          this.emit('room_message', {
            type: 'room_message',
            data: payload.new,
            timestamp: new Date().toISOString(),
            userId: payload.new.user_id,
            roomId
          });
        }
      })
      .subscribe();
  }

  public leaveRoom(roomId: string) {
    // Leave a room
    supabase.removeChannel(`room-${roomId}`);
  }

  public disconnect() {
    this.unregisterConnection();
    supabase.removeAllChannels();
    this.ws = null;
  }

  public isConnected(): boolean {
    return this.connectionId !== null;
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;


