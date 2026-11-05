import { dedent, isEmpty, space } from '@peiyanlu/ts-utils'


export const createNamesCode = (names: Iterable<string>): string => {
  return dedent(`
    export default ${ JSON.stringify([ ...names ]) }
  `)
}

export const createNamesType = (names: Iterable<string>) => {
  const types = isEmpty(names)
    ? `${ space() }string`
    : [ ...names ].map(name => `\n${ space(8) }| '${ name }'`).join('')
  return dedent(`
    declare module 'virtual:svg-icons-names' {
      export type IconName =${ types }
      const names: IconName[]
      export default names
    }
  `)
}
