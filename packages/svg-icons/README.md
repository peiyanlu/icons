# @peiyanlu/svg-icons


[![module](https://img.shields.io/badge/package-ESM--only-FFE536.svg?logo=npm)](https://nodejs.org/api/esm.html)
[![npm](https://img.shields.io/npm/v/@peiyanlu/svg-icons.svg)](https://npmjs.com/package/@peiyanlu/svg-icons)
[![license](https://img.shields.io/npm/l/@peiyanlu/svg-icons.svg)](https://npmjs.com/package/@peiyanlu/svg-icons)
[![downloads](https://img.shields.io/npm/dm/@peiyanlu/svg-icons.svg)](https://npmjs.com/package/@peiyanlu/svg-icons)
[![node](https://img.shields.io/node/v/@peiyanlu/svg-icons.svg)](https://nodejs.org)
[![size](https://packagephobia.com/badge?p=@peiyanlu/svg-icons)](https://packagephobia.com/result?p=@peiyanlu/svg-icons)
[![deps](https://img.shields.io/librariesio/release/npm/@peiyanlu/svg-icons)](https://libraries.io/npm/%40peiyanlu%2Fsvg-icons)

A Vite plugin for building SVG icon sprites.


## Installation

```shell
pnpm add @peiyanlu/svg-icons -D
```

## Usage

```ts
import { vitePlugin } from '@peiyanlu/svg-icons'


// vite.config.ts
vitePlugin({
  iconDirs: [ join(process.cwd(), 'svg-icons') ],
  symbolId: 'symbol-[dir]-[name]',
  domId: 'svg-icons-dom',
})
```

Icons Injection

```ts
import 'virtual:svg-icons-register'
```

Vue Component

```vue
<script setup lang="ts">
import SvgIcon from 'virtual:svg-icons-component/vue'
</script>

<template>
  <SvgIcon name="svg"></SvgIcon>
</template>
```

React Component

```tsx
import SvgIcon from 'virtual:svg-icons-component/react'


function render() {
  return (<SvgIcon name={ 'svg' }></SvgIcon>)
}
```

## License

[MIT](./LICENSE)
