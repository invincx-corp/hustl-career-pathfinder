// Authentication Manager
// Handles user authentication, authorization, and session management

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'mentor' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  profile: {
    bio?: string;
    location?: string;
    timezone?: string;
    skills: string[];
    interests: string[];
    experience: string;
    education: string[];
    socialLinks: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      website?: string;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: {
      showEmail: boolean;
      showProfile: boolean;
      showActivity: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  stats: {
    joinDate: string;
    lastActive: string;
    totalSessions: number;
    totalMentors: number;
    totalMentees: number;
    rating: number;
    reviewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
    ipAddress?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    browser: string;
    ipAddress?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'mentor';
  profile?: Partial<User['profile']>;
  preferences?: Partial<User['preferences']>;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

export class AuthManager {
  private user: User | null = null;
  private session: AuthSession | null = null;
  private isAuthenticated = false;
  private isLoading = false;
  private error: string | null = null;
  private listeners: Array<(state: AuthState) => void> = [];

  // Role-based permissions
  private rolePermissions: RolePermissions[] = [
    {
      role: 'user',
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'sessions', action: 'create' },
        { resource: 'sessions', action: 'read' },
        { resource: 'messages', action: 'create' },
        { resource: 'messages', action: 'read' },
        { resource: 'forums', action: 'create' },
        { resource: 'forums', action: 'read' },
        { resource: 'study_groups', action: 'create' },
        { resource: 'study_groups', action: 'join' },
        { resource: 'peer_review', action: 'create' },
        { resource: 'peer_review', action: 'review' }
      ]
    },
    {
      role: 'mentor',
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'mentor_profile', action: 'create' },
        { resource: 'mentor_profile', action: 'update' },
        { resource: 'sessions', action: 'create' },
        { resource: 'sessions', action: 'read' },
        { resource: 'sessions', action: 'update' },
        { resource: 'sessions', action: 'delete' },
        { resource: 'messages', action: 'create' },
        { resource: 'messages', action: 'read' },
        { resource: 'forums', action: 'create' },
        { resource: 'forums', action: 'read' },
        { resource: 'study_groups', action: 'create' },
        { resource: 'study_groups', action: 'join' },
        { resource: 'study_groups', action: 'moderate' },
        { resource: 'peer_review', action: 'create' },
        { resource: 'peer_review', action: 'review' },
        { resource: 'mentor_verification', action: 'read' }
      ]
    },
    {
      role: 'moderator',
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'forums', action: 'moderate' },
        { resource: 'study_groups', action: 'moderate' },
        { resource: 'peer_review', action: 'moderate' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'reports', action: 'read' },
        { resource: 'reports', action: 'resolve' }
      ]
    },
    {
      role: 'admin',
      permissions: [
        { resource: '*', action: '*' }
      ]
    }
  ];

  constructor() {
    this.loadFromLocalStorage();
    this.initializeAuth();
  }

  // Initialize authentication
  private async initializeAuth(): Promise<void> {
    this.isLoading = true;
    this.notifyListeners();

    try {
      const session = this.getStoredSession();
      if (session && this.isSessionValid(session)) {
        await this.validateSession(session);
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearSession();
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthState> {
    this.isLoading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Simulate API call
      const response = await this.simulateLogin(credentials);
      
      if (response.success && response.data) {
        this.user = response.data.user;
        this.session = response.data.session;
        this.isAuthenticated = true;
        this.saveToLocalStorage();
      } else {
        this.error = response.error || 'Login failed';
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Login failed';
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }

    return this.getAuthState();
  }

  // Register user
  async register(data: RegisterData): Promise<AuthState> {
    this.isLoading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Simulate API call
      const response = await this.simulateRegister(data);
      
      if (response.success && response.data) {
        this.user = response.data.user;
        this.session = response.data.session;
        this.isAuthenticated = true;
        this.saveToLocalStorage();
      } else {
        this.error = response.error || 'Registration failed';
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Registration failed';
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }

    return this.getAuthState();
  }

  // Logout user
  async logout(): Promise<void> {
    this.isLoading = true;
    this.notifyListeners();

    try {
      if (this.session) {
        // Simulate API call to invalidate session
        await this.simulateLogout(this.session.token);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.clearSession();
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    if (!this.session?.refreshToken) return false;

    try {
      const response = await this.simulateRefreshToken(this.session.refreshToken);
      
      if (response.success && response.data) {
        this.session = response.data.session;
        this.saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Update user profile
  async updateProfile(updates: Partial<User['profile']>): Promise<boolean> {
    if (!this.user) return false;

    try {
      const response = await this.simulateUpdateProfile(this.user.id, updates);
      
      if (response.success && response.data) {
        this.user = { ...this.user, ...response.data };
        this.saveToLocalStorage();
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }

    return false;
  }

  // Update user preferences
  async updatePreferences(updates: Partial<User['preferences']>): Promise<boolean> {
    if (!this.user) return false;

    try {
      const response = await this.simulateUpdatePreferences(this.user.id, updates);
      
      if (response.success && response.data) {
        this.user = { ...this.user, ...response.data };
        this.saveToLocalStorage();
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Preferences update failed:', error);
    }

    return false;
  }

  // Check permission
  hasPermission(resource: string, action: string, conditions?: Record<string, any>): boolean {
    if (!this.user) return false;

    const userPermissions = this.rolePermissions.find(rp => rp.role === this.user!.role);
    if (!userPermissions) return false;

    // Check for admin role
    if (userPermissions.permissions.some(p => p.resource === '*' && p.action === '*')) {
      return true;
    }

    // Check specific permissions
    return userPermissions.permissions.some(permission => {
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const actionMatch = permission.action === action || permission.action === '*';
      const conditionsMatch = !permission.conditions || this.checkConditions(permission.conditions, conditions);
      
      return resourceMatch && actionMatch && conditionsMatch;
    });
  }

  // Check conditions
  private checkConditions(permissionConditions: Record<string, any>, userConditions?: Record<string, any>): boolean {
    if (!userConditions) return true;

    return Object.entries(permissionConditions).every(([key, value]) => {
      return userConditions[key] === value;
    });
  }

  // Get user role
  getUserRole(): string | null {
    return this.user?.role || null;
  }

  // Check if user is mentor
  isMentor(): boolean {
    return this.user?.role === 'mentor' || this.user?.role === 'admin';
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  // Check if user is moderator
  isModerator(): boolean {
    return this.user?.role === 'moderator' || this.user?.role === 'admin';
  }

  // Get auth state
  getAuthState(): AuthState {
    return {
      user: this.user,
      session: this.session,
      isAuthenticated: this.isAuthenticated,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAuthState()));
  }

  // Validate session
  private async validateSession(session: AuthSession): Promise<void> {
    try {
      const response = await this.simulateValidateSession(session.token);
      
      if (response.success && response.data) {
        this.user = response.data.user;
        this.session = session;
        this.isAuthenticated = true;
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
    }
  }

  // Check if session is valid
  private isSessionValid(session: AuthSession): boolean {
    return new Date(session.expiresAt) > new Date();
  }

  // Clear session
  private clearSession(): void {
    this.user = null;
    this.session = null;
    this.isAuthenticated = false;
    this.error = null;
    this.clearStoredSession();
  }

  // Simulate login API call
  private async simulateLogin(credentials: LoginCredentials): Promise<{ success: boolean; data?: any; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      const user: User = {
        id: 'user-123',
        email: credentials.email,
        name: 'Test User',
        role: 'user',
        isVerified: true,
        isActive: true,
        profile: {
          skills: ['JavaScript', 'React', 'Node.js'],
          interests: ['Web Development', 'AI'],
          experience: '3 years',
          education: ['Computer Science'],
          socialLinks: {}
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
          },
          privacy: {
            showEmail: false,
            showProfile: true,
            showActivity: true
          },
          theme: 'auto',
          language: 'en'
        },
        stats: {
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          totalSessions: 0,
          totalMentors: 0,
          totalMentees: 0,
          rating: 0,
          reviewCount: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const session: AuthSession = {
        id: 'session-123',
        userId: user.id,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        deviceInfo: credentials.deviceInfo || {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          browser: 'Unknown'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: { user, session } };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  // Simulate register API call
  private async simulateRegister(data: RegisterData): Promise<{ success: boolean; data?: any; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      isVerified: false,
      isActive: true,
      profile: {
        skills: data.profile?.skills || [],
        interests: data.profile?.interests || [],
        experience: data.profile?.experience || '',
        education: data.profile?.education || [],
        socialLinks: data.profile?.socialLinks || {}
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false
        },
        privacy: {
          showEmail: false,
          showProfile: true,
          showActivity: true
        },
        theme: 'auto',
        language: 'en',
        ...data.preferences
      },
      stats: {
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalSessions: 0,
        totalMentors: 0,
        totalMentees: 0,
        rating: 0,
        reviewCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const session: AuthSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: 'Unknown'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { success: true, data: { user, session } };
  }

  // Simulate logout API call
  private async simulateLogout(token: string): Promise<{ success: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  // Simulate refresh token API call
  private async simulateRefreshToken(refreshToken: string): Promise<{ success: boolean; data?: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: { session: this.session } };
  }

  // Simulate validate session API call
  private async simulateValidateSession(token: string): Promise<{ success: boolean; data?: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: { user: this.user } };
  }

  // Simulate update profile API call
  private async simulateUpdateProfile(userId: string, updates: Partial<User['profile']>): Promise<{ success: boolean; data?: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: { profile: updates } };
  }

  // Simulate update preferences API call
  private async simulateUpdatePreferences(userId: string, updates: Partial<User['preferences']>): Promise<{ success: boolean; data?: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: { preferences: updates } };
  }

  // Get stored session
  private getStoredSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem('auth_session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      return null;
    }
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      if (this.session) {
        localStorage.setItem('auth_session', JSON.stringify(this.session));
      }
      if (this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const sessionData = localStorage.getItem('auth_session');
      const userData = localStorage.getItem('auth_user');
      
      if (sessionData) {
        this.session = JSON.parse(sessionData);
      }
      
      if (userData) {
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Failed to load auth data from localStorage:', error);
    }
  }

  // Clear stored session
  private clearStoredSession(): void {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_user');
  }
}

// Export singleton instance
export const authManager = new AuthManager();
