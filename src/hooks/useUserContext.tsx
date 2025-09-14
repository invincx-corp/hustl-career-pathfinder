import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import ApiService from '../lib/api-services';

// =====================================================
// USER CONTEXT FOR PHASE 2 IMPLEMENTATION
// =====================================================

interface UserContextType {
  // User data
  user: any;
  profile: any;
  dashboardData: any;
  
  // Loading states
  isLoading: boolean;
  isProfileLoading: boolean;
  isDashboardLoading: boolean;
  
  // Error states
  error: string | null;
  profileError: string | null;
  dashboardError: string | null;
  
  // Actions
  refreshProfile: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  createProject: (projectData: any) => Promise<boolean>;
  updateProject: (projectId: string, updates: any) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  saveSkillAssessment: (assessmentData: any) => Promise<boolean>;
  unlockAchievement: (achievementId: string) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    // Return a default context to prevent the error
    return {
      user: null,
      profile: null,
      dashboardData: null,
      isLoading: true,
      isProfileLoading: true,
      isDashboardLoading: true,
      error: null,
      profileError: null,
      dashboardError: null,
      refreshProfile: async () => {},
      refreshDashboard: async () => {},
      updateProfile: async () => false,
      createProject: async () => false,
      updateProject: async () => false,
      deleteProject: async () => false,
      saveSkillAssessment: async () => false,
      unlockAchievement: async () => false,
      markNotificationAsRead: async () => false
    } as UserContextType;
  }
  return context;
};

interface UserContextProviderProps {
  children: React.ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // State
  const [profile, setProfile] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Load user profile
  const loadProfile = async () => {
    if (!user?.id) return;
    
    setIsProfileLoading(true);
    setProfileError(null);
    
    try {
      const response = await ApiService.getUserProfile(user.id);
      if (response.success) {
        setProfile(response.data);
      } else {
        setProfileError(response.error);
      }
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsDashboardLoading(true);
    setDashboardError(null);
    
    try {
      const response = await ApiService.getDashboardData(user.id);
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setDashboardError(response.error);
      }
    } catch (err: any) {
      setDashboardError(err.message);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    await loadProfile();
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    await loadDashboardData();
  };

  // Update profile
  const updateProfile = async (updates: any): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.updateUserProfile(user.id, updates);
      if (response.success) {
        setProfile(response.data);
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create project
  const createProject = async (projectData: any): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.createProject(user.id, projectData);
      if (response.success) {
        // Refresh dashboard data to include new project
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update project
  const updateProject = async (projectId: string, updates: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.updateProject(projectId, updates);
      if (response.success) {
        // Refresh dashboard data to reflect changes
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.deleteProject(projectId);
      if (response.success) {
        // Refresh dashboard data to reflect changes
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save skill assessment
  const saveSkillAssessment = async (assessmentData: any): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.saveSkillAssessment(user.id, assessmentData);
      if (response.success) {
        // Refresh dashboard data to include new skills
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock achievement
  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.unlockAchievement(user.id, achievementId);
      if (response.success) {
        // Refresh dashboard data to include new achievement
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.markNotificationAsRead(notificationId);
      if (response.success) {
        // Refresh dashboard data to reflect changes
        await loadDashboardData();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadDashboardData();
    } else {
      setProfile(null);
      setDashboardData(null);
    }
  }, [user?.id]);

  const value: UserContextType = {
    user,
    profile,
    dashboardData,
    isLoading,
    isProfileLoading,
    isDashboardLoading,
    error,
    profileError,
    dashboardError,
    refreshProfile,
    refreshDashboard,
    updateProfile,
    createProject,
    updateProject,
    deleteProject,
    saveSkillAssessment,
    unlockAchievement,
    markNotificationAsRead
  };


  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

