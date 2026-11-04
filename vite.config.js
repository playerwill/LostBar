import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos funcionam em localhost e em repositórios de projeto no GitHub Pages.
  base: './',
});
