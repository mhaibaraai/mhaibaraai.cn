import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url))
    }
  },
  test: {
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/utils/**', 'shared/**', 'scripts/**'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  }
})
