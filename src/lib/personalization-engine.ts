// Personalization Engine for AI Career Coach
// Provides tailored career advice and recommendations based on user profile data

export interface UserProfile {
  id: string;
  age: string;
  interests: string[];
  goals: string[];
  experienceLevel: string;
  skills: string[];
  learningStyle?: string;
  careerStage?: string;
  location?: string;
  education?: string;
  workExperience?: string[];
  personalityTraits?: string[];
  learningPreferences?: {
    pace: 'slow' | 'moderate' | 'fast';
    format: 'visual' | 'text' | 'hands-on' | 'mixed';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    duration: 'short' | 'medium' | 'long';
  };
  careerPreferences?: {
    industry: string[];
    companySize: 'startup' | 'medium' | 'large' | 'enterprise' | 'any';
    workEnvironment: 'remote' | 'hybrid' | 'office' | 'any';
    salaryExpectations?: string;
    workLifeBalance: 'high' | 'medium' | 'low';
  };
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'skill' | 'course' | 'project' | 'career' | 'networking' | 'mentorship';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relevanceScore: number; // 0-100
  personalizationFactors: string[];
  actionItems: string[];
  resources: Array<{
    title: string;
    type: 'course' | 'article' | 'video' | 'book' | 'tool' | 'community';
    url?: string;
    description: string;
  }>;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  milestones: Array<{
    title: string;
    description: string;
    duration: string;
    skills: string[];
    projects: string[];
  }>;
  personalizedFor: string[];
}

export interface CareerInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  actionRequired: boolean;
  relatedSkills: string[];
  marketTrends?: string[];
}

export class PersonalizationEngine {
  private userProfile: UserProfile | null = null;
  private conversationHistory: any[] = [];
  private learningProgress: any = null;

  // Update user profile
  updateUserProfile(profile: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...profile } as UserProfile;
  }

  // Update conversation history
  updateConversationHistory(history: any[]): void {
    this.conversationHistory = history;
  }

  // Update learning progress
  updateLearningProgress(progress: any): void {
    this.learningProgress = progress;
  }

  // Generate personalized recommendations
  generatePersonalizedRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) {
      return this.getDefaultRecommendations();
    }

    const recommendations: PersonalizedRecommendation[] = [];

    // Skill-based recommendations
    recommendations.push(...this.generateSkillRecommendations());

    // Career-based recommendations
    recommendations.push(...this.generateCareerRecommendations());

    // Learning-based recommendations
    recommendations.push(...this.generateLearningRecommendations());

    // Project-based recommendations
    recommendations.push(...this.generateProjectRecommendations());

    // Networking recommendations
    recommendations.push(...this.generateNetworkingRecommendations());

    // Sort by relevance score and priority
    return recommendations
      .sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, 10); // Return top 10 recommendations
  }

  // Generate skill recommendations
  private generateSkillRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    const { skills, goals, experienceLevel, interests } = this.userProfile;

    // Identify missing skills for goals
    const requiredSkills = this.getRequiredSkillsForGoals(goals);
    const missingSkills = requiredSkills.filter(skill => 
      !skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    missingSkills.forEach(skill => {
      const difficulty = this.determineSkillDifficulty(skill, experienceLevel);
      const priority = this.calculateSkillPriority(skill, goals, interests);
      
      recommendations.push({
        id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'skill',
        title: `Learn ${skill}`,
        description: `Master ${skill} to advance your career goals`,
        priority,
        estimatedTime: this.estimateSkillLearningTime(skill, difficulty),
        difficulty,
        relevanceScore: this.calculateSkillRelevance(skill, goals, interests),
        personalizationFactors: [
          `Required for: ${goals.join(', ')}`,
          `Matches your interests: ${interests.join(', ')}`,
          `Appropriate for ${experienceLevel} level`
        ],
        actionItems: this.generateSkillActionItems(skill, difficulty),
        resources: this.getSkillResources(skill, difficulty)
      });
    });

    return recommendations;
  }

  // Generate career recommendations
  private generateCareerRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    const { skills, goals, experienceLevel, careerPreferences } = this.userProfile;

    // Career advancement recommendations
    if (experienceLevel === 'beginner') {
      recommendations.push({
        id: 'career-internship',
        type: 'career',
        title: 'Apply for Internships',
        description: 'Gain practical experience through internships in your field',
        priority: 'high',
        estimatedTime: '2-4 weeks',
        difficulty: 'beginner',
        relevanceScore: 90,
        personalizationFactors: [
          'Perfect for beginner level',
          'Builds practical experience',
          'Networking opportunity'
        ],
        actionItems: [
          'Research companies in your area',
          'Prepare your resume and portfolio',
          'Practice interview skills',
          'Apply to 5-10 positions'
        ],
        resources: this.getCareerResources('internship')
      });
    }

    // Industry-specific recommendations
    if (careerPreferences?.industry) {
      careerPreferences.industry.forEach(industry => {
        recommendations.push({
          id: `career-${industry.toLowerCase()}`,
          type: 'career',
          title: `Explore ${industry} Opportunities`,
          description: `Discover career paths and opportunities in ${industry}`,
          priority: 'medium',
          estimatedTime: '1-2 weeks',
          difficulty: 'intermediate',
          relevanceScore: 80,
          personalizationFactors: [
            `Matches your industry interest: ${industry}`,
            'Aligns with career preferences'
          ],
          actionItems: [
            `Research ${industry} companies`,
            'Connect with professionals in the field',
            'Learn industry-specific skills',
            'Attend industry events'
          ],
          resources: this.getIndustryResources(industry)
        });
      });
    }

    return recommendations;
  }

  // Generate learning recommendations
  private generateLearningRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    const { learningPreferences, interests, skills } = this.userProfile;

    // Learning format recommendations
    if (learningPreferences?.format) {
      const format = learningPreferences.format;
      recommendations.push({
        id: `learning-${format}`,
        type: 'course',
        title: `Optimize Your ${format.charAt(0).toUpperCase() + format.slice(1)} Learning`,
        description: `Enhance your learning experience with ${format}-focused resources`,
        priority: 'medium',
        estimatedTime: '1 week',
        difficulty: 'beginner',
        relevanceScore: 75,
        personalizationFactors: [
          `Matches your learning style: ${format}`,
          'Improves learning efficiency'
        ],
        actionItems: [
          `Find ${format} learning resources`,
          'Set up your learning environment',
          'Create a learning schedule',
          'Track your progress'
        ],
        resources: this.getLearningFormatResources(format)
      });
    }

    // Interest-based learning
    interests.forEach(interest => {
      recommendations.push({
        id: `learning-${interest.toLowerCase()}`,
        type: 'course',
        title: `Deep Dive into ${interest}`,
        description: `Explore advanced topics in ${interest} to expand your expertise`,
        priority: 'medium',
        estimatedTime: '2-4 weeks',
        difficulty: 'intermediate',
        relevanceScore: 85,
        personalizationFactors: [
          `Matches your interest: ${interest}`,
          'Builds specialized knowledge'
        ],
        actionItems: [
          `Research advanced ${interest} topics`,
          'Find expert resources',
          'Join specialized communities',
          'Practice with projects'
        ],
        resources: this.getInterestResources(interest)
      });
    });

    return recommendations;
  }

  // Generate project recommendations
  private generateProjectRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    const { skills, goals, experienceLevel } = this.userProfile;

    // Skill-building projects
    skills.forEach(skill => {
      recommendations.push({
        id: `project-${skill.toLowerCase()}`,
        type: 'project',
        title: `Build a ${skill} Project`,
        description: `Create a practical project to showcase your ${skill} abilities`,
        priority: 'high',
        estimatedTime: '1-3 weeks',
        difficulty: this.determineSkillDifficulty(skill, experienceLevel),
        relevanceScore: 90,
        personalizationFactors: [
          `Uses your existing skill: ${skill}`,
          'Builds portfolio',
          'Practical application'
        ],
        actionItems: [
          `Plan your ${skill} project`,
          'Set up development environment',
          'Implement core features',
          'Document and showcase'
        ],
        resources: this.getProjectResources(skill)
      });
    });

    return recommendations;
  }

  // Generate networking recommendations
  private generateNetworkingRecommendations(): PersonalizedRecommendation[] {
    if (!this.userProfile) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    const { interests, goals, location } = this.userProfile;

    recommendations.push({
      id: 'networking-community',
      type: 'networking',
      title: 'Join Professional Communities',
      description: 'Connect with like-minded professionals and expand your network',
      priority: 'medium',
      estimatedTime: 'Ongoing',
      difficulty: 'beginner',
      relevanceScore: 80,
      personalizationFactors: [
        'Builds professional network',
        'Learning opportunities',
        'Career advancement'
      ],
      actionItems: [
        'Join online communities',
        'Attend local meetups',
        'Participate in discussions',
        'Share your knowledge'
      ],
      resources: this.getNetworkingResources(interests, location)
    });

    return recommendations;
  }

  // Generate personalized learning path
  generatePersonalizedLearningPath(goal: string): LearningPath {
    if (!this.userProfile) {
      return this.getDefaultLearningPath(goal);
    }

    const { experienceLevel, skills, interests, learningPreferences } = this.userProfile;
    const requiredSkills = this.getRequiredSkillsForGoals([goal]);
    const missingSkills = requiredSkills.filter(skill => 
      !skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const milestones = missingSkills.map((skill, index) => ({
      title: `Master ${skill}`,
      description: `Learn and practice ${skill} fundamentals`,
      duration: this.estimateSkillLearningTime(skill, this.determineSkillDifficulty(skill, experienceLevel)),
      skills: [skill],
      projects: [`Build a ${skill} project`]
    }));

    return {
      id: `path-${goal.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Path to ${goal}`,
      description: `A personalized learning path to achieve your goal of ${goal}`,
      totalDuration: this.calculateTotalDuration(milestones),
      difficulty: this.determinePathDifficulty(experienceLevel, missingSkills.length),
      skills: missingSkills,
      milestones,
      personalizedFor: [
        `Experience level: ${experienceLevel}`,
        `Learning style: ${learningPreferences?.format || 'mixed'}`,
        `Interests: ${interests.join(', ')}`
      ]
    };
  }

  // Generate career insights
  generateCareerInsights(): CareerInsight[] {
    if (!this.userProfile) return [];

    const insights: CareerInsight[] = [];
    const { skills, goals, experienceLevel, careerPreferences } = this.userProfile;

    // Market opportunity insights
    if (skills.includes('JavaScript') || skills.includes('React')) {
      insights.push({
        type: 'opportunity',
        title: 'High Demand for Frontend Skills',
        description: 'Frontend development skills are in high demand. Consider specializing in modern frameworks.',
        impact: 'high',
        timeframe: 'immediate',
        actionRequired: true,
        relatedSkills: ['React', 'Vue', 'Angular', 'TypeScript'],
        marketTrends: ['Remote work opportunities', 'High salary potential', 'Growing market']
      });
    }

    // Skill gap warnings
    if (goals.some(goal => goal.toLowerCase().includes('data science')) && 
        !skills.some(skill => skill.toLowerCase().includes('python'))) {
      insights.push({
        type: 'warning',
        title: 'Missing Core Data Science Skill',
        description: 'Python is essential for data science. Consider learning it to achieve your goals.',
        impact: 'high',
        timeframe: 'short-term',
        actionRequired: true,
        relatedSkills: ['Python', 'Pandas', 'NumPy', 'Matplotlib']
      });
    }

    // Achievement insights
    if (skills.length >= 5) {
      insights.push({
        type: 'achievement',
        title: 'Strong Skill Foundation',
        description: 'You have a solid foundation of skills. Consider specializing in a specific area.',
        impact: 'medium',
        timeframe: 'medium-term',
        actionRequired: false,
        relatedSkills: skills
      });
    }

    return insights;
  }

  // Helper methods
  private getRequiredSkillsForGoals(goals: string[]): string[] {
    const skillMap: Record<string, string[]> = {
      'web development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      'mobile development': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      'data science': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
      'ai ml': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
      'cybersecurity': ['Network Security', 'Ethical Hacking', 'Risk Assessment'],
      'ui ux': ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems']
    };

    const allSkills: string[] = [];
    goals.forEach(goal => {
      const goal_lower = goal.toLowerCase();
      Object.entries(skillMap).forEach(([key, skills]) => {
        if (goal_lower.includes(key)) {
          allSkills.push(...skills);
        }
      });
    });

    return [...new Set(allSkills)];
  }

  private determineSkillDifficulty(skill: string, experienceLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerSkills = ['HTML', 'CSS', 'JavaScript', 'Python', 'SQL'];
    const advancedSkills = ['Machine Learning', 'System Design', 'DevOps', 'Microservices'];
    
    if (advancedSkills.includes(skill)) return 'advanced';
    if (beginnerSkills.includes(skill)) return 'beginner';
    return 'intermediate';
  }

  private calculateSkillPriority(skill: string, goals: string[], interests: string[]): 'low' | 'medium' | 'high' | 'urgent' {
    let priority = 0;
    
    // Check if skill is directly mentioned in goals
    if (goals.some(goal => goal.toLowerCase().includes(skill.toLowerCase()))) {
      priority += 3;
    }
    
    // Check if skill matches interests
    if (interests.some(interest => interest.toLowerCase().includes(skill.toLowerCase()))) {
      priority += 2;
    }
    
    // Check if skill is in high demand
    const highDemandSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'];
    if (highDemandSkills.includes(skill)) {
      priority += 1;
    }
    
    if (priority >= 4) return 'urgent';
    if (priority >= 3) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  }

  private estimateSkillLearningTime(skill: string, difficulty: string): string {
    const timeMap = {
      'beginner': { 'HTML': '1-2 weeks', 'CSS': '2-3 weeks', 'JavaScript': '4-6 weeks' },
      'intermediate': { 'React': '3-4 weeks', 'Node.js': '4-6 weeks', 'Python': '6-8 weeks' },
      'advanced': { 'Machine Learning': '3-6 months', 'System Design': '2-4 months' }
    };
    
    return timeMap[difficulty as keyof typeof timeMap]?.[skill as keyof typeof timeMap[typeof difficulty]] || '2-4 weeks';
  }

  private calculateSkillRelevance(skill: string, goals: string[], interests: string[]): number {
    let score = 0;
    
    if (goals.some(goal => goal.toLowerCase().includes(skill.toLowerCase()))) score += 40;
    if (interests.some(interest => interest.toLowerCase().includes(skill.toLowerCase()))) score += 30;
    
    // Add base relevance
    score += 20;
    
    return Math.min(100, score);
  }

  private generateSkillActionItems(skill: string, difficulty: string): string[] {
    return [
      `Find a comprehensive ${skill} tutorial`,
      `Practice with ${skill} exercises`,
      `Build a small ${skill} project`,
      `Join ${skill} community forums`,
      `Read ${skill} documentation`
    ];
  }

  private getSkillResources(skill: string, difficulty: string): any[] {
    return [
      {
        title: `${skill} Official Documentation`,
        type: 'article',
        description: `Official documentation for ${skill}`,
        url: `https://${skill.toLowerCase()}.org/docs`
      },
      {
        title: `${skill} Tutorial Series`,
        type: 'video',
        description: `Comprehensive video tutorial for ${skill}`,
        url: `https://youtube.com/search?q=${skill}+tutorial`
      }
    ];
  }

  private getDefaultRecommendations(): PersonalizedRecommendation[] {
    return [
      {
        id: 'default-1',
        type: 'skill',
        title: 'Learn JavaScript',
        description: 'JavaScript is essential for web development',
        priority: 'high',
        estimatedTime: '4-6 weeks',
        difficulty: 'beginner',
        relevanceScore: 80,
        personalizationFactors: ['High demand skill'],
        actionItems: ['Find JavaScript tutorial', 'Practice coding exercises'],
        resources: []
      }
    ];
  }

  private getDefaultLearningPath(goal: string): LearningPath {
    return {
      id: `default-${goal}`,
      title: `Path to ${goal}`,
      description: `A learning path to achieve ${goal}`,
      totalDuration: '3-6 months',
      difficulty: 'intermediate',
      skills: ['Basic Skills'],
      milestones: [
        {
          title: 'Learn Fundamentals',
          description: 'Master the basics',
          duration: '1-2 months',
          skills: ['Fundamentals'],
          projects: ['Basic Project']
        }
      ],
      personalizedFor: ['Default path']
    };
  }

  private calculateTotalDuration(milestones: any[]): string {
    const totalWeeks = milestones.reduce((total, milestone) => {
      const duration = milestone.duration;
      const weeks = parseInt(duration.match(/\d+/)?.[0] || '2');
      return total + weeks;
    }, 0);
    
    if (totalWeeks < 4) return `${totalWeeks} weeks`;
    if (totalWeeks < 12) return `${Math.round(totalWeeks / 4)} months`;
    return `${Math.round(totalWeeks / 12)} months`;
  }

  private determinePathDifficulty(experienceLevel: string, skillCount: number): 'beginner' | 'intermediate' | 'advanced' {
    if (experienceLevel === 'beginner' || skillCount <= 2) return 'beginner';
    if (experienceLevel === 'advanced' || skillCount >= 5) return 'advanced';
    return 'intermediate';
  }

  private getCareerResources(type: string): any[] {
    return [
      {
        title: `${type} Guide`,
        type: 'article',
        description: `Comprehensive guide to ${type}`,
        url: `https://example.com/${type}-guide`
      }
    ];
  }

  private getIndustryResources(industry: string): any[] {
    return [
      {
        title: `${industry} Industry Report`,
        type: 'article',
        description: `Latest trends in ${industry}`,
        url: `https://example.com/${industry}-trends`
      }
    ];
  }

  private getLearningFormatResources(format: string): any[] {
    return [
      {
        title: `${format} Learning Resources`,
        type: 'article',
        description: `Best ${format} learning resources`,
        url: `https://example.com/${format}-learning`
      }
    ];
  }

  private getInterestResources(interest: string): any[] {
    return [
      {
        title: `${interest} Community`,
        type: 'community',
        description: `Join the ${interest} community`,
        url: `https://example.com/${interest}-community`
      }
    ];
  }

  private getProjectResources(skill: string): any[] {
    return [
      {
        title: `${skill} Project Ideas`,
        type: 'article',
        description: `Project ideas for ${skill}`,
        url: `https://example.com/${skill}-projects`
      }
    ];
  }

  private getNetworkingResources(interests: string[], location?: string): any[] {
    return [
      {
        title: 'Professional Networking',
        type: 'community',
        description: 'Connect with professionals',
        url: 'https://linkedin.com'
      }
    ];
  }
}

// Export singleton instance
export const personalizationEngine = new PersonalizationEngine();
