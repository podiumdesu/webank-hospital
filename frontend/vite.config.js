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
      'dlv': './lib/dlv.js',
      'randombytes': './lib/randombytes.js',
      'electron-fetch': './lib/empty.js',
      'mortice': './lib/mortice.js',
      'readable-stream': './lib/readable-stream/index.js',
      'levelup': './lib/levelup.js',
      'level-js': './lib/level-js.js',

      '@/': resolve(__dirname, './patient'),
      '@/config': resolve(__dirname, './patient/config'),
      '@/components': resolve(__dirname, './patient/components'),
      '@/styles': resolve(__dirname, './patient/styles'),
      // '@/common': resolve(__dirname, './patient/common'),
      // '@/assets': resolve(__dirname, './patient/assets'),
      '@/pages': resolve(__dirname, './patient/pages'),
      '@/routes': resolve(__dirname, './patient/routes'),
      // '@/layouts': resolve(__dirname, './patient/layouts'),
      // '@/hooks': resolve(__dirname, './patient/hooks'),
      // '@/store': resolve(__dirname, './patient/store'),

      '#/utils': resolve(__dirname, './common/utils'),
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
