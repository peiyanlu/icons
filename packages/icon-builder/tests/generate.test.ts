import { createTempWorkspace } from '@peiyanlu/test-tools'
import { readFileSync } from 'fs'
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
  ICO_SIZES,
  parseICNS,
  parseICO,
  PNG_SIZES,
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
    expect(files).toEqual([
      'icon-1024x1024.png',
      'icon-128x128.png',
      'icon-16x16.png',
      'icon-256x256.png',
      'icon-32x32.png',
      'icon-512x512.png',
      'icon-64x64.png',
      'icon.png',
    ])
    expect(files.length).toBe(PNG_SIZES.length + 1)
  })
  
  it('uses the configured name for PNG files', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generatePNG(input, outputDir, { name: 'app' })
    
    expect(await readdir(outputDir)).toEqual([
      'app-1024x1024.png',
      'app-128x128.png',
      'app-16x16.png',
      'app-256x256.png',
      'app-32x32.png',
      'app-512x512.png',
      'app-64x64.png',
      'app.png',
    ])
  })
  
  it('generates only the configured PNG sizes', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    
    await generatePNG(input, outputDir, {
      sizes: [ 256, 512, 1024 ],
    })
    
    expect(await readdir(outputDir)).toEqual([
      'icon-1024x1024.png',
      'icon-256x256.png',
      'icon-512x512.png',
      'icon.png',
    ])
  })
  
  it('omits the base PNG when 1024 is not requested', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'omits')
    
    await generatePNG(input, outputDir, {
      sizes: [ 256, 512 ],
    })
    
    expect(await readdir(outputDir)).toEqual([
      'icon-256x256.png',
      'icon-512x512.png',
    ])
  })
})

describe('generateICO', () => {
  it('generates an ICO file with the default name', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generateICO(input, outputDir)
    
    expect(await readdir(outputDir)).toEqual([
      'icon.ico',
    ])
    
    const ico = readFileSync(join(outputDir, 'icon.ico'))
    expect(parseICO(ico).length).toBe(ICO_SIZES.length)
  })
  
  it('uses the configured name for the ICO file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generateICO(input, outputDir, { name: 'app' })
    
    expect(await readdir(outputDir)).toEqual([
      'app.ico',
    ])
  })
  
  it('includes the configured sizes in the ICO file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    
    await generateICO(input, outputDir, {
      sizes: [ 64, 96, 128 ],
    })
    
    expect(await readdir(outputDir)).toEqual([
      'icon.ico',
    ])
    
    const ico = readFileSync(join(outputDir, 'icon.ico'))
    expect(parseICO(ico).map(k => k.width)).toEqual([
      64,
      96,
      128,
    ])
    expect(parseICO(ico).length).toBe(3)
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
    
    const icns = readFileSync(join(outputDir, 'icon.icns'))
    expect(parseICNS(icns).length).toBe(ICNS_SIZES.length)
  })
  
  it('uses the configured name for the ICNS file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'rename')
    
    await generateICNS(input, outputDir, { name: 'app' })
    
    expect(await readdir(outputDir)).toEqual([
      'app.icns',
    ])
  })
  
  it('includes the configured sizes in the ICNS file', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'sizes')
    
    await generateICNS(input, outputDir, {
      sizes: [ 128, 256, 512 ],
    })
    
    expect(await readdir(outputDir)).toEqual([
      'icon.icns',
    ])
    
    const icns = readFileSync(join(outputDir, 'icon.icns'))
    expect(parseICNS(icns).map(k => k.width)).toEqual([
      128,
      256,
      512,
    ])
    expect(parseICNS(icns).length).toBe(3)
  })
})

describe('generate', () => {
  it('generates PNG, ICO, and ICNS icons by default', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'default')
    
    await generate(input, outputDir)
    
    expect(await readdir(outputDir)).toEqual([
      'icon-1024x1024.png',
      'icon-128x128.png',
      'icon-16x16.png',
      'icon-256x256.png',
      'icon-32x32.png',
      'icon-512x512.png',
      'icon-64x64.png',
      'icon.icns',
      'icon.ico',
      'icon.png',
    ])
  })
  
  it('generates only the enabled icon formats', async () => {
    const input = await createTestPNG()
    const outputDir = join(path, 'omits')
    
    await generate(input, outputDir, { png: false, icns: false })
    await generate(input, outputDir, { ico: false })
    
    expect(await readdir(outputDir)).toEqual([
      'icon-1024x1024.png',
      'icon-128x128.png',
      'icon-16x16.png',
      'icon-256x256.png',
      'icon-32x32.png',
      'icon-512x512.png',
      'icon-64x64.png',
      'icon.icns',
      'icon.ico',
      'icon.png',
    ])
  })
})
