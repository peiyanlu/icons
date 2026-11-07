import { createTempWorkspace } from '@peiyanlu/test-tools'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'
import {
  generate,
  generateICNS,
  generateICO,
  generatePNG,
  ICNS_SIZES,
  type IcnsSize,
  ICO_SIZES,
  type IcoSize,
  parseICNS,
  parseICO,
  PNG_SIZES,
  type PngSize,
} from '../src/index.ts'


const createTestPNG = async (alpha = 1): Promise<Buffer<ArrayBuffer>> => {
  return sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: {
        r: 255,
        g: 0,
        b: 0,
        alpha,
      },
    },
  })
    .png()
    .toBuffer()
}

const { path, remove } = createTempWorkspace()

afterEach(() => {
  remove()
})


describe('generatePNG', () => {
  it('generates the default PNG icon sizes', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generatePNG(input, outputDir)
    
    const files = await readdir(outputDir)
    expect(files).toEqual(
      expect.arrayContaining([
        ...PNG_SIZES.map(size => `icon-${ size }x${ size }.png`),
        ...[ 'png' ].map(ext => `icon.${ ext }`),
      ]),
    )
    expect(files.length).toBe(PNG_SIZES.length + 1)
  })
  
  it('uses the configured name for PNG files', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generatePNG(input, outputDir, { name: 'app' })
    
    const files = await readdir(outputDir)
    expect(files).toEqual(
      expect.arrayContaining([
        ...PNG_SIZES.map(size => `app-${ size }x${ size }.png`),
        ...[ 'png' ].map(ext => `app.${ ext }`),
      ]),
    )
    expect(files.length).toBe(PNG_SIZES.length + 1)
  })
  
  it('generates only the configured PNG sizes', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    const customSizes: PngSize[] = [ 256, 512, 1024 ]
    
    await generatePNG(input, outputDir, {
      sizes: customSizes,
    })
    
    const files = await readdir(outputDir)
    expect(files).toEqual(
      expect.arrayContaining([
        ...customSizes.map(size => `icon-${ size }x${ size }.png`),
        ...[ 'png' ].map(ext => `icon.${ ext }`),
      ]),
    )
    expect(files.length).toBe(customSizes.length + 1)
  })
  
  it('omits the base PNG when 1024 is not requested', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'omits')
    const customSizes: PngSize[] = [ 256, 512 ]
    
    await generatePNG(input, outputDir, {
      sizes: customSizes,
    })
    
    const files = await readdir(outputDir)
    expect(files).toEqual(
      expect.arrayContaining([
        ...customSizes.map(size => `icon-${ size }x${ size }.png`),
      ]),
    )
    expect(files.length).toBe(customSizes.length)
  })
})

describe('generateICO', () => {
  it('generates an ICO file with the default name', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generateICO(input, outputDir)
    
    expect(await readdir(outputDir)).toEqual([ 'icon.ico' ])
    
    const ico = parseICO(readFileSync(join(outputDir, 'icon.ico')))
    expect(ico.map(k => k.width)).toEqual(ICO_SIZES)
    expect(ico.length).toBe(ICO_SIZES.length)
  })
  
  it('uses the configured name for the ICO file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generateICO(input, outputDir, { name: 'app' })
    
    expect(await readdir(outputDir)).toEqual([ 'app.ico' ])
  })
  
  it('includes the configured sizes in the ICO file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    const customSizes: IcoSize[] = [ 64, 96, 128 ]
    
    await generateICO(input, outputDir, {
      sizes: customSizes,
    })
    
    expect(await readdir(outputDir)).toEqual([ 'icon.ico' ])
    
    const ico = parseICO(readFileSync(join(outputDir, 'icon.ico')))
    expect(ico.map(k => k.width)).toEqual(customSizes)
    expect(ico.length).toBe(customSizes.length)
  })
})

describe('generateICNS', () => {
  it('generates an ICNS file with the default name', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generateICNS(input, outputDir)
    
    expect(await readdir(outputDir)).toEqual([
      'icon.icns',
    ])
    
    const icns = parseICNS(readFileSync(join(outputDir, 'icon.icns')))
    expect(icns.map(k => k.width)).toEqual(ICNS_SIZES)
    expect(icns.length).toBe(ICNS_SIZES.length)
  })
  
  it('uses the configured name for the ICNS file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generateICNS(input, outputDir, { name: 'app' })
    
    expect(await readdir(outputDir)).toEqual([ 'app.icns' ])
  })
  
  it('includes the configured sizes in the ICNS file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    const customSizes: IcnsSize[] = [ 128, 256, 512 ]
    
    await generateICNS(input, outputDir, {
      sizes: customSizes,
    })
    
    expect(await readdir(outputDir)).toEqual([ 'icon.icns' ])
    
    const icns = parseICNS(readFileSync(join(outputDir, 'icon.icns')))
    expect(icns.map(k => k.width)).toEqual(customSizes)
    expect(icns.length).toBe(customSizes.length)
  })
})

describe('generate', () => {
  it('generates PNG, ICO, and ICNS icons by default', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generate(input, outputDir)
    
    expect(await readdir(outputDir)).toEqual(
      expect.arrayContaining([
        ...PNG_SIZES.map(size => `icon-${ size }x${ size }.png`),
        ...[ 'icns', 'ico', 'png' ].map(ext => `icon.${ ext }`),
      ]),
    )
  })
  
  it('generates only the enabled icon formats', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'omits')
    
    await generate(input, outputDir, { png: false, icns: false })
    await generate(input, outputDir, { ico: false })
    
    expect(await readdir(outputDir)).toEqual(
      expect.arrayContaining([
        ...PNG_SIZES.map(size => `icon-${ size }x${ size }.png`),
        ...[ 'icns', 'ico', 'png' ].map(ext => `icon.${ ext }`),
      ]),
    )
  })
})
