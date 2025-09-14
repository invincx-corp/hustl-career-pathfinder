// File Management System
// Handles file upload, sharing, and management

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  isPublic: boolean;
  isTemporary: boolean;
  tags: string[];
  description?: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio files
  checksum: string;
  version: number;
  parentId?: string; // for file versions
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  estimatedTime: number; // seconds
}

export interface FileShare {
  id: string;
  fileId: string;
  sharedBy: string;
  sharedWith: string[];
  permissions: 'view' | 'download' | 'edit' | 'admin';
  isPublic: boolean;
  password?: string;
  expiresAt?: string;
  downloadCount: number;
  maxDownloads?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  name: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  changes: string[];
  isCurrent: boolean;
}

export interface FileSearchFilters {
  category?: string;
  mimeType?: string;
  uploadedBy?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  isPublic?: boolean;
  isTemporary?: boolean;
}

export class FileManager {
  private files: Map<string, FileMetadata> = new Map();
  private shares: Map<string, FileShare> = new Map();
  private versions: Map<string, FileVersion> = new Map();
  private uploadProgress: Map<string, FileUploadProgress> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Upload file
  async uploadFile(
    file: File,
    options: {
      isPublic?: boolean;
      isTemporary?: boolean;
      tags?: string[];
      description?: string;
      category?: FileMetadata['category'];
      onProgress?: (progress: FileUploadProgress) => void;
    } = {}
  ): Promise<FileMetadata> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const category = options.category || this.detectFileCategory(file.type);
    
    // Create file metadata
    const metadata: FileMetadata = {
      id: fileId,
      name: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      mimeType: file.type,
      url: '', // Will be set after upload
      uploadedBy: 'current-user', // Replace with actual user ID
      uploadedAt: new Date().toISOString(),
      isPublic: options.isPublic || false,
      isTemporary: options.isTemporary || false,
      tags: options.tags || [],
      description: options.description,
      category,
      checksum: await this.calculateChecksum(file),
      version: 1
    };

    // Initialize upload progress
    const progress: FileUploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      uploadedBytes: 0,
      totalBytes: file.size,
      speed: 0,
      estimatedTime: 0
    };

    this.uploadProgress.set(fileId, progress);
    this.files.set(fileId, metadata);

    try {
      // Simulate file upload with progress
      const uploadResult = await this.simulateFileUpload(file, progress, options.onProgress);
      
      // Update metadata with upload result
      metadata.url = uploadResult.url;
      metadata.thumbnailUrl = uploadResult.thumbnailUrl;
      metadata.dimensions = uploadResult.dimensions;
      metadata.duration = uploadResult.duration;

      // Update progress
      progress.status = 'completed';
      progress.progress = 100;
      options.onProgress?.(progress);

      this.files.set(fileId, metadata);
      this.saveToLocalStorage();

      return metadata;
    } catch (error) {
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Upload failed';
      options.onProgress?.(progress);
      throw error;
    }
  }

  // Simulate file upload (replace with actual upload logic)
  private async simulateFileUpload(
    file: File,
    progress: FileUploadProgress,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<{
    url: string;
    thumbnailUrl?: string;
    dimensions?: { width: number; height: number };
    duration?: number;
  }> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let uploadedBytes = 0;
      const totalBytes = file.size;
      const chunkSize = Math.max(1024 * 1024, totalBytes / 100); // 1MB or 1% of file size

      const uploadInterval = setInterval(() => {
        uploadedBytes += chunkSize;
        if (uploadedBytes > totalBytes) {
          uploadedBytes = totalBytes;
        }

        const elapsed = (Date.now() - startTime) / 1000;
        const speed = uploadedBytes / elapsed;
        const remaining = totalBytes - uploadedBytes;
        const estimatedTime = remaining / speed;

        progress.progress = (uploadedBytes / totalBytes) * 100;
        progress.uploadedBytes = uploadedBytes;
        progress.speed = speed;
        progress.estimatedTime = estimatedTime;

        onProgress?.(progress);

        if (uploadedBytes >= totalBytes) {
          clearInterval(uploadInterval);
          
          // Generate mock URLs
          const url = `https://storage.example.com/files/${progress.fileId}`;
          const thumbnailUrl = this.isImageFile(file.type) ? 
            `https://storage.example.com/thumbnails/${progress.fileId}` : undefined;
          
          const dimensions = this.isImageFile(file.type) ? 
            { width: 1920, height: 1080 } : undefined;
          
          const duration = this.isVideoFile(file.type) || this.isAudioFile(file.type) ? 
            120 : undefined;

          resolve({ url, thumbnailUrl, dimensions, duration });
        }
      }, 100);

      // Simulate upload failure for large files
      if (file.size > 100 * 1024 * 1024) { // 100MB
        setTimeout(() => {
          clearInterval(uploadInterval);
          reject(new Error('File too large'));
        }, 2000);
      }
    });
  }

  // Get file metadata
  getFile(fileId: string): FileMetadata | null {
    return this.files.get(fileId) || null;
  }

  // Get user files
  getUserFiles(userId: string, filters: FileSearchFilters = {}): FileMetadata[] {
    let files = Array.from(this.files.values()).filter(file => file.uploadedBy === userId);

    if (filters.category) {
      files = files.filter(file => file.category === filters.category);
    }

    if (filters.mimeType) {
      files = files.filter(file => file.mimeType === filters.mimeType);
    }

    if (filters.tags && filters.tags.length > 0) {
      files = files.filter(file =>
        filters.tags!.some(tag => file.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      files = files.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return fileDate >= startDate && fileDate <= endDate;
      });
    }

    if (filters.sizeRange) {
      files = files.filter(file => {
        const size = file.size;
        const min = filters.sizeRange!.min;
        const max = filters.sizeRange!.max;
        return size >= min && size <= max;
      });
    }

    if (filters.isPublic !== undefined) {
      files = files.filter(file => file.isPublic === filters.isPublic);
    }

    if (filters.isTemporary !== undefined) {
      files = files.filter(file => file.isTemporary === filters.isTemporary);
    }

    return files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  // Search files
  searchFiles(query: string, filters: FileSearchFilters = {}): FileMetadata[] {
    let files = Array.from(this.files.values());

    if (query) {
      const queryLower = query.toLowerCase();
      files = files.filter(file =>
        file.name.toLowerCase().includes(queryLower) ||
        file.originalName.toLowerCase().includes(queryLower) ||
        file.description?.toLowerCase().includes(queryLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    // Apply filters
    if (filters.category) {
      files = files.filter(file => file.category === filters.category);
    }

    if (filters.mimeType) {
      files = files.filter(file => file.mimeType === filters.mimeType);
    }

    if (filters.tags && filters.tags.length > 0) {
      files = files.filter(file =>
        filters.tags!.some(tag => file.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      files = files.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return fileDate >= startDate && fileDate <= endDate;
      });
    }

    if (filters.sizeRange) {
      files = files.filter(file => {
        const size = file.size;
        const min = filters.sizeRange!.min;
        const max = filters.sizeRange!.max;
        return size >= min && size <= max;
      });
    }

    if (filters.isPublic !== undefined) {
      files = files.filter(file => file.isPublic === filters.isPublic);
    }

    if (filters.isTemporary !== undefined) {
      files = files.filter(file => file.isTemporary === filters.isTemporary);
    }

    return files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  // Update file metadata
  updateFile(fileId: string, updates: Partial<Omit<FileMetadata, 'id' | 'uploadedBy' | 'uploadedAt' | 'checksum' | 'version'>>): FileMetadata | null {
    const file = this.files.get(fileId);
    if (!file) return null;

    const updatedFile = { ...file, ...updates };
    this.files.set(fileId, updatedFile);
    this.saveToLocalStorage();

    return updatedFile;
  }

  // Delete file
  deleteFile(fileId: string): boolean {
    const file = this.files.get(fileId);
    if (!file) return false;

    this.files.delete(fileId);
    this.shares.delete(fileId);
    this.uploadProgress.delete(fileId);
    this.saveToLocalStorage();

    return true;
  }

  // Share file
  shareFile(
    fileId: string,
    sharedWith: string[],
    permissions: FileShare['permissions'] = 'view',
    options: {
      isPublic?: boolean;
      password?: string;
      expiresAt?: string;
      maxDownloads?: number;
    } = {}
  ): FileShare | null {
    const file = this.files.get(fileId);
    if (!file) return null;

    const share: FileShare = {
      id: `share-${Date.now()}`,
      fileId,
      sharedBy: 'current-user', // Replace with actual user ID
      sharedWith,
      permissions,
      isPublic: options.isPublic || false,
      password: options.password,
      expiresAt: options.expiresAt,
      downloadCount: 0,
      maxDownloads: options.maxDownloads,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.shares.set(share.id, share);
    this.saveToLocalStorage();

    return share;
  }

  // Get file shares
  getFileShares(fileId: string): FileShare[] {
    return Array.from(this.shares.values()).filter(share => share.fileId === fileId);
  }

  // Get shared files
  getSharedFiles(userId: string): FileMetadata[] {
    const sharedFileIds = Array.from(this.shares.values())
      .filter(share => share.sharedWith.includes(userId))
      .map(share => share.fileId);

    return sharedFileIds
      .map(id => this.files.get(id))
      .filter((file): file is FileMetadata => file !== undefined);
  }

  // Create file version
  createFileVersion(
    fileId: string,
    file: File,
    changes: string[]
  ): Promise<FileVersion> {
    return new Promise(async (resolve, reject) => {
      try {
        const originalFile = this.files.get(fileId);
        if (!originalFile) {
          reject(new Error('File not found'));
          return;
        }

        const version: FileVersion = {
          id: `version-${Date.now()}`,
          fileId,
          version: originalFile.version + 1,
          name: file.name,
          size: file.size,
          url: '', // Will be set after upload
          uploadedBy: 'current-user', // Replace with actual user ID
          uploadedAt: new Date().toISOString(),
          changes,
          isCurrent: false
        };

        // Simulate version upload
        const uploadResult = await this.simulateFileUpload(file, {
          fileId: version.id,
          fileName: file.name,
          progress: 0,
          status: 'uploading',
          uploadedBytes: 0,
          totalBytes: file.size,
          speed: 0,
          estimatedTime: 0
        });

        version.url = uploadResult.url;
        this.versions.set(version.id, version);

        // Update original file version
        originalFile.version = version.version;
        this.files.set(fileId, originalFile);

        this.saveToLocalStorage();
        resolve(version);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get file versions
  getFileVersions(fileId: string): FileVersion[] {
    return Array.from(this.versions.values())
      .filter(version => version.fileId === fileId)
      .sort((a, b) => b.version - a.version);
  }

  // Get upload progress
  getUploadProgress(fileId: string): FileUploadProgress | null {
    return this.uploadProgress.get(fileId) || null;
  }

  // Get all upload progress
  getAllUploadProgress(): FileUploadProgress[] {
    return Array.from(this.uploadProgress.values());
  }

  // Clear completed uploads
  clearCompletedUploads(): void {
    const completedUploads = Array.from(this.uploadProgress.values())
      .filter(progress => progress.status === 'completed' || progress.status === 'error');

    completedUploads.forEach(progress => {
      this.uploadProgress.delete(progress.fileId);
    });

    this.saveToLocalStorage();
  }

  // Detect file category
  private detectFileCategory(mimeType: string): FileMetadata['category'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
    return 'other';
  }

  // Check if file is image
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  // Check if file is video
  private isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  // Check if file is audio
  private isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  // Calculate file checksum
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Format file size
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get file statistics
  getFileStatistics(): {
    totalFiles: number;
    totalSize: number;
    categoryDistribution: Record<string, number>;
    sizeDistribution: Record<string, number>;
    recentUploads: number;
  } {
    const files = Array.from(this.files.values());
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    const categoryDistribution = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sizeDistribution = files.reduce((acc, file) => {
      const size = file.size;
      if (size < 1024 * 1024) acc['<1MB'] = (acc['<1MB'] || 0) + 1;
      else if (size < 10 * 1024 * 1024) acc['1-10MB'] = (acc['1-10MB'] || 0) + 1;
      else if (size < 100 * 1024 * 1024) acc['10-100MB'] = (acc['10-100MB'] || 0) + 1;
      else acc['>100MB'] = (acc['>100MB'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = files.filter(file => 
      new Date(file.uploadedAt) > oneWeekAgo
    ).length;

    return {
      totalFiles,
      totalSize,
      categoryDistribution,
      sizeDistribution,
      recentUploads
    };
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        files: Object.fromEntries(this.files),
        shares: Object.fromEntries(this.shares),
        versions: Object.fromEntries(this.versions)
      };
      localStorage.setItem('file-manager', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save file manager data to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('file-manager');
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.files) {
        this.files = new Map(Object.entries(parsed.files));
      }
      
      if (parsed.shares) {
        this.shares = new Map(Object.entries(parsed.shares));
      }
      
      if (parsed.versions) {
        this.versions = new Map(Object.entries(parsed.versions));
      }
    } catch (error) {
      console.error('Failed to load file manager data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.files.clear();
    this.shares.clear();
    this.versions.clear();
    this.uploadProgress.clear();
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const fileManager = new FileManager();
