import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthService, AuthUser, SignUpData, SignInData, ProfileUpdateData } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<{ user: AuthUser | null; error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ user: AuthUser | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (data: ProfileUpdateData) => Promise<{ user: AuthUser | null; error: string | null }>;
  completeOnboarding: (data: any) => Promise<{ success: boolean; error: string | null }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  signOut: async () => ({ error: null }),
  updateProfile: async () => ({ user: null, error: null }),
  completeOnboarding: async () => ({ success: false, error: null }),
  resetPassword: async () => ({ success: false, error: null }),
  updatePassword: async () => ({ success: false, error: null }),
});

// Named export for better HMR support
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthProvider: Starting initialization...');
    
    // First, check for existing session
    const initializeAuth = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser();
        console.log('🔍 AuthProvider: Initial user check:', currentUser ? currentUser.email : 'No user');
        setUser(currentUser);
      } catch (error) {
        console.error('❌ AuthProvider: Error checking initial user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check for existing session first
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (data: SignInData) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(data);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(data);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signOut();
      setUser(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) {
      return { user: null, error: 'No user logged in' };
    }

    try {
      const result = await AuthService.updateProfile(user.id, data);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  };

  const completeOnboarding = async (data: any) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = await AuthService.completeOnboarding(user.id, data);
      if (result.success) {
        console.log('Onboarding completion successful, refreshing user data...');
        // Force refresh user data multiple times to ensure it's updated
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          const { user: updatedUser } = await AuthService.getCurrentUser();
          if (updatedUser && updatedUser.onboarding_completed) {
            console.log('User data refreshed successfully:', updatedUser);
            setUser(updatedUser);
            break;
          }
          attempts++;
          console.log(`Attempt ${attempts} to refresh user data...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between attempts
        }
        
        if (attempts >= maxAttempts) {
          console.warn('Failed to refresh user data after multiple attempts, but onboarding was successful');
          // Manually update the user object to mark onboarding as completed
          setUser(prev => prev ? { ...prev, onboarding_completed: true } : null);
        }
      } else {
        console.error('Onboarding completion failed:', result.error);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await AuthService.updatePassword(newPassword);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    completeOnboarding,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}