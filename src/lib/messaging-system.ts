// Messaging System
// Handles real-time messaging, group chats, and communication features

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'location' | 'system';
  media?: {
    url: string;
    type: string;
    size: number;
    thumbnail?: string;
  };
  metadata?: Record<string, any>;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  replyTo?: string;
  reactions: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  lastMessage?: Message;
  lastActivity: string;
  isActive: boolean;
  settings: {
    allowNewMembers: boolean;
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowReactions: boolean;
    muteNotifications: boolean;
    archiveAfterDays: number;
  };
  metadata: {
    color?: string;
    icon?: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  id: string;
  conversationId: string;
  parentMessageId: string;
  messages: string[];
  participants: string[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  highlights: string[];
  relevanceScore: number;
}

export class MessagingSystem {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private threads: Map<string, MessageThread> = new Map();
  private typingIndicators: Map<string, TypingIndicator> = new Map();
  private reactions: Map<string, MessageReaction> = new Map();
  private searchIndex: Map<string, string[]> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Create conversation
  createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'isActive'>): Conversation {
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      ...conversationData,
      lastActivity: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversations.set(conversation.id, conversation);
    this.saveToLocalStorage();

    return conversation;
  }

  // Get conversation
  getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  // Get user conversations
  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.participants.includes(userId) && conv.isActive)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  // Create direct conversation
  createDirectConversation(userId1: string, userId2: string): Conversation {
    const existingConversation = Array.from(this.conversations.values())
      .find(conv => 
        conv.type === 'direct' && 
        conv.participants.length === 2 &&
        conv.participants.includes(userId1) &&
        conv.participants.includes(userId2)
      );

    if (existingConversation) {
      return existingConversation;
    }

    return this.createConversation({
      type: 'direct',
      participants: [userId1, userId2],
      admins: [],
      createdBy: userId1,
      settings: {
        allowNewMembers: false,
        allowFileSharing: true,
        allowVoiceMessages: true,
        allowReactions: true,
        muteNotifications: false,
        archiveAfterDays: 30
      },
      metadata: {
        tags: []
      }
    });
  }

  // Create group conversation
  createGroupConversation(
    name: string,
    description: string,
    createdBy: string,
    participants: string[],
    admins: string[] = []
  ): Conversation {
    return this.createConversation({
      type: 'group',
      name,
      description,
      participants: [...participants, createdBy],
      admins: [...admins, createdBy],
      createdBy,
      settings: {
        allowNewMembers: true,
        allowFileSharing: true,
        allowVoiceMessages: true,
        allowReactions: true,
        muteNotifications: false,
        archiveAfterDays: 30
      },
      metadata: {
        tags: []
      }
    });
  }

  // Send message
  sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'isDeleted' | 'reactions' | 'readBy'>): Message {
    const message: Message = {
      id: `msg-${Date.now()}`,
      ...messageData,
      isEdited: false,
      isDeleted: false,
      reactions: [],
      readBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.messages.set(message.id, message);

    // Update conversation
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastActivity = new Date().toISOString();
      conversation.updatedAt = new Date().toISOString();
      this.conversations.set(conversation.id, conversation);
    }

    // Add to search index
    this.addToSearchIndex(message);

    this.saveToLocalStorage();
    return message;
  }

  // Get conversation messages
  getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Message[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId && !msg.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Edit message
  editMessage(messageId: string, newContent: string): Message | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date().toISOString();
    message.updatedAt = new Date().toISOString();

    this.messages.set(messageId, message);
    this.saveToLocalStorage();

    return message;
  }

  // Delete message
  deleteMessage(messageId: string): Message | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    message.isDeleted = true;
    message.deletedAt = new Date().toISOString();
    message.updatedAt = new Date().toISOString();

    this.messages.set(messageId, message);
    this.saveToLocalStorage();

    return message;
  }

  // Add reaction to message
  addReaction(messageId: string, userId: string, emoji: string): Message | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    const existingReaction = message.reactions.find(r => r.userId === userId && r.emoji === emoji);
    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
    } else {
      // Add reaction
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date().toISOString()
      });
    }

    message.updatedAt = new Date().toISOString();
    this.messages.set(messageId, message);
    this.saveToLocalStorage();

    return message;
  }

  // Mark message as read
  markMessageAsRead(messageId: string, userId: string): Message | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    const existingRead = message.readBy.find(r => r.userId === userId);
    if (!existingRead) {
      message.readBy.push({
        userId,
        readAt: new Date().toISOString()
      });
      message.updatedAt = new Date().toISOString();
      this.messages.set(messageId, message);
      this.saveToLocalStorage();
    }

    return message;
  }

  // Mark conversation as read
  markConversationAsRead(conversationId: string, userId: string): void {
    const messages = this.getConversationMessages(conversationId);
    messages.forEach(message => {
      if (message.senderId !== userId) {
        this.markMessageAsRead(message.id, userId);
      }
    });
  }

  // Get unread message count
  getUnreadMessageCount(userId: string): number {
    const userConversations = this.getUserConversations(userId);
    let unreadCount = 0;

    userConversations.forEach(conversation => {
      const messages = this.getConversationMessages(conversation.id);
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== userId && 
        !msg.readBy.some(r => r.userId === userId)
      );
      unreadCount += unreadMessages.length;
    });

    return unreadCount;
  }

  // Set typing indicator
  setTypingIndicator(conversationId: string, userId: string, isTyping: boolean): void {
    const key = `${conversationId}-${userId}`;
    
    if (isTyping) {
      this.typingIndicators.set(key, {
        conversationId,
        userId,
        isTyping: true,
        timestamp: new Date().toISOString()
      });
    } else {
      this.typingIndicators.delete(key);
    }

    this.saveToLocalStorage();
  }

  // Get typing indicators for conversation
  getTypingIndicators(conversationId: string): TypingIndicator[] {
    return Array.from(this.typingIndicators.values())
      .filter(indicator => 
        indicator.conversationId === conversationId && 
        indicator.isTyping &&
        new Date().getTime() - new Date(indicator.timestamp).getTime() < 5000 // 5 seconds
      );
  }

  // Search messages
  searchMessages(query: string, userId: string, conversationId?: string): MessageSearchResult[] {
    const userConversations = conversationId ? 
      [this.conversations.get(conversationId)].filter(Boolean) as Conversation[] :
      this.getUserConversations(userId);

    const results: MessageSearchResult[] = [];

    userConversations.forEach(conversation => {
      const messages = this.getConversationMessages(conversation.id);
      
      messages.forEach(message => {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          const highlights = this.getHighlights(message.content, query);
          const relevanceScore = this.calculateRelevanceScore(message, query);
          
          results.push({
            message,
            conversation,
            highlights,
            relevanceScore
          });
        }
      });
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Get highlights for search results
  private getHighlights(content: string, query: string): string[] {
    const highlights: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    let index = lowerContent.indexOf(lowerQuery);
    while (index !== -1) {
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + query.length + 50);
      highlights.push(content.substring(start, end));
      index = lowerContent.indexOf(lowerQuery, index + 1);
    }

    return highlights;
  }

  // Calculate relevance score
  private calculateRelevanceScore(message: Message, query: string): number {
    let score = 0;
    const lowerContent = message.content.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match
    if (lowerContent === lowerQuery) score += 100;
    
    // Starts with query
    if (lowerContent.startsWith(lowerQuery)) score += 80;
    
    // Contains query
    if (lowerContent.includes(lowerQuery)) score += 60;
    
    // Word boundary match
    const wordBoundaryRegex = new RegExp(`\\b${lowerQuery}\\b`, 'i');
    if (wordBoundaryRegex.test(lowerContent)) score += 40;

    return score;
  }

  // Add message to search index
  private addToSearchIndex(message: Message): void {
    const words = message.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      const messageIds = this.searchIndex.get(word) || [];
      if (!messageIds.includes(message.id)) {
        messageIds.push(message.id);
        this.searchIndex.set(word, messageIds);
      }
    });
  }

  // Create message thread
  createMessageThread(conversationId: string, parentMessageId: string, participants: string[]): MessageThread {
    const thread: MessageThread = {
      id: `thread-${Date.now()}`,
      conversationId,
      parentMessageId,
      messages: [],
      participants,
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.threads.set(thread.id, thread);
    this.saveToLocalStorage();

    return thread;
  }

  // Add message to thread
  addMessageToThread(threadId: string, messageId: string): MessageThread | null {
    const thread = this.threads.get(threadId);
    if (!thread) return null;

    if (!thread.messages.includes(messageId)) {
      thread.messages.push(messageId);
      thread.updatedAt = new Date().toISOString();
      this.threads.set(threadId, thread);
      this.saveToLocalStorage();
    }

    return thread;
  }

  // Get thread messages
  getThreadMessages(threadId: string): Message[] {
    const thread = this.threads.get(threadId);
    if (!thread) return [];

    return thread.messages
      .map(msgId => this.messages.get(msgId))
      .filter((msg): msg is Message => msg !== undefined && !msg.isDeleted);
  }

  // Archive conversation
  archiveConversation(conversationId: string): Conversation | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    conversation.isActive = false;
    conversation.updatedAt = new Date().toISOString();
    this.conversations.set(conversationId, conversation);
    this.saveToLocalStorage();

    return conversation;
  }

  // Get conversation statistics
  getConversationStatistics(conversationId: string): {
    totalMessages: number;
    totalParticipants: number;
    messagesPerDay: number;
    mostActiveUser: string;
    averageMessageLength: number;
    fileShareCount: number;
    reactionCount: number;
  } {
    const messages = this.getConversationMessages(conversationId);
    const conversation = this.getConversation(conversationId);
    
    if (!conversation) {
      return {
        totalMessages: 0,
        totalParticipants: 0,
        messagesPerDay: 0,
        mostActiveUser: '',
        averageMessageLength: 0,
        fileShareCount: 0,
        reactionCount: 0
      };
    }

    const totalMessages = messages.length;
    const totalParticipants = conversation.participants.length;
    
    // Calculate messages per day
    const daysSinceCreation = Math.ceil(
      (new Date().getTime() - new Date(conversation.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const messagesPerDay = daysSinceCreation > 0 ? totalMessages / daysSinceCreation : 0;

    // Find most active user
    const userMessageCounts = messages.reduce((acc, msg) => {
      acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveUser = Object.entries(userMessageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate average message length
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const averageMessageLength = totalMessages > 0 ? totalLength / totalMessages : 0;

    // Count file shares and reactions
    const fileShareCount = messages.filter(msg => msg.type !== 'text').length;
    const reactionCount = messages.reduce((sum, msg) => sum + msg.reactions.length, 0);

    return {
      totalMessages,
      totalParticipants,
      messagesPerDay: Math.round(messagesPerDay * 100) / 100,
      mostActiveUser,
      averageMessageLength: Math.round(averageMessageLength * 100) / 100,
      fileShareCount,
      reactionCount
    };
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        conversations: Object.fromEntries(this.conversations),
        messages: Object.fromEntries(this.messages),
        threads: Object.fromEntries(this.threads),
        typingIndicators: Object.fromEntries(this.typingIndicators),
        reactions: Object.fromEntries(this.reactions),
        searchIndex: Object.fromEntries(this.searchIndex)
      };
      localStorage.setItem('messaging-system', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save messaging data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('messaging-system');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.conversations) {
        this.conversations = new Map(Object.entries(parsed.conversations));
      }
      
      if (parsed.messages) {
        this.messages = new Map(Object.entries(parsed.messages));
      }
      
      if (parsed.threads) {
        this.threads = new Map(Object.entries(parsed.threads));
      }
      
      if (parsed.typingIndicators) {
        this.typingIndicators = new Map(Object.entries(parsed.typingIndicators));
      }
      
      if (parsed.reactions) {
        this.reactions = new Map(Object.entries(parsed.reactions));
      }
      
      if (parsed.searchIndex) {
        this.searchIndex = new Map(Object.entries(parsed.searchIndex));
      }
    } catch (error) {
      console.error('Failed to load messaging data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.conversations.clear();
    this.messages.clear();
    this.threads.clear();
    this.typingIndicators.clear();
    this.reactions.clear();
    this.searchIndex.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const messagingSystem = new MessagingSystem();
