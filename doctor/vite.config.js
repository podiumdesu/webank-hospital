import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [reactRefresh()],
});
