import { defineConfig, type UserConfig } from 'tsdown'


const config: UserConfig[] = defineConfig([
  {
    entry: 'src/index.ts',
    format: [ 'esm' ],
    outDir: 'dist',
    platform: 'node',
    nodeProtocol: true,
    shims: true,
    dts: true,
    publint: true,
    banner: '/// <reference path="./virtual.d.ts" />',
    copy: 'src/virtual.d.ts',
  },
] satisfies UserConfig[])

export default config
