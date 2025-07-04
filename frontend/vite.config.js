import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:5000"
        }
    },
    plugins: [react(), tailwind()],
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})