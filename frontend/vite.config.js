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
      'ipfs-utils/src/env': './lib/ipfs-utils/env.js',
      'ipfs-utils/src/supports': './lib/ipfs-utils/supports.js',
      'ipfs-utils/src': './lib/ipfs-utils',

      '@': resolve(__dirname, 'patient'),
      '#': resolve(__dirname, 'common'),
      '$': resolve(__dirname, 'doctor'),
      '%': resolve(__dirname, 'supplyChain'),
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        doctor: resolve(__dirname, 'doctor.html'),
        patient: resolve(__dirname, 'patient.html'),
        supplyChain: resolve(__dirname, 'supplyChain.html'),
      }
    }
  }
});
