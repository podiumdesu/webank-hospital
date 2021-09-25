import { defineConfig } from 'vite';
import { resolve } from 'path';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  plugins: [reactRefresh()],
  define: {
    'process.env.DUMP_SESSION_KEYS': '""'
  },
  resolve: {
    alias: {
      '@motrix/nat-api': './lib/empty.js',
      'randombytes': './lib/randombytes.js',
      'electron-fetch': './lib/empty.js',
      'mortice': './lib/mortice.js',
      'readable-stream': './lib/readable-stream/index.js',
      'levelup': './lib/levelup.js',
      'level-js': './lib/level-js.js',

      '@': resolve(__dirname, 'patient'),
      '#': resolve(__dirname, 'common'),
      '$': resolve(__dirname, 'doctor'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        doctor: resolve(__dirname, 'doctor.html'),
        patient: resolve(__dirname, 'patient.html')
      }
    }
  }
});
