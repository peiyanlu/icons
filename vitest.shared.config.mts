import { defineConfig } from 'vitest/config'


export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
    },
    env: {
      // FORCE_COLOR: '0'
    },
  },
})
