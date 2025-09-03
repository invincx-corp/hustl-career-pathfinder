import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, socketService, type UserProfile, type Roadmap, type Skill, type Job } from '@/lib/api-service';
import { notificationService } from '@/lib/notification-service';
import { useAuth } from './useAuth';

// Generic API hook
export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err);
      notificationService.createErrorNotification('API Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// User Profile Hook
export function useUserProfile(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useAPI(
    () => apiService.getUserProfile(id!),
    [id],
    {
      onError: (error) => {
        console.error('Failed to fetch user profile:', error);
      }
    }
  );
}

// User Stats Hook
export function useUserStats(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useAPI(
    () => apiService.getUserStats(id!),
    [id]
  );
}

// Skills Hook
export function useUserSkills(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useAPI(
    () => apiService.getUserSkills(id!),
    [id]
  );
}

// Roadmaps Hook
export function useUserRoadmaps(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useAPI(
    () => apiService.getUserRoadmaps(id!),
    [id]
  );
}

// Roadmap Templates Hook
export function useRoadmapTemplates(filters: any = {}) {
  return useAPI(
    () => apiService.getRoadmapTemplates(filters),
    [filters]
  );
}

// Jobs Hook
export function useJobs(filters: any = {}) {
  return useAPI(
    () => apiService.getJobs(filters),
    [filters]
  );
}

// Career Domains Hook
export function useCareerDomains() {
  return useAPI(
    () => apiService.getCareerDomains(),
    []
  );
}

// AI Recommendations Hook
export function useAIRecommendations(userId?: string, type: string = 'all') {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useAPI(
    () => apiService.getPersonalizedRecommendations(id!, type),
    [id, type]
  );
}

// Real-time Updates Hook
export function useRealtimeUpdates(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;

    // Join user room for real-time updates
    socketService.joinUserRoom(id);
    setIsConnected(socketService.isSocketConnected());

    // Listen for connection status changes
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, [id]);

  return {
    isConnected,
    lastUpdate,
  };
}

// Progress Tracking Hook
export function useProgressTracking(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;
  const [progress, setProgress] = useState<any>(null);

  const updateSkillProgress = useCallback(async (skillName: string, newLevel: number, confidence?: number) => {
    if (!id) return;

    try {
      await apiService.updateSkillLevel(id, {
        skillName,
        newLevel,
        confidence,
        lastPracticed: new Date().toISOString(),
      });

      // Send real-time update
      socketService.sendLearningProgress({
        userId: id,
        skill: skillName,
        level: newLevel,
        progress: newLevel * 10, // Convert to percentage
      });

      // Show success notification
      notificationService.createSuccessNotification(
        'Skill Updated',
        `Great job! You've advanced in ${skillName} to level ${newLevel}`
      );

      setProgress(prev => ({
        ...prev,
        [skillName]: { level: newLevel, confidence, lastPracticed: new Date().toISOString() }
      }));
    } catch (error) {
      console.error('Failed to update skill progress:', error);
      notificationService.createErrorNotification(
        'Update Failed',
        'Failed to update skill progress. Please try again.'
      );
    }
  }, [id]);

  const updateRoadmapProgress = useCallback(async (roadmapId: string, step: number, progressPercentage: number) => {
    if (!id) return;

    try {
      await apiService.updateRoadmapProgress(roadmapId, {
        userId: id,
        currentStep: step,
        progressPercentage,
      });

      // Send real-time update
      socketService.sendRoadmapUpdate({
        userId: id,
        roadmapId,
        step,
        progress: progressPercentage,
      });

      // Show success notification
      notificationService.createSuccessNotification(
        'Roadmap Progress',
        `You've completed step ${step} in your roadmap!`
      );
    } catch (error) {
      console.error('Failed to update roadmap progress:', error);
      notificationService.createErrorNotification(
        'Update Failed',
        'Failed to update roadmap progress. Please try again.'
      );
    }
  }, [id]);

  return {
    progress,
    updateSkillProgress,
    updateRoadmapProgress,
  };
}

// AI Coach Hook
export function useAICoach(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (message: string, context?: any) => {
    if (!id) return;

    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send to API
      const response = await apiService.chatWithCoach({
        userId: id,
        message,
        context,
      });

      // Add AI response to chat
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        message: response.response.content,
        suggestions: response.response.suggestions,
        actionItems: response.response.actionItems,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message to AI coach:', error);
      notificationService.createErrorNotification(
        'AI Coach Error',
        'Failed to get response from AI coach. Please try again.'
      );
    } finally {
      setIsTyping(false);
    }
  }, [id]);

  const sendRealtimeMessage = useCallback((message: string, context?: any) => {
    if (!id) return;

    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Send via Socket.IO for real-time response
    socketService.requestAICoach({
      userId: id,
      message,
      context,
    });
  }, [id]);

  // Listen for real-time AI responses
  useEffect(() => {
    const handleAIResponse = (data: any) => {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        message: data.message,
        suggestions: data.suggestions,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    };

    socketService.on('ai-coach-response', handleAIResponse);

    return () => {
      socketService.off('ai-coach-response', handleAIResponse);
    };
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    sendRealtimeMessage,
  };
}

// Notifications Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState(notificationService.getNotifications());
  const [unreadCount, setUnreadCount] = useState(notificationService.getUnreadCount());

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    notificationService.removeNotification(notificationId);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAllNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

// Mutation Hook for API calls that modify data
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(params);
      options.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options.onError?.(err);
      notificationService.createErrorNotification('Operation Failed', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error,
  };
}

// Custom hooks for specific mutations
export function useCreateRoadmap() {
  return useMutation(
    (roadmapData: any) => apiService.createRoadmap(roadmapData),
    {
      onSuccess: () => {
        notificationService.createSuccessNotification(
          'Roadmap Created',
          'Your new roadmap has been created successfully!'
        );
      }
    }
  );
}

export function useUpdateProfile() {
  return useMutation(
    ({ userId, profileData }: { userId: string; profileData: any }) => 
      apiService.updateUserProfile(userId, profileData),
    {
      onSuccess: () => {
        notificationService.createSuccessNotification(
          'Profile Updated',
          'Your profile has been updated successfully!'
        );
      }
    }
  );
}

export function useGenerateAIRoadmap() {
  return useMutation(
    (roadmapData: any) => apiService.generateAIRoadmap(roadmapData),
    {
      onSuccess: () => {
        notificationService.createSuccessNotification(
          'AI Roadmap Generated',
          'Your personalized AI roadmap is ready!'
        );
      }
    }
  );
}

export function useApplyToJob() {
  return useMutation(
    ({ jobId, applicationData }: { jobId: string; applicationData: any }) =>
      apiService.applyToJob(jobId, applicationData),
    {
      onSuccess: () => {
        notificationService.createSuccessNotification(
          'Application Submitted',
          'Your job application has been submitted successfully!'
        );
      }
    }
  );
}
