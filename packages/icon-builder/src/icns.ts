import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SharpInput } from 'sharp'
import { createPng } from './png.ts'


export type IcnsType = 'icp4' | 'icp5' | 'icp6' | 'ic07' | 'ic08' | 'ic09' | 'ic10'

export type IcnsSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024

export interface ICNSBlock {
  type: IcnsType
  size: IcnsSize
  data: Buffer
}

export interface ICNSImage {
  type: IcnsType
  width: number
  height: number
  data: Buffer
}


const ICNS_TYPES: Record<number, IcnsType> = {
  16: 'icp4',
  32: 'icp5',
  64: 'icp6',
  128: 'ic07',
  256: 'ic08',
  512: 'ic09',
  1024: 'ic10',
}
const ICNS_SIZES: Record<IcnsType, number> = {
  icp4: 16,
  icp5: 32,
  icp6: 64,
  ic07: 128,
  ic08: 256,
  ic09: 512,
  ic10: 1024,
}

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


const createICNSHeader = (size: number): Buffer => {
  const buffer = Buffer.alloc(ICNS_HEADER_SIZE)
  
  // header magic
  buffer.write(ICNS_HEADER_MAGIC, ICNS_HEADER_MAGIC_OFFSET, ICNS_HEADER_MAGIC_SIZE, 'ascii')
  // total size
  buffer.writeUInt32BE(size, ICNS_HEADER_TOTAL_SIZE_OFFSET)
  
  return buffer
}

const createICNSBlock = (block: ICNSBlock): Buffer => {
  const size = block.data.length + ICNS_BLOCK_HEADER_SIZE
  const buffer = Buffer.alloc(size)
  
  // block type
  buffer.write(block.type, ICNS_BLOCK_TYPE_OFFSET, ICNS_BLOCK_TYPE_SIZE, 'ascii')
  // block size
  buffer.writeUInt32BE(size, ICNS_BLOCK_SIZE_OFFSET)
  
  block.data.copy(buffer, ICNS_BLOCK_DATA_OFFSET)
  
  return buffer
}


export const createICNSBlocks = (input: SharpInput, sizes: IcnsSize[]): Promise<ICNSBlock[]> => {
  return Promise.all(
    sizes.map(async size => {
      const data = await createPng(input, size)
      return { type: ICNS_TYPES[size], size, data }
    }),
  )
}

export const createICNS = (blocks: ICNSBlock[]): Buffer => {
  const blockData = blocks.map(createICNSBlock)
  
  const blocksSize = blockData.reduce((sum, block) => sum + block.length, 0)
  const totalSize = ICNS_HEADER_SIZE + blocksSize
  
  const header = createICNSHeader(totalSize)
  
  return Buffer.concat([
    header,
    ...blockData,
  ])
}

export const parseICNS = (buffer: Buffer): ICNSImage[] => {
  const images: ICNSImage[] = []
  
  if (buffer.length < ICNS_HEADER_SIZE) {
    throw new Error('Invalid ICNS file')
  }
  
  // header magic
  const header = buffer.toString('ascii', ICNS_HEADER_MAGIC_OFFSET, ICNS_HEADER_MAGIC_OFFSET + ICNS_HEADER_MAGIC_SIZE)
  if (header !== ICNS_HEADER_MAGIC) {
    throw new Error('Invalid ICNS file')
  }
  
  // total size
  const totalSize = buffer.readUInt32BE(ICNS_HEADER_TOTAL_SIZE_OFFSET)
  if (totalSize !== buffer.length) {
    throw new Error('Invalid ICNS file')
  }
  
  // -------------------------------------------------------------------------------------------------------------------
  
  let offset = ICNS_HEADER_SIZE
  while (offset < buffer.length) {
    if (offset + ICNS_BLOCK_HEADER_SIZE > buffer.length) {
      throw new Error('Invalid ICNS block')
    }
    
    const type = buffer.toString(
      'ascii',
      offset + ICNS_BLOCK_TYPE_OFFSET,
      offset + ICNS_BLOCK_TYPE_OFFSET + ICNS_BLOCK_TYPE_SIZE,
    ) as IcnsType
    
    const blockSize = buffer.readUInt32BE(offset + ICNS_BLOCK_SIZE_OFFSET)
    if (blockSize < ICNS_BLOCK_HEADER_SIZE) {
      throw new Error('Invalid ICNS block')
    }
    if (offset + blockSize > buffer.length) {
      throw new Error('Invalid ICNS image data')
    }
    
    const data = Buffer.from(buffer.subarray(offset + ICNS_BLOCK_DATA_OFFSET, offset + blockSize))
    
    const iconSize = ICNS_SIZES[type]
    if (iconSize) {
      images.push({
        type,
        width: iconSize,
        height: iconSize,
        data,
      })
    }
    
    offset += blockSize
  }
  
  return images
}

export const writeICNSImagesAsPNGs = async (buffer: Buffer, outDir: string): Promise<void> => {
  await mkdir(outDir, { recursive: true })
  
  for (const { width, height, data } of parseICNS(buffer)) {
    const file = join(outDir, `icon-${ width }x${ height }.png`)
    await writeFile(file, data)
  }
}
