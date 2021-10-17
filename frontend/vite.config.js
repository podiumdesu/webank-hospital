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
      },
      output: {
        manualChunks: {
          react: ['react'],
          'react-dom': ['react-dom'],
          'react-router': ['react-router-dom'],
          'react-is': ['react-is'],
          'lodash': ['lodash'],
          'node-forge': ['node-forge'],
          'loadable': ['@loadable/component'],
          'mui-core': ['@mui/material'],
          'mui-lab': ['@mui/lab'],
          'mui-icons': ['@mui/icons-material'],
          antd: ['antd-mobile'],
          'libp2p-crypto': ['libp2p-crypto'],
          libp2p: ['libp2p'],
          ipfs: ['ipfs-core'],
          ethers: ['ethers'],
          axios: ['axios'],
        },
      },
    }
  }
});
