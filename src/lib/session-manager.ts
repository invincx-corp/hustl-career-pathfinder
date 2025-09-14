// Session Management System
// Handles session conducting, tracking, and management

export interface SessionState {
  id: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  startTime?: string;
  endTime?: string;
  duration: number; // in minutes
  participants: {
    mentor: string;
    mentee: string;
  };
  sessionData: {
    agenda: string[];
    notes: string[];
    actionItems: Array<{
      id: string;
      description: string;
      assignedTo: 'mentor' | 'mentee' | 'both';
      dueDate?: string;
      completed: boolean;
    }>;
    resources: Array<{
      id: string;
      title: string;
      url: string;
      type: 'link' | 'document' | 'video' | 'article';
    }>;
    whiteboard?: {
      content: string;
      lastModified: string;
    };
  };
  technicalDetails: {
    meetingPlatform: string;
    meetingId?: string;
    recordingUrl?: string;
    chatLog?: Array<{
      timestamp: string;
      sender: string;
      message: string;
    }>;
  };
  feedback: {
    mentor: {
      rating?: number;
      review?: string;
      menteeProgress?: string;
      recommendations?: string[];
    };
    mentee: {
      rating?: number;
      review?: string;
      sessionValue?: string;
      suggestions?: string[];
    };
  };
  analytics: {
    engagementScore: number;
    participationLevel: 'low' | 'medium' | 'high';
    keyTopics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    followUpRequired: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  agenda: string[];
  preparation: {
    mentee: string[];
    mentor: string[];
  };
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  category: 'technical' | 'career' | 'soft-skills' | 'project-review' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  url: string;
  duration: number;
  size: number; // in bytes
  format: 'mp4' | 'webm' | 'audio';
  quality: 'low' | 'medium' | 'high';
  transcript?: string;
  chapters?: Array<{
    title: string;
    startTime: number;
    endTime: number;
  }>;
  createdAt: string;
}

export interface SessionAnalytics {
  sessionId: string;
  duration: number;
  engagement: {
    menteeParticipation: number; // 0-100
    mentorParticipation: number; // 0-100
    interactionCount: number;
    questionCount: number;
  };
  content: {
    topicsCovered: string[];
    keyInsights: string[];
    actionItemsCreated: number;
    resourcesShared: number;
  };
  outcomes: {
    goalsAchieved: string[];
    nextSteps: string[];
    followUpScheduled: boolean;
    satisfactionScore: number;
  };
  technical: {
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    platformUsed: string;
    issuesEncountered: string[];
  };
}

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();
  private templates: Map<string, SessionTemplate> = new Map();
  private recordings: Map<string, SessionRecording> = new Map();
  private analytics: Map<string, SessionAnalytics> = new Map();

  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultTemplates();
  }

  // Start a session
  startSession(sessionId: string, mentorId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.participants.mentor !== mentorId) {
      return false;
    }

    if (session.status !== 'scheduled' && session.status !== 'confirmed') {
      return false;
    }

    session.status = 'in-progress';
    session.startTime = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // End a session
  endSession(sessionId: string, mentorId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.participants.mentor !== mentorId) {
      return false;
    }

    if (session.status !== 'in-progress') {
      return false;
    }

    session.status = 'completed';
    session.endTime = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    // Calculate actual duration
    if (session.startTime) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      session.duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    // Generate analytics
    this.generateSessionAnalytics(sessionId);

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Cancel a session
  cancelSession(sessionId: string, cancelledBy: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (session.status === 'completed' || session.status === 'cancelled') {
      return false;
    }

    session.status = 'cancelled';
    session.updatedAt = new Date().toISOString();

    if (reason) {
      session.sessionData.notes.push(`Session cancelled by ${cancelledBy}: ${reason}`);
    }

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Mark as no-show
  markNoShow(sessionId: string, mentorId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.participants.mentor !== mentorId) {
      return false;
    }

    if (session.status !== 'scheduled' && session.status !== 'confirmed') {
      return false;
    }

    session.status = 'no-show';
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add agenda item
  addAgendaItem(sessionId: string, item: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.sessionData.agenda.push(item);
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add session note
  addSessionNote(sessionId: string, note: string, author: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const timestamp = new Date().toISOString();
    session.sessionData.notes.push(`[${author}] ${timestamp}: ${note}`);
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add action item
  addActionItem(
    sessionId: string,
    description: string,
    assignedTo: 'mentor' | 'mentee' | 'both',
    dueDate?: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const actionItem = {
      id: `action-${Date.now()}`,
      description,
      assignedTo,
      dueDate,
      completed: false
    };

    session.sessionData.actionItems.push(actionItem);
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Complete action item
  completeActionItem(sessionId: string, actionItemId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const actionItem = session.sessionData.actionItems.find(item => item.id === actionItemId);
    if (!actionItem) return false;

    actionItem.completed = true;
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add resource
  addResource(
    sessionId: string,
    title: string,
    url: string,
    type: 'link' | 'document' | 'video' | 'article'
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const resource = {
      id: `resource-${Date.now()}`,
      title,
      url,
      type
    };

    session.sessionData.resources.push(resource);
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Update whiteboard
  updateWhiteboard(sessionId: string, content: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.sessionData.whiteboard = {
      content,
      lastModified: new Date().toISOString()
    };
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Add chat message
  addChatMessage(sessionId: string, sender: string, message: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (!session.technicalDetails.chatLog) {
      session.technicalDetails.chatLog = [];
    }

    session.technicalDetails.chatLog.push({
      timestamp: new Date().toISOString(),
      sender,
      message
    });

    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Submit feedback
  submitFeedback(
    sessionId: string,
    feedbackType: 'mentor' | 'mentee',
    feedback: {
      rating?: number;
      review?: string;
      menteeProgress?: string;
      recommendations?: string[];
      sessionValue?: string;
      suggestions?: string[];
    }
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (feedbackType === 'mentor') {
      session.feedback.mentor = {
        ...session.feedback.mentor,
        ...feedback
      };
    } else {
      session.feedback.mentee = {
        ...session.feedback.mentee,
        ...feedback
      };
    }

    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();

    return true;
  }

  // Get session by ID
  getSession(sessionId: string): SessionState | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get sessions for user
  getSessionsForUser(userId: string, userType: 'mentor' | 'mentee'): SessionState[] {
    const sessions = Array.from(this.sessions.values());
    
    return sessions.filter(session => {
      if (userType === 'mentor') {
        return session.participants.mentor === userId;
      } else {
        return session.participants.mentee === userId;
      }
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get upcoming sessions
  getUpcomingSessions(userId: string, userType: 'mentor' | 'mentee'): SessionState[] {
    const sessions = this.getSessionsForUser(userId, userType);
    const now = new Date();

    return sessions.filter(session => {
      const sessionTime = new Date(session.startTime || session.createdAt);
      return sessionTime > now && ['scheduled', 'confirmed'].includes(session.status);
    });
  }

  // Get session history
  getSessionHistory(userId: string, userType: 'mentor' | 'mentee', limit?: number): SessionState[] {
    const sessions = this.getSessionsForUser(userId, userType);
    const completedSessions = sessions.filter(session => 
      ['completed', 'cancelled', 'no-show'].includes(session.status)
    );

    return limit ? completedSessions.slice(0, limit) : completedSessions;
  }

  // Create session template
  createTemplate(template: Omit<SessionTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>): SessionTemplate {
    const newTemplate: SessionTemplate = {
      id: `template-${Date.now()}`,
      ...template,
      usageCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveToLocalStorage();

    return newTemplate;
  }

  // Get templates
  getTemplates(category?: string, difficulty?: string): SessionTemplate[] {
    let templates = Array.from(this.templates.values());

    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    if (difficulty) {
      templates = templates.filter(template => template.difficulty === difficulty);
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  // Use template for session
  useTemplate(sessionId: string, templateId: string): boolean {
    const session = this.sessions.get(sessionId);
    const template = this.templates.get(templateId);
    
    if (!session || !template) return false;

    // Apply template to session
    session.sessionData.agenda = [...template.agenda];
    session.sessionData.resources = template.resources.map(resource => ({
      id: `resource-${Date.now()}-${Math.random()}`,
      ...resource
    }));

    // Update template usage count
    template.usageCount++;
    template.updatedAt = new Date().toISOString();

    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.templates.set(templateId, template);
    this.saveToLocalStorage();

    return true;
  }

  // Generate session analytics
  private generateSessionAnalytics(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const analytics: SessionAnalytics = {
      sessionId,
      duration: session.duration,
      engagement: {
        menteeParticipation: this.calculateParticipation(session, 'mentee'),
        mentorParticipation: this.calculateParticipation(session, 'mentor'),
        interactionCount: session.technicalDetails.chatLog?.length || 0,
        questionCount: this.countQuestions(session)
      },
      content: {
        topicsCovered: this.extractTopics(session),
        keyInsights: this.extractInsights(session),
        actionItemsCreated: session.sessionData.actionItems.length,
        resourcesShared: session.sessionData.resources.length
      },
      outcomes: {
        goalsAchieved: this.extractAchievedGoals(session),
        nextSteps: this.extractNextSteps(session),
        followUpScheduled: this.checkFollowUpScheduled(session),
        satisfactionScore: this.calculateSatisfactionScore(session)
      },
      technical: {
        connectionQuality: this.assessConnectionQuality(session),
        platformUsed: session.technicalDetails.meetingPlatform,
        issuesEncountered: this.extractTechnicalIssues(session)
      }
    };

    this.analytics.set(sessionId, analytics);
  }

  // Calculate participation level
  private calculateParticipation(session: SessionState, userType: 'mentor' | 'mentee'): number {
    const chatLog = session.technicalDetails.chatLog || [];
    const userMessages = chatLog.filter(msg => msg.sender === userType);
    
    if (chatLog.length === 0) return 50; // Default if no chat data
    
    return Math.round((userMessages.length / chatLog.length) * 100);
  }

  // Count questions in session
  private countQuestions(session: SessionState): number {
    const chatLog = session.technicalDetails.chatLog || [];
    return chatLog.filter(msg => msg.message.includes('?')).length;
  }

  // Extract topics from session
  private extractTopics(session: SessionState): string[] {
    const topics: string[] = [];
    
    // Extract from agenda
    topics.push(...session.sessionData.agenda);
    
    // Extract from notes
    session.sessionData.notes.forEach(note => {
      const words = note.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3 && !topics.includes(word)) {
          topics.push(word);
        }
      });
    });

    return topics.slice(0, 10); // Limit to 10 topics
  }

  // Extract insights from session
  private extractInsights(session: SessionState): string[] {
    const insights: string[] = [];
    
    // Extract from notes that contain insights
    session.sessionData.notes.forEach(note => {
      if (note.toLowerCase().includes('insight') || 
          note.toLowerCase().includes('learned') ||
          note.toLowerCase().includes('discovered')) {
        insights.push(note);
      }
    });

    return insights.slice(0, 5); // Limit to 5 insights
  }

  // Extract achieved goals
  private extractAchievedGoals(session: SessionState): string[] {
    const goals: string[] = [];
    
    session.sessionData.notes.forEach(note => {
      if (note.toLowerCase().includes('achieved') || 
          note.toLowerCase().includes('completed') ||
          note.toLowerCase().includes('accomplished')) {
        goals.push(note);
      }
    });

    return goals;
  }

  // Extract next steps
  private extractNextSteps(session: SessionState): string[] {
    const nextSteps: string[] = [];
    
    session.sessionData.actionItems.forEach(item => {
      if (!item.completed) {
        nextSteps.push(item.description);
      }
    });

    return nextSteps;
  }

  // Check if follow-up is scheduled
  private checkFollowUpScheduled(session: SessionState): boolean {
    return session.sessionData.notes.some(note => 
      note.toLowerCase().includes('follow-up') ||
      note.toLowerCase().includes('next session')
    );
  }

  // Calculate satisfaction score
  private calculateSatisfactionScore(session: SessionState): number {
    const mentorRating = session.feedback.mentor.rating || 0;
    const menteeRating = session.feedback.mentee.rating || 0;
    
    if (mentorRating > 0 && menteeRating > 0) {
      return (mentorRating + menteeRating) / 2;
    } else if (mentorRating > 0) {
      return mentorRating;
    } else if (menteeRating > 0) {
      return menteeRating;
    }
    
    return 0;
  }

  // Assess connection quality
  private assessConnectionQuality(session: SessionState): 'excellent' | 'good' | 'fair' | 'poor' {
    // This would typically be based on actual connection metrics
    // For now, we'll use a simple heuristic
    const chatLog = session.technicalDetails.chatLog || [];
    const technicalIssues = this.extractTechnicalIssues(session);
    
    if (technicalIssues.length === 0) return 'excellent';
    if (technicalIssues.length <= 2) return 'good';
    if (technicalIssues.length <= 4) return 'fair';
    return 'poor';
  }

  // Extract technical issues
  private extractTechnicalIssues(session: SessionState): string[] {
    const issues: string[] = [];
    const chatLog = session.technicalDetails.chatLog || [];
    
    chatLog.forEach(msg => {
      if (msg.message.toLowerCase().includes('connection') ||
          msg.message.toLowerCase().includes('audio') ||
          msg.message.toLowerCase().includes('video') ||
          msg.message.toLowerCase().includes('lag')) {
        issues.push(msg.message);
      }
    });

    return issues;
  }

  // Get session analytics
  getSessionAnalytics(sessionId: string): SessionAnalytics | null {
    return this.analytics.get(sessionId) || null;
  }

  // Get user analytics
  getUserAnalytics(userId: string, userType: 'mentor' | 'mentee'): {
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalDuration: number;
    averageEngagement: number;
    topTopics: string[];
    satisfactionTrend: number[];
  } {
    const sessions = this.getSessionsForUser(userId, userType);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const ratings = completedSessions.map(s => {
      if (userType === 'mentor') {
        return s.feedback.mentee.rating || 0;
      } else {
        return s.feedback.mentor.rating || 0;
      }
    }).filter(r => r > 0);

    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    const analytics = completedSessions.map(s => this.analytics.get(s.id)).filter(a => a);
    const averageEngagement = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (a.engagement.menteeParticipation + a.engagement.mentorParticipation) / 2, 0) / analytics.length
      : 0;

    const allTopics = completedSessions.flatMap(s => this.extractTopics(s));
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const satisfactionTrend = ratings.slice(-10); // Last 10 ratings

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageRating,
      totalDuration,
      averageEngagement,
      topTopics,
      satisfactionTrend
    };
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<SessionTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>[] = [
      {
        name: 'Technical Skills Review',
        description: 'Review and discuss technical skills and knowledge',
        duration: 60,
        agenda: [
          'Review current skill level',
          'Identify knowledge gaps',
          'Discuss learning resources',
          'Set skill development goals',
          'Plan next steps'
        ],
        preparation: {
          mentee: ['Prepare skill assessment', 'List current projects', 'Identify challenges'],
          mentor: ['Review mentee profile', 'Prepare skill evaluation', 'Gather resources']
        },
        resources: [
          { title: 'Skill Assessment Template', url: '#', type: 'document' },
          { title: 'Learning Resources Guide', url: '#', type: 'link' }
        ],
        category: 'technical',
        difficulty: 'intermediate',
        tags: ['skills', 'assessment', 'development'],
        createdBy: 'system',
        isPublic: true
      },
      {
        name: 'Career Planning Session',
        description: 'Discuss career goals and development path',
        duration: 90,
        agenda: [
          'Review career goals',
          'Assess current position',
          'Identify opportunities',
          'Create action plan',
          'Set milestones'
        ],
        preparation: {
          mentee: ['Prepare career goals', 'Research opportunities', 'Update resume'],
          mentor: ['Review industry trends', 'Prepare career resources', 'Research opportunities']
        },
        resources: [
          { title: 'Career Planning Worksheet', url: '#', type: 'document' },
          { title: 'Industry Trends Report', url: '#', type: 'article' }
        ],
        category: 'career',
        difficulty: 'beginner',
        tags: ['career', 'planning', 'goals'],
        createdBy: 'system',
        isPublic: true
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.name)) {
        this.createTemplate(template);
      }
    });
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        sessions: Object.fromEntries(this.sessions),
        templates: Object.fromEntries(this.templates),
        recordings: Object.fromEntries(this.recordings),
        analytics: Object.fromEntries(this.analytics)
      };
      localStorage.setItem('session-manager', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('session-manager');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.sessions) {
        this.sessions = new Map(Object.entries(parsed.sessions));
      }
      
      if (parsed.templates) {
        this.templates = new Map(Object.entries(parsed.templates));
      }
      
      if (parsed.recordings) {
        this.recordings = new Map(Object.entries(parsed.recordings));
      }
      
      if (parsed.analytics) {
        this.analytics = new Map(Object.entries(parsed.analytics));
      }
    } catch (error) {
      console.error('Failed to load session data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.sessions.clear();
    this.templates.clear();
    this.recordings.clear();
    this.analytics.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
