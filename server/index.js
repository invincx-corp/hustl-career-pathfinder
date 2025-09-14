import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

const PORT = config.server.port;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import API routes
import authRoutes from './routes/auth.js';
import learningRoutes from './routes/learning.js';
import identityRoutes from './routes/identity.js';
import supportRoutes from './routes/support.js';
import opportunitiesRoutes from './routes/opportunities.js';
import roadmapRoutes from './routes/roadmaps.js';
import aiRoutes from './routes/ai.js';
import contentRoutes from './routes/content.js';
import mentorRoutes from './routes/mentors.js';
import intelligentContentRoutes from './routes/intelligent-content.js';
import careerRoutes from './routes/career.js';
import testAPIsRoutes from './routes/test-apis.js';
import messagingRoutes from './routes/messaging.js';
import forumRoutes from './routes/forums.js';
import communityRoutes from './routes/community.js';
import statusRoutes from './routes/status.js';

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Nexa Pathfinder Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Feature-specific API routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/test', testAPIsRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/intelligent-content', intelligentContentRoutes);
app.use('/api', statusRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // User joins their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Client ${socket.id} joined user room: user-${userId}`);
  });
  
  // Join learning session room
  socket.on('join-learning-session', (sessionId) => {
    socket.join(`learning-${sessionId}`);
    console.log(`Client ${socket.id} joined learning session: ${sessionId}`);
  });
  
  // Join mentorship room
  socket.on('join-mentorship-room', (mentorshipId) => {
    socket.join(`mentorship-${mentorshipId}`);
    console.log(`Client ${socket.id} joined mentorship room: ${mentorshipId}`);
  });
  
  // Real-time learning progress updates
  socket.on('learning-progress', (data) => {
    const { userId, progress, skill, level } = data;
    
    // Broadcast to user's room
    io.to(`user-${userId}`).emit('progress-update', {
      skill,
      level,
      progress,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Progress update for user ${userId}: ${skill} - Level ${level}`);
  });
  
  // Real-time roadmap updates
  socket.on('roadmap-update', (data) => {
    const { userId, roadmapId, step, progress } = data;
    
    // Broadcast to user's room
    io.to(`user-${userId}`).emit('roadmap-progress', {
      roadmapId,
      step,
      progress,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Roadmap update for user ${userId}: ${roadmapId} - Step ${step}`);
  });
  
  // Real-time notifications
  socket.on('send-notification', (data) => {
    const { userId, type, message, priority } = data;
    
    // Broadcast to user's room
    io.to(`user-${userId}`).emit('notification', {
      type,
      message,
      priority,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Notification sent to user ${userId}: ${type} - ${message}`);
  });
  
  // Real-time chat for mentorship
  socket.on('mentorship-message', (data) => {
    const { mentorshipId, userId, message, senderType } = data;
    
    // Broadcast to mentorship room
    io.to(`mentorship-${mentorshipId}`).emit('chat-message', {
      userId,
      message,
      senderType,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Mentorship message in ${mentorshipId}: ${senderType} - ${message}`);
  });
  
  // Real-time AI coach responses
  socket.on('ai-coach-request', async (data) => {
    const { userId, message, context } = data;
    
    try {
      // Simulate AI processing time
      setTimeout(() => {
        const response = {
          message: `AI Coach: I understand you're asking about "${message}". Let me help you with that!`,
          suggestions: [
            'Create a learning plan',
            'Find relevant resources',
            'Connect with mentors'
          ],
          timestamp: new Date().toISOString()
        };
        
        // Send response back to user
        io.to(`user-${userId}`).emit('ai-coach-response', response);
        
        console.log(`AI Coach response sent to user ${userId}`);
      }, 1000);
    } catch (error) {
      console.error('Error processing AI coach request:', error);
    }
  });

  // Phase 4: Real-time messaging
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`Client ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`Client ${socket.id} left conversation: ${conversationId}`);
  });

  socket.on('send-message', (data) => {
    const { conversationId, userId, message, messageType = 'text' } = data;
    
    // Broadcast to conversation room
    io.to(`conversation-${conversationId}`).emit('new-message', {
      userId,
      message,
      messageType,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Message sent in conversation ${conversationId}: ${message}`);
  });

  socket.on('typing-start', (data) => {
    const { conversationId, userId } = data;
    
    // Broadcast typing indicator to conversation room
    io.to(`conversation-${conversationId}`).emit('user-typing', {
      userId,
      isTyping: true,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing-stop', (data) => {
    const { conversationId, userId } = data;
    
    // Broadcast typing stop to conversation room
    io.to(`conversation-${conversationId}`).emit('user-typing', {
      userId,
      isTyping: false,
      timestamp: new Date().toISOString()
    });
  });

  // Phase 4: Forum notifications
  socket.on('join-forum', (forumId) => {
    socket.join(`forum-${forumId}`);
    console.log(`Client ${socket.id} joined forum: ${forumId}`);
  });

  socket.on('forum-post', (data) => {
    const { forumId, topicId, userId, title } = data;
    
    // Broadcast new post to forum subscribers
    io.to(`forum-${forumId}`).emit('new-forum-post', {
      topicId,
      userId,
      title,
      timestamp: new Date().toISOString()
    });
    
    console.log(`New forum post in ${forumId}: ${title}`);
  });

  // Phase 4: Mentor session notifications
  socket.on('mentor-session-update', (data) => {
    const { mentorId, menteeId, sessionId, status } = data;
    
    // Notify both mentor and mentee
    io.to(`user-${mentorId}`).emit('session-update', {
      sessionId,
      status,
      timestamp: new Date().toISOString()
    });
    
    io.to(`user-${menteeId}`).emit('session-update', {
      sessionId,
      status,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Mentor session ${sessionId} status updated: ${status}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Nexa Pathfinder Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API status: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

export default app;
