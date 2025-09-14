// Escalation Manager for AI Career Coach
// Handles escalation of complex issues to human mentors

export interface EscalationRequest {
  id: string;
  userId: string;
  reason: EscalationReason;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: {
    originalMessage: string;
    conversationHistory: any[];
    userProfile: any;
    emotionalState: any;
    sentimentAnalysis: any;
  };
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  assignedMentor?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

export interface EscalationReason {
  type: 'technical_complexity' | 'emotional_support' | 'career_crisis' | 'ai_limitation' | 'user_request';
  description: string;
  confidence: number;
  triggers: string[];
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  availability: {
    timezone: string;
    workingHours: string;
    daysAvailable: string[];
  };
  rating: number;
  responseTime: number; // in minutes
  isOnline: boolean;
  currentLoad: number; // 0-100
}

export class EscalationManager {
  private escalationRequests: Map<string, EscalationRequest> = new Map();
  private mentors: Map<string, Mentor> = new Map();
  private escalationCallbacks: Array<(request: EscalationRequest) => void> = [];

  constructor() {
    this.initializeMentors();
  }

  // Initialize mock mentors
  private initializeMentors() {
    const mockMentors: Mentor[] = [
      {
        id: 'mentor-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        expertise: ['Web Development', 'Career Guidance', 'JavaScript', 'React'],
        availability: {
          timezone: 'EST',
          workingHours: '9 AM - 5 PM',
          daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        rating: 4.8,
        responseTime: 30,
        isOnline: true,
        currentLoad: 60
      },
      {
        id: 'mentor-2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        expertise: ['Data Science', 'Python', 'Machine Learning', 'Career Transition'],
        availability: {
          timezone: 'PST',
          workingHours: '10 AM - 6 PM',
          daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        rating: 4.9,
        responseTime: 45,
        isOnline: true,
        currentLoad: 40
      },
      {
        id: 'mentor-3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        expertise: ['UI/UX Design', 'Career Coaching', 'Portfolio Review', 'Freelancing'],
        availability: {
          timezone: 'CST',
          workingHours: '8 AM - 4 PM',
          daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        rating: 4.7,
        responseTime: 60,
        isOnline: false,
        currentLoad: 80
      }
    ];

    mockMentors.forEach(mentor => {
      this.mentors.set(mentor.id, mentor);
    });
  }

  // Check if escalation is needed
  shouldEscalate(
    userMessage: string,
    context: any,
    aiResponse: any,
    emotionalState: any
  ): { shouldEscalate: boolean; reason?: EscalationReason } {
    const reasons: EscalationReason[] = [];

    // Check for technical complexity
    if (this.isTechnicallyComplex(userMessage)) {
      reasons.push({
        type: 'technical_complexity',
        description: 'User is asking about complex technical concepts that require expert guidance',
        confidence: 0.8,
        triggers: this.extractTechnicalTriggers(userMessage)
      });
    }

    // Check for emotional support needs
    if (this.needsEmotionalSupport(emotionalState)) {
      reasons.push({
        type: 'emotional_support',
        description: 'User needs emotional support and guidance from a human mentor',
        confidence: 0.9,
        triggers: this.extractEmotionalTriggers(emotionalState)
      });
    }

    // Check for career crisis
    if (this.isCareerCrisis(userMessage, context)) {
      reasons.push({
        type: 'career_crisis',
        description: 'User is experiencing a career crisis that requires immediate human intervention',
        confidence: 0.95,
        triggers: this.extractCrisisTriggers(userMessage)
      });
    }

    // Check for AI limitations
    if (this.isAILimited(userMessage, aiResponse)) {
      reasons.push({
        type: 'ai_limitation',
        description: 'AI response indicates limitations in handling this specific query',
        confidence: 0.7,
        triggers: this.extractAILimitationTriggers(aiResponse)
      });
    }

    // Check for explicit user request
    if (this.isUserRequestingEscalation(userMessage)) {
      reasons.push({
        type: 'user_request',
        description: 'User explicitly requested to speak with a human mentor',
        confidence: 1.0,
        triggers: ['user_request']
      });
    }

    if (reasons.length === 0) {
      return { shouldEscalate: false };
    }

    // Find the highest confidence reason
    const primaryReason = reasons.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );

    return {
      shouldEscalate: true,
      reason: primaryReason
    };
  }

  // Create escalation request
  createEscalationRequest(
    userId: string,
    reason: EscalationReason,
    context: any
  ): EscalationRequest {
    const request: EscalationRequest = {
      id: `escalation-${Date.now()}`,
      userId,
      reason,
      priority: this.determinePriority(reason),
      context,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.escalationRequests.set(request.id, request);
    this.notifyCallbacks(request);
    
    // Auto-assign to best available mentor
    this.autoAssignMentor(request);

    return request;
  }

  // Auto-assign mentor based on expertise and availability
  private autoAssignMentor(request: EscalationRequest) {
    const availableMentors = Array.from(this.mentors.values())
      .filter(mentor => mentor.isOnline && mentor.currentLoad < 90)
      .sort((a, b) => {
        // Sort by expertise match, then by current load, then by response time
        const aExpertiseMatch = this.calculateExpertiseMatch(mentor, request);
        const bExpertiseMatch = this.calculateExpertiseMatch(mentor, request);
        
        if (aExpertiseMatch !== bExpertiseMatch) {
          return bExpertiseMatch - aExpertiseMatch;
        }
        
        if (a.currentLoad !== b.currentLoad) {
          return a.currentLoad - b.currentLoad;
        }
        
        return a.responseTime - b.responseTime;
      });

    if (availableMentors.length > 0) {
      const selectedMentor = availableMentors[0];
      this.assignMentor(request.id, selectedMentor.id);
    }
  }

  // Calculate expertise match score
  private calculateExpertiseMatch(mentor: Mentor, request: EscalationRequest): number {
    const userTopics = this.extractTopicsFromContext(request.context);
    const mentorExpertise = mentor.expertise.map(e => e.toLowerCase());
    
    let matchScore = 0;
    userTopics.forEach(topic => {
      if (mentorExpertise.some(expertise => 
        expertise.includes(topic.toLowerCase()) || 
        topic.toLowerCase().includes(expertise)
      )) {
        matchScore += 1;
      }
    });
    
    return matchScore / userTopics.length;
  }

  // Extract topics from context
  private extractTopicsFromContext(context: any): string[] {
    const topics: string[] = [];
    
    if (context.originalMessage) {
      const messageTopics = this.extractTopicsFromMessage(context.originalMessage);
      topics.push(...messageTopics);
    }
    
    if (context.userProfile?.interests) {
      topics.push(...context.userProfile.interests);
    }
    
    if (context.userProfile?.skills) {
      topics.push(...context.userProfile.skills);
    }
    
    return [...new Set(topics)];
  }

  // Extract topics from message
  private extractTopicsFromMessage(message: string): string[] {
    const topics: string[] = [];
    const messageLower = message.toLowerCase();
    
    const topicKeywords = {
      'web development': ['web', 'website', 'frontend', 'backend', 'html', 'css', 'javascript'],
      'mobile development': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
      'data science': ['data', 'analysis', 'machine learning', 'ai', 'python', 'statistics'],
      'ui ux': ['ui', 'ux', 'design', 'user interface', 'user experience', 'figma'],
      'career': ['career', 'job', 'internship', 'resume', 'interview', 'hiring'],
      'programming': ['code', 'programming', 'coding', 'developer', 'software']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  // Assign mentor to escalation request
  assignMentor(requestId: string, mentorId: string): boolean {
    const request = this.escalationRequests.get(requestId);
    const mentor = this.mentors.get(mentorId);
    
    if (!request || !mentor) {
      return false;
    }
    
    request.assignedMentor = mentorId;
    request.status = 'assigned';
    request.updatedAt = new Date().toISOString();
    
    // Update mentor load
    mentor.currentLoad = Math.min(100, mentor.currentLoad + 10);
    
    this.escalationRequests.set(requestId, request);
    this.mentors.set(mentorId, mentor);
    this.notifyCallbacks(request);
    
    return true;
  }

  // Update escalation status
  updateEscalationStatus(requestId: string, status: EscalationRequest['status'], resolution?: string): boolean {
    const request = this.escalationRequests.get(requestId);
    
    if (!request) {
      return false;
    }
    
    request.status = status;
    request.updatedAt = new Date().toISOString();
    
    if (resolution) {
      request.resolution = resolution;
    }
    
    // If resolved, reduce mentor load
    if (status === 'resolved' && request.assignedMentor) {
      const mentor = this.mentors.get(request.assignedMentor);
      if (mentor) {
        mentor.currentLoad = Math.max(0, mentor.currentLoad - 10);
        this.mentors.set(request.assignedMentor, mentor);
      }
    }
    
    this.escalationRequests.set(requestId, request);
    this.notifyCallbacks(request);
    
    return true;
  }

  // Get escalation request
  getEscalationRequest(requestId: string): EscalationRequest | undefined {
    return this.escalationRequests.get(requestId);
  }

  // Get user's escalation requests
  getUserEscalationRequests(userId: string): EscalationRequest[] {
    return Array.from(this.escalationRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get available mentors
  getAvailableMentors(): Mentor[] {
    return Array.from(this.mentors.values())
      .filter(mentor => mentor.isOnline && mentor.currentLoad < 90)
      .sort((a, b) => a.currentLoad - b.currentLoad);
  }

  // Get mentor by ID
  getMentor(mentorId: string): Mentor | undefined {
    return this.mentors.get(mentorId);
  }

  // Check if escalation is technically complex
  private isTechnicallyComplex(message: string): boolean {
    const complexKeywords = [
      'architecture', 'scalability', 'performance', 'optimization', 'security',
      'microservices', 'distributed', 'concurrent', 'asynchronous', 'algorithm',
      'complex', 'advanced', 'enterprise', 'production', 'deployment'
    ];
    
    const messageLower = message.toLowerCase();
    return complexKeywords.some(keyword => messageLower.includes(keyword));
  }

  // Check if emotional support is needed
  private needsEmotionalSupport(emotionalState: any): boolean {
    if (!emotionalState) return false;
    
    const { mood, intensity, supportNeeded } = emotionalState;
    
    // High intensity negative emotions
    if (intensity === 'high' && ['frustrated', 'overwhelmed', 'anxious'].includes(mood)) {
      return true;
    }
    
    // Explicit support needed
    if (supportNeeded) {
      return true;
    }
    
    return false;
  }

  // Check if it's a career crisis
  private isCareerCrisis(message: string, context: any): boolean {
    const crisisKeywords = [
      'fired', 'laid off', 'unemployed', 'job loss', 'career change',
      'crisis', 'emergency', 'urgent', 'desperate', 'stuck',
      'depression', 'anxiety', 'mental health', 'burnout'
    ];
    
    const messageLower = message.toLowerCase();
    return crisisKeywords.some(keyword => messageLower.includes(keyword));
  }

  // Check if AI is limited
  private isAILimited(message: string, aiResponse: any): boolean {
    if (!aiResponse) return false;
    
    const limitationIndicators = [
      'I don\'t know', 'I can\'t help', 'I\'m not sure', 'I\'m limited',
      'I cannot', 'I\'m unable', 'I don\'t have', 'I\'m not qualified'
    ];
    
    const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.content || '';
    return limitationIndicators.some(indicator => 
      responseText.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  // Check if user is requesting escalation
  private isUserRequestingEscalation(message: string): boolean {
    const escalationKeywords = [
      'human', 'mentor', 'person', 'real person', 'speak to someone',
      'talk to', 'connect me', 'escalate', 'transfer', 'help me'
    ];
    
    const messageLower = message.toLowerCase();
    return escalationKeywords.some(keyword => messageLower.includes(keyword));
  }

  // Determine priority based on reason
  private determinePriority(reason: EscalationReason): EscalationRequest['priority'] {
    switch (reason.type) {
      case 'career_crisis':
        return 'urgent';
      case 'emotional_support':
        return 'high';
      case 'technical_complexity':
        return 'medium';
      case 'ai_limitation':
        return 'low';
      case 'user_request':
        return 'medium';
      default:
        return 'medium';
    }
  }

  // Extract technical triggers
  private extractTechnicalTriggers(message: string): string[] {
    const triggers: string[] = [];
    const messageLower = message.toLowerCase();
    
    const technicalTriggers = {
      'architecture': ['architecture', 'system design', 'scalability'],
      'performance': ['performance', 'optimization', 'speed', 'efficiency'],
      'security': ['security', 'vulnerability', 'encryption', 'authentication'],
      'deployment': ['deployment', 'production', 'infrastructure', 'devops']
    };
    
    Object.entries(technicalTriggers).forEach(([trigger, keywords]) => {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        triggers.push(trigger);
      }
    });
    
    return triggers;
  }

  // Extract emotional triggers
  private extractEmotionalTriggers(emotionalState: any): string[] {
    if (!emotionalState) return [];
    
    const triggers: string[] = [];
    
    if (emotionalState.mood) {
      triggers.push(emotionalState.mood);
    }
    
    if (emotionalState.triggers) {
      triggers.push(...emotionalState.triggers);
    }
    
    return triggers;
  }

  // Extract crisis triggers
  private extractCrisisTriggers(message: string): string[] {
    const triggers: string[] = [];
    const messageLower = message.toLowerCase();
    
    const crisisTriggers = {
      'job_loss': ['fired', 'laid off', 'unemployed', 'job loss'],
      'mental_health': ['depression', 'anxiety', 'mental health', 'burnout'],
      'urgent': ['urgent', 'emergency', 'crisis', 'desperate']
    };
    
    Object.entries(crisisTriggers).forEach(([trigger, keywords]) => {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        triggers.push(trigger);
      }
    });
    
    return triggers;
  }

  // Extract AI limitation triggers
  private extractAILimitationTriggers(aiResponse: any): string[] {
    const triggers: string[] = [];
    const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.content || '';
    
    if (responseText.includes('I don\'t know')) {
      triggers.push('knowledge_limitation');
    }
    if (responseText.includes('I can\'t help')) {
      triggers.push('capability_limitation');
    }
    if (responseText.includes('I\'m not sure')) {
      triggers.push('uncertainty');
    }
    
    return triggers;
  }

  // Subscribe to escalation updates
  subscribe(callback: (request: EscalationRequest) => void) {
    this.escalationCallbacks.push(callback);
  }

  // Unsubscribe from escalation updates
  unsubscribe(callback: (request: EscalationRequest) => void) {
    this.escalationCallbacks = this.escalationCallbacks.filter(cb => cb !== callback);
  }

  // Notify callbacks of escalation updates
  private notifyCallbacks(request: EscalationRequest) {
    this.escalationCallbacks.forEach(callback => callback(request));
  }

  // Get escalation statistics
  getEscalationStats(): any {
    const requests = Array.from(this.escalationRequests.values());
    
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      assigned: requests.filter(r => r.status === 'assigned').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      averageResolutionTime: this.calculateAverageResolutionTime(requests),
      topReasons: this.getTopReasons(requests)
    };
  }

  // Calculate average resolution time
  private calculateAverageResolutionTime(requests: EscalationRequest[]): number {
    const resolvedRequests = requests.filter(r => r.status === 'resolved');
    
    if (resolvedRequests.length === 0) return 0;
    
    const totalTime = resolvedRequests.reduce((total, request) => {
      const created = new Date(request.createdAt).getTime();
      const updated = new Date(request.updatedAt).getTime();
      return total + (updated - created);
    }, 0);
    
    return totalTime / resolvedRequests.length / (1000 * 60 * 60); // Convert to hours
  }

  // Get top escalation reasons
  private getTopReasons(requests: EscalationRequest[]): any[] {
    const reasonCounts = new Map<string, number>();
    
    requests.forEach(request => {
      const reason = request.reason.type;
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });
    
    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Export singleton instance
export const escalationManager = new EscalationManager();
