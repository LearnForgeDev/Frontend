import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error @types/node missing
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This maps "src" to the actual file system path of your src folder
      "src": path.resolve(__dirname, "./src"),
    },
  },
})
