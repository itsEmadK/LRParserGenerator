import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const REPO_NAME = 'LRParserGenerator';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
  base: `/${REPO_NAME}/`, //Comment this out if you want to host this project anywhere other than GitHub
});
