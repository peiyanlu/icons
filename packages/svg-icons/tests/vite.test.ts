import { join, resolve } from 'node:path'
import { build } from 'vite'
import { expect, it, vi } from 'vitest'
import { vitePlugin } from '../src/vite.js'


const mocks = vi.hoisted(() => ({
  createVueComponent: vi.fn(),
  createVueComponentType: vi.fn(),
  createReactComponent: vi.fn(),
  createReactComponentType: vi.fn(),
}))

vi.mock('../src/components.js', () => mocks)


it('should resolve virtual modules', () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
  })
  
  expect(plugin.resolveId?.('virtual:svg-icons-sprite'))
    .toBe('\0virtual:svg-icons-sprite')
})

it('should load names module', async () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
  })
  
  const result = await plugin.load?.('\0virtual:svg-icons-names', { ssr: false })
  
  expect(result).toContain('export default []')
})

it('should load sprite module', async () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
  })
  
  const result = await plugin.load?.('\0virtual:svg-icons-sprite', { ssr: false })
  
  expect(result).toContain('svg-icons-dom')
})

it('should load component module', async () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
  })
  
  await plugin.load?.('\0virtual:svg-icons-component/vue', { ssr: false })
  
  expect(mocks.createVueComponent).toHaveBeenCalled()
  
  await plugin.load?.('\0virtual:svg-icons-component/react', { ssr: false })
  
  expect(mocks.createReactComponent).toHaveBeenCalled()
})

it('should support ssr', async () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
  })
  
  const result = await plugin.load?.('\0virtual:svg-icons-register', { ssr: true })
  
  expect(result).toContain('export default {}')
})

it('should support hmr', () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
    dts: join(__dirname, './cache/svg-icons-hmr.d.ts'),
  })
  
  const server = {
    ws: {
      send: vi.fn(),
    },
  } as any
  
  plugin.handleHotUpdate({
    file: 'icons/vite.svg',
    server,
  })
  
  expect(server.ws.send)
    .toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'svg-icons:update',
      }),
    )
})

it('should resolve config', async () => {
  const plugin: any = vitePlugin({
    iconDirs: [
      './icons',
    ],
    dts: join(__dirname, './cache/svg-icons.d.ts'),
  })
  const config = {
    plugins: [
      { name: 'vite:vue' },
      { name: 'vite:react' },
    ],
  }
  
  plugin.configResolved(config)
  
  expect(mocks.createVueComponentType).toHaveBeenCalled()
  expect(mocks.createReactComponentType).toHaveBeenCalled()
})

it('should build vue project', async () => {
  const root = resolve(__dirname, 'fixtures/vue')
  
  await build({
    root,
  })
})
