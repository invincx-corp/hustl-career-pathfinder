// Discussion Forums System
// Handles topic-based discussions, Q&A, and community interactions

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  parentId?: string;
  subcategories: string[];
  topicCount: number;
  postCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  type: 'discussion' | 'question' | 'announcement' | 'poll' | 'event';
  status: 'open' | 'closed' | 'locked' | 'pinned' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  views: number;
  likes: string[];
  bookmarks: string[];
  followers: string[];
  isSolved: boolean;
  solvedBy?: string;
  solvedAt?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string;
  content: string;
  parentId?: string;
  isAnswer: boolean;
  isAccepted: boolean;
  likes: string[];
  dislikes: string[];
  reactions: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
  mentions: string[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPoll {
  id: string;
  topicId: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: string[];
  }>;
  allowMultiple: boolean;
  isAnonymous: boolean;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumEvent {
  id: string;
  topicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  attendees: string[];
  maxAttendees?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumModeration {
  id: string;
  moderatorId: string;
  targetType: 'topic' | 'post' | 'user';
  targetId: string;
  action: 'warn' | 'hide' | 'lock' | 'delete' | 'ban' | 'unban';
  reason: string;
  duration?: number; // in days
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumNotification {
  id: string;
  userId: string;
  type: 'new_post' | 'new_reply' | 'topic_liked' | 'post_liked' | 'mentioned' | 'topic_solved' | 'moderation_action';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export class ForumsSystem {
  private categories: Map<string, ForumCategory> = new Map();
  private topics: Map<string, ForumTopic> = new Map();
  private posts: Map<string, ForumPost> = new Map();
  private polls: Map<string, ForumPoll> = new Map();
  private events: Map<string, ForumEvent> = new Map();
  private moderations: Map<string, ForumModeration> = new Map();
  private notifications: Map<string, ForumNotification> = new Map();

  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultCategories();
  }

  // Create category
  createCategory(categoryData: Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt' | 'topicCount' | 'postCount' | 'lastActivity' | 'subcategories'>): ForumCategory {
    const category: ForumCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData,
      topicCount: 0,
      postCount: 0,
      lastActivity: new Date().toISOString(),
      subcategories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.categories.set(category.id, category);
    this.saveToLocalStorage();

    return category;
  }

  // Get categories
  getCategories(parentId?: string): ForumCategory[] {
    return Array.from(this.categories.values())
      .filter(cat => cat.isActive && cat.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  // Create topic
  createTopic(topicData: Omit<ForumTopic, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'bookmarks' | 'followers' | 'isSolved' | 'lastActivity'>): ForumTopic {
    const topic: ForumTopic = {
      id: `topic-${Date.now()}`,
      ...topicData,
      views: 0,
      likes: [],
      bookmarks: [],
      followers: [],
      isSolved: false,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.topics.set(topic.id, topic);

    // Update category stats
    const category = this.categories.get(topic.categoryId);
    if (category) {
      category.topicCount++;
      category.lastActivity = new Date().toISOString();
      this.categories.set(category.id, category);
    }

    this.saveToLocalStorage();
    return topic;
  }

  // Get topics
  getTopics(categoryId?: string, filters: {
    status?: ForumTopic['status'];
    type?: ForumTopic['type'];
    authorId?: string;
    tags?: string[];
    search?: string;
  } = {}): ForumTopic[] {
    let topics = Array.from(this.topics.values());

    if (categoryId) {
      topics = topics.filter(topic => topic.categoryId === categoryId);
    }

    if (filters.status) {
      topics = topics.filter(topic => topic.status === filters.status);
    }

    if (filters.type) {
      topics = topics.filter(topic => topic.type === filters.type);
    }

    if (filters.authorId) {
      topics = topics.filter(topic => topic.authorId === filters.authorId);
    }

    if (filters.tags && filters.tags.length > 0) {
      topics = topics.filter(topic =>
        filters.tags!.some(tag => topic.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      topics = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchLower) ||
        topic.content.toLowerCase().includes(searchLower)
      );
    }

    return topics.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  // Get topic
  getTopic(topicId: string): ForumTopic | null {
    return this.topics.get(topicId) || null;
  }

  // View topic
  viewTopic(topicId: string): ForumTopic | null {
    const topic = this.topics.get(topicId);
    if (!topic) return null;

    topic.views++;
    topic.lastActivity = new Date().toISOString();
    this.topics.set(topicId, topic);
    this.saveToLocalStorage();

    return topic;
  }

  // Like topic
  likeTopic(topicId: string, userId: string): ForumTopic | null {
    const topic = this.topics.get(topicId);
    if (!topic) return null;

    if (topic.likes.includes(userId)) {
      topic.likes = topic.likes.filter(id => id !== userId);
    } else {
      topic.likes.push(userId);
    }

    topic.lastActivity = new Date().toISOString();
    this.topics.set(topicId, topic);
    this.saveToLocalStorage();

    return topic;
  }

  // Bookmark topic
  bookmarkTopic(topicId: string, userId: string): ForumTopic | null {
    const topic = this.topics.get(topicId);
    if (!topic) return null;

    if (topic.bookmarks.includes(userId)) {
      topic.bookmarks = topic.bookmarks.filter(id => id !== userId);
    } else {
      topic.bookmarks.push(userId);
    }

    topic.lastActivity = new Date().toISOString();
    this.topics.set(topicId, topic);
    this.saveToLocalStorage();

    return topic;
  }

  // Follow topic
  followTopic(topicId: string, userId: string): ForumTopic | null {
    const topic = this.topics.get(topicId);
    if (!topic) return null;

    if (!topic.followers.includes(userId)) {
      topic.followers.push(userId);
      topic.lastActivity = new Date().toISOString();
      this.topics.set(topicId, topic);
      this.saveToLocalStorage();
    }

    return topic;
  }

  // Create post
  createPost(postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'reactions' | 'mentions' | 'attachments' | 'isEdited' | 'isDeleted'>): ForumPost {
    const post: ForumPost = {
      id: `post-${Date.now()}`,
      ...postData,
      likes: [],
      dislikes: [],
      reactions: [],
      mentions: [],
      attachments: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.posts.set(post.id, post);

    // Update topic stats
    const topic = this.topics.get(post.topicId);
    if (topic) {
      topic.lastActivity = new Date().toISOString();
      this.topics.set(topic.id, topic);
    }

    // Update category stats
    const category = this.categories.get(topic?.categoryId || '');
    if (category) {
      category.postCount++;
      category.lastActivity = new Date().toISOString();
      this.categories.set(category.id, category);
    }

    this.saveToLocalStorage();
    return post;
  }

  // Get topic posts
  getTopicPosts(topicId: string, limit: number = 50, offset: number = 0): ForumPost[] {
    return Array.from(this.posts.values())
      .filter(post => post.topicId === topicId && !post.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Like post
  likePost(postId: string, userId: string): ForumPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
      post.dislikes = post.dislikes.filter(id => id !== userId);
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Dislike post
  dislikePost(postId: string, userId: string): ForumPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(id => id !== userId);
    } else {
      post.dislikes.push(userId);
      post.likes = post.likes.filter(id => id !== userId);
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Add reaction to post
  addReaction(postId: string, userId: string, emoji: string): ForumPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    const existingReaction = post.reactions.find(r => r.userId === userId && r.emoji === emoji);
    if (existingReaction) {
      post.reactions = post.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
    } else {
      post.reactions.push({
        userId,
        emoji,
        createdAt: new Date().toISOString()
      });
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Mark post as answer
  markPostAsAnswer(postId: string, userId: string): ForumPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    post.isAnswer = true;
    post.isAccepted = true;
    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);

    // Mark topic as solved
    const topic = this.topics.get(post.topicId);
    if (topic) {
      topic.isSolved = true;
      topic.solvedBy = userId;
      topic.solvedAt = new Date().toISOString();
      topic.status = 'closed';
      this.topics.set(topic.id, topic);
    }

    this.saveToLocalStorage();
    return post;
  }

  // Create poll
  createPoll(pollData: Omit<ForumPoll, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): ForumPoll {
    const poll: ForumPoll = {
      id: `poll-${Date.now()}`,
      ...pollData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.polls.set(poll.id, poll);
    this.saveToLocalStorage();

    return poll;
  }

  // Vote on poll
  voteOnPoll(pollId: string, userId: string, optionIds: string[]): ForumPoll | null {
    const poll = this.polls.get(pollId);
    if (!poll || !poll.isActive) return null;

    if (!poll.allowMultiple && optionIds.length > 1) return null;

    // Remove existing votes
    poll.options.forEach(option => {
      option.votes = option.votes.filter(vote => vote !== userId);
    });

    // Add new votes
    optionIds.forEach(optionId => {
      const option = poll.options.find(opt => opt.id === optionId);
      if (option && !option.votes.includes(userId)) {
        option.votes.push(userId);
      }
    });

    poll.updatedAt = new Date().toISOString();
    this.polls.set(pollId, poll);
    this.saveToLocalStorage();

    return poll;
  }

  // Create event
  createEvent(eventData: Omit<ForumEvent, 'id' | 'createdAt' | 'updatedAt' | 'attendees'>): ForumEvent {
    const event: ForumEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.set(event.id, event);
    this.saveToLocalStorage();

    return event;
  }

  // Join event
  joinEvent(eventId: string, userId: string): ForumEvent | null {
    const event = this.events.get(eventId);
    if (!event) return null;

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return null;
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      event.updatedAt = new Date().toISOString();
      this.events.set(eventId, event);
      this.saveToLocalStorage();
    }

    return event;
  }

  // Leave event
  leaveEvent(eventId: string, userId: string): ForumEvent | null {
    const event = this.events.get(eventId);
    if (!event) return null;

    event.attendees = event.attendees.filter(id => id !== userId);
    event.updatedAt = new Date().toISOString();
    this.events.set(eventId, event);
    this.saveToLocalStorage();

    return event;
  }

  // Create moderation action
  createModeration(moderationData: Omit<ForumModeration, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): ForumModeration {
    const moderation: ForumModeration = {
      id: `mod-${Date.now()}`,
      ...moderationData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.moderations.set(moderation.id, moderation);
    this.saveToLocalStorage();

    return moderation;
  }

  // Get forum statistics
  getForumStatistics(): {
    totalCategories: number;
    totalTopics: number;
    totalPosts: number;
    totalUsers: number;
    activeTopics: number;
    solvedTopics: number;
    averagePostsPerTopic: number;
    mostActiveCategory: string;
    recentActivity: Array<{
      type: string;
      id: string;
      title: string;
      authorId: string;
      createdAt: string;
    }>;
  } {
    const categories = Array.from(this.categories.values());
    const topics = Array.from(this.topics.values());
    const posts = Array.from(this.posts.values());

    const totalCategories = categories.length;
    const totalTopics = topics.length;
    const totalPosts = posts.length;
    const totalUsers = new Set([...topics.map(t => t.authorId), ...posts.map(p => p.authorId)]).size;
    const activeTopics = topics.filter(t => t.status === 'open').length;
    const solvedTopics = topics.filter(t => t.isSolved).length;
    const averagePostsPerTopic = totalTopics > 0 ? totalPosts / totalTopics : 0;

    // Find most active category
    const categoryPostCounts = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: topics.filter(t => t.categoryId === cat.id).length
    }));
    const mostActiveCategory = categoryPostCounts
      .sort((a, b) => b.count - a.count)[0]?.name || '';

    // Recent activity
    const recentActivity = [
      ...topics.map(t => ({
        type: 'topic',
        id: t.id,
        title: t.title,
        authorId: t.authorId,
        createdAt: t.createdAt
      })),
      ...posts.map(p => ({
        type: 'post',
        id: p.id,
        title: p.content.substring(0, 50) + '...',
        authorId: p.authorId,
        createdAt: p.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalCategories,
      totalTopics,
      totalPosts,
      totalUsers,
      activeTopics,
      solvedTopics,
      averagePostsPerTopic: Math.round(averagePostsPerTopic * 100) / 100,
      mostActiveCategory,
      recentActivity
    };
  }

  // Initialize default categories
  private initializeDefaultCategories(): void {
    const defaultCategories: Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt' | 'topicCount' | 'postCount' | 'lastActivity' | 'subcategories'>[] = [
      {
        name: 'General Discussion',
        description: 'General discussions about career development and professional growth',
        icon: '💬',
        color: '#3B82F6',
        order: 1,
        isActive: true
      },
      {
        name: 'Career Advice',
        description: 'Ask questions and get advice about your career path',
        icon: '💼',
        color: '#10B981',
        order: 2,
        isActive: true
      },
      {
        name: 'Technical Skills',
        description: 'Discuss technical skills, programming, and technology',
        icon: '💻',
        color: '#8B5CF6',
        order: 3,
        isActive: true
      },
      {
        name: 'Mentorship',
        description: 'Find mentors and discuss mentorship opportunities',
        icon: '🤝',
        color: '#F59E0B',
        order: 4,
        isActive: true
      },
      {
        name: 'Job Opportunities',
        description: 'Share and discuss job opportunities and career openings',
        icon: '🎯',
        color: '#EF4444',
        order: 5,
        isActive: true
      },
      {
        name: 'Study Groups',
        description: 'Form study groups and collaborate on learning projects',
        icon: '📚',
        color: '#06B6D4',
        order: 6,
        isActive: true
      }
    ];

    defaultCategories.forEach(category => {
      if (!this.categories.has(category.name)) {
        this.createCategory(category);
      }
    });
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        categories: Object.fromEntries(this.categories),
        topics: Object.fromEntries(this.topics),
        posts: Object.fromEntries(this.posts),
        polls: Object.fromEntries(this.polls),
        events: Object.fromEntries(this.events),
        moderations: Object.fromEntries(this.moderations),
        notifications: Object.fromEntries(this.notifications)
      };
      localStorage.setItem('forums-system', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save forums data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('forums-system');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.categories) {
        this.categories = new Map(Object.entries(parsed.categories));
      }
      
      if (parsed.topics) {
        this.topics = new Map(Object.entries(parsed.topics));
      }
      
      if (parsed.posts) {
        this.posts = new Map(Object.entries(parsed.posts));
      }
      
      if (parsed.polls) {
        this.polls = new Map(Object.entries(parsed.polls));
      }
      
      if (parsed.events) {
        this.events = new Map(Object.entries(parsed.events));
      }
      
      if (parsed.moderations) {
        this.moderations = new Map(Object.entries(parsed.moderations));
      }
      
      if (parsed.notifications) {
        this.notifications = new Map(Object.entries(parsed.notifications));
      }
    } catch (error) {
      console.error('Failed to load forums data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.categories.clear();
    this.topics.clear();
    this.posts.clear();
    this.polls.clear();
    this.events.clear();
    this.moderations.clear();
    this.notifications.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const forumsSystem = new ForumsSystem();
