import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js is ~945 KB unavoidably for a 3D star field — it's lazy-loaded
    // after first paint in App.jsx so it doesn't block LCP. We raise the
    // warning threshold so legitimate three.js bundles don't trigger the
    // chunk warning on every build.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', 'maath'],
          motion: ['motion'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
