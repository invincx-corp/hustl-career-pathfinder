// Mentor Verification System
// Handles credential verification, background checks, and mentor validation

export interface VerificationDocument {
  id: string;
  type: 'resume' | 'certificate' | 'degree' | 'id' | 'portfolio' | 'reference';
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerNotes?: string;
  verificationMethod: 'manual' | 'automated' | 'third-party';
  expiryDate?: string;
  isExpired: boolean;
}

export interface VerificationCheck {
  id: string;
  mentorId: string;
  checkType: 'identity' | 'education' | 'employment' | 'criminal' | 'reference' | 'skill_assessment';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  provider: 'internal' | 'external' | 'manual';
  startedAt: string;
  completedAt?: string;
  result: 'pass' | 'fail' | 'inconclusive';
  score?: number;
  details: string;
  evidence: string[];
  cost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface VerificationProfile {
  mentorId: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationLevel: 'basic' | 'standard' | 'premium' | 'expert';
  documents: VerificationDocument[];
  checks: VerificationCheck[];
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  verifiedAt?: string;
  expiresAt?: string;
  lastUpdated: string;
  reviewerId?: string;
  notes?: string;
  flags: string[];
  requirements: {
    identity: boolean;
    education: boolean;
    experience: boolean;
    references: boolean;
    background: boolean;
    skills: boolean;
  };
}

export interface VerificationTemplate {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'standard' | 'premium' | 'expert';
  requirements: {
    documents: string[];
    checks: string[];
    minimumScore: number;
    expiryDays: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationWorkflow {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'document_upload' | 'automated_check' | 'manual_review' | 'interview' | 'assessment';
    required: boolean;
    order: number;
    estimatedDays: number;
    dependencies: string[];
    criteria: {
      pass: string[];
      fail: string[];
      warning: string[];
    };
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class MentorVerificationSystem {
  private verificationProfiles: Map<string, VerificationProfile> = new Map();
  private documents: Map<string, VerificationDocument> = new Map();
  private checks: Map<string, VerificationCheck> = new Map();
  private templates: Map<string, VerificationTemplate> = new Map();
  private workflows: Map<string, VerificationWorkflow> = new Map();

  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultTemplates();
    this.initializeDefaultWorkflows();
  }

  // Start verification process for a mentor
  startVerification(mentorId: string, templateId: string): VerificationProfile {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Verification template not found');
    }

    const profile: VerificationProfile = {
      mentorId,
      status: 'pending',
      verificationLevel: template.level,
      documents: [],
      checks: [],
      overallScore: 0,
      riskLevel: 'medium',
      lastUpdated: new Date().toISOString(),
      flags: [],
      requirements: {
        identity: false,
        education: false,
        experience: false,
        references: false,
        background: false,
        skills: false
      }
    };

    this.verificationProfiles.set(mentorId, profile);
    this.saveToLocalStorage();

    return profile;
  }

  // Upload verification document
  uploadDocument(
    mentorId: string,
    documentData: {
      type: VerificationDocument['type'];
      title: string;
      description: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }
  ): VerificationDocument {
    const document: VerificationDocument = {
      id: `doc-${Date.now()}`,
      ...documentData,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      verificationMethod: 'manual',
      isExpired: false
    };

    this.documents.set(document.id, document);

    const profile = this.verificationProfiles.get(mentorId);
    if (profile) {
      profile.documents.push(document);
      profile.lastUpdated = new Date().toISOString();
      this.verificationProfiles.set(mentorId, profile);
    }

    this.saveToLocalStorage();
    return document;
  }

  // Review document
  reviewDocument(
    documentId: string,
    reviewerId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): VerificationDocument | null {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.status = status;
    document.reviewedAt = new Date().toISOString();
    document.reviewerId = reviewerId;
    document.reviewerNotes = notes;

    this.documents.set(documentId, document);

    // Update mentor profile
    const profile = this.verificationProfiles.get(document.mentorId);
    if (profile) {
      profile.lastUpdated = new Date().toISOString();
      this.updateVerificationStatus(profile.mentorId);
      this.verificationProfiles.set(profile.mentorId, profile);
    }

    this.saveToLocalStorage();
    return document;
  }

  // Run verification check
  runVerificationCheck(
    mentorId: string,
    checkType: VerificationCheck['checkType'],
    provider: VerificationCheck['provider'] = 'internal'
  ): VerificationCheck {
    const check: VerificationCheck = {
      id: `check-${Date.now()}`,
      mentorId,
      checkType,
      status: 'in_progress',
      provider,
      startedAt: new Date().toISOString(),
      result: 'inconclusive',
      details: '',
      evidence: [],
      cost: this.getCheckCost(checkType, provider),
      priority: this.getCheckPriority(checkType)
    };

    this.checks.set(check.id, check);

    const profile = this.verificationProfiles.get(mentorId);
    if (profile) {
      profile.checks.push(check);
      profile.lastUpdated = new Date().toISOString();
      this.verificationProfiles.set(mentorId, profile);
    }

    // Simulate check completion
    setTimeout(() => {
      this.completeVerificationCheck(check.id, 'pass', 'Check completed successfully', []);
    }, 2000);

    this.saveToLocalStorage();
    return check;
  }

  // Complete verification check
  completeVerificationCheck(
    checkId: string,
    result: VerificationCheck['result'],
    details: string,
    evidence: string[]
  ): VerificationCheck | null {
    const check = this.checks.get(checkId);
    if (!check) return null;

    check.status = 'completed';
    check.completedAt = new Date().toISOString();
    check.result = result;
    check.details = details;
    check.evidence = evidence;

    this.checks.set(checkId, check);

    // Update mentor profile
    const profile = this.verificationProfiles.get(check.mentorId);
    if (profile) {
      profile.lastUpdated = new Date().toISOString();
      this.updateVerificationStatus(profile.mentorId);
      this.verificationProfiles.set(profile.mentorId, profile);
    }

    this.saveToLocalStorage();
    return check;
  }

  // Update verification status
  private updateVerificationStatus(mentorId: string): void {
    const profile = this.verificationProfiles.get(mentorId);
    if (!profile) return;

    // Calculate overall score
    const documentScore = this.calculateDocumentScore(profile.documents);
    const checkScore = this.calculateCheckScore(profile.checks);
    profile.overallScore = (documentScore + checkScore) / 2;

    // Update requirements
    profile.requirements.identity = this.hasValidDocument(profile.documents, 'id');
    profile.requirements.education = this.hasValidDocument(profile.documents, 'degree') || 
                                   this.hasValidDocument(profile.documents, 'certificate');
    profile.requirements.experience = this.hasValidDocument(profile.documents, 'resume');
    profile.requirements.references = this.hasValidDocument(profile.documents, 'reference');
    profile.requirements.background = this.hasPassedCheck(profile.checks, 'criminal');
    profile.requirements.skills = this.hasPassedCheck(profile.checks, 'skill_assessment');

    // Determine verification status
    const allRequirementsMet = Object.values(profile.requirements).every(req => req);
    const hasMinimumScore = profile.overallScore >= 70;

    if (allRequirementsMet && hasMinimumScore) {
      profile.status = 'verified';
      profile.verifiedAt = new Date().toISOString();
      profile.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (profile.overallScore < 30) {
      profile.status = 'rejected';
    } else {
      profile.status = 'pending';
    }

    // Determine risk level
    profile.riskLevel = this.calculateRiskLevel(profile);
  }

  // Calculate document score
  private calculateDocumentScore(documents: VerificationDocument[]): number {
    if (documents.length === 0) return 0;

    const approvedDocs = documents.filter(doc => doc.status === 'approved');
    const totalWeight = documents.length * 100;
    const approvedWeight = approvedDocs.length * 100;

    return (approvedWeight / totalWeight) * 100;
  }

  // Calculate check score
  private calculateCheckScore(checks: VerificationCheck[]): number {
    if (checks.length === 0) return 0;

    const completedChecks = checks.filter(check => check.status === 'completed');
    const passedChecks = completedChecks.filter(check => check.result === 'pass');
    const totalWeight = completedChecks.length * 100;
    const passedWeight = passedChecks.length * 100;

    return totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;
  }

  // Check if has valid document
  private hasValidDocument(documents: VerificationDocument[], type: string): boolean {
    return documents.some(doc => doc.type === type && doc.status === 'approved' && !doc.isExpired);
  }

  // Check if has passed check
  private hasPassedCheck(checks: VerificationCheck[], type: string): boolean {
    return checks.some(check => check.checkType === type && check.result === 'pass');
  }

  // Calculate risk level
  private calculateRiskLevel(profile: VerificationProfile): 'low' | 'medium' | 'high' {
    if (profile.overallScore >= 90) return 'low';
    if (profile.overallScore >= 70) return 'medium';
    return 'high';
  }

  // Get check cost
  private getCheckCost(checkType: string, provider: string): number {
    const costs = {
      identity: { internal: 0, external: 5, manual: 10 },
      education: { internal: 0, external: 15, manual: 25 },
      employment: { internal: 0, external: 20, manual: 30 },
      criminal: { internal: 0, external: 25, manual: 40 },
      reference: { internal: 0, external: 10, manual: 15 },
      skill_assessment: { internal: 0, external: 30, manual: 50 }
    };

    return costs[checkType as keyof typeof costs]?.[provider as keyof typeof costs[keyof typeof costs]] || 0;
  }

  // Get check priority
  private getCheckPriority(checkType: string): 'low' | 'medium' | 'high' | 'critical' {
    const priorities = {
      identity: 'critical',
      education: 'high',
      employment: 'high',
      criminal: 'critical',
      reference: 'medium',
      skill_assessment: 'high'
    };

    return priorities[checkType as keyof typeof priorities] || 'medium';
  }

  // Get verification profile
  getVerificationProfile(mentorId: string): VerificationProfile | null {
    return this.verificationProfiles.get(mentorId) || null;
  }

  // Get all verification profiles
  getAllVerificationProfiles(): VerificationProfile[] {
    return Array.from(this.verificationProfiles.values());
  }

  // Get pending verifications
  getPendingVerifications(): VerificationProfile[] {
    return Array.from(this.verificationProfiles.values())
      .filter(profile => profile.status === 'pending');
  }

  // Get verification documents
  getVerificationDocuments(mentorId: string): VerificationDocument[] {
    const profile = this.verificationProfiles.get(mentorId);
    return profile ? profile.documents : [];
  }

  // Get verification checks
  getVerificationChecks(mentorId: string): VerificationCheck[] {
    const profile = this.verificationProfiles.get(mentorId);
    return profile ? profile.checks : [];
  }

  // Create verification template
  createVerificationTemplate(template: Omit<VerificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): VerificationTemplate {
    const newTemplate: VerificationTemplate = {
      id: `template-${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveToLocalStorage();

    return newTemplate;
  }

  // Get verification templates
  getVerificationTemplates(level?: string): VerificationTemplate[] {
    let templates = Array.from(this.templates.values());

    if (level) {
      templates = templates.filter(t => t.level === level);
    }

    return templates.filter(t => t.isActive);
  }

  // Create verification workflow
  createVerificationWorkflow(workflow: Omit<VerificationWorkflow, 'id' | 'createdAt' | 'updatedAt'>): VerificationWorkflow {
    const newWorkflow: VerificationWorkflow = {
      id: `workflow-${Date.now()}`,
      ...workflow,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    this.saveToLocalStorage();

    return newWorkflow;
  }

  // Get verification workflows
  getVerificationWorkflows(): VerificationWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.isActive);
  }

  // Get verification statistics
  getVerificationStatistics(): {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    suspended: number;
    averageScore: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  } {
    const profiles = Array.from(this.verificationProfiles.values());
    const total = profiles.length;
    const verified = profiles.filter(p => p.status === 'verified').length;
    const pending = profiles.filter(p => p.status === 'pending').length;
    const rejected = profiles.filter(p => p.status === 'rejected').length;
    const suspended = profiles.filter(p => p.status === 'suspended').length;
    const averageScore = profiles.length > 0 ? profiles.reduce((sum, p) => sum + p.overallScore, 0) / profiles.length : 0;

    const riskDistribution = {
      low: profiles.filter(p => p.riskLevel === 'low').length,
      medium: profiles.filter(p => p.riskLevel === 'medium').length,
      high: profiles.filter(p => p.riskLevel === 'high').length
    };

    return {
      total,
      verified,
      pending,
      rejected,
      suspended,
      averageScore: Math.round(averageScore * 10) / 10,
      riskDistribution
    };
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<VerificationTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Basic Verification',
        description: 'Basic verification for new mentors',
        level: 'basic',
        requirements: {
          documents: ['id', 'resume'],
          checks: ['identity'],
          minimumScore: 60,
          expiryDays: 365
        },
        isActive: true
      },
      {
        name: 'Standard Verification',
        description: 'Standard verification for experienced mentors',
        level: 'standard',
        requirements: {
          documents: ['id', 'resume', 'degree', 'reference'],
          checks: ['identity', 'education', 'reference'],
          minimumScore: 75,
          expiryDays: 365
        },
        isActive: true
      },
      {
        name: 'Premium Verification',
        description: 'Premium verification for expert mentors',
        level: 'premium',
        requirements: {
          documents: ['id', 'resume', 'degree', 'certificate', 'reference', 'portfolio'],
          checks: ['identity', 'education', 'employment', 'reference', 'skill_assessment'],
          minimumScore: 85,
          expiryDays: 365
        },
        isActive: true
      },
      {
        name: 'Expert Verification',
        description: 'Expert verification for top-tier mentors',
        level: 'expert',
        requirements: {
          documents: ['id', 'resume', 'degree', 'certificate', 'reference', 'portfolio'],
          checks: ['identity', 'education', 'employment', 'criminal', 'reference', 'skill_assessment'],
          minimumScore: 95,
          expiryDays: 365
        },
        isActive: true
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.name)) {
        this.createVerificationTemplate(template);
      }
    });
  }

  // Initialize default workflows
  private initializeDefaultWorkflows(): void {
    const defaultWorkflows: Omit<VerificationWorkflow, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Standard Verification Workflow',
        steps: [
          {
            id: 'document_upload',
            name: 'Document Upload',
            type: 'document_upload',
            required: true,
            order: 1,
            estimatedDays: 1,
            dependencies: [],
            criteria: {
              pass: ['All required documents uploaded'],
              fail: ['Missing required documents'],
              warning: ['Document quality issues']
            }
          },
          {
            id: 'identity_check',
            name: 'Identity Verification',
            type: 'automated_check',
            required: true,
            order: 2,
            estimatedDays: 2,
            dependencies: ['document_upload'],
            criteria: {
              pass: ['Identity verified'],
              fail: ['Identity verification failed'],
              warning: ['Identity verification inconclusive']
            }
          },
          {
            id: 'manual_review',
            name: 'Manual Review',
            type: 'manual_review',
            required: true,
            order: 3,
            estimatedDays: 3,
            dependencies: ['identity_check'],
            criteria: {
              pass: ['All documents approved'],
              fail: ['Documents rejected'],
              warning: ['Additional information required']
            }
          }
        ],
        isActive: true
      }
    ];

    defaultWorkflows.forEach(workflow => {
      if (!this.workflows.has(workflow.name)) {
        this.createVerificationWorkflow(workflow);
      }
    });
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        verificationProfiles: Object.fromEntries(this.verificationProfiles),
        documents: Object.fromEntries(this.documents),
        checks: Object.fromEntries(this.checks),
        templates: Object.fromEntries(this.templates),
        workflows: Object.fromEntries(this.workflows)
      };
      localStorage.setItem('mentor-verification', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save verification data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('mentor-verification');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.verificationProfiles) {
        this.verificationProfiles = new Map(Object.entries(parsed.verificationProfiles));
      }
      
      if (parsed.documents) {
        this.documents = new Map(Object.entries(parsed.documents));
      }
      
      if (parsed.checks) {
        this.checks = new Map(Object.entries(parsed.checks));
      }
      
      if (parsed.templates) {
        this.templates = new Map(Object.entries(parsed.templates));
      }
      
      if (parsed.workflows) {
        this.workflows = new Map(Object.entries(parsed.workflows));
      }
    } catch (error) {
      console.error('Failed to load verification data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.verificationProfiles.clear();
    this.documents.clear();
    this.checks.clear();
    this.templates.clear();
    this.workflows.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const mentorVerificationSystem = new MentorVerificationSystem();
