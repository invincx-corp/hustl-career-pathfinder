import { supabase } from './supabase';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface UserPublicProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  location?: string;
  website_url?: string;
  social_links: Record<string, any>;
  skills: string[];
  interests: string[];
  current_position?: string;
  company?: string;
  is_public: boolean;
  is_mentor: boolean;
  is_student: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserConnection {
  id: string;
  follower_id: string;
  following_id: string;
  connection_type: 'follow' | 'mentor_student' | 'peer';
  status: 'active' | 'blocked' | 'pending';
  created_at: string;
  follower?: any;
  following?: any;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url?: string;
  attachment_type?: string;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  created_at: string;
  sender?: any;
  recipient?: any;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement' | 'poll';
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  likes_count: number;
  replies_count: number;
  last_reply_at?: string;
  created_at: string;
  updated_at: string;
  author?: any;
  category?: ForumCategory;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  parent_reply_id?: string;
  content: string;
  is_solution: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: any;
  parent_reply?: ForumReply;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  topic: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  max_members: number;
  current_members: number;
  is_public: boolean;
  is_active: boolean;
  meeting_schedule: Record<string, any>;
  meeting_link?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: any;
  members?: StudyGroupMember[];
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

// =====================================================
// COMMUNITY SERVICE
// =====================================================

export const communityService = {
  // =====================================================
  // USER PROFILES
  // =====================================================

  async getUserProfile(userId: string): Promise<UserPublicProfile | null> {
    try {
      const response = await fetch(`/api/community/profiles/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async createOrUpdateUserProfile(userId: string, profileData: Partial<UserPublicProfile>): Promise<UserPublicProfile | null> {
    try {
      const response = await fetch('/api/community/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create/update profile: ${response.status}`);
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      return null;
    }
  },

  // =====================================================
  // USER CONNECTIONS
  // =====================================================

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/community/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          follower_id: followerId,
          following_id: followingId,
          action: 'follow'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to follow user: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/community/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          follower_id: followerId,
          following_id: followingId,
          action: 'unfollow'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to unfollow user: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  async getUserConnections(userId: string, type: 'followers' | 'following' = 'followers', limit: number = 20, offset: number = 0): Promise<UserConnection[]> {
    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/community/users/${userId}/connections?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.status}`);
      }

      const data = await response.json();
      return data.connections || [];
    } catch (error) {
      console.error('Error fetching user connections:', error);
      return [];
    }
  },

  // =====================================================
  // DIRECT MESSAGES
  // =====================================================

  async sendMessage(messageData: {
    sender_id: string;
    recipient_id: string;
    content: string;
    message_type?: 'text' | 'image' | 'file' | 'system';
    attachment_url?: string;
    attachment_type?: string;
  }): Promise<DirectMessage | null> {
    try {
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async getConversation(user1Id: string, user2Id: string, limit: number = 50, offset: number = 0): Promise<DirectMessage[]> {
    try {
      const params = new URLSearchParams({
        user1_id: user1Id,
        user2_id: user2Id,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/community/messages/conversation?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  },

  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/community/messages/${messageId}/read`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  },

  // =====================================================
  // FORUM CATEGORIES
  // =====================================================

  async getForumCategories(): Promise<ForumCategory[]> {
    try {
      const response = await fetch('/api/community/forum/categories');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forum categories: ${response.status}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching forum categories:', error);
      return [];
    }
  },

  // =====================================================
  // FORUM POSTS
  // =====================================================

  async getForumPosts(filters: {
    category_id?: string;
    author_id?: string;
    post_type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ForumPost[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.author_id) params.append('author_id', filters.author_id);
      if (filters.post_type) params.append('post_type', filters.post_type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/community/forum/posts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forum posts: ${response.status}`);
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      return [];
    }
  },

  async createForumPost(postData: {
    author_id: string;
    category_id: string;
    title: string;
    content: string;
    post_type?: 'discussion' | 'question' | 'announcement' | 'poll';
    tags?: string[];
  }): Promise<ForumPost | null> {
    try {
      const response = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create forum post: ${response.status}`);
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error creating forum post:', error);
      return null;
    }
  },

  async getForumPost(postId: string): Promise<ForumPost | null> {
    try {
      const response = await fetch(`/api/community/forum/posts/${postId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch forum post: ${response.status}`);
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error fetching forum post:', error);
      return null;
    }
  },

  // =====================================================
  // FORUM REPLIES
  // =====================================================

  async getForumReplies(postId: string, limit: number = 20, offset: number = 0): Promise<ForumReply[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/community/forum/posts/${postId}/replies?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forum replies: ${response.status}`);
      }

      const data = await response.json();
      return data.replies || [];
    } catch (error) {
      console.error('Error fetching forum replies:', error);
      return [];
    }
  },

  async createForumReply(postId: string, replyData: {
    author_id: string;
    content: string;
    parent_reply_id?: string;
    is_solution?: boolean;
  }): Promise<ForumReply | null> {
    try {
      const response = await fetch(`/api/community/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create forum reply: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error creating forum reply:', error);
      return null;
    }
  },

  // =====================================================
  // STUDY GROUPS
  // =====================================================

  async getStudyGroups(filters: {
    topic?: string;
    skill_level?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<StudyGroup[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.skill_level) params.append('skill_level', filters.skill_level);
      if (filters.is_public !== undefined) params.append('is_public', filters.is_public.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/community/study-groups?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch study groups: ${response.status}`);
      }

      const data = await response.json();
      return data.groups || [];
    } catch (error) {
      console.error('Error fetching study groups:', error);
      return [];
    }
  },

  async createStudyGroup(groupData: {
    name: string;
    description?: string;
    topic: string;
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    max_members?: number;
    is_public?: boolean;
    meeting_schedule?: Record<string, any>;
    meeting_link?: string;
    created_by: string;
  }): Promise<StudyGroup | null> {
    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create study group: ${response.status}`);
      }

      const data = await response.json();
      return data.group;
    } catch (error) {
      console.error('Error creating study group:', error);
      return null;
    }
  },

  async joinStudyGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to join study group: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error joining study group:', error);
      return false;
    }
  },

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  },

  formatMemberCount(current: number, max: number): string {
    return `${current}/${max} members`;
  }
};