import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5000/api')
  }
})
