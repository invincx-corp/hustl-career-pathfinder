#!/usr/bin/env node

import { spawn } from 'child_process';
import { watch } from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NexaDevServer {
  constructor() {
    this.frontendProcess = null;
    this.backendProcess = null;
    this.isRunning = false;
    this.restartTimeout = null;
    this.config = {
      frontendPort: 5173,
      backendPort: 3001,
      restartDelay: 1000
    };
  }

  start() {
    console.log('🚀 Starting Nexa Pathfinder Full-Stack Development Server...');
    console.log(`📱 Frontend: http://localhost:${this.config.frontendPort}`);
    console.log(`🔧 Backend: http://localhost:${this.config.backendPort}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.startFrontend();
    this.startBackend();
    this.setupFileWatcher();
    this.setupGracefulShutdown();
  }

  startFrontend() {
    if (this.frontendProcess) {
      this.frontendProcess.kill();
    }

    console.log('📦 Starting Vite frontend server...');
    this.frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      env: { ...process.env, PORT: this.config.frontendPort }
    });

    this.frontendProcess.on('error', (error) => {
      console.error('❌ Frontend process error:', error);
    });

    this.frontendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`⚠️  Frontend process exited with code ${code}`);
        if (this.isRunning) {
          console.log('🔄 Restarting frontend in 2 seconds...');
          setTimeout(() => this.startFrontend(), 2000);
        }
      }
    });
  }

  startBackend() {
    if (this.backendProcess) {
      this.backendProcess.kill();
    }

    console.log('🔧 Starting Express backend server...');
    this.backendProcess = spawn('npm', ['run', 'dev:backend'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      env: { ...process.env, PORT: this.config.backendPort }
    });

    this.backendProcess.on('error', (error) => {
      console.error('❌ Backend process error:', error);
    });

    this.backendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`⚠️  Backend process exited with code ${code}`);
        if (this.isRunning) {
          console.log('🔄 Restarting backend in 2 seconds...');
          setTimeout(() => this.startBackend(), 2000);
        }
      }
    });
  }

  setupFileWatcher() {
    const watchPaths = [
      'src/**/*',
      'server/**/*',
      'public/**/*',
      '*.config.*',
      'package.json',
      'tsconfig*.json',
      'tailwind.config.*',
      'postcss.config.*'
    ];

    const watcher = watch(watchPaths, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.log',
        '**/server/node_modules/**'
      ],
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      this.handleFileChange(filePath);
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      this.handleFileChange(filePath);
    });

    watcher.on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${filePath}`);
      this.handleFileChange(filePath);
    });

    console.log('👀 File watcher active for automatic recompilation');
  }

  handleFileChange(filePath) {
    if (filePath.startsWith('server/')) {
      this.debounceRestart('backend');
    } else if (filePath.startsWith('src/') || filePath.includes('config')) {
      this.debounceRestart('frontend');
    } else {
      this.debounceRestart('both');
    }
  }

  debounceRestart(target = 'both') {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    this.restartTimeout = setTimeout(() => {
      console.log(`🔄 Restarting ${target} server(s)...`);
      
      if (target === 'frontend' || target === 'both') {
        this.startFrontend();
      }
      
      if (target === 'backend' || target === 'both') {
        this.startBackend();
      }
    }, this.config.restartDelay);
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      console.log('\n🛑 Shutting down development servers...');
      this.isRunning = false;
      
      if (this.frontendProcess) {
        this.frontendProcess.kill();
      }
      
      if (this.backendProcess) {
        this.backendProcess.kill();
      }
      
      console.log('✅ All servers stopped');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);
  }
}

// Start the development server
const devServer = new NexaDevServer();
devServer.start();
