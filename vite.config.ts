import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  base: "/Frontend/",
  plugins: [react()],
  resolve: {
    alias: {
      // This maps "src" to the actual file system path of your src folder
      "src": path.resolve(__dirname, "./src"),
    },
  },
})
