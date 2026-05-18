import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['src/__tests__/unit/**/*.test.ts', 'src/__tests__/unit/**/*.test.tsx'],
    exclude: ['src/__tests__/integration/**', 'src/__tests__/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/config/**'],
      exclude: ['node_modules/**', 'src/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
