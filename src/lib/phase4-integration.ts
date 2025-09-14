// Phase 4 Integration System
// Integrates all Phase 4 features with backend and real-time capabilities

import { apiClient, API_ENDPOINTS } from './api-client';
import { websocketClient, WS_MESSAGE_TYPES } from './websocket-client';
import { fileManager } from './file-manager';
import { authManager } from './auth-manager';
import { databaseOperations } from './database-operations';
import { mentorProfileManager } from './mentor-profile-manager';
import { mentorMatchingEngine } from './mentor-matching-engine';
import { bookingSystem } from './booking-system';
import { feedbackSystem } from './feedback-system';
import { userProfilesSystem } from './user-profiles';
import { messagingSystem } from './messaging-system';
import { forumsSystem } from './forums-system';
import { studyGroupsSystem } from './study-groups';
import { peerReviewSystem } from './peer-review-system';
import { socialFeaturesSystem } from './social-features';
import { mentorVerificationSystem } from './mentor-verification';

export interface IntegrationConfig {
  enableRealTime: boolean;
  enableFileUpload: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
}

export interface IntegrationState {
  isConnected: boolean;
  isAuthenticated: boolean;
  isWebSocketConnected: boolean;
  lastSync: string;
  pendingOperations: number;
  error: string | null;
}

export class Phase4Integration {
  private config: IntegrationConfig;
  private state: IntegrationState;
  private listeners: Array<(state: IntegrationState) => void> = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(config: Partial<IntegrationConfig> = {}) {
    this.config = {
      enableRealTime: config.enableRealTime || true,
      enableFileUpload: config.enableFileUpload || true,
      enableNotifications: config.enableNotifications || true,
      enableAnalytics: config.enableAnalytics || true,
      enableCaching: config.enableCaching || true,
      cacheTimeout: config.cacheTimeout || 300000 // 5 minutes
    };

    this.state = {
      isConnected: false,
      isAuthenticated: false,
      isWebSocketConnected: false,
      lastSync: new Date().toISOString(),
      pendingOperations: 0,
      error: null
    };

    this.initialize();
  }

  // Initialize integration
  private async initialize(): Promise<void> {
    try {
      // Initialize API client
      await this.initializeApiClient();
      
      // Initialize WebSocket connection
      if (this.config.enableRealTime) {
        await this.initializeWebSocket();
      }
      
      // Initialize authentication
      await this.initializeAuthentication();
      
      // Start sync process
      this.startSyncProcess();
      
      this.state.isConnected = true;
      this.state.error = null;
      this.notifyListeners();
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Initialization failed';
      this.notifyListeners();
    }
  }

  // Initialize API client
  private async initializeApiClient(): Promise<void> {
    try {
      const isHealthy = await apiClient.healthCheck();
      if (!isHealthy) {
        throw new Error('API server is not healthy');
      }
      
      // Set up API client with auth token
      const authState = authManager.getAuthState();
      if (authState.isAuthenticated && authState.session) {
        apiClient.setAuthToken(authState.session.token);
      }
    } catch (error) {
      console.error('API client initialization failed:', error);
      throw error;
    }
  }

  // Initialize WebSocket connection
  private async initializeWebSocket(): Promise<void> {
    try {
      await websocketClient.connect();
      
      // Set up event handlers
      websocketClient.setEventHandlers({
        onOpen: () => {
          this.state.isWebSocketConnected = true;
          this.notifyListeners();
        },
        onClose: () => {
          this.state.isWebSocketConnected = false;
          this.notifyListeners();
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          this.state.error = 'WebSocket connection error';
          this.notifyListeners();
        },
        onMessage: (message) => {
          this.handleWebSocketMessage(message);
        }
      });
      
      // Subscribe to user updates
      const authState = authManager.getAuthState();
      if (authState.isAuthenticated && authState.user) {
        websocketClient.subscribeToUserUpdates(authState.user.id);
        websocketClient.subscribeToNotifications(authState.user.id);
      }
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      throw error;
    }
  }

  // Initialize authentication
  private async initializeAuthentication(): Promise<void> {
    const authState = authManager.getAuthState();
    this.state.isAuthenticated = authState.isAuthenticated;
    
    if (authState.isAuthenticated) {
      // Sync user data
      await this.syncUserData();
    }
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case WS_MESSAGE_TYPES.MESSAGE:
        this.handleNewMessage(message.data);
        break;
      case WS_MESSAGE_TYPES.NOTIFICATION:
        this.handleNotification(message.data);
        break;
      case WS_MESSAGE_TYPES.USER_UPDATE:
        this.handleUserUpdate(message.data);
        break;
      case WS_MESSAGE_TYPES.SESSION_UPDATE:
        this.handleSessionUpdate(message.data);
        break;
      case WS_MESSAGE_TYPES.STUDY_GROUP_UPDATE:
        this.handleStudyGroupUpdate(message.data);
        break;
      case WS_MESSAGE_TYPES.FORUM_TOPIC_UPDATE:
        this.handleForumUpdate(message.data);
        break;
      case WS_MESSAGE_TYPES.PEER_REVIEW_UPDATE:
        this.handlePeerReviewUpdate(message.data);
        break;
      case WS_MESSAGE_TYPES.SOCIAL_UPDATE:
        this.handleSocialUpdate(message.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  // Handle new message
  private handleNewMessage(data: any): void {
    // Update messaging system
    messagingSystem.sendMessage(data.conversationId, data.content, data.type);
  }

  // Handle notification
  private handleNotification(data: any): void {
    // Update notification system
    console.log('New notification:', data);
  }

  // Handle user update
  private handleUserUpdate(data: any): void {
    // Update user profiles system
    if (data.type === 'profile_update') {
      userProfilesSystem.updateProfile(data.userId, data.profile);
    }
  }

  // Handle session update
  private handleSessionUpdate(data: any): void {
    // Update session management
    console.log('Session update:', data);
  }

  // Handle study group update
  private handleStudyGroupUpdate(data: any): void {
    // Update study groups system
    console.log('Study group update:', data);
  }

  // Handle forum update
  private handleForumUpdate(data: any): void {
    // Update forums system
    console.log('Forum update:', data);
  }

  // Handle peer review update
  private handlePeerReviewUpdate(data: any): void {
    // Update peer review system
    console.log('Peer review update:', data);
  }

  // Handle social update
  private handleSocialUpdate(data: any): void {
    // Update social features system
    console.log('Social update:', data);
  }

  // Start sync process
  private startSyncProcess(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAllData();
        this.state.lastSync = new Date().toISOString();
        this.state.error = null;
        this.retryCount = 0;
      } catch (error) {
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
          this.state.error = 'Sync failed after multiple retries';
          this.notifyListeners();
        }
      }
    }, this.config.cacheTimeout);
  }

  // Sync all data
  private async syncAllData(): Promise<void> {
    this.state.pendingOperations++;
    this.notifyListeners();

    try {
      const authState = authManager.getAuthState();
      if (!authState.isAuthenticated) {
        return;
      }

      // Sync user data
      await this.syncUserData();
      
      // Sync mentor data
      await this.syncMentorData();
      
      // Sync session data
      await this.syncSessionData();
      
      // Sync message data
      await this.syncMessageData();
      
      // Sync forum data
      await this.syncForumData();
      
      // Sync study group data
      await this.syncStudyGroupData();
      
      // Sync peer review data
      await this.syncPeerReviewData();
      
      // Sync social data
      await this.syncSocialData();
      
    } finally {
      this.state.pendingOperations--;
      this.notifyListeners();
    }
  }

  // Sync user data
  private async syncUserData(): Promise<void> {
    try {
      const authState = authManager.getAuthState();
      if (!authState.user) return;

      const userData = await databaseOperations.getUser(authState.user.id);
      if (userData) {
        // Update local user profile
        userProfilesSystem.updateProfile(authState.user.id, userData);
      }
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  }

  // Sync mentor data
  private async syncMentorData(): Promise<void> {
    try {
      const mentors = await databaseOperations.list('mentors');
      mentors.forEach(mentor => {
        mentorProfileManager.updateProfile(mentor.id, mentor);
      });
    } catch (error) {
      console.error('Failed to sync mentor data:', error);
    }
  }

  // Sync session data
  private async syncSessionData(): Promise<void> {
    try {
      const authState = authManager.getAuthState();
      if (!authState.user) return;

      const sessions = await databaseOperations.getUserSessions(authState.user.id);
      // Update local session data
      console.log('Synced sessions:', sessions.length);
    } catch (error) {
      console.error('Failed to sync session data:', error);
    }
  }

  // Sync message data
  private async syncMessageData(): Promise<void> {
    try {
      const authState = authManager.getAuthState();
      if (!authState.user) return;

      const conversations = await databaseOperations.list('conversations', {
        filters: { userId: authState.user.id }
      });
      
      // Update local message data
      console.log('Synced conversations:', conversations.length);
    } catch (error) {
      console.error('Failed to sync message data:', error);
    }
  }

  // Sync forum data
  private async syncForumData(): Promise<void> {
    try {
      const topics = await databaseOperations.getForumTopics();
      // Update local forum data
      console.log('Synced forum topics:', topics.length);
    } catch (error) {
      console.error('Failed to sync forum data:', error);
    }
  }

  // Sync study group data
  private async syncStudyGroupData(): Promise<void> {
    try {
      const groups = await databaseOperations.getStudyGroups();
      // Update local study group data
      console.log('Synced study groups:', groups.length);
    } catch (error) {
      console.error('Failed to sync study group data:', error);
    }
  }

  // Sync peer review data
  private async syncPeerReviewData(): Promise<void> {
    try {
      const projects = await databaseOperations.list('peer_review_projects');
      // Update local peer review data
      console.log('Synced peer review projects:', projects.length);
    } catch (error) {
      console.error('Failed to sync peer review data:', error);
    }
  }

  // Sync social data
  private async syncSocialData(): Promise<void> {
    try {
      const authState = authManager.getAuthState();
      if (!authState.user) return;

      const feed = await databaseOperations.getUserFeed(authState.user.id);
      // Update local social data
      console.log('Synced social feed:', feed.length);
    } catch (error) {
      console.error('Failed to sync social data:', error);
    }
  }

  // Upload file
  async uploadFile(file: File, metadata: any): Promise<any> {
    if (!this.config.enableFileUpload) {
      throw new Error('File upload is disabled');
    }

    try {
      const result = await fileManager.uploadFile(file, metadata);
      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(conversationId: string, content: string, type: string = 'text'): Promise<any> {
    try {
      // Send via WebSocket for real-time delivery
      if (this.state.isWebSocketConnected) {
        websocketClient.sendMessage(conversationId, content, type);
      }
      
      // Also save to database
      const message = await databaseOperations.createMessage({
        conversationId,
        content,
        type,
        senderId: authManager.getAuthState().user?.id
      });
      
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Create mentor profile
  async createMentorProfile(profileData: any): Promise<any> {
    try {
      const mentor = await databaseOperations.createMentor(profileData);
      
      // Update local mentor profile
      mentorProfileManager.updateProfile(mentor.id, mentor);
      
      return mentor;
    } catch (error) {
      console.error('Failed to create mentor profile:', error);
      throw error;
    }
  }

  // Book session
  async bookSession(bookingData: any): Promise<any> {
    try {
      const booking = await databaseOperations.createBooking(bookingData);
      
      // Update local booking system
      bookingSystem.createBooking(booking);
      
      return booking;
    } catch (error) {
      console.error('Failed to book session:', error);
      throw error;
    }
  }

  // Create forum topic
  async createForumTopic(topicData: any): Promise<any> {
    try {
      const topic = await databaseOperations.createForumTopic(topicData);
      
      // Update local forums system
      forumsSystem.createTopic(topic);
      
      return topic;
    } catch (error) {
      console.error('Failed to create forum topic:', error);
      throw error;
    }
  }

  // Join study group
  async joinStudyGroup(groupId: string, userId: string): Promise<any> {
    try {
      const result = await databaseOperations.joinStudyGroup(groupId, userId);
      
      // Update local study groups system
      studyGroupsSystem.joinGroup(groupId, userId);
      
      return result;
    } catch (error) {
      console.error('Failed to join study group:', error);
      throw error;
    }
  }

  // Create peer review
  async createPeerReview(reviewData: any): Promise<any> {
    try {
      const review = await databaseOperations.createPeerReview(reviewData);
      
      // Update local peer review system
      peerReviewSystem.createReview(review);
      
      return review;
    } catch (error) {
      console.error('Failed to create peer review:', error);
      throw error;
    }
  }

  // Get integration state
  getState(): IntegrationState {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(listener: (state: IntegrationState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Disconnect
  disconnect(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    websocketClient.disconnect();
    
    this.state.isConnected = false;
    this.state.isWebSocketConnected = false;
    this.notifyListeners();
  }

  // Reconnect
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.initialize();
  }
}

// Export singleton instance
export const phase4Integration = new Phase4Integration();
