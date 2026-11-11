import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5174

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    server: {
      port,
      strictPort: true
    },
    build: {
      outDir: fileURLToPath(new URL('../backend/public', import.meta.url)),
      emptyOutDir: true
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
