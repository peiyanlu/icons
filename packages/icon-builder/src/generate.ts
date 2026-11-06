import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SharpInput } from 'sharp'
import { createICNS, createICNSBlocks, type IcnsSize } from './icns.ts'
import { createICO, createICOEntries, type IcoSize } from './ico.ts'
import { createPNGEntries, type PngSize } from './png.ts'


export interface GeneratePNGOptions {
  name?: string
  sizes?: PngSize[]
}

export interface GenerateICOOptions {
  name?: string
  sizes?: IcoSize[]
}

export interface GenerateICNSOptions {
  name?: string
  sizes?: IcnsSize[]
}

export interface GenerateOptions {
  name?: string
  png?: boolean
  pngSizes?: PngSize[]
  ico?: boolean
  icoSizes?: IcoSize[]
  icns?: boolean
  icnsSizes?: IcnsSize[]
}


export const PNG_SIZES: PngSize[] = [ 16, 32, 64, 128, 256, 512, 1024 ]

export const ICO_SIZES: IcoSize[] = [ 256, 128, 96, 64, 48, 40, 32, 24, 20, 16 ]

export const ICNS_SIZES: IcnsSize[] = [ 1024, 512, 256, 128, 64, 32, 16 ]


export const generatePNG = async (input: SharpInput, outDir: string, options?: GeneratePNGOptions): Promise<void> => {
  const { name = 'icon', sizes = PNG_SIZES } = options ?? {}
  const entries = await createPNGEntries(input, sizes)
  
  await mkdir(outDir, { recursive: true })
  
  for (const { size, data } of entries) {
    const file = join(outDir, `${ name }-${ size }x${ size }.png`)
    await writeFile(file, data)
    
    if (size === 1024) {
      const file = join(outDir, `${ name }.png`)
      await writeFile(file, data)
    }
  }
}

export const generateICO = async (input: SharpInput, outDir: string, options?: GenerateICOOptions): Promise<void> => {
  const { name = 'icon', sizes = ICO_SIZES } = options ?? {}
  const entries = await createICOEntries(input, sizes)
  const buffer = createICO(entries)
  
  await mkdir(outDir, { recursive: true })
  
  const file = join(outDir, `${ name }.ico`)
  await writeFile(file, buffer)
}

export const generateICNS = async (input: SharpInput, outDir: string, options?: GenerateICNSOptions): Promise<void> => {
  const { name = 'icon', sizes = ICNS_SIZES } = options ?? {}
  const entries = await createICNSBlocks(input, sizes)
  const buffer = createICNS(entries)
  
  await mkdir(outDir, { recursive: true })
  
  const file = join(outDir, `${ name }.icns`)
  await writeFile(file, buffer)
}

export const generate = async (input: SharpInput, outDir: string, options?: GenerateOptions): Promise<void> => {
  const { name = 'icon', png = true, ico = true, icns = true } = options ?? {}
  const { pngSizes = PNG_SIZES, icoSizes = ICO_SIZES, icnsSizes = ICNS_SIZES } = options ?? {}
  
  if (png) {
    await generatePNG(input, outDir, { name, sizes: pngSizes })
  }
  if (ico) {
    await generateICO(input, outDir, { name, sizes: icoSizes })
  }
  if (icns) {
    await generateICNS(input, outDir, { name, sizes: icnsSizes })
  }
}
