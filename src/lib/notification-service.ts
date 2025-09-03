import { socketService } from './api-service';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    achievements: boolean;
    reminders: boolean;
    updates: boolean;
    opportunities: boolean;
    mentorship: boolean;
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private preferences: NotificationPreferences = {
    email: true,
    push: true,
    inApp: true,
    types: {
      achievements: true,
      reminders: true,
      updates: true,
      opportunities: true,
      mentorship: true,
    },
  };

  constructor() {
    this.initializeSocketListeners();
    this.loadNotifications();
    this.loadPreferences();
  }

  private initializeSocketListeners() {
    // Listen for real-time notifications
    socketService.on('notification', (data: any) => {
      this.addNotification({
        id: `notification-${Date.now()}`,
        type: data.type || 'info',
        title: data.title || 'New Notification',
        message: data.message,
        priority: data.priority || 'medium',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        metadata: data.metadata,
      });
    });

    // Listen for progress updates
    socketService.on('progress-update', (data: any) => {
      this.addNotification({
        id: `progress-${Date.now()}`,
        type: 'success',
        title: 'Skill Progress Updated',
        message: `Great job! You've advanced in ${data.skill} to level ${data.level}`,
        priority: 'medium',
        timestamp: data.timestamp,
        read: false,
        actionUrl: '/dashboard',
        actionText: 'View Progress',
        metadata: data,
      });
    });

    // Listen for roadmap updates
    socketService.on('roadmap-progress', (data: any) => {
      this.addNotification({
        id: `roadmap-${Date.now()}`,
        type: 'info',
        title: 'Roadmap Progress',
        message: `You've completed step ${data.step} in your roadmap!`,
        priority: 'medium',
        timestamp: data.timestamp,
        read: false,
        actionUrl: '/roadmaps',
        actionText: 'View Roadmap',
        metadata: data,
      });
    });

    // Listen for AI coach responses
    socketService.on('ai-coach-response', (data: any) => {
      this.addNotification({
        id: `ai-coach-${Date.now()}`,
        type: 'info',
        title: 'AI Coach Response',
        message: data.message,
        priority: 'low',
        timestamp: data.timestamp,
        read: false,
        actionUrl: '/coach',
        actionText: 'View Response',
        metadata: data,
      });
    });
  }

  // Add a new notification
  addNotification(notification: Notification) {
    // Check if user wants this type of notification
    if (!this.shouldShowNotification(notification)) {
      return;
    }

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();

    // Show browser notification if enabled
    if (this.preferences.push && 'Notification' in window) {
      this.showBrowserNotification(notification);
    }
  }

  // Check if notification should be shown based on preferences
  private shouldShowNotification(notification: Notification): boolean {
    if (!this.preferences.inApp) return false;

    switch (notification.type) {
      case 'achievement':
        return this.preferences.types.achievements;
      case 'reminder':
        return this.preferences.types.reminders;
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        return this.preferences.types.updates;
      default:
        return true;
    }
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification) {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/nexa-logo-192x192.svg',
        badge: '/nexa-favicon-32x32.svg',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Remove notification
  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get notification count
  getNotificationCount(): number {
    return this.notifications.length;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Create specific notification types
  createAchievementNotification(title: string, message: string, metadata?: any) {
    this.addNotification({
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title,
      message,
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: '/achievements',
      actionText: 'View Achievement',
      metadata,
    });
  }

  createReminderNotification(title: string, message: string, actionUrl?: string) {
    this.addNotification({
      id: `reminder-${Date.now()}`,
      type: 'reminder',
      title,
      message,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionText: 'Take Action',
    });
  }

  createSuccessNotification(title: string, message: string, actionUrl?: string) {
    this.addNotification({
      id: `success-${Date.now()}`,
      type: 'success',
      title,
      message,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionText: 'View Details',
    });
  }

  createErrorNotification(title: string, message: string) {
    this.addNotification({
      id: `error-${Date.now()}`,
      type: 'error',
      title,
      message,
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  createInfoNotification(title: string, message: string, actionUrl?: string) {
    this.addNotification({
      id: `info-${Date.now()}`,
      type: 'info',
      title,
      message,
      priority: 'low',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionText: 'Learn More',
    });
  }

  // Notification preferences
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  // Save notifications to localStorage
  private saveNotifications() {
    try {
      localStorage.setItem('nexa-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load notifications from localStorage
  private loadNotifications() {
    try {
      const saved = localStorage.getItem('nexa-notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save preferences to localStorage
  private savePreferences() {
    try {
      localStorage.setItem('nexa-notification-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Load preferences from localStorage
  private loadPreferences() {
    try {
      const saved = localStorage.getItem('nexa-notification-preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Schedule a notification for later
  scheduleNotification(notification: Notification, delay: number) {
    setTimeout(() => {
      this.addNotification(notification);
    }, delay);
  }

  // Create recurring reminders
  createRecurringReminder(
    title: string,
    message: string,
    interval: number, // in milliseconds
    actionUrl?: string
  ) {
    const scheduleNext = () => {
      this.addNotification({
        id: `recurring-${Date.now()}`,
        type: 'reminder',
        title,
        message,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl,
        actionText: 'Take Action',
      });

      setTimeout(scheduleNext, interval);
    };

    scheduleNext();
  }

  // Smart notifications based on user behavior
  createSmartNotification(userId: string, context: any) {
    // This would integrate with AI to create contextual notifications
    // For now, we'll create some basic smart notifications
    
    const { lastActivity, currentSkills, goals, learningProgress } = context;
    
    // If user hasn't been active for a while
    if (lastActivity && Date.now() - new Date(lastActivity).getTime() > 7 * 24 * 60 * 60 * 1000) {
      this.createReminderNotification(
        'Welcome Back!',
        'We missed you! Ready to continue your learning journey?',
        '/dashboard'
      );
    }

    // If user is making good progress
    if (learningProgress && learningProgress.completedSteps > 0) {
      this.createAchievementNotification(
        'Great Progress!',
        `You've completed ${learningProgress.completedSteps} learning steps this week!`,
        learningProgress
      );
    }

    // If user has new opportunities
    if (goals && goals.length > 0) {
      this.createInfoNotification(
        'New Opportunities',
        'We found some opportunities that match your goals!',
        '/opportunities'
      );
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService;
