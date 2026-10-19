import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
    base: "/",
    plugins: [react({ babel: { babelrc: false, configFile: false } })],
    define: {
        'import.meta.env.VITE_YENV': JSON.stringify(process.env.YENV || ""),
    },
    esbuild: {
        target: 'es2015',
    },
    build: {
        manifest: true,
        target: 'es2015',
        rollupOptions: {
            output: {
                onlyExplicitManualChunks: true,
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
                        return 'vendor-react';
                    }

                    if (/\/node_modules\/(react-router|react-router-dom)\//.test(id)) {
                        return 'vendor-router';
                    }

                    if (id.includes('@emotion/')) {
                        return 'vendor-styles';
                    }

                    if (id.includes('@tanstack/')) {
                        return 'vendor-query';
                    }

                    if (id.includes('katex')) {
                        return 'vendor-katex';
                    }

                    if (id.includes('/lexical/') || id.includes('@lexical') || /\/node_modules\/prismjs\//.test(id)) {
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
    preview: {
        proxy: process.env.CI_BACKEND_URL ? {
            '/api': process.env.CI_BACKEND_URL,
            '/health': process.env.CI_BACKEND_URL,
            '/chatHub': { target: process.env.CI_BACKEND_URL, ws: true },
            '/directChatHub': { target: process.env.CI_BACKEND_URL, ws: true },
        } : undefined,
    },
    resolve: {
        alias: {
            "src": path.resolve(__dirname, "./src"),
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
