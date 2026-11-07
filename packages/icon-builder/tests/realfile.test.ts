import { readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import {
  generate,
  ICNS_SIZES,
  ICO_SIZES,
  PNG_SIZES,
  writeICNSImagesAsPNGs,
  writeICOImagesAsPNGs,
} from '../src/index.ts'


const outDir = join(__dirname, 'build-icons')

afterEach(() => {
  rmSync(outDir, { recursive: true })
})


it.each([ [ 'svg' ], [ 'png' ] ])(
  'should generate and parse %s file',
  async (type) => {
    const input = join(__dirname, 'icons', `icon.${ type }`)
    const outputGen = join(outDir, `${ type }-output`)
    const outputParse = join(outDir, `${ type }-parse`)
    
    const name = 'icon'
    await generate(input, outputGen, { name })
    
    const icnsBuffer = readFileSync(join(outputGen, 'icon.icns'))
    const icnsDir = join(outputParse, 'icns')
    await writeICNSImagesAsPNGs(icnsBuffer, icnsDir)
    
    const icoBuffer = readFileSync(join(outputGen, 'icon.ico'))
    const icoDir = join(outputParse, 'ico')
    await writeICOImagesAsPNGs(icoBuffer, icoDir)
    
    expect(readdirSync(outputGen)).toEqual(
      expect.arrayContaining([
        ...PNG_SIZES.map(size => `${ name }-${ size }x${ size }.png`),
        ...[ 'icns', 'ico', 'png' ].map(ext => `${ name }.${ ext }`),
      ]),
    )
    expect(readdirSync(outputGen).length).toBe(PNG_SIZES.length + 3)
    
    expect(readdirSync(icoDir)).toEqual(
      expect.arrayContaining([
        ...ICO_SIZES.map(size => `${ name }-${ size }x${ size }.png`),
      ]),
    )
    expect(readdirSync(icoDir).length).toBe(ICO_SIZES.length)
    
    expect(readdirSync(icnsDir)).toEqual(
      expect.arrayContaining([
        ...ICNS_SIZES.map(size => `${ name }-${ size }x${ size }.png`),
      ]),
    )
    expect(readdirSync(icnsDir).length).toBe(ICNS_SIZES.length)
  },
)
