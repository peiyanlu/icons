import { writeFile } from 'fs/promises'
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { join } from 'path'
import { parseICNS } from '../src/icns.ts'
import { parseICO } from '../src/ico.ts'
import { generate } from '../src/index.ts'


const createTempDir = (parent: string, key: string) => {
  mkdirSync(parent, { recursive: true })
  return mkdtempSync(join(parent, [ 'temp', key, '' ].join('-')))
}


const input = './icons/icon.svg'
const outDir = createTempDir('./build-icons', 'svg-build')


await generate(input, outDir)

const parseBuild = () => {
  const dir = createTempDir('./build-icons', 'svg-parse')
  
  const icns = parseICNS(readFileSync(`./${ outDir }/icon.icns`))
  const icnsDir = join(dir, 'icns')
  mkdirSync(icnsDir, { recursive: true })
  icns.forEach(async ({ width, height, data }) => {
    const file = join(icnsDir, `icon-${ width }x${ height }.png`)
    await writeFile(file, data)
  })
  
  const ico = parseICO(readFileSync(`./${ outDir }/icon.ico`))
  const icoDir = join(dir, 'ico')
  mkdirSync(icoDir, { recursive: true })
  ico.forEach(async ({ width, height, data }) => {
    const file = join(icoDir, `icon-${ width }x${ height }.png`)
    await writeFile(file, data)
  })
}

parseBuild()
