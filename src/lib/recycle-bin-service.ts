// =====================================================
// UNIVERSAL RECYCLE BIN SERVICE
// =====================================================
// Manages deleted items across the entire app with 90-day auto-deletion

export interface RecycleBinItem {
  id: string;
  type: 'roadmap' | 'project' | 'profile' | 'assessment' | 'resource';
  originalData: any;
  deletedAt: string;
  deletedBy: string;
  expiresAt: string; // 90 days from deletion
  restoreData?: any; // Data needed to restore the item
}

export class RecycleBinService {
  private static readonly STORAGE_KEY = 'recycle_bin_items';
  private static readonly EXPIRY_DAYS = 90;

  // Add item to recycle bin
  static addToRecycleBin(
    id: string,
    type: RecycleBinItem['type'],
    originalData: any,
    deletedBy: string,
    restoreData?: any
  ): void {
    const deletedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (this.EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString();

    const item: RecycleBinItem = {
      id,
      type,
      originalData,
      deletedAt,
      deletedBy,
      expiresAt,
      restoreData
    };

    const items = this.getAllItems();
    items.push(item);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));

    console.log(`🗑️ Added ${type} to recycle bin:`, item);
  }

  // Get all items in recycle bin
  static getAllItems(): RecycleBinItem[] {
    try {
      const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      return this.cleanExpiredItems(items);
    } catch (error) {
      console.error('Error loading recycle bin items:', error);
      return [];
    }
  }

  // Get items by type
  static getItemsByType(type: RecycleBinItem['type']): RecycleBinItem[] {
    return this.getAllItems().filter(item => item.type === type);
  }

  // Restore item from recycle bin
  static restoreItem(id: string): RecycleBinItem | null {
    const items = this.getAllItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      console.warn(`Item ${id} not found in recycle bin`);
      return null;
    }

    const item = items[itemIndex];
    items.splice(itemIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));

    console.log(`♻️ Restored ${item.type} from recycle bin:`, item);
    return item;
  }

  // Permanently delete item from recycle bin
  static permanentDelete(id: string): boolean {
    const items = this.getAllItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      console.warn(`Item ${id} not found in recycle bin`);
      return false;
    }

    items.splice(itemIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));

    console.log(`🗑️ Permanently deleted ${id} from recycle bin`);
    return true;
  }

  // Clean expired items
  static cleanExpiredItems(items: RecycleBinItem[]): RecycleBinItem[] {
    const now = new Date();
    const validItems = items.filter(item => {
      const expiresAt = new Date(item.expiresAt);
      return expiresAt > now;
    });

    if (validItems.length !== items.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validItems));
      console.log(`🧹 Cleaned ${items.length - validItems.length} expired items from recycle bin`);
    }

    return validItems;
  }

  // Get recycle bin statistics
  static getStats(): {
    total: number;
    byType: Record<string, number>;
    expiringSoon: number; // Items expiring in next 7 days
  } {
    const items = this.getAllItems();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const expiringSoon = items.filter(item => {
      const expiresAt = new Date(item.expiresAt);
      return expiresAt <= sevenDaysFromNow;
    }).length;

    return {
      total: items.length,
      byType,
      expiringSoon
    };
  }

  // Auto-cleanup on app start
  static initialize(): void {
    this.cleanExpiredItems(this.getAllItems());
    console.log('🗑️ Recycle bin initialized and cleaned');
  }
}

// Initialize on import
RecycleBinService.initialize();

