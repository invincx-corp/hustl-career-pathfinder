// State management system
import { errorHandler } from './error-handler';

export interface StateUpdate<T> {
  type: string;
  payload: T;
  timestamp: Date;
  userId?: string;
}

export interface StateSubscription<T> {
  id: string;
  callback: (state: T) => void;
  filter?: (state: T) => boolean;
}

export class StateManager<T> {
  private state: T;
  private subscribers: Map<string, StateSubscription<T>> = new Map();
  private updateHistory: StateUpdate<T>[] = [];
  private maxHistorySize = 50;

  constructor(initialState: T) {
    this.state = initialState;
  }

  // Get current state
  public getState(): T {
    return this.state;
  }

  // Update state
  public updateState(update: StateUpdate<T>): void {
    try {
      const previousState = { ...this.state };
      
      // Apply update
      this.state = { ...this.state, ...update.payload };
      
      // Add to history
      this.updateHistory.unshift(update);
      if (this.updateHistory.length > this.maxHistorySize) {
        this.updateHistory = this.updateHistory.slice(0, this.maxHistorySize);
      }
      
      // Notify subscribers
      this.notifySubscribers(update);
      
      // Log state change
      console.log(`State updated:`, {
        type: update.type,
        previousState,
        newState: this.state,
        timestamp: update.timestamp
      });
    } catch (error) {
      errorHandler.handleAPIError(error, 'StateManager.updateState');
    }
  }

  // Subscribe to state changes
  public subscribe(subscription: StateSubscription<T>): string {
    this.subscribers.set(subscription.id, subscription);
    return subscription.id;
  }

  // Unsubscribe from state changes
  public unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  // Notify subscribers
  private notifySubscribers(update: StateUpdate<T>): void {
    this.subscribers.forEach(subscription => {
      try {
        if (!subscription.filter || subscription.filter(this.state)) {
          subscription.callback(this.state);
        }
      } catch (error) {
        errorHandler.handleAPIError(error, 'StateManager.notifySubscribers');
      }
    });
  }

  // Get update history
  public getUpdateHistory(): StateUpdate<T>[] {
    return [...this.updateHistory];
  }

  // Get updates by type
  public getUpdatesByType(type: string): StateUpdate<T>[] {
    return this.updateHistory.filter(update => update.type === type);
  }

  // Get recent updates
  public getRecentUpdates(count: number = 10): StateUpdate<T>[] {
    return this.updateHistory.slice(0, count);
  }

  // Reset state
  public resetState(newState: T): void {
    this.state = newState;
    this.updateHistory = [];
    this.notifySubscribers({
      type: 'RESET',
      payload: newState,
      timestamp: new Date()
    });
  }

  // Get state statistics
  public getStateStats(): {
    subscriberCount: number;
    updateCount: number;
    lastUpdate: Date | null;
    stateSize: number;
  } {
    return {
      subscriberCount: this.subscribers.size,
      updateCount: this.updateHistory.length,
      lastUpdate: this.updateHistory[0]?.timestamp || null,
      stateSize: JSON.stringify(this.state).length
    };
  }
}

// Global state managers
export const userStateManager = new StateManager({
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
});

export const learningStateManager = new StateManager({
  currentRoadmap: null,
  progress: 0,
  completedSteps: [],
  currentStep: null,
  isLoading: false,
  error: null
});

export const projectStateManager = new StateManager({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null
});

export const mentorStateManager = new StateManager({
  mentors: [],
  currentMentor: null,
  conversations: [],
  isLoading: false,
  error: null
});

export const notificationStateManager = new StateManager({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
});

export const aiStateManager = new StateManager({
  isConnected: false,
  lastResponse: null,
  isLoading: false,
  error: null
});

// State management utilities
export class StateUtils {
  // Merge state updates
  static mergeState<T>(currentState: T, updates: Partial<T>): T {
    return { ...currentState, ...updates };
  }

  // Deep merge state updates
  static deepMergeState<T>(currentState: T, updates: Partial<T>): T {
    const result = { ...currentState };
    
    for (const key in updates) {
      if (updates[key] !== undefined) {
        if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
          result[key] = this.deepMergeState(result[key] || {}, updates[key] as any);
        } else {
          result[key] = updates[key];
        }
      }
    }
    
    return result;
  }

  // Create state update
  static createUpdate<T>(type: string, payload: T, userId?: string): StateUpdate<T> {
    return {
      type,
      payload,
      timestamp: new Date(),
      userId
    };
  }

  // Validate state update
  static validateUpdate<T>(update: StateUpdate<T>): boolean {
    return !!(
      update &&
      typeof update.type === 'string' &&
      update.payload !== undefined &&
      update.timestamp instanceof Date
    );
  }

  // Create state subscription
  static createSubscription<T>(
    id: string,
    callback: (state: T) => void,
    filter?: (state: T) => boolean
  ): StateSubscription<T> {
    return { id, callback, filter };
  }
}

export default StateManager;
