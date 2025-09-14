// Conversation History Storage
// Manages persistent chat history with database integration

export interface ConversationMessage {
  id: string;
  userId: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics?: string[];
  metadata?: {
    aiProvider?: string;
    responseTime?: number;
    escalationTriggered?: boolean;
    contextUsed?: any;
    emotionalState?: any;
    sentimentAnalysis?: any;
  };
}

export interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageAt: string;
  tags: string[];
  summary?: string;
}

export interface ConversationStats {
  totalMessages: number;
  totalSessions: number;
  averageSessionLength: number;
  mostActiveDay: string;
  topTopics: Array<{ topic: string; count: number }>;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export class ConversationStorage {
  private conversations: Map<string, ConversationMessage[]> = new Map();
  private sessions: Map<string, ConversationSession> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create a new conversation session
  createSession(userId: string, title?: string): ConversationSession {
    const sessionId = `session-${Date.now()}`;
    const session: ConversationSession = {
      id: sessionId,
      userId,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      lastMessageAt: new Date().toISOString(),
      tags: [],
      summary: undefined
    };

    this.sessions.set(sessionId, session);
    this.conversations.set(sessionId, []);
    this.currentSessionId = sessionId;
    
    this.saveToLocalStorage();
    return session;
  }

  // Add message to current session
  addMessage(message: Omit<ConversationMessage, 'id' | 'userId' | 'timestamp'>): ConversationMessage {
    if (!this.currentSessionId) {
      throw new Error('No active conversation session');
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.sessions.get(this.currentSessionId)!.userId,
      timestamp: new Date().toISOString()
    };

    const sessionMessages = this.conversations.get(this.currentSessionId) || [];
    sessionMessages.push(fullMessage);
    this.conversations.set(this.currentSessionId, sessionMessages);

    // Update session
    const session = this.sessions.get(this.currentSessionId)!;
    session.messageCount = sessionMessages.length;
    session.lastMessageAt = fullMessage.timestamp;
    session.updatedAt = new Date().toISOString();

    // Auto-generate title if it's the first message
    if (session.messageCount === 1 && session.title.startsWith('Conversation')) {
      session.title = this.generateSessionTitle(fullMessage.content);
    }

    // Update tags based on message topics
    if (fullMessage.topics) {
      fullMessage.topics.forEach(topic => {
        if (!session.tags.includes(topic)) {
          session.tags.push(topic);
        }
      });
    }

    this.sessions.set(this.currentSessionId, session);
    this.saveToLocalStorage();

    return fullMessage;
  }

  // Get current session messages
  getCurrentSessionMessages(): ConversationMessage[] {
    if (!this.currentSessionId) {
      return [];
    }
    return this.conversations.get(this.currentSessionId) || [];
  }

  // Get session by ID
  getSession(sessionId: string): ConversationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get session messages
  getSessionMessages(sessionId: string): ConversationMessage[] {
    return this.conversations.get(sessionId) || [];
  }

  // Get user's conversation sessions
  getUserSessions(userId: string): ConversationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  // Get recent messages across all sessions
  getRecentMessages(userId: string, limit: number = 50): ConversationMessage[] {
    const userSessions = this.getUserSessions(userId);
    const allMessages: ConversationMessage[] = [];

    userSessions.forEach(session => {
      const messages = this.getSessionMessages(session.id);
      allMessages.push(...messages);
    });

    return allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Search messages
  searchMessages(userId: string, query: string): ConversationMessage[] {
    const userSessions = this.getUserSessions(userId);
    const allMessages: ConversationMessage[] = [];

    userSessions.forEach(session => {
      const messages = this.getSessionMessages(session.id);
      allMessages.push(...messages);
    });

    const searchQuery = query.toLowerCase();
    return allMessages.filter(message => 
      message.content.toLowerCase().includes(searchQuery) ||
      message.topics?.some(topic => topic.toLowerCase().includes(searchQuery))
    );
  }

  // Update session title
  updateSessionTitle(sessionId: string, title: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.title = title;
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();
    return true;
  }

  // Add tags to session
  addSessionTags(sessionId: string, tags: string[]): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    tags.forEach(tag => {
      if (!session.tags.includes(tag)) {
        session.tags.push(tag);
      }
    });

    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();
    return true;
  }

  // Generate session summary
  generateSessionSummary(sessionId: string): string {
    const messages = this.getSessionMessages(sessionId);
    if (messages.length === 0) return '';

    const userMessages = messages.filter(m => m.type === 'user');
    const coachMessages = messages.filter(m => m.type === 'coach');

    const topics = new Set<string>();
    messages.forEach(message => {
      if (message.topics) {
        message.topics.forEach(topic => topics.add(topic));
      }
    });

    const topicList = Array.from(topics).slice(0, 3).join(', ');
    const duration = this.calculateSessionDuration(messages);

    return `Discussed ${topicList} over ${duration}. ${userMessages.length} questions asked, ${coachMessages.length} responses provided.`;
  }

  // Calculate session duration
  private calculateSessionDuration(messages: ConversationMessage[]): string {
    if (messages.length < 2) return 'a few minutes';

    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    
    const start = new Date(firstMessage.timestamp);
    const end = new Date(lastMessage.timestamp);
    const diffMs = end.getTime() - start.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'less than a minute';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }

  // Generate session title from first message
  private generateSessionTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6);
    const title = words.join(' ');
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }

  // Get conversation statistics
  getConversationStats(userId: string): ConversationStats {
    const userSessions = this.getUserSessions(userId);
    const allMessages: ConversationMessage[] = [];

    userSessions.forEach(session => {
      const messages = this.getSessionMessages(session.id);
      allMessages.push(...messages);
    });

    // Calculate statistics
    const totalMessages = allMessages.length;
    const totalSessions = userSessions.length;
    
    const averageSessionLength = totalSessions > 0 
      ? allMessages.length / totalSessions 
      : 0;

    // Most active day
    const dayCounts = new Map<string, number>();
    allMessages.forEach(message => {
      const day = new Date(message.timestamp).toDateString();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    
    const mostActiveDay = Array.from(dayCounts.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];

    // Top topics
    const topicCounts = new Map<string, number>();
    allMessages.forEach(message => {
      if (message.topics) {
        message.topics.forEach(topic => {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
      }
    });

    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sentiment distribution
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    allMessages.forEach(message => {
      if (message.sentiment) {
        sentimentCounts[message.sentiment]++;
      }
    });

    return {
      totalMessages,
      totalSessions,
      averageSessionLength: Math.round(averageSessionLength * 10) / 10,
      mostActiveDay,
      topTopics,
      sentimentDistribution: sentimentCounts
    };
  }

  // Export conversation data
  exportConversationData(userId: string): any {
    const userSessions = this.getUserSessions(userId);
    const sessionsData = userSessions.map(session => ({
      session: session,
      messages: this.getSessionMessages(session.id)
    }));

    return {
      userId,
      exportDate: new Date().toISOString(),
      sessions: sessionsData,
      stats: this.getConversationStats(userId)
    };
  }

  // Import conversation data
  importConversationData(data: any): boolean {
    try {
      if (!data.sessions || !Array.isArray(data.sessions)) {
        return false;
      }

      data.sessions.forEach((sessionData: any) => {
        const { session, messages } = sessionData;
        
        // Import session
        this.sessions.set(session.id, session);
        
        // Import messages
        this.conversations.set(session.id, messages);
      });

      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import conversation data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    this.conversations.clear();
    this.sessions.clear();
    this.currentSessionId = null;
    this.saveToLocalStorage();
  }

  // Clear user data
  clearUserData(userId: string): void {
    const userSessions = this.getUserSessions(userId);
    
    userSessions.forEach(session => {
      this.conversations.delete(session.id);
      this.sessions.delete(session.id);
    });

    if (this.currentSessionId && this.sessions.get(this.currentSessionId)?.userId === userId) {
      this.currentSessionId = null;
    }

    this.saveToLocalStorage();
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        conversations: Object.fromEntries(this.conversations),
        sessions: Object.fromEntries(this.sessions),
        currentSessionId: this.currentSessionId
      };
      localStorage.setItem('conversation-storage', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save conversation data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('conversation-storage');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.conversations) {
        this.conversations = new Map(Object.entries(parsed.conversations));
      }
      
      if (parsed.sessions) {
        this.sessions = new Map(Object.entries(parsed.sessions));
      }
      
      if (parsed.currentSessionId) {
        this.currentSessionId = parsed.currentSessionId;
      }
    } catch (error) {
      console.error('Failed to load conversation data from localStorage:', error);
    }
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // Set current session
  setCurrentSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) {
      return false;
    }
    this.currentSessionId = sessionId;
    this.saveToLocalStorage();
    return true;
  }

  // Auto-save session summary
  autoSaveSessionSummary(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const summary = this.generateSessionSummary(sessionId);
    session.summary = summary;
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.saveToLocalStorage();
  }

  // Get conversation insights
  getConversationInsights(userId: string): any {
    const stats = this.getConversationStats(userId);
    const recentMessages = this.getRecentMessages(userId, 20);
    
    const insights = {
      learningPatterns: this.analyzeLearningPatterns(recentMessages),
      engagementLevel: this.calculateEngagementLevel(stats),
      improvementAreas: this.identifyImprovementAreas(recentMessages),
      achievements: this.identifyAchievements(stats, recentMessages)
    };

    return insights;
  }

  // Analyze learning patterns
  private analyzeLearningPatterns(messages: ConversationMessage[]): any {
    const userMessages = messages.filter(m => m.type === 'user');
    const topics = new Set<string>();
    
    userMessages.forEach(message => {
      if (message.topics) {
        message.topics.forEach(topic => topics.add(topic));
      }
    });

    return {
      totalQuestions: userMessages.length,
      uniqueTopics: topics.size,
      mostFrequentTopics: this.getMostFrequentTopics(userMessages),
      questionComplexity: this.analyzeQuestionComplexity(userMessages)
    };
  }

  // Get most frequent topics
  private getMostFrequentTopics(messages: ConversationMessage[]): Array<{ topic: string; count: number }> {
    const topicCounts = new Map<string, number>();
    
    messages.forEach(message => {
      if (message.topics) {
        message.topics.forEach(topic => {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
      }
    });

    return Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Analyze question complexity
  private analyzeQuestionComplexity(messages: ConversationMessage[]): 'low' | 'medium' | 'high' {
    const complexityKeywords = {
      low: ['what', 'how', 'why', 'when', 'where'],
      medium: ['explain', 'describe', 'compare', 'analyze', 'evaluate'],
      high: ['design', 'implement', 'optimize', 'architecture', 'complex']
    };

    let complexityScore = 0;
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (complexityKeywords.high.some(keyword => content.includes(keyword))) {
        complexityScore += 3;
      } else if (complexityKeywords.medium.some(keyword => content.includes(keyword))) {
        complexityScore += 2;
      } else if (complexityKeywords.low.some(keyword => content.includes(keyword))) {
        complexityScore += 1;
      }
    });

    const averageScore = complexityScore / messages.length;
    
    if (averageScore >= 2.5) return 'high';
    if (averageScore >= 1.5) return 'medium';
    return 'low';
  }

  // Calculate engagement level
  private calculateEngagementLevel(stats: ConversationStats): 'low' | 'medium' | 'high' {
    const messagesPerSession = stats.totalMessages / stats.totalSessions;
    
    if (messagesPerSession >= 20) return 'high';
    if (messagesPerSession >= 10) return 'medium';
    return 'low';
  }

  // Identify improvement areas
  private identifyImprovementAreas(messages: ConversationMessage[]): string[] {
    const areas: string[] = [];
    
    // Check for sentiment patterns
    const negativeMessages = messages.filter(m => m.sentiment === 'negative');
    if (negativeMessages.length > messages.length * 0.3) {
      areas.push('Consider asking more specific questions to get better guidance');
    }

    // Check for topic diversity
    const topics = new Set<string>();
    messages.forEach(m => {
      if (m.topics) m.topics.forEach(topic => topics.add(topic));
    });
    
    if (topics.size < 3) {
      areas.push('Explore more diverse topics to broaden your learning');
    }

    return areas;
  }

  // Identify achievements
  private identifyAchievements(stats: ConversationStats, messages: ConversationMessage[]): string[] {
    const achievements: string[] = [];
    
    if (stats.totalMessages >= 100) {
      achievements.push('Active learner - 100+ messages exchanged');
    }
    
    if (stats.totalSessions >= 10) {
      achievements.push('Consistent learner - 10+ conversation sessions');
    }
    
    if (stats.sentimentDistribution.positive > stats.sentimentDistribution.negative) {
      achievements.push('Positive learning attitude maintained');
    }

    return achievements;
  }
}

// Export singleton instance
export const conversationStorage = new ConversationStorage();
