import { writeFile } from 'fs/promises'
import { join } from 'path'
import type { SharpInput } from 'sharp'
import { createICNS, createICNSBlocks } from './icns.ts'
import { createICO, createICOEntries } from './ico.ts'
import { createPNGEntries } from './png.ts'


export interface Options {
  name?: string
  sizes?: number[]
}

export interface GenerateOptions {
  name?: string
  png?: boolean
  pngSizes?: number[]
  ico?: boolean
  icoSizes?: number[]
  icns?: boolean
  icnsSizes?: number[]
}


export const PNG_SIZES: number[] = [ 16, 32, 64, 128, 256, 512, 1024 ]

export const ICO_SIZES: number[] = [ 16, 20, 24, 32, 40, 48, 64, 96, 128, 256 ].reverse()

export const ICNS_SIZES: number[] = [ 16, 32, 64, 128, 256, 512, 1024 ].reverse()


export const generatePNG = async (input: SharpInput, outDir: string, options?: Options): Promise<void> => {
  const { name = 'icon', sizes = PNG_SIZES } = options ?? {}
  const entries = await createPNGEntries(input, sizes)
  
  for (const { size, data } of entries) {
    const file = join(outDir, `${ name }-${ size }x${ size }.png`)
    await writeFile(file, data)
    
    if (size === 1024) {
      await writeFile(join(outDir, `${ name }.png`), data)
    }
  }
}

export const generateICO = async (input: SharpInput, outDir: string, options?: Options): Promise<void> => {
  const { name = 'icon', sizes = ICO_SIZES } = options ?? {}
  const entries = await createICOEntries(input, sizes)
  const buffer = createICO(entries)
  
  const file = join(outDir, `${ name }.ico`)
  await writeFile(file, buffer)
}

export const generateICNS = async (input: SharpInput, outDir: string, options?: Options): Promise<void> => {
  const { name = 'icon', sizes = ICNS_SIZES } = options ?? {}
  const entries = await createICNSBlocks(input, sizes)
  const buffer = createICNS(entries)
  
  const file = join(outDir, `${ name }.icns`)
  await writeFile(file, buffer)
}

export const generate = async (input: SharpInput, outDir: string, options?: GenerateOptions): Promise<void> => {
  const { name = 'icon', png = true, ico = true, icns = true } = options ?? {}
  const { pngSizes = PNG_SIZES, icoSizes = ICNS_SIZES, icnsSizes = ICNS_SIZES } = options ?? {}
  
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
