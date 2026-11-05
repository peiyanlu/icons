import { defineConfig, mergeConfig } from 'vitest/config'
import sharedConfig from './vitest.shared.config.mjs'


export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: {
              label: 'scenario',
              color: 'green',
            },
            setupFiles: [],
            include: [ '**/tests/**/*.{test,spec}.{ts,mts}' ],
          },
        },
      ],
    },
  }),
)
