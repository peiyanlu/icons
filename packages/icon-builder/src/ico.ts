import type { SharpInput } from 'sharp'
import { createPng } from './png.ts'


export type IcoSize = 16 | 20 | 24 | 32 | 40 | 48 | 64 | 96 | 128 | 256

export interface ICOEntry {
  size: IcoSize
  data: Buffer
}

export interface ICOImage {
  width: number
  height: number
  data: Buffer
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


const createICOHeader = (count: number): Buffer => {
  const buffer = Buffer.alloc(ICO_HEADER_SIZE)
  
  // Reserved
  buffer.writeUInt16LE(0, ICO_RESERVED_OFFSET)
  // ICO type
  buffer.writeUInt16LE(1, ICO_TYPE_OFFSET)
  // image count
  buffer.writeUInt16LE(count, ICO_ENTRY_COUNT_OFFSET)
  
  return buffer
}

const createICOEntry = (entry: ICOEntry, offset: number): Buffer => {
  const buffer = Buffer.alloc(ICO_ENTRY_SIZE)
  
  const size = entry.size >= ICO_ICON_MAX_SIZE ? 0 : entry.size
  
  // width
  buffer.writeUInt8(size, ICO_ENTRY_WIDTH_OFFSET)
  // height
  buffer.writeUInt8(size, ICO_ENTRY_HEIGHT_OFFSET)
  
  // color palette
  buffer.writeUInt8(0, 2)
  // reserved
  buffer.writeUInt8(0, 3)
  
  // color planes
  buffer.writeUInt16LE(1, 4)
  // bits per pixel
  buffer.writeUInt16LE(32, 6)
  
  // PNG data size
  buffer.writeUInt32LE(entry.data.length, ICO_ENTRY_DATA_SIZE_OFFSET)
  // PNG data offset
  buffer.writeUInt32LE(offset, ICO_ENTRY_DATA_OFFSET)
  
  return buffer
}


export const createICOEntries = (input: SharpInput, sizes: IcoSize[]): Promise<ICOEntry[]> => {
  return Promise.all(
    sizes.map(async size => {
      const data = await createPng(input, size)
      return { size, data }
    }),
  )
}

export const createICO = (entries: ICOEntry[]): Buffer => {
  const header = createICOHeader(entries.length)
  
  let offset = ICO_HEADER_SIZE + ICO_ENTRY_SIZE * entries.length
  
  const directories: Buffer[] = []
  const imagesData: Buffer[] = []
  for (const image of entries) {
    directories.push(createICOEntry(image, offset))
    imagesData.push(image.data)
    offset += image.data.length
  }
  
  return Buffer.concat([
    header,
    ...directories,
    ...imagesData,
  ])
}

export const parseICO = (buffer: Buffer): ICOImage[] => {
  const images: ICOImage[] = []
  
  if (buffer.length < ICO_HEADER_SIZE) {
    throw new Error('Invalid ICO file')
  }
  
  // reserved & icon type
  const reserved = buffer.readUInt16LE(ICO_RESERVED_OFFSET)
  const type = buffer.readUInt16LE(ICO_TYPE_OFFSET)
  if (reserved !== 0 || type !== 1) {
    throw new Error('Invalid ICO file')
  }
  
  // image count
  const count = buffer.readUInt16LE(ICO_ENTRY_COUNT_OFFSET)
  
  // -------------------------------------------------------------------------------------------------------------------
  
  const directorySize = ICO_HEADER_SIZE + count * ICO_ENTRY_SIZE
  if (directorySize > buffer.length) {
    throw new Error('Invalid ICO directory')
  }
  
  for (let i = 0; i < count; i++) {
    const entryOffset = ICO_HEADER_SIZE + i * ICO_ENTRY_SIZE
    
    const width = buffer.readUInt8(entryOffset + ICO_ENTRY_WIDTH_OFFSET) || ICO_ICON_MAX_SIZE
    const height = buffer.readUInt8(entryOffset + ICO_ENTRY_HEIGHT_OFFSET) || ICO_ICON_MAX_SIZE
    
    const size = buffer.readUInt32LE(entryOffset + ICO_ENTRY_DATA_SIZE_OFFSET)
    const offset = buffer.readUInt32LE(entryOffset + ICO_ENTRY_DATA_OFFSET)
    
    if (offset + size > buffer.length) {
      throw new Error('Invalid ICO image data')
    }
    
    const data = Buffer.from(buffer.subarray(offset, offset + size))
    
    images.push({ width, height, data })
  }
  
  return images
}
