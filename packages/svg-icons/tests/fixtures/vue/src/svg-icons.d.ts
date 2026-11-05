declare module 'virtual:svg-icons-register'

declare module 'virtual:svg-icons-names' {
  export type IconName = string
  const names: IconName[]
  export default names
}

declare module 'virtual:svg-icons-sprite' {
  const sprite: string
  export default sprite
}

declare module 'virtual:svg-icons-component/vue' {
  import type { DefineComponent } from 'vue'
  import type { IconName } from 'virtual:svg-icons-names'
  const SvgIcon: DefineComponent<{
    name: IconName | (string & {})
    size?: string
    pointer?: boolean
    inline?: boolean
    prefix?: string
  }>
  export default SvgIcon
}