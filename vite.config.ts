import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "./src"),
      "@/Endpoints": path.resolve(__dirname, "./src/Endpoints"),
      "@/Services": path.resolve(__dirname, "./src/Services"),
      "@/Storage": path.resolve(__dirname, "./src/Storage"),
      "@/Assets": path.resolve(__dirname, "./src/Assets"),
    },
  },
})
