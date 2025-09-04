# 🚀 Nexa Pathfinder Development Setup

This document explains how to set up automatic compilation and hot reload for the Nexa Pathfinder project.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation

### 1. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install frontend only
npm install
```

### 2. Environment Setup

Copy the environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration values.

## 🎯 Development Modes

### Frontend Only (Current Setup)
Since the project currently uses Supabase as the backend, you can run just the frontend:

```bash
# Basic development server
npm run dev

# With automatic file watching and recompilation
npm run dev:auto

# With TypeScript checking and linting
npm run dev:full
```

### Full-Stack Development (Future Ready)
When you're ready to add a custom backend:

```bash
# Run both frontend and backend with automatic recompilation
npm run dev:complete-auto

# Run both with manual control
npm run dev:both

# Run with full development tools
npm run dev:complete
```

## 🔧 Available Scripts

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run dev:auto` - Start with automatic file watching
- `npm run dev:full` - Start with TypeScript checking and linting
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend Scripts (Future)
- `npm run dev:backend` - Start backend server
- `npm run start:backend` - Start backend in production mode

### Combined Scripts
- `npm run dev:both` - Run frontend and backend together
- `npm run dev:complete` - Run with all development tools
- `npm run dev:complete-auto` - Full automatic recompilation
- `npm run build:all` - Build both frontend and backend

### Utility Scripts
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run ESLint
- `npm run install:all` - Install all dependencies

## 🌐 Access Points

### Frontend
- **Development**: http://localhost:5173
- **Production Preview**: http://localhost:4173 (after `npm run preview`)

### Backend (Future)
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Status**: http://localhost:3001/api/status

## 🔄 Automatic Recompilation Features

### File Watching
The development server automatically watches for changes in:
- `src/**/*` - All frontend source files
- `server/**/*` - All backend source files (when available)
- Configuration files (`*.config.*`, `package.json`, etc.)

### Hot Reload
- **Frontend**: Vite provides instant hot module replacement
- **Backend**: Automatic server restart on file changes
- **TypeScript**: Real-time type checking
- **Linting**: Continuous code quality monitoring

### Smart Restart Logic
- Frontend changes trigger frontend-only restart
- Backend changes trigger backend-only restart
- Configuration changes trigger full restart
- Debounced restarts prevent excessive reloading

## 🎨 Development Workflow

### Recommended Workflow
1. Start the development server: `npm run dev:complete-auto`
2. Make changes to your code
3. Watch automatic recompilation and hot reload
4. Test your changes in the browser
5. Use browser dev tools for debugging

### File Structure
```
nexa-pathfinder-main/
├── src/                    # Frontend source code
├── server/                 # Backend source code (future)
├── public/                 # Static assets
├── dev-server.js          # Full-stack development server
├── dev.config.js          # Frontend-only development server
└── package.json           # Project configuration
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
# Kill process using port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Watch for type errors
npm run type-check:watch
```

### Linting Issues
```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

## 📝 Notes

- The project is configured to use port 5173 for the frontend [[memory:4454729]]
- Hot reload is enabled by default for instant feedback
- TypeScript checking runs continuously in watch mode
- ESLint provides real-time code quality feedback
- The backend server is prepared for future integration
- All changes are automatically compiled and served

## 🚀 Production Deployment

### Build for Production
```bash
# Build frontend
npm run build

# Build everything (when backend is ready)
npm run build:all
```

### Preview Production Build
```bash
npm run preview
```

---

**Happy Coding! 🎉**

The development environment is now set up for automatic compilation and hot reload. Every change you make will be automatically compiled and reflected in your browser.
