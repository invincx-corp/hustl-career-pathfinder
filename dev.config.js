import { spawn } from 'child_process';
import { watch } from 'chokidar';
import path from 'path';

class DevServer {
  constructor() {
    this.viteProcess = null;
    this.isRunning = false;
    this.restartTimeout = null;
  }

  start() {
    console.log('🚀 Starting Nexa Pathfinder Development Server...');
    this.startVite();
    this.setupFileWatcher();
    this.setupGracefulShutdown();
  }

  startVite() {
    if (this.viteProcess) {
      this.viteProcess.kill();
    }

    console.log('📦 Starting Vite development server on port 5173...');
    this.viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    this.viteProcess.on('error', (error) => {
      console.error('❌ Vite process error:', error);
    });

    this.viteProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`⚠️  Vite process exited with code ${code}`);
        if (!this.isRunning) {
          console.log('🔄 Restarting Vite in 2 seconds...');
          setTimeout(() => this.startVite(), 2000);
        }
      }
    });

    this.isRunning = true;
  }

  setupFileWatcher() {
    const watchPaths = [
      'src/**/*',
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
        '**/*.log'
      ],
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      this.debounceRestart();
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      this.debounceRestart();
    });

    watcher.on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${filePath}`);
      this.debounceRestart();
    });

    console.log('👀 File watcher active for automatic recompilation');
  }

  debounceRestart() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    this.restartTimeout = setTimeout(() => {
      console.log('🔄 Restarting development server...');
      this.startVite();
    }, 1000);
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      console.log('\n🛑 Shutting down development server...');
      this.isRunning = false;
      if (this.viteProcess) {
        this.viteProcess.kill();
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);
  }
}

// Start the development server
const devServer = new DevServer();
devServer.start();
