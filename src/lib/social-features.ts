// Social Features System
// Handles follow, like, share, bookmark, and other social interactions

export interface SocialInteraction {
  id: string;
  userId: string;
  targetType: 'post' | 'comment' | 'project' | 'profile' | 'group' | 'event';
  targetId: string;
  action: 'like' | 'follow' | 'share' | 'bookmark' | 'save' | 'react' | 'mention';
  metadata?: {
    emoji?: string;
    platform?: string;
    message?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocialFeed {
  id: string;
  userId: string;
  type: 'post' | 'project' | 'achievement' | 'event' | 'milestone';
  content: {
    title: string;
    description: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video' | 'document';
      thumbnail?: string;
    }>;
    tags: string[];
    mentions: string[];
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  visibility: 'public' | 'followers' | 'connections' | 'private';
  isPinned: boolean;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention' | 'achievement' | 'milestone' | 'event';
  title: string;
  message: string;
  data: {
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    targetType: string;
    targetId: string;
    targetTitle?: string;
    metadata?: Record<string, any>;
  };
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialConnection {
  id: string;
  userId: string;
  targetUserId: string;
  type: 'follow' | 'connection' | 'block' | 'mute';
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface SocialActivity {
  id: string;
  userId: string;
  type: 'post_created' | 'project_published' | 'achievement_earned' | 'milestone_completed' | 'event_joined' | 'group_joined' | 'review_completed';
  title: string;
  description: string;
  metadata: Record<string, any>;
  visibility: 'public' | 'followers' | 'connections' | 'private';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    followers: number;
    following: number;
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
    engagement: number;
    reach: number;
  };
  trends: {
    followers: Array<{ date: string; count: number }>;
    engagement: Array<{ date: string; count: number }>;
    posts: Array<{ date: string; count: number }>;
  };
  topContent: Array<{
    id: string;
    title: string;
    type: string;
    engagement: number;
    createdAt: string;
  }>;
  topHashtags: Array<{
    tag: string;
    count: number;
  }>;
  audience: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
    interests: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
}

export class SocialFeaturesSystem {
  private interactions: Map<string, SocialInteraction> = new Map();
  private feeds: Map<string, SocialFeed> = new Map();
  private notifications: Map<string, SocialNotification> = new Map();
  private connections: Map<string, SocialConnection> = new Map();
  private activities: Map<string, SocialActivity> = new Map();
  private analytics: Map<string, SocialAnalytics> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create social interaction
  createInteraction(interactionData: Omit<SocialInteraction, 'id' | 'createdAt' | 'updatedAt'>): SocialInteraction {
    const interaction: SocialInteraction = {
      id: `interaction-${Date.now()}`,
      ...interactionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.interactions.set(interaction.id, interaction);
    this.saveToLocalStorage();

    return interaction;
  }

  // Like content
  likeContent(userId: string, targetType: string, targetId: string): SocialInteraction | null {
    const existingInteraction = Array.from(this.interactions.values())
      .find(i => i.userId === userId && i.targetType === targetType && i.targetId === targetId && i.action === 'like');

    if (existingInteraction) {
      // Unlike
      this.interactions.delete(existingInteraction.id);
      this.saveToLocalStorage();
      return null;
    }

    return this.createInteraction({
      userId,
      targetType: targetType as any,
      targetId,
      action: 'like'
    });
  }

  // Follow user
  followUser(userId: string, targetUserId: string): SocialConnection | null {
    const existingConnection = Array.from(this.connections.values())
      .find(c => c.userId === userId && c.targetUserId === targetUserId && c.type === 'follow');

    if (existingConnection) {
      // Unfollow
      this.connections.delete(existingConnection.id);
      this.saveToLocalStorage();
      return null;
    }

    const connection: SocialConnection = {
      id: `connection-${Date.now()}`,
      userId,
      targetUserId,
      type: 'follow',
      status: 'accepted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.connections.set(connection.id, connection);
    this.saveToLocalStorage();

    return connection;
  }

  // Share content
  shareContent(userId: string, targetType: string, targetId: string, platform?: string, message?: string): SocialInteraction {
    return this.createInteraction({
      userId,
      targetType: targetType as any,
      targetId,
      action: 'share',
      metadata: {
        platform,
        message
      }
    });
  }

  // Bookmark content
  bookmarkContent(userId: string, targetType: string, targetId: string): SocialInteraction | null {
    const existingInteraction = Array.from(this.interactions.values())
      .find(i => i.userId === userId && i.targetType === targetType && i.targetId === targetId && i.action === 'bookmark');

    if (existingInteraction) {
      // Remove bookmark
      this.interactions.delete(existingInteraction.id);
      this.saveToLocalStorage();
      return null;
    }

    return this.createInteraction({
      userId,
      targetType: targetType as any,
      targetId,
      action: 'bookmark'
    });
  }

  // React to content
  reactToContent(userId: string, targetType: string, targetId: string, emoji: string): SocialInteraction | null {
    const existingInteraction = Array.from(this.interactions.values())
      .find(i => i.userId === userId && i.targetType === targetType && i.targetId === targetId && i.action === 'react');

    if (existingInteraction) {
      if (existingInteraction.metadata?.emoji === emoji) {
        // Remove reaction
        this.interactions.delete(existingInteraction.id);
        this.saveToLocalStorage();
        return null;
      } else {
        // Update reaction
        existingInteraction.metadata = { ...existingInteraction.metadata, emoji };
        existingInteraction.updatedAt = new Date().toISOString();
        this.interactions.set(existingInteraction.id, existingInteraction);
        this.saveToLocalStorage();
        return existingInteraction;
      }
    }

    return this.createInteraction({
      userId,
      targetType: targetType as any,
      targetId,
      action: 'react',
      metadata: { emoji }
    });
  }

  // Get user interactions
  getUserInteractions(userId: string, action?: string, targetType?: string): SocialInteraction[] {
    return Array.from(this.interactions.values())
      .filter(i => i.userId === userId && (!action || i.action === action) && (!targetType || i.targetType === targetType))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get content interactions
  getContentInteractions(targetType: string, targetId: string, action?: string): SocialInteraction[] {
    return Array.from(this.interactions.values())
      .filter(i => i.targetType === targetType && i.targetId === targetId && (!action || i.action === action))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get user followers
  getFollowers(userId: string): SocialConnection[] {
    return Array.from(this.connections.values())
      .filter(c => c.targetUserId === userId && c.type === 'follow' && c.status === 'accepted')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get user following
  getFollowing(userId: string): SocialConnection[] {
    return Array.from(this.connections.values())
      .filter(c => c.userId === userId && c.type === 'follow' && c.status === 'accepted')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Create social feed item
  createFeedItem(feedData: Omit<SocialFeed, 'id' | 'createdAt' | 'updatedAt' | 'engagement'>): SocialFeed {
    const feed: SocialFeed = {
      id: `feed-${Date.now()}`,
      ...feedData,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        views: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feeds.set(feed.id, feed);
    this.saveToLocalStorage();

    return feed;
  }

  // Get user feed
  getUserFeed(userId: string, limit: number = 20, offset: number = 0): SocialFeed[] {
    // Get following users
    const following = this.getFollowing(userId).map(c => c.targetUserId);
    
    // Get feed items from following users and public items
    return Array.from(this.feeds.values())
      .filter(feed => 
        following.includes(feed.author.id) || 
        feed.visibility === 'public' ||
        feed.userId === userId
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Update feed engagement
  updateFeedEngagement(feedId: string, engagement: Partial<SocialFeed['engagement']>): SocialFeed | null {
    const feed = this.feeds.get(feedId);
    if (!feed) return null;

    feed.engagement = { ...feed.engagement, ...engagement };
    feed.updatedAt = new Date().toISOString();
    this.feeds.set(feedId, feed);
    this.saveToLocalStorage();

    return feed;
  }

  // Create notification
  createNotification(notificationData: Omit<SocialNotification, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>): SocialNotification {
    const notification: SocialNotification = {
      id: `notification-${Date.now()}`,
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notifications.set(notification.id, notification);
    this.saveToLocalStorage();

    return notification;
  }

  // Get user notifications
  getUserNotifications(userId: string, limit: number = 20, offset: number = 0): SocialNotification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): SocialNotification | null {
    const notification = this.notifications.get(notificationId);
    if (!notification) return null;

    notification.isRead = true;
    notification.updatedAt = new Date().toISOString();
    this.notifications.set(notificationId, notification);
    this.saveToLocalStorage();

    return notification;
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(userId: string): void {
    const userNotifications = this.getUserNotifications(userId);
    userNotifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.updatedAt = new Date().toISOString();
        this.notifications.set(notification.id, notification);
      }
    });
    this.saveToLocalStorage();
  }

  // Get unread notification count
  getUnreadNotificationCount(userId: string): number {
    return this.getUserNotifications(userId).filter(n => !n.isRead).length;
  }

  // Create social activity
  createActivity(activityData: Omit<SocialActivity, 'id' | 'createdAt' | 'updatedAt' | 'isVisible'>): SocialActivity {
    const activity: SocialActivity = {
      id: `activity-${Date.now()}`,
      ...activityData,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.activities.set(activity.id, activity);
    this.saveToLocalStorage();

    return activity;
  }

  // Get user activities
  getUserActivities(userId: string, limit: number = 20, offset: number = 0): SocialActivity[] {
    return Array.from(this.activities.values())
      .filter(a => a.userId === userId && a.isVisible)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Get user analytics
  getUserAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): SocialAnalytics {
    const existingAnalytics = this.analytics.get(`${userId}-${period}`);
    if (existingAnalytics) {
      return existingAnalytics;
    }

    // Calculate analytics
    const startDate = this.getStartDate(period);
    const endDate = new Date().toISOString();

    const userInteractions = this.getUserInteractions(userId);
    const userFeeds = Array.from(this.feeds.values()).filter(f => f.userId === userId);
    const userActivities = this.getUserActivities(userId);

    const metrics = {
      followers: this.getFollowers(userId).length,
      following: this.getFollowing(userId).length,
      posts: userFeeds.length,
      likes: userInteractions.filter(i => i.action === 'like').length,
      comments: 0, // Would need to integrate with comment system
      shares: userInteractions.filter(i => i.action === 'share').length,
      bookmarks: userInteractions.filter(i => i.action === 'bookmark').length,
      views: userFeeds.reduce((sum, f) => sum + f.engagement.views, 0),
      engagement: 0, // Would need to calculate based on interactions
      reach: 0 // Would need to calculate based on followers and shares
    };

    const trends = {
      followers: this.calculateTrends(userId, 'followers', startDate, endDate),
      engagement: this.calculateTrends(userId, 'engagement', startDate, endDate),
      posts: this.calculateTrends(userId, 'posts', startDate, endDate)
    };

    const topContent = userFeeds
      .sort((a, b) => (b.engagement.likes + b.engagement.comments + b.engagement.shares) - (a.engagement.likes + a.engagement.comments + a.engagement.shares))
      .slice(0, 10)
      .map(feed => ({
        id: feed.id,
        title: feed.content.title,
        type: feed.type,
        engagement: feed.engagement.likes + feed.engagement.comments + feed.engagement.shares,
        createdAt: feed.createdAt
      }));

    const topHashtags = this.calculateTopHashtags(userFeeds);

    const analytics: SocialAnalytics = {
      userId,
      period,
      metrics,
      trends,
      topContent,
      topHashtags,
      audience: {
        ageGroups: {},
        locations: {},
        interests: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.analytics.set(`${userId}-${period}`, analytics);
    this.saveToLocalStorage();

    return analytics;
  }

  // Get start date for period
  private getStartDate(period: string): string {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // Calculate trends
  private calculateTrends(userId: string, metric: string, startDate: string, endDate: string): Array<{ date: string; count: number }> {
    // Simplified trend calculation
    const trends: Array<{ date: string; count: number }> = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < days; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simplified count calculation
      let count = 0;
      if (metric === 'followers') {
        count = this.getFollowers(userId).filter(f => 
          new Date(f.createdAt) <= date
        ).length;
      } else if (metric === 'posts') {
        count = Array.from(this.feeds.values()).filter(f => 
          f.userId === userId && new Date(f.createdAt) <= date
        ).length;
      }

      trends.push({ date: dateStr, count });
    }

    return trends;
  }

  // Calculate top hashtags
  private calculateTopHashtags(feeds: SocialFeed[]): Array<{ tag: string; count: number }> {
    const hashtagCounts: Record<string, number> = {};
    
    feeds.forEach(feed => {
      feed.content.tags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Search content
  searchContent(query: string, filters: {
    type?: string;
    tags?: string[];
    authorId?: string;
    dateRange?: { start: string; end: string };
  } = {}): SocialFeed[] {
    let feeds = Array.from(this.feeds.values());

    if (filters.type) {
      feeds = feeds.filter(feed => feed.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      feeds = feeds.filter(feed =>
        filters.tags!.some(tag => feed.content.tags.includes(tag))
      );
    }

    if (filters.authorId) {
      feeds = feeds.filter(feed => feed.author.id === filters.authorId);
    }

    if (filters.dateRange) {
      feeds = feeds.filter(feed => {
        const feedDate = new Date(feed.createdAt);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return feedDate >= startDate && feedDate <= endDate;
      });
    }

    if (query) {
      const queryLower = query.toLowerCase();
      feeds = feeds.filter(feed =>
        feed.content.title.toLowerCase().includes(queryLower) ||
        feed.content.description.toLowerCase().includes(queryLower) ||
        feed.content.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    return feeds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        interactions: Object.fromEntries(this.interactions),
        feeds: Object.fromEntries(this.feeds),
        notifications: Object.fromEntries(this.notifications),
        connections: Object.fromEntries(this.connections),
        activities: Object.fromEntries(this.activities),
        analytics: Object.fromEntries(this.analytics)
      };
      localStorage.setItem('social-features', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save social features data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('social-features');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.interactions) {
        this.interactions = new Map(Object.entries(parsed.interactions));
      }
      
      if (parsed.feeds) {
        this.feeds = new Map(Object.entries(parsed.feeds));
      }
      
      if (parsed.notifications) {
        this.notifications = new Map(Object.entries(parsed.notifications));
      }
      
      if (parsed.connections) {
        this.connections = new Map(Object.entries(parsed.connections));
      }
      
      if (parsed.activities) {
        this.activities = new Map(Object.entries(parsed.activities));
      }
      
      if (parsed.analytics) {
        this.analytics = new Map(Object.entries(parsed.analytics));
      }
    } catch (error) {
      console.error('Failed to load social features data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.interactions.clear();
    this.feeds.clear();
    this.notifications.clear();
    this.connections.clear();
    this.activities.clear();
    this.analytics.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const socialFeaturesSystem = new SocialFeaturesSystem();
