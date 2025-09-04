import { huggingFaceAIProvider } from './ai-provider-huggingface';

// AI Provider Configuration
export class AIProvider {
  private huggingFace = huggingFaceAIProvider;
  private isConfigured = false;
  private careerKnowledgeBase = this.initializeCareerKnowledgeBase();

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    this.isConfigured = !!apiKey;
  }

  // Generate AI roadmap
  async generateRoadmap(goal: string, userProfile: any): Promise<any> {
    if (!this.isConfigured) {
      return this.simulateRoadmapGeneration(goal, userProfile);
    }

    try {
      return await this.huggingFace.generateRoadmap(goal, userProfile);
    } catch (error: any) {
      console.warn('Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateRoadmapGeneration(goal, userProfile);
    }
  }

  // Generate skill gap analysis
  async analyzeSkillGaps(currentSkills: string[], targetRole: string): Promise<any> {
    if (!this.isConfigured) {
      return this.simulateSkillAnalysis(currentSkills, targetRole);
    }

    try {
      return await this.huggingFace.analyzeSkillGaps(currentSkills, targetRole);
    } catch (error: any) {
      console.warn('Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateSkillAnalysis(currentSkills, targetRole);
    }
  }

  // Enhanced career coach response with real-time analysis
  async generateCoachResponse(userMessage: string, context: any): Promise<any> {
    if (!this.isConfigured) {
      return this.generateEnhancedSimulatedResponse(userMessage, context);
    }

    try {
      // Real-time context analysis
      const analyzedContext = this.analyzeUserContext(context);
      
      // Generate intelligent response using AI
      const aiResponse = await this.huggingFace.generateEnhancedCoachResponse(
        userMessage, 
        analyzedContext
      );
      
      // Enhance with career intelligence
      const enhancedResponse = this.enhanceResponseWithCareerIntelligence(
        aiResponse, 
        userMessage, 
        analyzedContext
      );
      
      return enhancedResponse;
    } catch (error: any) {
      console.warn('AI failed, using enhanced simulated response:', error.message);
      return this.generateEnhancedSimulatedResponse(userMessage, context);
    }
  }

  // Simulate responses when AI is not configured
  private simulateRoadmapGeneration(goal: string, userProfile: any) {
    return {
      steps: [
        {
          id: "1",
          title: "Research and Planning",
          description: "Understand the requirements and create a learning plan",
          duration: "2 weeks",
          type: "course",
          completed: false
        },
        {
          id: "2", 
          title: "Foundation Skills",
          description: "Build core skills needed for your goal",
          duration: "4 weeks",
          type: "course",
          completed: false
        },
        {
          id: "3",
          title: "Practical Project",
          description: "Apply your skills in a real project",
          duration: "3 weeks", 
          type: "project",
          completed: false
        }
      ],
      estimatedTime: "9 weeks",
      difficulty: "beginner",
      skills: ["Planning", "Core Skills", "Project Management"]
    };
  }

  private simulateSkillAnalysis(currentSkills: string[], targetRole: string) {
    return {
      missingSkills: ["Advanced Programming", "System Design", "Team Leadership"],
      prioritySkills: ["Advanced Programming", "System Design"],
      learningPath: ["Programming Fundamentals", "Advanced Concepts", "System Design"],
      estimatedTime: "6 months"
    };
  }

  // Real-time context analysis
  private analyzeUserContext(context: any) {
    const { userHistory, userProfile, currentSkills, learningProgress } = context;
    
    // Analyze learning patterns
    const learningPatterns = this.analyzeLearningPatterns(userHistory);
    
    // Identify skill gaps
    const skillGaps = this.identifySkillGaps(currentSkills, userProfile.goals);
    
    // Predict next steps
    const nextSteps = this.predictNextSteps(learningProgress, skillGaps);
    
    // Career trajectory analysis
    const careerTrajectory = this.analyzeCareerTrajectory(userProfile, currentSkills);
    
    return {
      ...context,
      learningPatterns,
      skillGaps,
      nextSteps,
      careerTrajectory,
      timestamp: new Date().toISOString()
    };
  }

  // Analyze learning patterns from conversation history
  private analyzeLearningPatterns(userHistory: any[]) {
    if (!userHistory || userHistory.length === 0) {
      return { pattern: 'new_user', confidence: 0.8 };
    }

    const recentMessages = userHistory.slice(-10);
    const questionTypes = recentMessages.map(msg => this.categorizeQuestion(msg.content));
    
    const patterns = {
      exploratory: questionTypes.filter(q => q === 'exploratory').length,
      technical: questionTypes.filter(q => q === 'technical').length,
      career: questionTypes.filter(q => q === 'career').length,
      motivational: questionTypes.filter(q => q === 'motivational').length
    };

    const dominantPattern = Object.entries(patterns).reduce((a, b) => 
      patterns[a[0]] > patterns[b[0]] ? a : b
    )[0];

    return {
      pattern: dominantPattern,
      confidence: Math.max(...Object.values(patterns)) / recentMessages.length,
      questionDistribution: patterns
    };
  }

  // Categorize user questions for better context
  private categorizeQuestion(content: string): string {
    const content_lower = content.toLowerCase();
    
    if (content_lower.includes('learn') || content_lower.includes('what') || content_lower.includes('how')) {
      return 'exploratory';
    }
    if (content_lower.includes('code') || content_lower.includes('error') || content_lower.includes('bug')) {
      return 'technical';
    }
    if (content_lower.includes('career') || content_lower.includes('job') || content_lower.includes('internship')) {
      return 'career';
    }
    if (content_lower.includes('motivated') || content_lower.includes('stuck') || content_lower.includes('help')) {
      return 'motivational';
    }
    
    return 'general';
  }

  // Identify skill gaps based on goals
  private identifySkillGaps(currentSkills: string[], goals: string[]) {
    const skillMap = this.careerKnowledgeBase.skills;
    const requiredSkills = this.getRequiredSkillsForGoals(goals);
    
    // Ensure currentSkills is an array
    const safeCurrentSkills = Array.isArray(currentSkills) ? currentSkills : [];
    
    const missingSkills = requiredSkills.filter(skill => 
      !safeCurrentSkills.some(current => 
        current.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(current.toLowerCase())
      )
    );

    return {
      missing: missingSkills,
      priority: this.prioritizeSkills(missingSkills, goals),
      estimatedTime: this.estimateLearningTime(missingSkills)
    };
  }

  // Predict next steps based on progress and gaps
  private predictNextSteps(learningProgress: any, skillGaps: any) {
    const { missing, priority } = skillGaps;
    
    if (priority.length === 0) return { action: 'maintain', focus: 'advanced_topics' };
    
    const nextSkill = priority[0];
    const learningPath = this.getLearningPathForSkill(nextSkill);
    
    return {
      action: 'learn',
      focus: nextSkill,
      path: learningPath,
      estimatedDuration: this.estimateLearningTime([nextSkill])
    };
  }

  // Analyze career trajectory
  private analyzeCareerTrajectory(userProfile: any, currentSkills: string[]) {
    const { age, interests, goals } = userProfile;
    const skillLevel = this.assessSkillLevel(currentSkills);
    
    // Career stage analysis
    let careerStage = 'beginner';
    if (skillLevel > 7) careerStage = 'intermediate';
    if (skillLevel > 9) careerStage = 'advanced';
    
    // Market readiness assessment
    const marketReadiness = this.assessMarketReadiness(currentSkills, careerStage);
    
    // Timeline projection
    const timeline = this.projectCareerTimeline(careerStage, goals);
    
    return {
      stage: careerStage,
      skillLevel,
      marketReadiness,
      timeline,
      recommendations: this.getCareerRecommendations(careerStage, goals)
    };
  }

  // Enhanced response generation with career intelligence
  private enhanceResponseWithCareerIntelligence(aiResponse: string, userMessage: string, context: any) {
    const { learningPatterns, skillGaps, nextSteps, careerTrajectory } = context;
    
    // Generate personalized suggestions
    const suggestions = this.generatePersonalizedSuggestions(context);
    
    // Create action items
    const actionItems = this.createActionItems(nextSteps, skillGaps);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(userMessage, context);
    
    return {
      content: aiResponse,
      suggestions,
      actionItems,
      followUpQuestions,
      context: {
        learningPattern: learningPatterns.pattern,
        skillGaps: skillGaps.missing.slice(0, 3),
        nextStep: nextSteps.focus,
        careerStage: careerTrajectory.stage
      }
    };
  }

  // Generate personalized suggestions based on context
  private generatePersonalizedSuggestions(context: any) {
    const { learningPatterns, skillGaps, careerTrajectory } = context;
    
    const suggestions = [];
    
    // Learning pattern-based suggestions
    if (learningPatterns.pattern === 'technical') {
      suggestions.push('Practice with hands-on coding challenges');
      suggestions.push('Join a coding community for peer learning');
    } else if (learningPatterns.pattern === 'career') {
      suggestions.push('Update your portfolio with recent projects');
      suggestions.push('Network with professionals in your target field');
    }
    
    // Skill gap-based suggestions
    if (skillGaps.missing.length > 0) {
      suggestions.push(`Focus on mastering ${skillGaps.priority[0]} first`);
      suggestions.push('Take incremental steps to avoid overwhelm');
    }
    
    // Career stage-based suggestions
    if (careerTrajectory.stage === 'beginner') {
      suggestions.push('Build a strong foundation with fundamentals');
      suggestions.push('Start with small, achievable projects');
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }

  // Create actionable items
  private createActionItems(nextSteps: any, skillGaps: any) {
    const actionItems = [];
    
    if (nextSteps.action === 'learn') {
      actionItems.push({
        id: Date.now().toString(),
        title: `Learn ${nextSteps.focus}`,
        type: 'learning',
        dueDate: 'This Week',
        priority: 'high',
        estimatedTime: nextSteps.estimatedDuration
      });
    }
    
    if (skillGaps.missing.length > 0) {
      actionItems.push({
        id: (Date.now() + 1).toString(),
        title: 'Complete skill assessment',
        type: 'assessment',
        dueDate: 'Today',
        priority: 'medium',
        estimatedTime: '30 minutes'
      });
    }
    
    return actionItems;
  }

  // Generate intelligent follow-up questions
  private generateFollowUpQuestions(userMessage: string, context: any) {
    const { learningPatterns, skillGaps, careerTrajectory } = context;
    const questions = [];
    
    // Pattern-based questions
    if (learningPatterns.pattern === 'exploratory') {
      questions.push('What specific area would you like to explore first?');
      questions.push('How much time can you dedicate to learning this week?');
    }
    
    if (learningPatterns.pattern === 'technical') {
      questions.push('Have you tried any solutions before asking?');
      questions.push('What\'s your current understanding of this concept?');
    }
    
    // Skill gap-based questions
    if (skillGaps.missing.length > 0) {
      questions.push(`How confident do you feel about ${skillGaps.priority[0]}?`);
      questions.push('What\'s your preferred learning style?');
    }
    
    return questions.slice(0, 3); // Limit to 3 questions
  }

  // Initialize comprehensive career knowledge base
  private initializeCareerKnowledgeBase() {
    return {
      skills: {
        // Technology & Digital
        'programming': ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git'],
        'ai_ml': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Neural Networks'],
        'cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'DevOps'],
        'cybersecurity': ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Security Protocols'],
        
        // Healthcare & Medical
        'patient_care': ['Patient Care', 'Medical Terminology', 'Clinical Skills', 'Healthcare Administration'],
        'medical_tech': ['Medical Records', 'HIPAA Compliance', 'Emergency Response', 'Diagnostic Tools'],
        'mental_health': ['Psychology', 'Therapy', 'Assessment', 'Counseling'],
        
        // Education & Training
        'teaching': ['Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment'],
        'training': ['Student Counseling', 'Training Design', 'Learning Management Systems', 'Instructional Design'],
        
        // Creative Arts & Design
        'design': ['Adobe Creative Suite', 'Figma', 'Sketch', 'UI/UX Design', 'Typography', 'Color Theory'],
        'content_creation': ['Photography', 'Video Editing', 'Animation', 'Writing', 'Social Media', 'Branding'],
        
        // Business & Finance
        'business_analysis': ['Project Management', 'Financial Analysis', 'Marketing', 'Sales', 'Business Strategy'],
        'finance': ['Excel', 'PowerBI', 'Tableau', 'CRM', 'Digital Marketing', 'Investment Analysis'],
        
        // Agriculture & Environment
        'sustainability': ['Sustainable Agriculture', 'Environmental Science', 'Conservation', 'Food Science'],
        'agricultural_tech': ['Agricultural Technology', 'Renewable Energy', 'Climate Change', 'Wildlife Biology'],
        
        // Hospitality & Tourism
        'hospitality': ['Hotel Management', 'Event Planning', 'Customer Service', 'Tourism'],
        'culinary': ['Culinary Arts', 'Restaurant Management', 'Catering', 'Food Safety'],
        
        // Manufacturing & Engineering
        'engineering': ['CAD', 'Engineering Design', 'Manufacturing', 'Quality Control', 'Process Improvement'],
        'technical': ['Technical Writing', 'System Analysis', 'Robotics', 'Automation'],
        
        // Arts & Entertainment
        'performing_arts': ['Acting', 'Music', 'Dance', 'Theater', 'Film Production'],
        'media': ['Writing', 'Journalism', 'Broadcasting', 'Gaming', 'Sports', 'Fitness'],
        
        // Public Service & Government
        'public_service': ['Law Enforcement', 'Public Policy', 'Social Work', 'Non-profit'],
        'government': ['Government Administration', 'Legal Services', 'Emergency Services', 'Community Development'],
        
        // Transportation & Logistics
        'logistics': ['Supply Chain', 'Transportation', 'Shipping', 'Warehousing', 'Fleet Management'],
        'trade': ['International Trade', 'Procurement', 'Inventory Management', 'Route Planning'],
        
        // General Skills
        'communication': ['Public Speaking', 'Written Communication', 'Presentation Skills', 'Negotiation'],
        'leadership': ['Teamwork', 'Problem Solving', 'Critical Thinking', 'Time Management', 'Adaptability']
      },
      career_paths: {
        // Technology careers
        'software_engineer': ['programming', 'ai_ml', 'cloud'],
        'data_scientist': ['ai_ml', 'programming', 'business_analysis'],
        'cybersecurity_analyst': ['cybersecurity', 'programming', 'technical'],
        
        // Healthcare careers
        'nurse': ['patient_care', 'medical_tech', 'communication'],
        'doctor': ['patient_care', 'medical_tech', 'leadership'],
        'therapist': ['mental_health', 'communication', 'patient_care'],
        
        // Education careers
        'teacher': ['teaching', 'communication', 'leadership'],
        'training_specialist': ['training', 'communication', 'business_analysis'],
        
        // Creative careers
        'graphic_designer': ['design', 'content_creation', 'communication'],
        'content_creator': ['content_creation', 'design', 'media'],
        
        // Business careers
        'business_analyst': ['business_analysis', 'finance', 'communication'],
        'marketing_manager': ['business_analysis', 'content_creation', 'communication'],
        
        // Agriculture careers
        'agricultural_engineer': ['sustainability', 'engineering', 'agricultural_tech'],
        'environmental_scientist': ['sustainability', 'agricultural_tech', 'technical'],
        
        // Hospitality careers
        'hotel_manager': ['hospitality', 'leadership', 'business_analysis'],
        'event_planner': ['hospitality', 'content_creation', 'communication'],
        
        // Engineering careers
        'mechanical_engineer': ['engineering', 'technical', 'problem_solving'],
        'manufacturing_engineer': ['engineering', 'manufacturing', 'quality_control'],
        
        // Arts careers
        'actor': ['performing_arts', 'communication', 'content_creation'],
        'musician': ['performing_arts', 'content_creation', 'communication'],
        
        // Public service careers
        'police_officer': ['public_service', 'communication', 'leadership'],
        'social_worker': ['public_service', 'mental_health', 'communication'],
        
        // Logistics careers
        'logistics_coordinator': ['logistics', 'business_analysis', 'communication'],
        'supply_chain_manager': ['logistics', 'trade', 'leadership']
      },
      learning_resources: {
        'beginner': ['Online Courses', 'YouTube Tutorials', 'Free Resources', 'Community Forums'],
        'intermediate': ['Professional Courses', 'Certifications', 'Workshops', 'Mentorship'],
        'advanced': ['Advanced Certifications', 'Professional Networks', 'Industry Conferences', 'Research Papers']
      }
    };
  }

  // Helper methods for career analysis
  private getRequiredSkillsForGoals(goals: string[]): string[] {
    const allSkills = [];
    goals.forEach(goal => {
      const goal_lower = goal.toLowerCase();
      if (goal_lower.includes('web')) {
        allSkills.push(...this.careerKnowledgeBase.skills.frontend, ...this.careerKnowledgeBase.skills.backend);
      }
      if (goal_lower.includes('mobile')) {
        allSkills.push(...this.careerKnowledgeBase.skills.mobile);
      }
      if (goal_lower.includes('ai') || goal_lower.includes('machine learning')) {
        allSkills.push(...this.careerKnowledgeBase.skills.ai_ml);
      }
    });
    return [...new Set(allSkills)]; // Remove duplicates
  }

  private prioritizeSkills(skills: string[], goals: string[]): string[] {
    // Simple priority: frontend first, then backend, then specialized
    const priorityOrder = ['frontend', 'backend', 'database', 'devops', 'ai_ml'];
    return skills.sort((a, b) => {
      const aIndex = priorityOrder.findIndex(category => 
        this.careerKnowledgeBase.skills[category]?.includes(a)
      );
      const bIndex = priorityOrder.findIndex(category => 
        this.careerKnowledgeBase.skills[category]?.includes(b)
      );
      return aIndex - bIndex;
    });
  }

  private estimateLearningTime(skills: string[]): string {
    const totalHours = skills.length * 40; // 40 hours per skill on average
    if (totalHours < 80) return `${totalHours} hours`;
    if (totalHours < 200) return `${Math.round(totalHours / 40)} weeks`;
    return `${Math.round(totalHours / 160)} months`;
  }

  private getLearningPathForSkill(skill: string): string[] {
    // Return a learning path for the given skill
    return [
      'Understand fundamentals',
      'Practice with small exercises',
      'Build a mini-project',
      'Apply in real-world scenario'
    ];
  }

  private assessSkillLevel(skills: string[]): number {
    // Simple assessment: 1-10 scale based on number and complexity of skills
    const basicSkills = ['HTML', 'CSS', 'JavaScript'];
    const intermediateSkills = ['React', 'Node.js', 'Python'];
    const advancedSkills = ['Machine Learning', 'System Design', 'DevOps'];
    
    let score = 1;
    skills.forEach(skill => {
      if (basicSkills.includes(skill)) score += 1;
      if (intermediateSkills.includes(skill)) score += 2;
      if (advancedSkills.includes(skill)) score += 3;
    });
    
    return Math.min(10, Math.max(1, score));
  }

  private assessMarketReadiness(skills: string[], careerStage: string): string {
    if (careerStage === 'beginner') return 'learning_focused';
    if (careerStage === 'intermediate') return 'internship_ready';
    if (careerStage === 'advanced') return 'job_ready';
    return 'expert_level';
  }

  private projectCareerTimeline(careerStage: string, goals: string[]): any {
    const timelines = {
      'beginner': { nextMilestone: '3-6 months', description: 'Build foundational skills' },
      'intermediate': { nextMilestone: '6-12 months', description: 'Gain practical experience' },
      'advanced': { nextMilestone: '3-6 months', description: 'Specialize and network' }
    };
    
    return timelines[careerStage] || timelines.beginner;
  }

  private getCareerRecommendations(careerStage: string, goals: string[]): string[] {
    const recommendations = {
      'beginner': [
        'Focus on one skill at a time',
        'Build a portfolio of small projects',
        'Join coding communities and forums'
      ],
      'intermediate': [
        'Contribute to open source projects',
        'Apply for internships and entry-level positions',
        'Network with professionals in your field'
      ],
      'advanced': [
        'Specialize in a specific domain',
        'Mentor junior developers',
        'Consider advanced certifications'
      ]
    };
    
    return recommendations[careerStage] || recommendations.beginner;
  }

  // Enhanced simulated response for when AI is not available
  private generateEnhancedSimulatedResponse(userMessage: string, context: any): any {
    const analyzedContext = this.analyzeUserContext(context);
    const enhancedResponse = this.enhanceResponseWithCareerIntelligence(
      this.getSimulatedResponse(userMessage),
      userMessage,
      analyzedContext
    );
    
    return enhancedResponse;
  }

  private getSimulatedResponse(userMessage: string): string {
    const input = userMessage.toLowerCase();
    
    if (input.includes('next') || input.includes('learn')) {
      return "Based on your current progress and interests, I recommend focusing on backend development next. You've mastered frontend fundamentals, so Node.js and Express would be perfect next steps. This will make you a full-stack developer! 💪";
    }
    
    if (input.includes('portfolio')) {
      return "Your portfolio looks great! To make it even better, consider adding: 1) A detailed case study for your main project, 2) Performance metrics and optimizations you've made, 3) A blog section to showcase your learning journey. Would you like help with any of these?";
    }
    
    if (input.includes('internship') || input.includes('job')) {
      return "Great question! Based on your skills in React and JavaScript, you're ready for junior frontend roles. I've found 5 companies in your area actively hiring. Would you like me to help you prepare application materials and practice interview questions?";
    }
    
    if (input.includes('goal')) {
      return "Let's set some SMART goals! Based on your learning pace, I suggest: 1) Complete the Backend Basics course by next Friday, 2) Build a full-stack project by month-end, 3) Apply to 3 internships next week. Sound good?";
    }
    
    return "That's a great question! I'm here to help you navigate your career journey. Whether it's choosing the right courses, improving your skills, or finding opportunities, I've got your back. What specific area would you like to focus on?";
  }

  // Check if AI is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }

  // Get configuration status
  getStatus(): { configured: boolean; provider: string } {
    return {
      configured: this.isConfigured,
      provider: this.isConfigured ? 'Hugging Face (Free)' : 'Simulated'
    };
  }
}

// Export singleton instance
export const aiProvider = new AIProvider();
