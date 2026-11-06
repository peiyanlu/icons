import { isInDir, scanFiles } from '@peiyanlu/node-utils'
import { newline } from '@peiyanlu/ts-utils'
import { readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, parse, relative, sep } from 'node:path'
import { optimize } from 'svgo'
import { type Plugin, type ViteDevServer } from 'vite'
import {
  createReactComponent,
  createReactComponentType,
  createVueComponent,
  createVueComponentType,
} from './components.ts'
import { createNamesCode, createNamesType } from './names.ts'
import { createRegisterCode, createRegisterType } from './register.ts'
import { createSpriteCode, createSpriteType } from './sprite.ts'


export interface SvgIconsOptions {
  iconDirs: string[];
  domId?: string;
  symbolId?: string;
  dts?: string;
}

export interface SpriteMeta {
  symbols: string;
  ids: Set<string>;
  names: Set<string>;
  domId: string;
}


const viteHmr = () => {
  return `
    if (import.meta.hot) {
      import.meta.hot.on(
        'svg-icons:update',
        ({ domId, symbols }) => loadSvg(domId, symbols)
      )
    }
  `
}


const normalizeSymbolId = (id: string): string => id
  .replace(/[\s'‘’]/g, '')
  .replace(/["&<>()[\]{}（）【】]/g, '_')

const generateSymbolId = (template: string, dir: string, name: string): string => {
  return normalizeSymbolId(
    template.replace(/\[dir]/g, dir)
      .replace(/-{2,}/g, '-')
      .replace(/\[name]/g, name),
  )
}

const generateSymbolName = (template: string, dir: string, name: string): string => {
  const tpl = !dir ? template.replace('[dir]-', '') : template
  return normalizeSymbolId(
    tpl.replace(/\[dir]/g, dir)
      .replace(/-{2,}/g, '-')
      .replace(/\[name]/g, name),
  )
}

const getAttribute = (str: string, attr: string, def: string): string => {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const reg = new RegExp(`\\b${ escaped }\\s*=\\s*["']([^"']*)["']`, 'i')
  const match = reg.exec(str)
  return match?.[1] ?? def
}

const normalizeDirName = (dir: string): string => {
  const name = dir.replaceAll(sep, '-')
  return name === '.' ? '' : name
}


const isIconFile = (iconDirs: string[], file: string): boolean => {
  return file.endsWith('.svg') && iconDirs.some(iconDir => isInDir(iconDir, file))
}

const svg2Symbol = (svg: string, id: string): string => {
  const reg = /<svg\s*\b([^>]*)\s*>([\s\S]*?)<\/svg\s*>/i
  const match = svg.match(reg)
  
  if (!match) return ''
  
  const [ attrs, els ] = match.slice(1, 3)
  
  const width = getAttribute(attrs, 'width', '1024')
  const height = getAttribute(attrs, 'height', '1024')
  const viewBox = getAttribute(attrs, 'viewBox', `0 0 ${ width } ${ height }`)
  
  return `<symbol id="${ id }" viewBox="${ viewBox }">${ els }</symbol>`
}

const createSvgSprite = (iconDirs: string[], symbolId?: string, domId?: string): SpriteMeta => {
  const ids = new Set<string>()
  const names = new Set<string>()
  const idSources = new Map<string, string>()
  
  const symbols = scanFiles(iconDirs, [ '**/*.svg' ])
    .map(({ file, dir }) => {
      const { dir: fileDir, name: fileName } = parse(file)
      const dirName = normalizeDirName(relative(dir, fileDir))
      
      const idTpl = symbolId ?? 'symbol-[dir]-[name]'
      const id = generateSymbolId(idTpl, dirName, fileName)
      const name = generateSymbolName('[dir]-[name]', dirName, fileName)
      
      const previousSource = idSources.get(id)
      if (previousSource) {
        throw new Error(`Duplicate SVG symbol id "${ id }" generated from "${ previousSource }" and "${ file }"`)
      }
      idSources.set(id, file)
      
      ids.add(id)
      names.add(name)
      
      const input = readFileSync(file, 'utf8')
      const { data: code } = optimize(input)
      return { code, id }
    })
    .map(({ code, id }) => svg2Symbol(code, id))
    .filter(Boolean)
    .join('')
  
  domId = domId ?? 'svg-icons-dom'
  
  return { symbols, ids, names, domId }
}

const resolved = (id: string): string => `\0${ id }`


export const vitePlugin = (options: SvgIconsOptions): Plugin => {
  const { iconDirs, symbolId, domId: _domId, dts } = options
  
  const SVG_ICONS_REGISTER = 'virtual:svg-icons-register'
  const SVG_ICONS_NAMES = 'virtual:svg-icons-names'
  const SVG_ICONS_SPRITE = 'virtual:svg-icons-sprite'
  const SVG_ICONS_COMPONENT_VUE = 'virtual:svg-icons-component/vue'
  const SVG_ICONS_COMPONENT_REACT = 'virtual:svg-icons-component/react'
  
  const types = new Map<string, string>()
  
  const x = () => {
    const { symbols, ids, names, domId } = createSvgSprite(iconDirs, symbolId, _domId)
    
    const registerCode = createRegisterCode(symbols, domId, viteHmr())
    const registerType = createRegisterType()
    types.set(SVG_ICONS_REGISTER, registerType)
    
    const namesCode = createNamesCode(names)
    const namesType = createNamesType(names)
    types.set(SVG_ICONS_NAMES, namesType)
    
    const spriteCode = createSpriteCode(symbols, domId)
    const spriteType = createSpriteType()
    types.set(SVG_ICONS_SPRITE, spriteType)
    
    return { registerCode, namesCode, spriteCode, symbols, domId }
  }
  
  const writeType = () => {
    const file = dts || join(import.meta.dirname, 'virtual.d.ts')
    const content = [ ...types.values() ].join(newline(2))
    
    writeFile(file, content).catch(console.error)
  }
  
  let { registerCode, namesCode, spriteCode, symbols, domId } = x()
  
  const onUpdate = (file: string, server: ViteDevServer) => {
    if (!isIconFile(iconDirs, file)) return
    
    ({ symbols, domId } = x())
    writeType()
    
    server.ws.send({
      type: 'custom',
      event: 'svg-icons:update',
      data: { domId, symbols },
    })
  }
  
  return {
    name: 'vite:svg-icons',
    configResolved(_cfg) {
      const is = (f: string) => _cfg.plugins.some(p => p.name.includes(f))
      
      const isVue = is('vite:vue')
      if (isVue) {
        types.set(SVG_ICONS_COMPONENT_VUE, createVueComponentType())
      }
      
      const isReact = is('vite:react')
      if (isReact) {
        types.set(SVG_ICONS_COMPONENT_REACT, createReactComponentType())
      }
      
      writeType()
    },
    resolveId(id) {
      const ids = [
        SVG_ICONS_REGISTER,
        SVG_ICONS_NAMES,
        SVG_ICONS_SPRITE,
        SVG_ICONS_COMPONENT_VUE,
        SVG_ICONS_COMPONENT_REACT,
      ]
      if (ids.includes(id)) {
        return resolved(id)
      }
    },
    load(id, options) {
      const isSSR = options?.ssr
      
      if (id === resolved(SVG_ICONS_REGISTER)) {
        return isSSR ? 'export default {}' : registerCode
      }
      
      if (id === resolved(SVG_ICONS_NAMES)) {
        return namesCode
      }
      
      if (id === resolved(SVG_ICONS_SPRITE)) {
        return spriteCode
      }
      
      if (id === resolved(SVG_ICONS_COMPONENT_VUE)) {
        return createVueComponent()
      }
      
      if (id === resolved(SVG_ICONS_COMPONENT_REACT)) {
        return createReactComponent()
      }
    },
    configureServer: (server) => {
      server.watcher.on('add', (file) => onUpdate(file, server))
      server.watcher.on('unlink', (file) => onUpdate(file, server))
    },
    handleHotUpdate({ file, server }) {
      onUpdate(file, server)
    },
  }
}
