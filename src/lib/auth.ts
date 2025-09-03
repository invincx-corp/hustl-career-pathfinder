import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  age?: number;
  interests?: string[];
  skills?: string[];
  goals?: string[];
  experience_level?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  is_mentor?: boolean;
  role?: string;
  selected_roadmaps?: any[];
  skill_assessment_results?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  age: number;
  interests: string[];
  goals: string[];
  username?: string;
  experience_level?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  age?: number;
  interests?: string[];
  skills?: string[];
  goals?: string[];
  experience_level?: string;
  preferred_learning_style?: string;
  country?: string;
  city?: string;
  timezone?: string;
}

export class AuthService {
  // Sign up a new user with complete profile creation
  static async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Validate age for parental consent
      if (data.age < 13) {
        return { user: null, error: 'You must be at least 13 years old to use this platform' };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            age: data.age,
            interests: data.interests,
            goals: data.goals,
            username: data.username
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' };
      }

      // Create comprehensive user profile
      const profileData = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        username: data.username,
        age: data.age,
        interests: data.interests || [],
        goals: data.goals || [],
        experience_level: data.experience_level || 'beginner',
        requires_parental_consent: data.age < 18,
        terms_accepted: true,
        privacy_policy_accepted: true,
        onboarding_completed: false,
        onboarding_step: 0,
        role: 'student'
      };

      // Wait a moment for the user to be fully authenticated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try direct insert into profiles table with retry logic
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!profileCreated && attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts} to create profile...`);

        try {
          // First try direct insert
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: data.email,
              full_name: data.full_name,
              username: data.username || null,
              age: data.age,
              interests: data.interests || [],
              goals: data.goals || [],
              experience_level: data.experience_level || 'beginner',
              requires_parental_consent: data.age < 18,
              terms_accepted: true,
              privacy_policy_accepted: true,
              onboarding_completed: false,
              onboarding_step: 0,
              role: 'student',
              is_active: true
            }] as any);

          if (insertError) {
            console.error(`Profile insert attempt ${attempts} failed:`, insertError);
            
            // If it's a duplicate key error, profile already exists
            if (insertError.code === '23505') {
              console.log('Profile already exists, continuing...');
              profileCreated = true;
              break;
            }
            
            // Wait before retry
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            console.log('Profile created successfully via direct insert');
            profileCreated = true;
          }
        } catch (insertException) {
          console.error(`Profile insert exception attempt ${attempts}:`, insertException);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!profileCreated) {
        console.error('Failed to create profile after all attempts, but continuing with signup...');
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        username: data.username,
        age: data.age,
        interests: data.interests,
        goals: data.goals,
        experience_level: data.experience_level || 'beginner',
        onboarding_completed: false,
        is_mentor: false,
        role: 'student'
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign in an existing user
  static async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      // Get complete user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { user: null, error: 'Failed to fetch user profile' };
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() } as any)
        .eq('id', authData.user.id);

      const user: AuthUser = {
        id: authData.user.id,
        email: profile?.email || '',
        full_name: profile?.full_name || '',
        username: profile?.username || '',
        avatar_url: profile?.avatar_url || '',
        age: profile?.age || 0,
        interests: profile?.interests || [],
        skills: profile?.skills || [],
        goals: profile?.goals || [],
        experience_level: profile?.experience_level || 'beginner',
        onboarding_completed: profile?.onboarding_completed || false,
        is_mentor: profile?.is_mentor || false,
        role: profile?.role || 'student',
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || ''
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign out the current user
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Get the current user with complete profile
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔍 AuthService.getCurrentUser: Starting...');
      
      // Simple approach - just check if there's a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('❌ AuthService.getCurrentUser: Session error:', sessionError.message);
        return { user: null, error: null };
      }

      if (!session?.user) {
        console.log('ℹ️ AuthService.getCurrentUser: No authenticated user');
        return { user: null, error: null };
      }

      console.log('✅ AuthService.getCurrentUser: Found session user:', session.user.email);

      // For now, just return basic user info without fetching profile
      // This prevents hanging on profile queries
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name,
        username: session.user.user_metadata?.username,
        age: session.user.user_metadata?.age,
        interests: session.user.user_metadata?.interests || [],
        goals: session.user.user_metadata?.goals || [],
        experience_level: session.user.user_metadata?.experience_level || 'beginner',
        onboarding_completed: false,
        is_mentor: false,
        role: 'student'
      };

      console.log('✅ AuthService.getCurrentUser: Returning user:', user.email);
      return { user, error: null };
    } catch (error) {
      console.error('❌ AuthService.getCurrentUser: Error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Update user profile
  static async updateProfile(userId: string, data: ProfileUpdateData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return { user: null, error: updateError.message };
      }

      const user: AuthUser = {
        id: updatedProfile?.id || '',
        email: updatedProfile?.email || '',
        full_name: updatedProfile?.full_name || '',
        username: updatedProfile?.username || '',
        avatar_url: updatedProfile?.avatar_url || '',
        age: updatedProfile?.age || 0,
        interests: updatedProfile?.interests || [],
        skills: updatedProfile?.skills || [],
        goals: updatedProfile?.goals || [],
        experience_level: updatedProfile?.experience_level || 'beginner',
        onboarding_completed: updatedProfile?.onboarding_completed || false,
        is_mentor: updatedProfile?.is_mentor || false,
        role: updatedProfile?.role || 'student',
        created_at: updatedProfile?.created_at || '',
        updated_at: updatedProfile?.updated_at || ''
      };

      return { user, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Complete onboarding
  static async completeOnboarding(userId: string, onboardingData: any): Promise<{ success: boolean; error: string | null }> {
    try {
      // Prepare the update data, excluding selected_roadmaps if the column doesn't exist
      const updateData: any = {
        onboarding_completed: true,
        onboarding_step: 100,
        updated_at: new Date().toISOString()
      };

      // Add all onboarding data except selected_roadmaps and skill_assessment_results initially
      const { selected_roadmaps, skill_assessment_results, ...otherData } = onboardingData;
      Object.assign(updateData, otherData);

      // First try a simple update with just the essential fields
      let { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 100,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId);

      // If that works, try to update with additional data
      if (!error) {
        const additionalData: any = {};
        if (selected_roadmaps) additionalData.selected_roadmaps = selected_roadmaps;
        if (skill_assessment_results) additionalData.skill_assessment_results = skill_assessment_results;
        
        if (Object.keys(additionalData).length > 0) {
          const { error: additionalError } = await supabase
            .from('profiles')
            .update(additionalData as any)
            .eq('id', userId);
          // Don't fail if additional data update fails
          if (additionalError) {
            console.warn('Additional data update failed, but onboarding completion succeeded:', additionalError);
          }
        }
      }

      if (error) {
        console.error('Complete onboarding database error:', error);
        return { success: false, error: error.message };
      }

      console.log('Onboarding completed successfully in database');
      return { success: true, error: null };
    } catch (error) {
      console.error('Complete onboarding error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get the current session
  static async getSession(): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error: error?.message || null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error: 'An unexpected error occurred' };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change event:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        // Return basic user info without database queries to prevent hanging
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          username: session.user.user_metadata?.username,
          age: session.user.user_metadata?.age,
          interests: session.user.user_metadata?.interests || [],
          goals: session.user.user_metadata?.goals || [],
          experience_level: session.user.user_metadata?.experience_level || 'beginner',
          onboarding_completed: false,
          is_mentor: false,
          role: 'student'
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Age verification for minors (13+)
  static async verifyAge(age: number, parentalConsent?: boolean) {
    if (age < 13) {
      throw new Error('Users must be at least 13 years old to use this platform.');
    }
    
    if (age < 18 && !parentalConsent) {
      throw new Error('Parental consent is required for users under 18.');
    }

    return { verified: true, requiresParentalConsent: age < 18 };
  }

  // Password reset functionality
  static async requestPasswordReset(data: PasswordResetData) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  // Update password (for authenticated users)
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password update failed:', error);
      throw error;
    }
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Password reset token verification failed:', error);
      throw error;
    }
  }
}

// Export singleton instance for backward compatibility
export const authService = new AuthService();