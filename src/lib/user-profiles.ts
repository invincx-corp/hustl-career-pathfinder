// User Profiles System
// Handles public user profiles, networking features, and social interactions

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  headline: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  location: {
    city: string;
    country: string;
    timezone: string;
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  professional: {
    currentRole: string;
    company: string;
    industry: string;
    experience: string;
    skills: string[];
    expertise: string[];
    achievements: string[];
    certifications: string[];
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startYear: number;
      endYear?: number;
      gpa?: number;
    }>;
    workExperience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      description: string;
      achievements: string[];
    }>;
  };
  personal: {
    interests: string[];
    hobbies: string[];
    languages: string[];
    availability: string;
    timezone: string;
  };
  social: {
    followers: string[];
    following: string[];
    connections: string[];
    blocked: string[];
    visibility: 'public' | 'connections' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    allowConnectionRequests: boolean;
  };
  stats: {
    profileViews: number;
    postCount: number;
    connectionCount: number;
    followerCount: number;
    followingCount: number;
    lastActive: string;
    joinDate: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      connectionRequests: boolean;
      messages: boolean;
      mentions: boolean;
      comments: boolean;
      likes: boolean;
    };
    privacy: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      showProfileViews: boolean;
      showConnections: boolean;
    };
    content: {
      language: string;
      theme: 'light' | 'dark' | 'auto';
      fontSize: 'small' | 'medium' | 'large';
    };
  };
  isVerified: boolean;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UserPost {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'event';
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'document';
    caption?: string;
  }>;
  tags: string[];
  mentions: string[];
  visibility: 'public' | 'connections' | 'private';
  likes: string[];
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    likes: string[];
    replies: Array<{
      id: string;
      userId: string;
      content: string;
      createdAt: string;
      likes: string[];
    }>;
  }>;
  shares: string[];
  bookmarks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'profile_view' | 'post_like' | 'post_comment' | 'post_share' | 'connection_request' | 'connection_accepted' | 'profile_update' | 'skill_added' | 'achievement_added';
  targetUserId?: string;
  targetPostId?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'post_share' | 'mention' | 'message' | 'achievement' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export class UserProfilesSystem {
  private profiles: Map<string, UserProfile> = new Map();
  private connectionRequests: Map<string, ConnectionRequest> = new Map();
  private posts: Map<string, UserPost> = new Map();
  private activities: Map<string, UserActivity> = new Map();
  private notifications: Map<string, UserNotification> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create user profile
  createProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'isVerified' | 'isActive' | 'isPublic'>): UserProfile {
    const profile: UserProfile = {
      id: `profile-${Date.now()}`,
      ...profileData,
      stats: {
        profileViews: 0,
        postCount: 0,
        connectionCount: 0,
        followerCount: 0,
        followingCount: 0,
        lastActive: new Date().toISOString(),
        joinDate: new Date().toISOString()
      },
      isVerified: false,
      isActive: true,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.profiles.set(profile.id, profile);
    this.saveToLocalStorage();

    return profile;
  }

  // Get user profile
  getProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }

  // Update user profile
  updateProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'stats'>>): UserProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.profiles.set(userId, updatedProfile);
    this.saveToLocalStorage();

    return updatedProfile;
  }

  // Search profiles
  searchProfiles(query: string, filters: {
    skills?: string[];
    location?: string;
    industry?: string;
    experience?: string;
    availability?: string;
  } = {}): UserProfile[] {
    let results = Array.from(this.profiles.values()).filter(profile => profile.isPublic);

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(profile =>
        profile.name.toLowerCase().includes(lowerQuery) ||
        profile.bio.toLowerCase().includes(lowerQuery) ||
        profile.headline.toLowerCase().includes(lowerQuery) ||
        profile.professional.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
        profile.professional.expertise.some(exp => exp.toLowerCase().includes(lowerQuery))
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(profile =>
        filters.skills!.some(skill => profile.professional.skills.includes(skill))
      );
    }

    if (filters.location) {
      results = results.filter(profile =>
        profile.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        profile.location.country.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.industry) {
      results = results.filter(profile =>
        profile.professional.industry.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    return results.sort((a, b) => b.stats.profileViews - a.stats.profileViews);
  }

  // Get profile suggestions
  getProfileSuggestions(userId: string, limit: number = 10): UserProfile[] {
    const userProfile = this.getProfile(userId);
    if (!userProfile) return [];

    const suggestions = Array.from(this.profiles.values())
      .filter(profile => 
        profile.id !== userId && 
        profile.isPublic &&
        !userProfile.social.connections.includes(profile.id) &&
        !userProfile.social.blocked.includes(profile.id)
      )
      .map(profile => ({
        profile,
        score: this.calculateCompatibilityScore(userProfile, profile)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.profile);

    return suggestions;
  }

  // Calculate compatibility score
  private calculateCompatibilityScore(profile1: UserProfile, profile2: UserProfile): number {
    let score = 0;

    // Skills overlap
    const skillsOverlap = profile1.professional.skills.filter(skill => 
      profile2.professional.skills.includes(skill)
    ).length;
    score += (skillsOverlap / Math.max(profile1.professional.skills.length, 1)) * 30;

    // Industry match
    if (profile1.professional.industry === profile2.professional.industry) {
      score += 20;
    }

    // Location proximity
    if (profile1.location.country === profile2.location.country) {
      score += 15;
    }
    if (profile1.location.city === profile2.location.city) {
      score += 10;
    }

    // Interests overlap
    const interestsOverlap = profile1.personal.interests.filter(interest => 
      profile2.personal.interests.includes(interest)
    ).length;
    score += (interestsOverlap / Math.max(profile1.personal.interests.length, 1)) * 15;

    // Mutual connections
    const mutualConnections = profile1.social.connections.filter(conn => 
      profile2.social.connections.includes(conn)
    ).length;
    score += mutualConnections * 5;

    return Math.min(score, 100);
  }

  // Send connection request
  sendConnectionRequest(fromUserId: string, toUserId: string, message?: string): ConnectionRequest | null {
    const existingRequest = Array.from(this.connectionRequests.values())
      .find(req => req.fromUserId === fromUserId && req.toUserId === toUserId);

    if (existingRequest) return null;

    const request: ConnectionRequest = {
      id: `request-${Date.now()}`,
      fromUserId,
      toUserId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.connectionRequests.set(request.id, request);
    this.saveToLocalStorage();

    return request;
  }

  // Respond to connection request
  respondToConnectionRequest(requestId: string, status: 'accepted' | 'rejected'): ConnectionRequest | null {
    const request = this.connectionRequests.get(requestId);
    if (!request) return null;

    request.status = status;
    request.updatedAt = new Date().toISOString();

    if (status === 'accepted') {
      const fromProfile = this.getProfile(request.fromUserId);
      const toProfile = this.getProfile(request.toUserId);

      if (fromProfile && toProfile) {
        fromProfile.social.connections.push(request.toUserId);
        toProfile.social.connections.push(request.fromUserId);
        fromProfile.stats.connectionCount++;
        toProfile.stats.connectionCount++;

        this.profiles.set(request.fromUserId, fromProfile);
        this.profiles.set(request.toUserId, toProfile);
      }
    }

    this.connectionRequests.set(requestId, request);
    this.saveToLocalStorage();

    return request;
  }

  // Get connection requests
  getConnectionRequests(userId: string): ConnectionRequest[] {
    return Array.from(this.connectionRequests.values())
      .filter(req => req.toUserId === userId && req.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get connections
  getConnections(userId: string): UserProfile[] {
    const profile = this.getProfile(userId);
    if (!profile) return [];

    return profile.social.connections
      .map(connId => this.getProfile(connId))
      .filter(profile => profile !== null) as UserProfile[];
  }

  // Create post
  createPost(postData: Omit<UserPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'shares' | 'bookmarks'>): UserPost {
    const post: UserPost = {
      id: `post-${Date.now()}`,
      ...postData,
      likes: [],
      comments: [],
      shares: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.posts.set(post.id, post);

    // Update user stats
    const profile = this.getProfile(post.userId);
    if (profile) {
      profile.stats.postCount++;
      this.profiles.set(post.userId, profile);
    }

    this.saveToLocalStorage();
    return post;
  }

  // Get user posts
  getUserPosts(userId: string, limit: number = 20): UserPost[] {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Get feed posts
  getFeedPosts(userId: string, limit: number = 20): UserPost[] {
    const profile = this.getProfile(userId);
    if (!profile) return [];

    const connectionIds = profile.social.connections;
    const allPosts = Array.from(this.posts.values())
      .filter(post => 
        post.userId === userId || 
        connectionIds.includes(post.userId) ||
        post.visibility === 'public'
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allPosts;
  }

  // Like post
  likePost(postId: string, userId: string): UserPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Comment on post
  commentOnPost(postId: string, userId: string, content: string): UserPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    const comment = {
      id: `comment-${Date.now()}`,
      userId,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };

    post.comments.push(comment);
    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Share post
  sharePost(postId: string, userId: string): UserPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    if (!post.shares.includes(userId)) {
      post.shares.push(userId);
      post.updatedAt = new Date().toISOString();
      this.posts.set(postId, post);
      this.saveToLocalStorage();
    }

    return post;
  }

  // Bookmark post
  bookmarkPost(postId: string, userId: string): UserPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    if (post.bookmarks.includes(userId)) {
      post.bookmarks = post.bookmarks.filter(id => id !== userId);
    } else {
      post.bookmarks.push(userId);
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Create activity
  createActivity(activityData: Omit<UserActivity, 'id' | 'createdAt'>): UserActivity {
    const activity: UserActivity = {
      id: `activity-${Date.now()}`,
      ...activityData,
      createdAt: new Date().toISOString()
    };

    this.activities.set(activity.id, activity);
    this.saveToLocalStorage();

    return activity;
  }

  // Get user activities
  getUserActivities(userId: string, limit: number = 20): UserActivity[] {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Create notification
  createNotification(notificationData: Omit<UserNotification, 'id' | 'createdAt' | 'isRead'>): UserNotification {
    const notification: UserNotification = {
      id: `notification-${Date.now()}`,
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.set(notification.id, notification);
    this.saveToLocalStorage();

    return notification;
  }

  // Get user notifications
  getUserNotifications(userId: string, limit: number = 20): UserNotification[] {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): UserNotification | null {
    const notification = this.notifications.get(notificationId);
    if (!notification) return null;

    notification.isRead = true;
    this.notifications.set(notificationId, notification);
    this.saveToLocalStorage();

    return notification;
  }

  // Get user statistics
  getUserStatistics(userId: string): {
    profileViews: number;
    postCount: number;
    connectionCount: number;
    followerCount: number;
    followingCount: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
  } {
    const profile = this.getProfile(userId);
    if (!profile) return {
      profileViews: 0,
      postCount: 0,
      connectionCount: 0,
      followerCount: 0,
      followingCount: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      engagementRate: 0
    };

    const userPosts = this.getUserPosts(userId);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.shares.length, 0);
    const engagementRate = userPosts.length > 0 ? (totalLikes + totalComments + totalShares) / userPosts.length : 0;

    return {
      profileViews: profile.stats.profileViews,
      postCount: profile.stats.postCount,
      connectionCount: profile.stats.connectionCount,
      followerCount: profile.stats.followerCount,
      followingCount: profile.stats.followingCount,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate: Math.round(engagementRate * 100) / 100
    };
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        profiles: Object.fromEntries(this.profiles),
        connectionRequests: Object.fromEntries(this.connectionRequests),
        posts: Object.fromEntries(this.posts),
        activities: Object.fromEntries(this.activities),
        notifications: Object.fromEntries(this.notifications)
      };
      localStorage.setItem('user-profiles', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user profiles data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('user-profiles');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.profiles) {
        this.profiles = new Map(Object.entries(parsed.profiles));
      }
      
      if (parsed.connectionRequests) {
        this.connectionRequests = new Map(Object.entries(parsed.connectionRequests));
      }
      
      if (parsed.posts) {
        this.posts = new Map(Object.entries(parsed.posts));
      }
      
      if (parsed.activities) {
        this.activities = new Map(Object.entries(parsed.activities));
      }
      
      if (parsed.notifications) {
        this.notifications = new Map(Object.entries(parsed.notifications));
      }
    } catch (error) {
      console.error('Failed to load user profiles data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.profiles.clear();
    this.connectionRequests.clear();
    this.posts.clear();
    this.activities.clear();
    this.notifications.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const userProfilesSystem = new UserProfilesSystem();
