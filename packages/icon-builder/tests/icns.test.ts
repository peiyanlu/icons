import { createTempWorkspace } from '@peiyanlu/test-tools'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createICNS,
  createICNSBlocks,
  type ICNSBlock,
  type IcnsSize,
  type IcnsType,
  parseICNS,
  writeICNSImagesAsPNGs,
} from '../src/icns.ts'
import { createPng } from '../src/png.ts'
import { createTestPNG } from './icons/png-file.ts'


const { path, remove } = createTempWorkspace()

afterEach(() => {
  remove()
})


// ICNS file header
const ICNS_HEADER_SIZE = 8
const ICNS_HEADER_MAGIC = 'icns'
const ICNS_HEADER_MAGIC_SIZE = 4
const ICNS_HEADER_MAGIC_OFFSET = 0
const ICNS_HEADER_TOTAL_SIZE_OFFSET = 4


// ICNS block
const ICNS_BLOCK_HEADER_SIZE = 8
const ICNS_BLOCK_TYPE_SIZE = 4
const ICNS_BLOCK_TYPE_OFFSET = 0
const ICNS_BLOCK_SIZE_OFFSET = 4
const ICNS_BLOCK_DATA_OFFSET = 8


describe('ICNS', () => {
  it('should create and parse icns', () => {
    const blocks: ICNSBlock[] = [
      {
        type: 'ic07',
        size: 128,
        data: Buffer.from([ 1, 2, 3 ]),
      },
      {
        type: 'ic08',
        size: 256,
        data: Buffer.from([ 4, 5, 6 ]),
      },
    ]
    
    const buffer = createICNS(blocks)
    
    const images = parseICNS(buffer)
    
    expect(images).toHaveLength(2)
    
    expect(images).toEqual([
      {
        type: 'ic07',
        width: 128,
        height: 128,
        data: Buffer.from([ 1, 2, 3 ]),
      },
      {
        type: 'ic08',
        width: 256,
        height: 256,
        data: Buffer.from([ 4, 5, 6 ]),
      },
    ])
  })
  
  it('should preserve png data', async () => {
    const png = await createPng(await createTestPNG(), 128)
    
    const buffer = createICNS([
      {
        type: 'ic07',
        size: 128,
        data: png,
      },
    ])
    
    const images = parseICNS(buffer)
    
    expect(images[0].data).toEqual(png)
  })
  
  it('should reject invalid header magic', () => {
    const buffer = Buffer.alloc(8)
    
    buffer.write('xxxx', ICNS_HEADER_MAGIC_OFFSET, ICNS_HEADER_MAGIC_SIZE, 'ascii')
    buffer.writeUInt32BE(buffer.length, ICNS_HEADER_TOTAL_SIZE_OFFSET)
    
    expect(() => parseICNS(buffer))
      .toThrow('Invalid ICNS file')
  })
  
  it('should reject incomplete ICNS block header', () => {
    const buffer = Buffer.alloc(
      ICNS_HEADER_SIZE + ICNS_BLOCK_HEADER_SIZE - 1,
    )
    
    // ICNS header
    buffer.write(
      ICNS_HEADER_MAGIC,
      ICNS_HEADER_MAGIC_OFFSET,
      ICNS_HEADER_MAGIC_SIZE,
      'ascii',
    )
    
    buffer.writeUInt32BE(
      buffer.length,
      ICNS_HEADER_TOTAL_SIZE_OFFSET,
    )
    
    expect(() => {
      parseICNS(buffer)
    }).toThrow('Invalid ICNS block')
  })
  
  it('should accept empty ICNS', () => {
    const buffer = Buffer.alloc(ICNS_HEADER_SIZE)
    
    buffer.write(
      ICNS_HEADER_MAGIC,
      ICNS_HEADER_MAGIC_OFFSET,
      ICNS_HEADER_MAGIC_SIZE,
      'ascii',
    )
    
    buffer.writeUInt32BE(ICNS_HEADER_SIZE, ICNS_HEADER_TOTAL_SIZE_OFFSET)
    
    expect(parseICNS(buffer)).toEqual([])
  })
  
  it('should reject invalid total size', () => {
    const buffer = Buffer.alloc(ICNS_HEADER_SIZE)
    
    buffer.write(
      ICNS_HEADER_MAGIC,
      ICNS_HEADER_MAGIC_OFFSET,
      ICNS_HEADER_MAGIC_SIZE,
      'ascii',
    )
    // 8 -> 100
    buffer.writeUInt32BE(100, ICNS_HEADER_TOTAL_SIZE_OFFSET)
    
    expect(() => parseICNS(buffer)).toThrow('Invalid ICNS file')
  })
  
  it('should reject block data exceeding buffer size', () => {
    const buffer = Buffer.alloc(ICNS_HEADER_SIZE + ICNS_BLOCK_HEADER_SIZE)
    
    // ICNS header
    buffer.write(
      ICNS_HEADER_MAGIC,
      ICNS_HEADER_MAGIC_OFFSET,
      ICNS_HEADER_MAGIC_SIZE,
      'ascii',
    )
    buffer.writeUInt32BE(
      buffer.length,
      ICNS_HEADER_TOTAL_SIZE_OFFSET,
    )
    
    // block header
    const blockOffset = ICNS_HEADER_SIZE
    buffer.write(
      'ic07',
      blockOffset + ICNS_BLOCK_TYPE_OFFSET,
      ICNS_BLOCK_TYPE_SIZE,
      'ascii',
    )
    
    buffer.writeUInt32BE(
      ICNS_BLOCK_HEADER_SIZE + 1,
      blockOffset + ICNS_BLOCK_SIZE_OFFSET,
    )
    
    expect(() => parseICNS(buffer))
      .toThrow('Invalid ICNS image data')
  })
  
  it('should reject invalid ICNS block size (smaller than header)', () => {
    const buffer = Buffer.alloc(ICNS_HEADER_SIZE + ICNS_BLOCK_HEADER_SIZE)
    
    // ICNS header
    buffer.write(
      ICNS_HEADER_MAGIC,
      ICNS_HEADER_MAGIC_OFFSET,
      ICNS_HEADER_MAGIC_SIZE,
      'ascii',
    )
    buffer.writeUInt32BE(
      buffer.length,
      ICNS_HEADER_TOTAL_SIZE_OFFSET,
    )
    
    // block header
    const blockOffset = ICNS_HEADER_SIZE
    buffer.write(
      'ic07',
      blockOffset + ICNS_BLOCK_TYPE_OFFSET,
      ICNS_BLOCK_TYPE_SIZE,
      'ascii',
    )
    
    buffer.writeUInt32BE(
      ICNS_BLOCK_HEADER_SIZE - 1,
      blockOffset + ICNS_BLOCK_SIZE_OFFSET,
    )
    
    expect(() => parseICNS(buffer))
      .toThrow('Invalid ICNS block')
  })
  
  it('should ignore unknown block type', () => {
    const buffer = createICNS([
      {
        type: 'test' as IcnsType,
        size: 100 as IcnsSize,
        data: Buffer.from([ 1 ]),
      },
    ])
    
    const images = parseICNS(buffer)
    
    expect(images).toEqual([])
  })
  
  it('should reject ICNS file smaller than header', () => {
    const buffer = Buffer.alloc(ICNS_HEADER_SIZE - 1)
    
    expect(() => parseICNS(buffer)).toThrow('Invalid ICNS file')
  })
  
  it('should create icns blocks', async () => {
    const blocks = await createICNSBlocks(
      await createTestPNG(),
      [ 128, 256 ],
    )
    
    expect(blocks).toHaveLength(2)
    
    expect(blocks[0].type).toBe('ic07')
    expect(blocks[1].type).toBe('ic08')
  })
  
  it('should parse and write icns to png', async () => {
    const input = await createTestPNG()
    
    const sizes: IcnsSize[] = [ 1024, 512, 256, 128, 64, 32, 16 ]
    const entries = await createICNSBlocks(input, sizes)
    const buffer = createICNS(entries)
    
    const outDir = join(path, 'output')
    await writeICNSImagesAsPNGs(buffer, outDir)
    
    expect(readdirSync(outDir)).toEqual(
      expect.arrayContaining([
        ...sizes.map(size => `icon-${ size }x${ size }.png`),
      ]),
    )
    expect(readdirSync(outDir).length).toBe(sizes.length)
  })
})
