import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: If deploying to https://username.github.io/repo-name/, 
  // change the base line below to: base: '/repo-name/',
  // If deploying to Vercel/Netlify, leave as '/'
  base: '/', 
  define: {
    // This allows using process.env.API_KEY in the browser for the demo
    // In a real production app, you should use a backend proxy.
    'process.env': process.env
  }
});