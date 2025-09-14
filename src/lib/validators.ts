// Data validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validators {
  // Email validation
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Password validation
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Name validation
  static validateName(name: string, fieldName: string = 'Name'): ValidationResult {
    const errors: string[] = [];
    
    if (!name) {
      errors.push(`${fieldName} is required`);
    } else if (name.trim().length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    } else if (name.trim().length > 50) {
      errors.push(`${fieldName} must be less than 50 characters long`);
    } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Age validation
  static validateAge(age: number): ValidationResult {
    const errors: string[] = [];
    
    if (!age || isNaN(age)) {
      errors.push('Age is required');
    } else if (age < 13) {
      errors.push('You must be at least 13 years old to use this service');
    } else if (age > 120) {
      errors.push('Please enter a valid age');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Phone number validation
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // URL validation
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];
    
    if (!url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(url);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Skill level validation
  static validateSkillLevel(level: string): ValidationResult {
    const errors: string[] = [];
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    
    if (!level) {
      errors.push('Skill level is required');
    } else if (!validLevels.includes(level.toLowerCase())) {
      errors.push(`Skill level must be one of: ${validLevels.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Interest validation
  static validateInterest(interest: string): ValidationResult {
    const errors: string[] = [];
    
    if (!interest) {
      errors.push('Interest is required');
    } else if (interest.trim().length < 2) {
      errors.push('Interest must be at least 2 characters long');
    } else if (interest.trim().length > 100) {
      errors.push('Interest must be less than 100 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Goal validation
  static validateGoal(goal: string): ValidationResult {
    const errors: string[] = [];
    
    if (!goal) {
      errors.push('Goal is required');
    } else if (goal.trim().length < 10) {
      errors.push('Goal must be at least 10 characters long');
    } else if (goal.trim().length > 500) {
      errors.push('Goal must be less than 500 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Project validation
  static validateProject(project: any): ValidationResult {
    const errors: string[] = [];
    
    if (!project.title || project.title.trim().length < 3) {
      errors.push('Project title must be at least 3 characters long');
    }
    
    if (!project.description || project.description.trim().length < 10) {
      errors.push('Project description must be at least 10 characters long');
    }
    
    if (!project.category) {
      errors.push('Project category is required');
    }
    
    if (!project.difficulty || !['beginner', 'intermediate', 'advanced'].includes(project.difficulty)) {
      errors.push('Project difficulty must be beginner, intermediate, or advanced');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Roadmap validation
  static validateRoadmap(roadmap: any): ValidationResult {
    const errors: string[] = [];
    
    if (!roadmap.title || roadmap.title.trim().length < 3) {
      errors.push('Roadmap title must be at least 3 characters long');
    }
    
    if (!roadmap.description || roadmap.description.trim().length < 10) {
      errors.push('Roadmap description must be at least 10 characters long');
    }
    
    if (!roadmap.category) {
      errors.push('Roadmap category is required');
    }
    
    if (!roadmap.steps || !Array.isArray(roadmap.steps) || roadmap.steps.length === 0) {
      errors.push('Roadmap must have at least one step');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Message validation
  static validateMessage(message: string): ValidationResult {
    const errors: string[] = [];
    
    if (!message) {
      errors.push('Message is required');
    } else if (message.trim().length < 1) {
      errors.push('Message cannot be empty');
    } else if (message.trim().length > 1000) {
      errors.push('Message must be less than 1000 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generic object validation
  static validateObject(obj: any, rules: Record<string, (value: any) => ValidationResult>): ValidationResult {
    const errors: string[] = [];
    
    for (const [field, validator] of Object.entries(rules)) {
      const result = validator(obj[field]);
      if (!result.isValid) {
        errors.push(...result.errors.map(error => `${field}: ${error}`));
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize input
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // Validate file upload
  static validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxNameLength?: number;
  } = {}): ValidationResult {
    const errors: string[] = [];
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      maxNameLength = 255
    } = options;
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
    
    if (file.name.length > maxNameLength) {
      errors.push(`File name must be less than ${maxNameLength} characters long`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default Validators;
