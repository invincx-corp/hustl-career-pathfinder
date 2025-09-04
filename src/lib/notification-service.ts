import { supabase } from './supabase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'social' | 'system' | 'learning' | 'mentor';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  scheduledFor?: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  category?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderNotifications: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
  mentorNotifications: boolean;
  systemNotifications: boolean;
  reminderTime: string;
  reminderDays: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

class NotificationService {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private unreadCountListeners: ((count: number) => void)[] = [];
  private currentUserId: string | null = null;
  private realtimeSubscription: any = null;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.currentUserId = user.id;
      this.setupRealtimeSubscription();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUserId = session.user.id;
        this.setupRealtimeSubscription();
      } else if (event === 'SIGNED_OUT') {
        this.currentUserId = null;
        this.cleanupRealtimeSubscription();
      }
    });
  }

  private setupRealtimeSubscription() {
    if (!this.currentUserId) return;

    this.cleanupRealtimeSubscription();

    // Subscribe to notifications table changes
    this.realtimeSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.currentUserId}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          this.fetchNotifications();
        }
      )
      .subscribe();
  }

  private cleanupRealtimeSubscription() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }

  // Fetch notifications from database
  async fetchNotifications(): Promise<Notification[]> {
    if (!this.currentUserId) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.currentUserId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      const notifications: Notification[] = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        isRead: notification.is_read,
        isArchived: notification.is_archived,
        createdAt: notification.created_at,
        scheduledFor: notification.scheduled_for,
        actionUrl: notification.action_url,
        actionText: notification.action_text,
        icon: notification.data?.icon || notification.icon,
        category: notification.data?.category || notification.category,
      }));

      this.notifyListeners(notifications);
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    if (!this.currentUserId) return 0;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUserId)
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      this.notifyUnreadCountListeners(count || 0);
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', this.currentUserId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Refresh notifications
      this.fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', this.currentUserId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Refresh notifications
      this.fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Archive notification
  async archiveNotification(notificationId: string): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', this.currentUserId);

      if (error) {
        console.error('Error archiving notification:', error);
        return false;
      }

      // Refresh notifications
      this.fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error archiving notification:', error);
      return false;
    }
  }

  // Create a new notification (for testing or admin use)
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'isArchived'>): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: this.currentUserId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          action_url: notification.actionUrl,
          action_text: notification.actionText,
          data: {
            icon: notification.icon,
            category: notification.category,
          },
          scheduled_for: notification.scheduledFor,
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    if (!this.currentUserId) return null;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', this.currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching notification settings:', error);
        return null;
      }

      if (!data) {
        // Return default settings if none exist
        return {
          emailNotifications: true,
          pushNotifications: true,
          reminderNotifications: true,
          achievementNotifications: true,
          socialNotifications: true,
          mentorNotifications: true,
          systemNotifications: true,
          reminderTime: '09:00',
          reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          frequency: 'immediate'
        };
      }

      return data.settings as NotificationSettings;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: NotificationSettings): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: this.currentUserId,
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Event listeners
  onNotificationsChange(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  onUnreadCountChange(callback: (count: number) => void) {
    this.unreadCountListeners.push(callback);
    return () => {
      this.unreadCountListeners = this.unreadCountListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(notifications: Notification[]) {
    this.listeners.forEach(listener => listener(notifications));
  }

  private notifyUnreadCountListeners(count: number) {
    this.unreadCountListeners.forEach(listener => listener(count));
  }

  // Cleanup
  destroy() {
    this.cleanupRealtimeSubscription();
    this.listeners = [];
    this.unreadCountListeners = [];
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Helper function to create sample notifications for testing
export const createSampleNotifications = async (userId: string) => {
  const sampleNotifications = [
    {
      title: 'Welcome to Nexa!',
      message: 'Start your learning journey by completing your first lesson.',
      type: 'system' as const,
      priority: 'high' as const,
      actionUrl: '/learning-paths',
      actionText: 'Start Learning',
      icon: '🎉',
      category: 'welcome'
    },
    {
      title: 'Achievement Unlocked!',
      message: 'You\'ve completed your first lesson. Keep up the great work!',
      type: 'achievement' as const,
      priority: 'medium' as const,
      actionUrl: '/achievements',
      actionText: 'View Achievements',
      icon: '🏆',
      category: 'achievement'
    },
    {
      title: 'New Mentor Available',
      message: 'Sarah Johnson is now available for mentorship in React development.',
      type: 'mentor' as const,
      priority: 'low' as const,
      actionUrl: '/mentor-matchmaking',
      actionText: 'Connect',
      icon: '👩‍💻',
      category: 'mentorship'
    }
  ];

  for (const notification of sampleNotifications) {
    await notificationService.createNotification(notification);
  }
};