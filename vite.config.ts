import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('lucide-react') || id.includes('shadcn')) return 'vendor-ui'
            if (id.includes('@tanstack')) return 'vendor-react-query'
            if (id.includes('@supabase')) return 'vendor-supabase'
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean) as []
,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
