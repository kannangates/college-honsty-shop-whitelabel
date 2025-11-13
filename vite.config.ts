import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// For environment variables in client-side code
declare global {
  interface Window {
    __ENV: Record<string, string>;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // In production, we'll use window.__ENV for environment variables
  // In development, we'll use process.env directly
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Group React and related libraries
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react')) {
              return 'react-core';
            }
            // Group UI libraries
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
            // Group date libraries
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            // Group form handling libraries
            if (id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            // Group animation libraries
            if (id.includes('framer-motion') || id.includes('embla-carousel')) {
              return 'animation-vendor';
            }
            // Group Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Group other node_modules
            return 'vendor';
          }
          // Group all components in the components directory
          if (id.includes('/src/components/')) {
            return 'components';
          }
          // Group all pages
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    minify: 'esbuild',
    sourcemap: true,
    cssCodeSplit: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'College Honesty Shop',
        short_name: 'HonestyShop',
        description: 'A platform for college honesty shop management',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
    mode === 'development' && componentTagger(),
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundle-analyzer-report.html',
    }),
  ].filter(Boolean),
  define: {
    // Make process.env available in the browser
    'process.env': {
      NODE_ENV: JSON.stringify(mode),
    },
    // Global variable for browser
    'global': 'window',
    // For compatibility with some libraries
    'process.browser': true,
    'window.process': {
      env: { NODE_ENV: JSON.stringify(mode) }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Replace lodash with lodash-es for better tree shaking
      'lodash': 'lodash-es',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
}));
