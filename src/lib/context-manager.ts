// Context Manager for AI Career Coach
// Manages user context, learning patterns, and conversation history

export interface UserContext {
  userProfile: {
    id: string;
    age: string;
    interests: string[];
    goals: string[];
    experienceLevel: string;
    skills: string[];
    learningStyle?: string;
    careerStage?: string;
  };
  learningProgress: {
    completedCourses: number;
    projectsBuilt: number;
    skillsMastered: number;
    learningStreak: number;
    totalLearningTime: number;
    lastActiveDate: string;
  };
  conversationHistory: {
    messages: Array<{
      id: string;
      type: 'user' | 'coach';
      content: string;
      timestamp: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      topics?: string[];
    }>;
    patterns: {
      questionTypes: Record<string, number>;
      commonTopics: string[];
      learningFocus: string[];
    };
  };
  currentSituation: {
    activeRoadmaps: string[];
    currentProjects: string[];
    skillGaps: string[];
    nextMilestones: string[];
    challenges: string[];
  };
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'encouraging';
    responseLength: 'brief' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    learningPace: 'slow' | 'moderate' | 'fast';
  };
}

export interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics?: string[];
}

export class ContextManager {
  private context: UserContext | null = null;
  private sessionId: string = '';

  constructor() {
    this.initializeContext();
  }

  private initializeContext() {
    this.sessionId = `session-${Date.now()}`;
    this.context = {
      userProfile: {
        id: '',
        age: '15-18',
        interests: [],
        goals: [],
        experienceLevel: 'beginner',
        skills: [],
        learningStyle: 'mixed',
        careerStage: 'exploration'
      },
      learningProgress: {
        completedCourses: 0,
        projectsBuilt: 0,
        skillsMastered: 0,
        learningStreak: 0,
        totalLearningTime: 0,
        lastActiveDate: new Date().toISOString()
      },
      conversationHistory: {
        messages: [],
        patterns: {
          questionTypes: {},
          commonTopics: [],
          learningFocus: []
        }
      },
      currentSituation: {
        activeRoadmaps: [],
        currentProjects: [],
        skillGaps: [],
        nextMilestones: [],
        challenges: []
      },
      preferences: {
        communicationStyle: 'encouraging',
        responseLength: 'detailed',
        focusAreas: [],
        learningPace: 'moderate'
      }
    };
  }

  // Update user profile
  updateUserProfile(profile: Partial<UserContext['userProfile']>) {
    if (!this.context) return;
    
    this.context.userProfile = {
      ...this.context.userProfile,
      ...profile
    };
    
    console.log('ContextManager: User profile updated', this.context.userProfile);
  }

  // Add message to conversation history
  addMessage(message: Message) {
    if (!this.context) return;

    this.context.conversationHistory.messages.push(message);
    
    // Keep only last 20 messages
    if (this.context.conversationHistory.messages.length > 20) {
      this.context.conversationHistory.messages = this.context.conversationHistory.messages.slice(-20);
    }

    // Update conversation patterns
    this.updateConversationPatterns(message);
    
    console.log('ContextManager: Message added to history', message);
  }

  // Update learning progress
  updateLearningProgress(progress: Partial<UserContext['learningProgress']>) {
    if (!this.context) return;

    this.context.learningProgress = {
      ...this.context.learningProgress,
      ...progress,
      lastActiveDate: new Date().toISOString()
    };
    
    console.log('ContextManager: Learning progress updated', this.context.learningProgress);
  }

  // Update current situation
  updateCurrentSituation(situation: Partial<UserContext['currentSituation']>) {
    if (!this.context) return;

    this.context.currentSituation = {
      ...this.context.currentSituation,
      ...situation
    };
    
    console.log('ContextManager: Current situation updated', this.context.currentSituation);
  }

  // Update preferences
  updatePreferences(preferences: Partial<UserContext['preferences']>) {
    if (!this.context) return;

    this.context.preferences = {
      ...this.context.preferences,
      ...preferences
    };
    
    console.log('ContextManager: Preferences updated', this.context.preferences);
  }

  // Get context for AI
  getContextForAI(): any {
    if (!this.context) return null;

    return {
      userProfile: this.context.userProfile,
      learningProgress: this.context.learningProgress,
      conversationHistory: this.context.conversationHistory,
      currentSituation: this.context.currentSituation,
      preferences: this.context.preferences,
      sessionId: this.sessionId,
      // Add computed context
      recentMessages: this.context.conversationHistory.messages.slice(-10),
      learningStreak: this.context.learningProgress.learningStreak,
      skillLevel: this.getSkillLevel(),
      learningVelocity: this.calculateLearningVelocity(),
      focusAreas: this.getFocusAreas(),
      nextSteps: this.getNextSteps()
    };
  }

  // Get current context
  getContext(): UserContext | null {
    return this.context;
  }

  // Clear context
  clearContext() {
    this.initializeContext();
    console.log('ContextManager: Context cleared');
  }

  // Get skill level based on skills and experience
  private getSkillLevel(): string {
    if (!this.context) return 'beginner';

    const { skills, experienceLevel } = this.context.userProfile;
    const skillCount = skills.length;

    if (skillCount >= 10 && experienceLevel === 'advanced') return 'expert';
    if (skillCount >= 7 && experienceLevel === 'intermediate') return 'advanced';
    if (skillCount >= 4 && experienceLevel === 'beginner') return 'intermediate';
    
    return 'beginner';
  }

  // Calculate learning velocity
  private calculateLearningVelocity(): number {
    if (!this.context) return 0;

    const { completedCourses, projectsBuilt, skillsMastered } = this.context.learningProgress;
    const totalAchievements = completedCourses + projectsBuilt + skillsMastered;
    
    // Simple velocity calculation (achievements per week)
    return Math.min(totalAchievements / 4, 10); // Cap at 10
  }

  // Get focus areas based on goals and interests
  private getFocusAreas(): string[] {
    if (!this.context) return [];

    const { goals, interests, skills } = this.context.userProfile;
    const focusAreas = [...goals, ...interests];
    
    // Add skills that appear frequently in conversation
    const skillMentions = this.context.conversationHistory.patterns.commonTopics
      .filter(topic => skills.includes(topic));
    
    return [...new Set([...focusAreas, ...skillMentions])];
  }

  // Get next steps based on current situation
  private getNextSteps(): string[] {
    if (!this.context) return [];

    const { skillGaps, nextMilestones, challenges } = this.context.currentSituation;
    const nextSteps: string[] = [];

    if (skillGaps.length > 0) {
      nextSteps.push(`Focus on developing: ${skillGaps.slice(0, 3).join(', ')}`);
    }

    if (nextMilestones.length > 0) {
      nextSteps.push(`Work towards: ${nextMilestones.slice(0, 2).join(', ')}`);
    }

    if (challenges.length > 0) {
      nextSteps.push(`Address challenges: ${challenges.slice(0, 2).join(', ')}`);
    }

    return nextSteps;
  }

  // Update conversation patterns
  private updateConversationPatterns(message: Message) {
    if (!this.context) return;

    const { patterns } = this.context.conversationHistory;

    // Update question types
    if (message.type === 'user' && message.content.includes('?')) {
      const questionType = this.categorizeQuestion(message.content);
      patterns.questionTypes[questionType] = (patterns.questionTypes[questionType] || 0) + 1;
    }

    // Update common topics
    if (message.topics) {
      message.topics.forEach(topic => {
        if (!patterns.commonTopics.includes(topic)) {
          patterns.commonTopics.push(topic);
        }
      });
    }

    // Update learning focus
    if (message.content.toLowerCase().includes('learn') || 
        message.content.toLowerCase().includes('study') ||
        message.content.toLowerCase().includes('course')) {
      const learningTopic = this.extractLearningTopic(message.content);
      if (learningTopic && !patterns.learningFocus.includes(learningTopic)) {
        patterns.learningFocus.push(learningTopic);
      }
    }
  }

  // Categorize question type
  private categorizeQuestion(content: string): string {
    const contentLower = content.toLowerCase();

    if (contentLower.includes('how')) return 'how';
    if (contentLower.includes('what')) return 'what';
    if (contentLower.includes('why')) return 'why';
    if (contentLower.includes('when')) return 'when';
    if (contentLower.includes('where')) return 'where';
    if (contentLower.includes('which')) return 'which';
    if (contentLower.includes('who')) return 'who';
    if (contentLower.includes('can') || contentLower.includes('could')) return 'capability';
    if (contentLower.includes('should') || contentLower.includes('would')) return 'advice';
    if (contentLower.includes('is') || contentLower.includes('are')) return 'clarification';
    
    return 'general';
  }

  // Extract learning topic from message
  private extractLearningTopic(content: string): string | null {
    const learningKeywords = [
      'javascript', 'python', 'react', 'node', 'html', 'css',
      'programming', 'coding', 'development', 'web', 'mobile',
      'data science', 'machine learning', 'ai', 'database',
      'design', 'ui', 'ux', 'frontend', 'backend', 'full stack'
    ];

    const contentLower = content.toLowerCase();
    const foundTopic = learningKeywords.find(keyword => contentLower.includes(keyword));
    
    return foundTopic || null;
  }

  // Generate insights based on context
  generateInsights(): string[] {
    const insights: string[] = [];
    const { userProfile, conversationHistory, learningProgress } = this.context;

    if (!userProfile || !conversationHistory || !learningProgress) {
      return insights;
    }

    // Skill development insight
    if (userProfile.skills.length >= 5) {
      insights.push(`You have ${userProfile.skills.length} skills - that's a strong foundation!`);
    }

    // Goal progress insight
    if (userProfile.goals.length >= 3) {
      insights.push(`You have ${userProfile.goals.length} clear goals - great focus!`);
    }

    // Progress insight
    if (learningProgress.completedCourses > 5) {
      insights.push(`You've completed ${learningProgress.completedCourses} courses - that's impressive dedication!`);
    }

    // Conversation pattern insight
    const patterns = conversationHistory.patterns;
    if (patterns.questionTypes.technical > 5) {
      insights.push("You ask a lot of technical questions - you're clearly focused on building practical skills!");
    }

    return insights;
  }

}

// Export singleton instance
export const contextManager = new ContextManager();
