import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { createPng, createPNGEntries } from '../src/png.ts'
import { createTestPNG } from './icons/png-file.ts'


describe('createPng', () => {
  it('should create png with specified size', async () => {
    const input = Buffer.from(await createTestPNG())
    
    const png = await createPng(input, 128)
    
    const metadata = await sharp(png)
      .metadata()
    
    expect(metadata.format)
      .toBe('png')
    
    expect(metadata.width)
      .toBe(128)
    
    expect(metadata.height)
      .toBe(128)
  })
  
  it('should keep transparent background', async () => {
    const png = await createPng(
      await createTestPNG(0),
      128,
    )
    
    const { data, info } =
      await sharp(png)
        .raw()
        .toBuffer({
          resolveWithObject: true,
        })
    
    expect(info.channels).toBe(4)
    expect(data[3]).toBe(0)
  })
})

describe('createPNGEntries', () => {
  it('should create multiple png entries', async () => {
    const entries =
      await createPNGEntries(
        await createTestPNG(),
        [
          16,
          32,
          256,
        ],
      )
    
    expect(entries).toHaveLength(3)
    
    expect(entries.map(item => item.size))
      .toEqual([
        16,
        32,
        256,
      ])
    
    for (const entry of entries) {
      const metadata = await sharp(entry.data).metadata()
      
      expect(metadata.width).toBe(entry.size)
      expect(metadata.height).toBe(entry.size)
    }
  })
})
