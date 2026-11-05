import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { createICO, createICOEntries, type ICOEntry, parseICO } from '../src/ico.js'


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


const ICO_ICON_MAX_SIZE = 256

const ICO_HEADER_SIZE = 6
const ICO_ENTRY_SIZE = 16

const ICO_RESERVED_OFFSET = 0
const ICO_TYPE_OFFSET = 2

const ICO_ENTRY_COUNT_OFFSET = 4
const ICO_ENTRY_WIDTH_OFFSET = 0
const ICO_ENTRY_HEIGHT_OFFSET = 1
const ICO_ENTRY_DATA_SIZE_OFFSET = 8
const ICO_ENTRY_DATA_OFFSET = 12


describe('ICO', () => {
  it('should create and parse ico', () => {
    const entries: ICOEntry[] = [
      {
        size: 128,
        data: Buffer.from([ 1, 2, 3 ]),
      },
      {
        size: 256,
        data: Buffer.from([ 4, 5, 6 ]),
      },
    ]
    
    const buffer = createICO(entries)
    
    const images = parseICO(buffer)
    
    expect(images).toHaveLength(2)
    
    expect(images).toEqual([
      {
        width: 128,
        height: 128,
        data: Buffer.from([ 1, 2, 3 ]),
      },
      {
        width: 256,
        height: 256,
        data: Buffer.from([ 4, 5, 6 ]),
      },
    ])
  })
  
  it('should parse 256 icon size', async () => {
    const entries =
      [
        {
          size: 256,
          data: Buffer.from('png'),
        },
      ]
    
    const ico = createICO(entries)
    const images = parseICO(ico)
    
    expect(images[0].width).toBe(256)
    expect(images[0].height).toBe(256)
  })
  
  it('should reject invalid header', () => {
    const buffer = Buffer.alloc(ICO_HEADER_SIZE)
    
    buffer.writeUInt16LE(1, ICO_RESERVED_OFFSET)
    buffer.writeUInt16LE(1, ICO_TYPE_OFFSET)
    
    expect(() => parseICO(buffer))
      .toThrow('Invalid ICO file')
  })
  
  it('should reject invalid directory', () => {
    const buffer = Buffer.alloc(ICO_HEADER_SIZE)
    
    buffer.writeUInt16LE(0, ICO_RESERVED_OFFSET)
    buffer.writeUInt16LE(1, ICO_TYPE_OFFSET)
    buffer.writeUInt16LE(1, ICO_ENTRY_COUNT_OFFSET)
    
    expect(() => parseICO(buffer))
      .toThrow('Invalid ICO directory')
  })
  
  it('should accept empty ICO', () => {
    const buffer = Buffer.alloc(ICO_HEADER_SIZE)
    
    buffer.writeUInt16LE(0, ICO_RESERVED_OFFSET)
    buffer.writeUInt16LE(1, ICO_TYPE_OFFSET)
    buffer.writeUInt16LE(0, ICO_ENTRY_COUNT_OFFSET)
    
    expect(parseICO(buffer)).toEqual([])
  })
  
  it('should reject invalid image offset', () => {
    const buffer = createICO([
      {
        size: 32,
        data: Buffer.from([ 1 ]),
      },
    ])
    
    // (6 + 16 * 1 = 22) -> 99999
    buffer.writeUInt32LE(99999, ICO_HEADER_SIZE + ICO_ENTRY_DATA_OFFSET)
    
    expect(() => parseICO(buffer))
      .toThrow('Invalid ICO image data')
  })
  
  it('should reject ICO file smaller than header', () => {
    const buffer = Buffer.alloc(ICO_HEADER_SIZE - 1)
    
    expect(() => parseICO(buffer)).toThrow('Invalid ICO file')
  })
  
  it('should create ico entries', async () => {
    const input = await createTestPNG()
    
    const entries =
      await createICOEntries(
        input,
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
      const meta = await sharp(entry.data).metadata()
      
      expect(meta.format).toBe('png')
      expect(meta.width).toBe(entry.size)
      expect(meta.height).toBe(entry.size)
    }
  })
})
