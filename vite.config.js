import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 9099,
    },
    preview: {
      host: '0.0.0.0',
      port: isDev ? 9099 : 8099,
    },
  }
})