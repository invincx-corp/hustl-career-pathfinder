// Peer Review System
// Handles peer feedback, project reviews, and skill assessments

export interface PeerReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  projectId: string;
  type: 'project' | 'skill' | 'portfolio' | 'code' | 'design' | 'writing';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  criteria: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    rating: number; // 1-5
    feedback: string;
  }>;
  overallRating: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ReviewProject {
  id: string;
  title: string;
  description: string;
  authorId: string;
  type: 'web_app' | 'mobile_app' | 'data_science' | 'ai_ml' | 'design' | 'writing' | 'other';
  category: string;
  tags: string[];
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
  files: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    description: string;
  }>;
  links: Array<{
    name: string;
    url: string;
    type: 'demo' | 'github' | 'documentation' | 'other';
  }>;
  requirements: string[];
  deliverables: string[];
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      title: string;
      dueDate: string;
      isCompleted: boolean;
    }>;
  };
  reviewSettings: {
    allowAnonymous: boolean;
    allowPublic: boolean;
    minReviewers: number;
    maxReviewers: number;
    deadline: string;
    criteria: string[];
  };
  reviews: string[]; // Review IDs
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'boolean';
  options?: string[];
  weight: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  criteria: string[]; // Criteria IDs
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAssignment {
  id: string;
  projectId: string;
  reviewerId: string;
  assignedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFeedback {
  id: string;
  reviewId: string;
  type: 'comment' | 'suggestion' | 'question' | 'praise' | 'concern';
  content: string;
  authorId: string;
  targetUserId?: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAnalytics {
  projectId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  commonStrengths: string[];
  commonImprovements: string[];
  reviewerDiversity: number;
  responseRate: number;
  averageCompletionTime: number; // in hours
  qualityScore: number;
}

export class PeerReviewSystem {
  private reviews: Map<string, PeerReview> = new Map();
  private projects: Map<string, ReviewProject> = new Map();
  private criteria: Map<string, ReviewCriteria> = new Map();
  private templates: Map<string, ReviewTemplate> = new Map();
  private assignments: Map<string, ReviewAssignment> = new Map();
  private feedback: Map<string, ReviewFeedback> = new Map();

  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultCriteria();
    this.initializeDefaultTemplates();
  }

  // Create review project
  createProject(projectData: Omit<ReviewProject, 'id' | 'createdAt' | 'updatedAt' | 'reviews' | 'averageRating' | 'totalReviews'>): ReviewProject {
    const project: ReviewProject = {
      id: `project-${Date.now()}`,
      ...projectData,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.set(project.id, project);
    this.saveToLocalStorage();

    return project;
  }

  // Get projects
  getProjects(filters: {
    authorId?: string;
    type?: string;
    category?: string;
    status?: string;
    difficulty?: string;
    tags?: string[];
    search?: string;
  } = {}): ReviewProject[] {
    let projects = Array.from(this.projects.values());

    if (filters.authorId) {
      projects = projects.filter(project => project.authorId === filters.authorId);
    }

    if (filters.type) {
      projects = projects.filter(project => project.type === filters.type);
    }

    if (filters.category) {
      projects = projects.filter(project => project.category === filters.category);
    }

    if (filters.status) {
      projects = projects.filter(project => project.status === filters.status);
    }

    if (filters.difficulty) {
      projects = projects.filter(project => project.difficulty === filters.difficulty);
    }

    if (filters.tags && filters.tags.length > 0) {
      projects = projects.filter(project =>
        filters.tags!.some(tag => project.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get project
  getProject(projectId: string): ReviewProject | null {
    return this.projects.get(projectId) || null;
  }

  // Create review
  createReview(reviewData: Omit<PeerReview, 'id' | 'createdAt' | 'updatedAt' | 'overallRating'>): PeerReview {
    const review: PeerReview = {
      id: `review-${Date.now()}`,
      ...reviewData,
      overallRating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.reviews.set(review.id, review);

    // Add review to project
    const project = this.projects.get(review.projectId);
    if (project) {
      project.reviews.push(review.id);
      project.updatedAt = new Date().toISOString();
      this.projects.set(project.id, project);
    }

    this.saveToLocalStorage();
    return review;
  }

  // Update review
  updateReview(reviewId: string, updates: Partial<Omit<PeerReview, 'id' | 'createdAt' | 'reviewerId' | 'revieweeId' | 'projectId'>>): PeerReview | null {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    const updatedReview = {
      ...review,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Calculate overall rating
    if (updates.criteria) {
      const totalWeight = updatedReview.criteria.reduce((sum, c) => sum + c.weight, 0);
      const weightedSum = updatedReview.criteria.reduce((sum, c) => sum + (c.rating * c.weight), 0);
      updatedReview.overallRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    this.reviews.set(reviewId, updatedReview);

    // Update project average rating
    this.updateProjectRating(review.projectId);

    this.saveToLocalStorage();
    return updatedReview;
  }

  // Complete review
  completeReview(reviewId: string): PeerReview | null {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    review.status = 'completed';
    review.completedAt = new Date().toISOString();
    review.updatedAt = new Date().toISOString();

    this.reviews.set(reviewId, review);
    this.updateProjectRating(review.projectId);
    this.saveToLocalStorage();

    return review;
  }

  // Update project rating
  private updateProjectRating(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;

    const projectReviews = project.reviews
      .map(reviewId => this.reviews.get(reviewId))
      .filter((review): review is PeerReview => review !== undefined && review.status === 'completed');

    if (projectReviews.length > 0) {
      const totalRating = projectReviews.reduce((sum, review) => sum + review.overallRating, 0);
      project.averageRating = totalRating / projectReviews.length;
      project.totalReviews = projectReviews.length;
    } else {
      project.averageRating = 0;
      project.totalReviews = 0;
    }

    project.updatedAt = new Date().toISOString();
    this.projects.set(projectId, project);
  }

  // Get project reviews
  getProjectReviews(projectId: string): PeerReview[] {
    return Array.from(this.reviews.values())
      .filter(review => review.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get user reviews
  getUserReviews(userId: string, type: 'given' | 'received'): PeerReview[] {
    return Array.from(this.reviews.values())
      .filter(review => 
        type === 'given' ? review.reviewerId === userId : review.revieweeId === userId
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Create review assignment
  createAssignment(assignmentData: Omit<ReviewAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): ReviewAssignment {
    const assignment: ReviewAssignment = {
      id: `assignment-${Date.now()}`,
      ...assignmentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.assignments.set(assignment.id, assignment);
    this.saveToLocalStorage();

    return assignment;
  }

  // Accept assignment
  acceptAssignment(assignmentId: string): ReviewAssignment | null {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) return null;

    assignment.status = 'accepted';
    assignment.updatedAt = new Date().toISOString();
    this.assignments.set(assignmentId, assignment);
    this.saveToLocalStorage();

    return assignment;
  }

  // Decline assignment
  declineAssignment(assignmentId: string): ReviewAssignment | null {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) return null;

    assignment.status = 'declined';
    assignment.updatedAt = new Date().toISOString();
    this.assignments.set(assignmentId, assignment);
    this.saveToLocalStorage();

    return assignment;
  }

  // Get user assignments
  getUserAssignments(userId: string): ReviewAssignment[] {
    return Array.from(this.assignments.values())
      .filter(assignment => assignment.reviewerId === userId)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  // Create review criteria
  createCriteria(criteriaData: Omit<ReviewCriteria, 'id' | 'createdAt' | 'updatedAt'>): ReviewCriteria {
    const criteria: ReviewCriteria = {
      id: `criteria-${Date.now()}`,
      ...criteriaData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.criteria.set(criteria.id, criteria);
    this.saveToLocalStorage();

    return criteria;
  }

  // Get criteria
  getCriteria(category?: string): ReviewCriteria[] {
    let criteria = Array.from(this.criteria.values()).filter(c => c.isActive);

    if (category) {
      criteria = criteria.filter(c => c.category === category);
    }

    return criteria.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Create review template
  createTemplate(templateData: Omit<ReviewTemplate, 'id' | 'createdAt' | 'updatedAt'>): ReviewTemplate {
    const template: ReviewTemplate = {
      id: `template-${Date.now()}`,
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(template.id, template);
    this.saveToLocalStorage();

    return template;
  }

  // Get templates
  getTemplates(type?: string): ReviewTemplate[] {
    let templates = Array.from(this.templates.values()).filter(t => t.isActive);

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Create review feedback
  createFeedback(feedbackData: Omit<ReviewFeedback, 'id' | 'createdAt' | 'updatedAt' | 'isResolved'>): ReviewFeedback {
    const feedback: ReviewFeedback = {
      id: `feedback-${Date.now()}`,
      ...feedbackData,
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feedback.set(feedback.id, feedback);
    this.saveToLocalStorage();

    return feedback;
  }

  // Get review feedback
  getReviewFeedback(reviewId: string): ReviewFeedback[] {
    return Array.from(this.feedback.values())
      .filter(feedback => feedback.reviewId === reviewId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Get project analytics
  getProjectAnalytics(projectId: string): ReviewAnalytics {
    const project = this.projects.get(projectId);
    if (!project) {
      return {
        projectId,
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        commonStrengths: [],
        commonImprovements: [],
        reviewerDiversity: 0,
        responseRate: 0,
        averageCompletionTime: 0,
        qualityScore: 0
      };
    }

    const reviews = this.getProjectReviews(projectId).filter(r => r.status === 'completed');
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews : 0;

    // Rating distribution
    const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    reviews.forEach(review => {
      const rating = Math.round(review.overallRating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating.toString() as keyof typeof ratingDistribution]++;
      }
    });

    // Common strengths and improvements
    const allStrengths = reviews.flatMap(r => r.strengths);
    const allImprovements = reviews.flatMap(r => r.improvements);
    
    const commonStrengths = this.getTopItems(allStrengths, 5);
    const commonImprovements = this.getTopItems(allImprovements, 5);

    // Reviewer diversity
    const uniqueReviewers = new Set(reviews.map(r => r.reviewerId)).size;
    const reviewerDiversity = totalReviews > 0 ? (uniqueReviewers / totalReviews) * 100 : 0;

    // Response rate (simplified)
    const assignments = Array.from(this.assignments.values()).filter(a => a.projectId === projectId);
    const responseRate = assignments.length > 0 ? (totalReviews / assignments.length) * 100 : 0;

    // Average completion time
    const completedAssignments = assignments.filter(a => a.status === 'completed');
    const averageCompletionTime = completedAssignments.length > 0 ? 
      completedAssignments.reduce((sum, a) => {
        const start = new Date(a.createdAt).getTime();
        const end = new Date(a.updatedAt).getTime();
        return sum + (end - start) / (1000 * 60 * 60); // Convert to hours
      }, 0) / completedAssignments.length : 0;

    // Quality score (simplified)
    const qualityScore = (averageRating / 5) * 100;

    return {
      projectId,
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      commonStrengths,
      commonImprovements,
      reviewerDiversity: Math.round(reviewerDiversity * 100) / 100,
      responseRate: Math.round(responseRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      qualityScore: Math.round(qualityScore * 100) / 100
    };
  }

  // Get top items from array
  private getTopItems(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  // Initialize default criteria
  private initializeDefaultCriteria(): void {
    const defaultCriteria: Omit<ReviewCriteria, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Code Quality',
        description: 'How well-written and maintainable is the code?',
        category: 'technical',
        type: 'rating',
        weight: 25,
        isRequired: true,
        isActive: true
      },
      {
        name: 'Functionality',
        description: 'Does the project work as intended?',
        category: 'technical',
        type: 'rating',
        weight: 25,
        isRequired: true,
        isActive: true
      },
      {
        name: 'Design',
        description: 'How well-designed is the user interface?',
        category: 'design',
        type: 'rating',
        weight: 20,
        isRequired: true,
        isActive: true
      },
      {
        name: 'Documentation',
        description: 'Is the project well-documented?',
        category: 'technical',
        type: 'rating',
        weight: 15,
        isRequired: true,
        isActive: true
      },
      {
        name: 'Creativity',
        description: 'How creative and innovative is the solution?',
        category: 'general',
        type: 'rating',
        weight: 15,
        isRequired: true,
        isActive: true
      }
    ];

    defaultCriteria.forEach(criteria => {
      if (!this.criteria.has(criteria.name)) {
        this.createCriteria(criteria);
      }
    });
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<ReviewTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Web Application Review',
        description: 'Template for reviewing web applications',
        type: 'web_app',
        criteria: Array.from(this.criteria.values())
          .filter(c => c.category === 'technical' || c.category === 'design')
          .map(c => c.id),
        isDefault: true,
        isActive: true
      },
      {
        name: 'Code Review',
        description: 'Template for reviewing code submissions',
        type: 'code',
        criteria: Array.from(this.criteria.values())
          .filter(c => c.category === 'technical')
          .map(c => c.id),
        isDefault: true,
        isActive: true
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
        reviews: Object.fromEntries(this.reviews),
        projects: Object.fromEntries(this.projects),
        criteria: Object.fromEntries(this.criteria),
        templates: Object.fromEntries(this.templates),
        assignments: Object.fromEntries(this.assignments),
        feedback: Object.fromEntries(this.feedback)
      };
      localStorage.setItem('peer-review', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save peer review data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('peer-review');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.reviews) {
        this.reviews = new Map(Object.entries(parsed.reviews));
      }
      
      if (parsed.projects) {
        this.projects = new Map(Object.entries(parsed.projects));
      }
      
      if (parsed.criteria) {
        this.criteria = new Map(Object.entries(parsed.criteria));
      }
      
      if (parsed.templates) {
        this.templates = new Map(Object.entries(parsed.templates));
      }
      
      if (parsed.assignments) {
        this.assignments = new Map(Object.entries(parsed.assignments));
      }
      
      if (parsed.feedback) {
        this.feedback = new Map(Object.entries(parsed.feedback));
      }
    } catch (error) {
      console.error('Failed to load peer review data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.reviews.clear();
    this.projects.clear();
    this.criteria.clear();
    this.templates.clear();
    this.assignments.clear();
    this.feedback.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const peerReviewSystem = new PeerReviewSystem();
