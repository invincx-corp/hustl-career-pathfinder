// Study Groups System
// Handles group formation, management, and collaboration tools

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  maxMembers: number;
  currentMembers: string[];
  admins: string[];
  createdBy: string;
  tags: string[];
  goals: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    time: string; // HH:mm format
    duration: number; // in minutes
    timezone: string;
  };
  location: {
    type: 'online' | 'in-person' | 'hybrid';
    address?: string;
    meetingLink?: string;
    platform?: string;
  };
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite-only';
  requirements: {
    minExperience: string;
    skills: string[];
    commitment: string;
    prerequisites: string[];
  };
  resources: Array<{
    id: string;
    name: string;
    type: 'document' | 'video' | 'link' | 'book' | 'course';
    url: string;
    description: string;
    addedBy: string;
    addedAt: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: string;
  }>;
  discussions: string[]; // Post IDs
  events: string[]; // Event IDs
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'study_session' | 'review' | 'presentation' | 'discussion' | 'exam' | 'social';
  startDate: string;
  endDate: string;
  location: {
    type: 'online' | 'in-person';
    address?: string;
    meetingLink?: string;
  };
  attendees: string[];
  maxAttendees?: number;
  isRequired: boolean;
  materials: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  agenda: Array<{
    time: string;
    activity: string;
    duration: number;
  }>;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupPost {
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  content: string;
  type: 'announcement' | 'discussion' | 'question' | 'resource' | 'milestone';
  tags: string[];
  likes: string[];
  comments: Array<{
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
    likes: string[];
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupApplication {
  id: string;
  groupId: string;
  applicantId: string;
  message: string;
  experience: string;
  motivation: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupProgress {
  groupId: string;
  userId: string;
  milestonesCompleted: number;
  totalMilestones: number;
  participationScore: number;
  lastActive: string;
  contributions: Array<{
    type: 'post' | 'comment' | 'resource' | 'event_attendance';
    count: number;
    lastContribution: string;
  }>;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export class StudyGroupsSystem {
  private groups: Map<string, StudyGroup> = new Map();
  private events: Map<string, StudyGroupEvent> = new Map();
  private posts: Map<string, StudyGroupPost> = new Map();
  private invitations: Map<string, StudyGroupInvitation> = new Map();
  private applications: Map<string, StudyGroupApplication> = new Map();
  private progress: Map<string, StudyGroupProgress> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create study group
  createGroup(groupData: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt' | 'currentMembers' | 'admins' | 'resources' | 'milestones' | 'discussions' | 'events'>): StudyGroup {
    const group: StudyGroup = {
      id: `group-${Date.now()}`,
      ...groupData,
      currentMembers: [groupData.createdBy],
      admins: [groupData.createdBy],
      resources: [],
      milestones: [],
      discussions: [],
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.groups.set(group.id, group);
    this.saveToLocalStorage();

    return group;
  }

  // Get study groups
  getGroups(filters: {
    subject?: string;
    level?: string;
    status?: string;
    visibility?: string;
    tags?: string[];
    search?: string;
  } = {}): StudyGroup[] {
    let groups = Array.from(this.groups.values());

    if (filters.subject) {
      groups = groups.filter(group => group.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
    }

    if (filters.level) {
      groups = groups.filter(group => group.level === filters.level);
    }

    if (filters.status) {
      groups = groups.filter(group => group.status === filters.status);
    }

    if (filters.visibility) {
      groups = groups.filter(group => group.visibility === filters.visibility);
    }

    if (filters.tags && filters.tags.length > 0) {
      groups = groups.filter(group =>
        filters.tags!.some(tag => group.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      groups = groups.filter(group =>
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.subject.toLowerCase().includes(searchLower)
      );
    }

    return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get study group
  getGroup(groupId: string): StudyGroup | null {
    return this.groups.get(groupId) || null;
  }

  // Join study group
  joinGroup(groupId: string, userId: string): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    if (group.currentMembers.length >= group.maxMembers) {
      return null;
    }

    if (!group.currentMembers.includes(userId)) {
      group.currentMembers.push(userId);
      group.updatedAt = new Date().toISOString();
      this.groups.set(groupId, group);
      this.saveToLocalStorage();
    }

    return group;
  }

  // Leave study group
  leaveGroup(groupId: string, userId: string): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    group.currentMembers = group.currentMembers.filter(id => id !== userId);
    group.admins = group.admins.filter(id => id !== userId);
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);
    this.saveToLocalStorage();

    return group;
  }

  // Add admin
  addAdmin(groupId: string, userId: string): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    if (!group.admins.includes(userId)) {
      group.admins.push(userId);
      group.updatedAt = new Date().toISOString();
      this.groups.set(groupId, group);
      this.saveToLocalStorage();
    }

    return group;
  }

  // Remove admin
  removeAdmin(groupId: string, userId: string): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    group.admins = group.admins.filter(id => id !== userId);
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);
    this.saveToLocalStorage();

    return group;
  }

  // Create group event
  createEvent(eventData: Omit<StudyGroupEvent, 'id' | 'createdAt' | 'updatedAt' | 'attendees' | 'isCompleted'>): StudyGroupEvent {
    const event: StudyGroupEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      attendees: [],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.set(event.id, event);

    // Add event to group
    const group = this.groups.get(event.groupId);
    if (group) {
      group.events.push(event.id);
      group.updatedAt = new Date().toISOString();
      this.groups.set(group.id, group);
    }

    this.saveToLocalStorage();
    return event;
  }

  // Get group events
  getGroupEvents(groupId: string): StudyGroupEvent[] {
    return Array.from(this.events.values())
      .filter(event => event.groupId === groupId)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  // Join event
  joinEvent(eventId: string, userId: string): StudyGroupEvent | null {
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
  leaveEvent(eventId: string, userId: string): StudyGroupEvent | null {
    const event = this.events.get(eventId);
    if (!event) return null;

    event.attendees = event.attendees.filter(id => id !== userId);
    event.updatedAt = new Date().toISOString();
    this.events.set(eventId, event);
    this.saveToLocalStorage();

    return event;
  }

  // Create group post
  createPost(postData: Omit<StudyGroupPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'attachments' | 'isPinned' | 'isLocked'>): StudyGroupPost {
    const post: StudyGroupPost = {
      id: `post-${Date.now()}`,
      ...postData,
      likes: [],
      comments: [],
      attachments: [],
      isPinned: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.posts.set(post.id, post);

    // Add post to group
    const group = this.groups.get(post.groupId);
    if (group) {
      group.discussions.push(post.id);
      group.updatedAt = new Date().toISOString();
      this.groups.set(group.id, group);
    }

    this.saveToLocalStorage();
    return post;
  }

  // Get group posts
  getGroupPosts(groupId: string, limit: number = 20, offset: number = 0): StudyGroupPost[] {
    return Array.from(this.posts.values())
      .filter(post => post.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Like post
  likePost(postId: string, userId: string): StudyGroupPost | null {
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
  commentOnPost(postId: string, userId: string, content: string): StudyGroupPost | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    const comment = {
      id: `comment-${Date.now()}`,
      authorId: userId,
      content,
      createdAt: new Date().toISOString(),
      likes: []
    };

    post.comments.push(comment);
    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.saveToLocalStorage();

    return post;
  }

  // Create group invitation
  createInvitation(invitationData: Omit<StudyGroupInvitation, 'id' | 'createdAt' | 'updatedAt' | 'status'>): StudyGroupInvitation {
    const invitation: StudyGroupInvitation = {
      id: `invite-${Date.now()}`,
      ...invitationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.invitations.set(invitation.id, invitation);
    this.saveToLocalStorage();

    return invitation;
  }

  // Respond to invitation
  respondToInvitation(invitationId: string, status: 'accepted' | 'declined'): StudyGroupInvitation | null {
    const invitation = this.invitations.get(invitationId);
    if (!invitation) return null;

    invitation.status = status;
    invitation.updatedAt = new Date().toISOString();
    this.invitations.set(invitationId, invitation);

    if (status === 'accepted') {
      this.joinGroup(invitation.groupId, invitation.inviteeId);
    }

    this.saveToLocalStorage();
    return invitation;
  }

  // Create group application
  createApplication(applicationData: Omit<StudyGroupApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>): StudyGroupApplication {
    const application: StudyGroupApplication = {
      id: `app-${Date.now()}`,
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.applications.set(application.id, application);
    this.saveToLocalStorage();

    return application;
  }

  // Review application
  reviewApplication(applicationId: string, status: 'approved' | 'rejected', reviewerId: string): StudyGroupApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    application.status = status;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date().toISOString();
    application.updatedAt = new Date().toISOString();
    this.applications.set(applicationId, application);

    if (status === 'approved') {
      this.joinGroup(application.groupId, application.applicantId);
    }

    this.saveToLocalStorage();
    return application;
  }

  // Get group applications
  getGroupApplications(groupId: string): StudyGroupApplication[] {
    return Array.from(this.applications.values())
      .filter(app => app.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Add milestone
  addMilestone(groupId: string, milestoneData: Omit<StudyGroup['milestones'][0], 'id' | 'isCompleted'>): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const milestone = {
      id: `milestone-${Date.now()}`,
      ...milestoneData,
      isCompleted: false
    };

    group.milestones.push(milestone);
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);
    this.saveToLocalStorage();

    return group;
  }

  // Complete milestone
  completeMilestone(groupId: string, milestoneId: string, userId: string): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const milestone = group.milestones.find(m => m.id === milestoneId);
    if (!milestone) return null;

    milestone.isCompleted = true;
    milestone.completedBy = userId;
    milestone.completedAt = new Date().toISOString();
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);
    this.saveToLocalStorage();

    return group;
  }

  // Add resource
  addResource(groupId: string, resourceData: Omit<StudyGroup['resources'][0], 'id' | 'addedBy' | 'addedAt'>): StudyGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const resource = {
      id: `resource-${Date.now()}`,
      ...resourceData,
      addedBy: resourceData.addedBy,
      addedAt: new Date().toISOString()
    };

    group.resources.push(resource);
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);
    this.saveToLocalStorage();

    return group;
  }

  // Get group statistics
  getGroupStatistics(groupId: string): {
    totalMembers: number;
    totalEvents: number;
    totalPosts: number;
    totalMilestones: number;
    completedMilestones: number;
    totalResources: number;
    averageParticipation: number;
    recentActivity: Array<{
      type: string;
      id: string;
      title: string;
      authorId: string;
      createdAt: string;
    }>;
  } {
    const group = this.groups.get(groupId);
    if (!group) {
      return {
        totalMembers: 0,
        totalEvents: 0,
        totalPosts: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        totalResources: 0,
        averageParticipation: 0,
        recentActivity: []
      };
    }

    const totalMembers = group.currentMembers.length;
    const totalEvents = group.events.length;
    const totalPosts = group.discussions.length;
    const totalMilestones = group.milestones.length;
    const completedMilestones = group.milestones.filter(m => m.isCompleted).length;
    const totalResources = group.resources.length;

    // Calculate average participation (simplified)
    const averageParticipation = totalMembers > 0 ? (totalPosts + totalEvents) / totalMembers : 0;

    // Recent activity
    const recentActivity = [
      ...group.discussions.map(postId => {
        const post = this.posts.get(postId);
        return post ? {
          type: 'post',
          id: post.id,
          title: post.title,
          authorId: post.authorId,
          createdAt: post.createdAt
        } : null;
      }).filter(Boolean),
      ...group.events.map(eventId => {
        const event = this.events.get(eventId);
        return event ? {
          type: 'event',
          id: event.id,
          title: event.title,
          authorId: event.groupId, // Group ID as author
          createdAt: event.createdAt
        } : null;
      }).filter(Boolean)
    ]
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime())
      .slice(0, 10);

    return {
      totalMembers,
      totalEvents,
      totalPosts,
      totalMilestones,
      completedMilestones,
      totalResources,
      averageParticipation: Math.round(averageParticipation * 100) / 100,
      recentActivity: recentActivity as any[]
    };
  }

  // Get user's study groups
  getUserStudyGroups(userId: string): StudyGroup[] {
    return Array.from(this.groups.values())
      .filter(group => group.currentMembers.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Get study group suggestions
  getStudyGroupSuggestions(userId: string, limit: number = 10): StudyGroup[] {
    const userGroups = this.getUserStudyGroups(userId);
    const userGroupIds = userGroups.map(g => g.id);

    return Array.from(this.groups.values())
      .filter(group => 
        group.visibility === 'public' && 
        !userGroupIds.includes(group.id) &&
        group.status === 'active'
      )
      .slice(0, limit);
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        groups: Object.fromEntries(this.groups),
        events: Object.fromEntries(this.events),
        posts: Object.fromEntries(this.posts),
        invitations: Object.fromEntries(this.invitations),
        applications: Object.fromEntries(this.applications),
        progress: Object.fromEntries(this.progress)
      };
      localStorage.setItem('study-groups', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save study groups data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('study-groups');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.groups) {
        this.groups = new Map(Object.entries(parsed.groups));
      }
      
      if (parsed.events) {
        this.events = new Map(Object.entries(parsed.events));
      }
      
      if (parsed.posts) {
        this.posts = new Map(Object.entries(parsed.posts));
      }
      
      if (parsed.invitations) {
        this.invitations = new Map(Object.entries(parsed.invitations));
      }
      
      if (parsed.applications) {
        this.applications = new Map(Object.entries(parsed.applications));
      }
      
      if (parsed.progress) {
        this.progress = new Map(Object.entries(parsed.progress));
      }
    } catch (error) {
      console.error('Failed to load study groups data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.groups.clear();
    this.events.clear();
    this.posts.clear();
    this.invitations.clear();
    this.applications.clear();
    this.progress.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const studyGroupsSystem = new StudyGroupsSystem();
