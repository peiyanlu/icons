import sharp, { type SharpInput } from 'sharp'


export interface PNGEntry {
  size: number
  data: Buffer
}


export const createPng = (input: SharpInput, size: number): Promise<Buffer> => {
  return sharp(input)
    .resize(size, size, {
      fit: 'contain',
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    })
    .png({
      compressionLevel: 9,
    })
    .toBuffer()
}

export const createPNGEntries = (input: SharpInput, sizes: number[]): Promise<PNGEntry[]> => {
  return Promise.all(
    sizes.map(async size => {
      const data = await createPng(input, size)
      return { size, data }
    }),
  )
}
