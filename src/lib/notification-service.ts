// =====================================================
// REAL-TIME NOTIFICATION SERVICE
// =====================================================
// Manages notifications across the entire app in real-time

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'roadmap' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'user' | 'ai' | 'roadmap' | 'achievement';
}

export class NotificationService {
  private static readonly STORAGE_KEY = 'app_notifications';
  private static readonly MAX_NOTIFICATIONS = 100;
  private static listeners: ((notifications: Notification[]) => void)[] = [];

  // Subscribe to notification updates
  static subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private static notifyListeners(): void {
    const notifications = this.getAllNotifications();
    this.listeners.forEach(listener => listener(notifications));
  }

  // Add new notification
  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    const notifications = this.getAllNotifications();
    notifications.unshift(newNotification);

    // Keep only the latest notifications
    if (notifications.length > this.MAX_NOTIFICATIONS) {
      notifications.splice(this.MAX_NOTIFICATIONS);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    this.notifyListeners();

    console.log('🔔 New notification:', newNotification);
    return newNotification;
  }

  // Get all notifications
  static getAllNotifications(): Notification[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Get unread notifications
  static getUnreadNotifications(): Notification[] {
    return this.getAllNotifications().filter(notification => !notification.read);
  }

  // Mark notification as read
  static markAsRead(id: string): void {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  static markAllAsRead(): void {
    const notifications = this.getAllNotifications();
    notifications.forEach(notification => notification.read = true);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    this.notifyListeners();
  }

  // Delete notification
  static deleteNotification(id: string): void {
    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    this.notifyListeners();
  }

  // Clear all notifications
  static clearAll(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    this.notifyListeners();
  }

  // Get notification statistics
  static getStats(): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const notifications = this.getAllNotifications();
    const unread = notifications.filter(n => !n.read).length;

    const byType = notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = notifications.reduce((acc, notif) => {
      acc[notif.category] = (acc[notif.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: notifications.length,
      unread,
      byType,
      byCategory
    };
  }

  // Predefined notification creators
  static createRoadmapNotification(title: string, message: string, actionUrl?: string): Notification {
    return this.addNotification({
      type: 'roadmap',
      title,
      message,
      priority: 'medium',
      category: 'roadmap',
      actionUrl,
      actionText: 'View Roadmap'
    });
  }

  static createAchievementNotification(title: string, message: string): Notification {
    return this.addNotification({
      type: 'achievement',
      title,
      message,
      priority: 'high',
      category: 'achievement'
    });
  }

  static createSystemNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Notification {
    return this.addNotification({
      type,
      title,
      message,
      priority: 'medium',
      category: 'system'
    });
  }

  static createAINotification(title: string, message: string): Notification {
    return this.addNotification({
      type: 'info',
      title,
      message,
      priority: 'medium',
      category: 'ai'
    });
  }
}