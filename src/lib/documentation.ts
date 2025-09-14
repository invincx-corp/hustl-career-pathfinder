// Documentation system for real-time functionality
export interface DocumentationEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  author: string;
  version: string;
}

export interface DocumentationCategory {
  id: string;
  name: string;
  description: string;
  entries: DocumentationEntry[];
}

export class DocumentationManager {
  private static instance: DocumentationManager;
  private entries: Map<string, DocumentationEntry> = new Map();
  private categories: Map<string, DocumentationCategory> = new Map();

  private constructor() {
    this.initializeDocumentation();
  }

  public static getInstance(): DocumentationManager {
    if (!DocumentationManager.instance) {
      DocumentationManager.instance = new DocumentationManager();
    }
    return DocumentationManager.instance;
  }

  // Initialize documentation
  private initializeDocumentation(): void {
    // Add core documentation entries
    this.addEntry({
      id: 'getting-started',
      title: 'Getting Started',
      content: `
# Getting Started with NEXA

NEXA is a comprehensive career development platform that helps users discover their career path, learn new skills, and connect with mentors.

## Features

- **Career Discovery**: Explore different career paths and opportunities
- **Skill Assessment**: Evaluate your current skills and identify gaps
- **Learning Paths**: Follow structured learning roadmaps
- **Project Portfolio**: Build and showcase your projects
- **Mentor Matching**: Connect with industry professionals
- **AI Coaching**: Get personalized career advice

## Quick Start

1. **Sign Up**: Create your account with email and password
2. **Complete Onboarding**: Fill out your profile and interests
3. **Take Assessment**: Complete the skill assessment
4. **Explore Paths**: Browse available learning paths
5. **Start Learning**: Begin your first learning journey

## Navigation

- **Dashboard**: Your main hub for progress and quick actions
- **Learning Paths**: Browse and start learning paths
- **Projects**: Manage your project portfolio
- **Mentors**: Find and connect with mentors
- **Profile**: Update your personal information
      `,
      category: 'general',
      tags: ['getting-started', 'overview', 'features'],
      lastUpdated: new Date(),
      author: 'NEXA Team',
      version: '1.0.0'
    });

    this.addEntry({
      id: 'api-reference',
      title: 'API Reference',
      content: `
# API Reference

## Authentication

All API requests require authentication. Include your JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### User Management
- \`GET /api/users/profile\` - Get user profile
- \`PUT /api/users/profile\` - Update user profile
- \`POST /api/users/onboarding/complete\` - Complete onboarding

### Learning Paths
- \`GET /api/learning/paths\` - Get all learning paths
- \`GET /api/learning/paths/:id\` - Get specific learning path
- \`POST /api/learning/paths/:id/start\` - Start learning path
- \`PUT /api/learning/paths/:id/progress\` - Update progress

### Projects
- \`GET /api/projects\` - Get user projects
- \`POST /api/projects\` - Create new project
- \`PUT /api/projects/:id\` - Update project
- \`DELETE /api/projects/:id\` - Delete project

### Mentors
- \`GET /api/mentors\` - Get available mentors
- \`GET /api/mentors/:id\` - Get mentor details
- \`POST /api/mentors/:id/request\` - Request mentorship

## Real-time Events

### WebSocket Events
- \`progress-update\` - Learning progress updates
- \`roadmap-progress\` - Roadmap step completion
- \`notification\` - New notifications
- \`ai-coach-response\` - AI coach responses
      `,
      category: 'technical',
      tags: ['api', 'reference', 'endpoints', 'websocket'],
      lastUpdated: new Date(),
      author: 'NEXA Team',
      version: '1.0.0'
    });

    this.addEntry({
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: `
# Troubleshooting

## Common Issues

### Authentication Problems
- **Issue**: "Authentication failed" error
- **Solution**: Check if your JWT token is valid and not expired
- **Prevention**: Implement token refresh logic

### Connection Issues
- **Issue**: "Connection lost" error
- **Solution**: Check your internet connection and try reconnecting
- **Prevention**: Implement automatic reconnection logic

### Data Loading Problems
- **Issue**: Data not loading or showing as "Loading..."
- **Solution**: Check API endpoints and database connectivity
- **Prevention**: Implement proper error handling and fallbacks

### Real-time Updates Not Working
- **Issue**: Real-time updates not appearing
- **Solution**: Check WebSocket connection and event listeners
- **Prevention**: Implement connection monitoring and reconnection

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Check authentication token |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Check resource existence |
| 500 | Internal Server Error | Contact support |

## Performance Issues

### Slow Loading
- Check network connection
- Clear browser cache
- Disable browser extensions
- Check server performance

### Memory Issues
- Close unused tabs
- Restart browser
- Check for memory leaks in code
      `,
      category: 'support',
      tags: ['troubleshooting', 'errors', 'performance', 'support'],
      lastUpdated: new Date(),
      author: 'NEXA Team',
      version: '1.0.0'
    });

    this.addEntry({
      id: 'real-time-features',
      title: 'Real-time Features',
      content: `
# Real-time Features

## WebSocket Connection

NEXA uses WebSocket for real-time communication between the client and server.

### Connection Management
- Automatic connection on app start
- Automatic reconnection on connection loss
- Connection status monitoring
- User-specific rooms for targeted updates

### Events

#### Progress Updates
- \`progress-update\`: Learning progress changes
- \`roadmap-progress\`: Roadmap step completion
- \`project-update\`: Project status changes

#### Notifications
- \`notification\`: New notifications
- \`achievement-unlocked\`: New achievements
- \`mentor-message\`: Messages from mentors

#### AI Features
- \`ai-coach-response\`: AI coach responses
- \`ai-recommendation\`: AI-generated recommendations
- \`ai-analysis\`: AI analysis results

## Implementation

### Frontend
\`\`\`typescript
import { socketService } from './lib/socket-service';

// Connect to WebSocket
socketService.connect(userId);

// Listen for events
socketService.onProgressUpdate((data) => {
  console.log('Progress updated:', data);
});

// Emit events
socketService.updateLearningProgress(userId, progress);
\`\`\`

### Backend
\`\`\`javascript
// Handle WebSocket connections
io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => {
    socket.join(userId);
  });
  
  socket.on('update-progress', (data) => {
    // Update database
    // Emit to user room
    io.to(data.userId).emit('progress-update', data);
  });
});
\`\`\`
      `,
      category: 'technical',
      tags: ['real-time', 'websocket', 'events', 'implementation'],
      lastUpdated: new Date(),
      author: 'NEXA Team',
      version: '1.0.0'
    });
  }

  // Add documentation entry
  public addEntry(entry: DocumentationEntry): void {
    this.entries.set(entry.id, entry);
    
    // Add to category
    if (!this.categories.has(entry.category)) {
      this.categories.set(entry.category, {
        id: entry.category,
        name: entry.category,
        description: '',
        entries: []
      });
    }
    
    const category = this.categories.get(entry.category)!;
    const existingIndex = category.entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      category.entries[existingIndex] = entry;
    } else {
      category.entries.push(entry);
    }
  }

  // Get documentation entry
  public getEntry(id: string): DocumentationEntry | undefined {
    return this.entries.get(id);
  }

  // Get all entries
  public getAllEntries(): DocumentationEntry[] {
    return Array.from(this.entries.values());
  }

  // Get entries by category
  public getEntriesByCategory(category: string): DocumentationEntry[] {
    const cat = this.categories.get(category);
    return cat ? cat.entries : [];
  }

  // Search entries
  public searchEntries(query: string): DocumentationEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllEntries().filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get categories
  public getCategories(): DocumentationCategory[] {
    return Array.from(this.categories.values());
  }

  // Update entry
  public updateEntry(id: string, updates: Partial<DocumentationEntry>): boolean {
    const entry = this.entries.get(id);
    if (!entry) return false;

    const updatedEntry = { ...entry, ...updates, lastUpdated: new Date() };
    this.entries.set(id, updatedEntry);
    
    // Update in category
    const category = this.categories.get(entry.category);
    if (category) {
      const index = category.entries.findIndex(e => e.id === id);
      if (index >= 0) {
        category.entries[index] = updatedEntry;
      }
    }
    
    return true;
  }

  // Delete entry
  public deleteEntry(id: string): boolean {
    const entry = this.entries.get(id);
    if (!entry) return false;

    this.entries.delete(id);
    
    // Remove from category
    const category = this.categories.get(entry.category);
    if (category) {
      category.entries = category.entries.filter(e => e.id !== id);
    }
    
    return true;
  }

  // Get documentation statistics
  public getStats(): {
    totalEntries: number;
    totalCategories: number;
    averageEntriesPerCategory: number;
    mostRecentUpdate: Date | null;
  } {
    const totalEntries = this.entries.size;
    const totalCategories = this.categories.size;
    const averageEntriesPerCategory = totalCategories > 0 ? totalEntries / totalCategories : 0;
    
    const allEntries = this.getAllEntries();
    const mostRecentUpdate = allEntries.length > 0 
      ? new Date(Math.max(...allEntries.map(e => e.lastUpdated.getTime())))
      : null;

    return {
      totalEntries,
      totalCategories,
      averageEntriesPerCategory: Math.round(averageEntriesPerCategory * 100) / 100,
      mostRecentUpdate
    };
  }
}

// Export singleton instance
export const documentationManager = DocumentationManager.getInstance();
export default documentationManager;
