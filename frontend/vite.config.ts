import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rpc': {
        target: 'https://polygon-amoy.blockpi.network/v1/rpc/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
      }
    }
  }
})