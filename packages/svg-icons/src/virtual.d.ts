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
  const SvgIcon: any
  export default SvgIcon
}

declare module 'virtual:svg-icons-component/react' {
  const SvgIcon: any
  export default SvgIcon
}
