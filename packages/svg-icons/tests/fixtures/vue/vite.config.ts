import vue from '@vitejs/plugin-vue'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { vitePlugin } from '../../../src/vite.ts'


// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue(),
    vitePlugin({
      iconDirs: [ './svg-icons' ],
      symbolId: 'symbol-[dir]-[name]',
      domId: 'svg-icons-dom',
      dts: join(import.meta.dirname, './src/svg-icons.d.ts')
    }),
  ],
})
