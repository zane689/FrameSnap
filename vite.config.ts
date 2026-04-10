import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // FFmpeg chunk - heavy library loaded on demand
          if (id.includes('@ffmpeg')) {
            return 'ffmpeg'
          }
          // React ecosystem chunk
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          // UI icons chunk
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          // Utilities chunk
          if (id.includes('jszip')) {
            return 'utils'
          }
        },
        // Optimize chunk file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || ''
          if (info.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
})
