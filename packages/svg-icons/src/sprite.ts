import { dedent } from '@peiyanlu/ts-utils'


export const createSpriteCode = (symbols: string, domId: string): string => {
  const sprite = `<svg id="${ domId }" style="display: none;">${ symbols }</svg>`
  return dedent(`
    export default ${ JSON.stringify(sprite) }
  `)
}

export const createSpriteType = () => {
  return dedent(`
    declare module 'virtual:svg-icons-sprite' {
      const sprite: string
      export default sprite
    }
  `)
}
