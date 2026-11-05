# @peiyanlu/icon-builder


[![module](https://img.shields.io/badge/package-ESM--only-FFE536.svg?logo=npm)](https://nodejs.org/api/esm.html)
[![npm](https://img.shields.io/npm/v/@peiyanlu/icon-builder.svg)](https://npmjs.com/package/@peiyanlu/icon-builder)
[![license](https://img.shields.io/npm/l/@peiyanlu/icon-builder.svg)](https://npmjs.com/package/@peiyanlu/icon-builder)
[![downloads](https://img.shields.io/npm/dm/@peiyanlu/icon-builder.svg)](https://npmjs.com/package/@peiyanlu/icon-builder)
[![node](https://img.shields.io/node/v/@peiyanlu/icon-builder.svg)](https://nodejs.org)
[![size](https://packagephobia.com/badge?p=@peiyanlu/icon-builder)](https://packagephobia.com/result?p=@peiyanlu/icon-builder)
[![deps](https://img.shields.io/librariesio/release/npm/@peiyanlu/icon-builder)](https://libraries.io/npm/%40peiyanlu%2Ficon-builder)

Generate desktop application icons from a single source image.

Supports:

* **PNG** — Linux
* **ICO** — Windows (`PNG-in-ICO`)
* **ICNS** — macOS

## Installation

```shell
pnpm add @peiyanlu/icon-builder -D
```

## Usage

Generate all icon formats:

```ts
import { generate } from '@peiyanlu/icon-builder'


await generate('./icon.svg', './build-icons')
```

Generate individual formats:

```ts
import { generateICNS, generateICO, generatePNG } from '@peiyanlu/icon-builder'


await generatePNG('./icon.svg', './build-icons')
await generateICO('./icon.svg', './build-icons')
await generateICNS('./icon.svg', './build-icons')
```

## License

[MIT](./LICENSE)
