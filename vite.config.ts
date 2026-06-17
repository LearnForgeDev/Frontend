import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  base: "/",
  plugins: [
    react({
      babel: {
        presets: [[
          '@babel/preset-env',
          {
            targets: {
              chrome: '58',
              edge: '16',
              firefox: '54',
              safari: '11',
              ios: '11',
            },
            modules: false,
          },
        ]],
      },
    }),
  ],
  define: {
    'import.meta.env.VITE_YENV': JSON.stringify(process.env.YENV || ""),
  },
  esbuild: {
    target: 'es2017',
  },
  build: {
    target: 'es2017',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('katex')) {
            return 'vendor-katex';
          }

          if (id.includes('/lexical/') || id.includes('@lexical')) {
            return 'vendor-lexical';
          }

          if (id.includes('@fullcalendar')) {
            return 'vendor-fullcalendar';
          }

          if (id.includes('@jitsi')) {
            return 'vendor-jitsi';
          }

          if (id.includes('desmos')) {
            return 'vendor-desmos';
          }

          if (id.includes('@microsoft/signalr')) {
            return 'vendor-signalr';
          }

          if (id.includes('react-spinners')) {
            return 'vendor-spinners';
          }

          if (id.includes('axios-retry') || id.includes('/axios/')) {
            return 'vendor-http';
          }

          return undefined;
        },
      },
    },
  },
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
