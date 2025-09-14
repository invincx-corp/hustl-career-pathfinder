/**
 * Offline Storage Service for Nexa Platform
 * Handles IndexedDB operations for offline content caching and synchronization
 */

interface OfflineContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'interactive' | 'audio';
  content_data: any;
  metadata: {
    duration?: number;
    file_size?: number;
    last_updated: string;
    download_date: string;
  };
  user_progress?: {
    progress_percentage: number;
    time_spent: number;
    last_position?: number;
    bookmarks?: number[];
  };
}

interface OfflineProgress {
  content_id: string;
  user_id: string;
  progress_percentage: number;
  time_spent: number;
  is_completed: boolean;
  last_accessed: string;
  completed_at?: string;
  offline_data: any;
}

class OfflineStorageService {
  private dbName = 'NexaOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offline_content')) {
          const contentStore = db.createObjectStore('offline_content', { keyPath: 'id' });
          contentStore.createIndex('content_type', 'content_type', { unique: false });
          contentStore.createIndex('download_date', 'metadata.download_date', { unique: false });
        }

        if (!db.objectStoreNames.contains('offline_progress')) {
          const progressStore = db.createObjectStore('offline_progress', { keyPath: ['content_id', 'user_id'] });
          progressStore.createIndex('user_id', 'user_id', { unique: false });
          progressStore.createIndex('last_accessed', 'last_accessed', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('action_type', 'action_type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('offline_settings')) {
          db.createObjectStore('offline_settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Download content for offline access
  async downloadContent(contentId: string, contentData: any): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_content'], 'readwrite');
      const store = transaction.objectStore('offline_content');

      const offlineContent: OfflineContent = {
        id: contentId,
        title: contentData.title,
        description: contentData.description,
        content_type: contentData.type,
        content_data: contentData,
        metadata: {
          duration: contentData.duration,
          file_size: this.calculateContentSize(contentData),
          last_updated: new Date().toISOString(),
          download_date: new Date().toISOString()
        }
      };

      const request = store.put(offlineContent);

      request.onsuccess = () => {
        console.log(`Content ${contentId} downloaded for offline access`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Failed to download content ${contentId}:`, request.error);
        reject(false);
      };
    });
  }

  // Get offline content
  async getOfflineContent(contentId: string): Promise<OfflineContent | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_content'], 'readonly');
      const store = transaction.objectStore('offline_content');
      const request = store.get(contentId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`Failed to get offline content ${contentId}:`, request.error);
        reject(null);
      };
    });
  }

  // Get all offline content
  async getAllOfflineContent(): Promise<OfflineContent[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        // Check if the object store exists
        if (!this.db!.objectStoreNames.contains('offline_content')) {
          console.warn('offline_content object store does not exist, returning empty array');
          resolve([]);
          return;
        }

        const transaction = this.db!.transaction(['offline_content'], 'readonly');
        const store = transaction.objectStore('offline_content');
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          console.error('Failed to get all offline content:', request.error);
          resolve([]); // Return empty array instead of rejecting
        };
      } catch (error) {
        console.error('Error loading data:', error);
        resolve([]); // Return empty array instead of rejecting
      }
    });
  }

  // Save offline progress
  async saveOfflineProgress(progress: OfflineProgress): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readwrite');
      const store = transaction.objectStore('offline_progress');

      const request = store.put(progress);

      request.onsuccess = () => {
        console.log(`Progress saved for content ${progress.content_id}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Failed to save progress for content ${progress.content_id}:`, request.error);
        reject(false);
      };
    });
  }

  // Get offline progress
  async getOfflineProgress(contentId: string, userId: string): Promise<OfflineProgress | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readonly');
      const store = transaction.objectStore('offline_progress');
      const request = store.get([contentId, userId]);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`Failed to get offline progress for content ${contentId}:`, request.error);
        reject(null);
      };
    });
  }

  // Queue action for sync when online
  async queueForSync(action: {
    type: 'progress_update' | 'content_completion' | 'badge_earned';
    data: any;
    timestamp: string;
  }): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');

      const syncItem = {
        action_type: action.type,
        data: action.data,
        timestamp: action.timestamp,
        retry_count: 0,
        status: 'pending'
      };

      const request = store.add(syncItem);

      request.onsuccess = () => {
        console.log(`Action queued for sync: ${action.type}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Failed to queue action for sync: ${action.type}`, request.error);
        reject(false);
      };
    });
  }

  // Get pending sync items
  async getPendingSyncItems(): Promise<any[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => {
        const pendingItems = request.result?.filter(item => item.status === 'pending') || [];
        resolve(pendingItems);
      };

      request.onerror = () => {
        console.error('Failed to get pending sync items:', request.error);
        reject([]);
      };
    });
  }

  // Mark sync item as completed
  async markSyncItemCompleted(syncId: number): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const getRequest = store.get(syncId);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'completed';
          item.completed_at = new Date().toISOString();
          
          const putRequest = store.put(item);
          
          putRequest.onsuccess = () => {
            console.log(`Sync item ${syncId} marked as completed`);
            resolve(true);
          };
          
          putRequest.onerror = () => {
            console.error(`Failed to mark sync item ${syncId} as completed:`, putRequest.error);
            reject(false);
          };
        } else {
          reject(false);
        }
      };
      
      getRequest.onerror = () => {
        console.error(`Failed to get sync item ${syncId}:`, getRequest.error);
        reject(false);
      };
    });
  }

  // Remove offline content
  async removeOfflineContent(contentId: string): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_content'], 'readwrite');
      const store = transaction.objectStore('offline_content');
      const request = store.delete(contentId);

      request.onsuccess = () => {
        console.log(`Offline content ${contentId} removed`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Failed to remove offline content ${contentId}:`, request.error);
        reject(false);
      };
    });
  }

  // Get storage usage
  async getStorageUsage(): Promise<{
    totalSize: number;
    contentCount: number;
    availableSpace: number;
  }> {
    if (!this.db) {
      await this.initialize();
    }

    const offlineContent = await this.getAllOfflineContent();
    const totalSize = offlineContent.reduce((sum, content) => {
      return sum + (content.metadata.file_size || 0);
    }, 0);

    // Estimate available space (this is a rough estimate)
    const availableSpace = 50 * 1024 * 1024; // 50MB limit

    return {
      totalSize,
      contentCount: offlineContent.length,
      availableSpace: Math.max(0, availableSpace - totalSize)
    };
  }

  // Check if content is available offline
  async isContentOffline(contentId: string): Promise<boolean> {
    const content = await this.getOfflineContent(contentId);
    return content !== null;
  }

  // Clear all offline data
  async clearAllOfflineData(): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_content', 'offline_progress', 'sync_queue'], 'readwrite');
      
      const contentStore = transaction.objectStore('offline_content');
      const progressStore = transaction.objectStore('offline_progress');
      const syncStore = transaction.objectStore('sync_queue');

      const contentRequest = contentStore.clear();
      const progressRequest = progressStore.clear();
      const syncRequest = syncStore.clear();

      let completed = 0;
      const total = 3;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          console.log('All offline data cleared');
          resolve(true);
        }
      };

      contentRequest.onsuccess = checkComplete;
      progressRequest.onsuccess = checkComplete;
      syncRequest.onsuccess = checkComplete;

      contentRequest.onerror = () => reject(false);
      progressRequest.onerror = () => reject(false);
      syncRequest.onerror = () => reject(false);
    });
  }

  // Calculate content size (rough estimate)
  private calculateContentSize(contentData: any): number {
    // This is a rough estimate - in a real implementation, you'd calculate actual file sizes
    let size = 0;
    
    if (contentData.video_url) size += 10 * 1024 * 1024; // 10MB for video
    if (contentData.audio_url) size += 5 * 1024 * 1024; // 5MB for audio
    if (contentData.text_content) size += contentData.text_content.length * 2; // 2 bytes per character
    if (contentData.images) size += contentData.images.length * 500 * 1024; // 500KB per image
    
    return size;
  }

  // Sync offline data when online
  async syncOfflineData(userId: string): Promise<boolean> {
    try {
      const pendingItems = await this.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          // Sync based on action type
          switch (item.action_type) {
            case 'progress_update':
              await this.syncProgressUpdate(userId, item.data);
              break;
            case 'content_completion':
              await this.syncContentCompletion(userId, item.data);
              break;
            case 'badge_earned':
              await this.syncBadgeEarned(userId, item.data);
              break;
          }
          
          await this.markSyncItemCompleted(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Increment retry count and potentially mark as failed
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      return false;
    }
  }

  private async syncProgressUpdate(userId: string, data: any): Promise<void> {
    // Import ApiService dynamically to avoid circular dependencies
    const { default: ApiService } = await import('./api-services');
    await ApiService.updateContentProgress(userId, data.content_id, data.progress);
  }

  private async syncContentCompletion(userId: string, data: any): Promise<void> {
    const { default: ApiService } = await import('./api-services');
    await ApiService.updateContentProgress(userId, data.content_id, {
      progress_percentage: 100,
      time_spent: data.time_spent,
      is_completed: true,
      last_accessed: new Date().toISOString()
    });
  }

  private async syncBadgeEarned(userId: string, data: any): Promise<void> {
    const { default: ApiService } = await import('./api-services');
    await ApiService.awardBadge(userId, data.badge_id, data.reason);
  }
}

// Export singleton instance
export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;


