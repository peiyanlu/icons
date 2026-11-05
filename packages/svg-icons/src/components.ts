import { dedent } from '@peiyanlu/ts-utils'


export const createVueComponent = (): string => {
  return dedent(`
    import { computed, defineComponent, h } from 'vue'
    export default defineComponent({
      name: 'SvgIcon',
      props: {
        name: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          default: '1em',
        },
        pointer: {
          type: Boolean,
          default: false,
        },
        inline: {
          type: Boolean,
          default: false,
        },
        prefix: {
          type: String,
          default: 'symbol',
        },
      },
      setup({ name, size, pointer, inline, prefix }) {
        return () =>
          h(
            'svg',
            {
              style: {
                width: size,
                height: size,
                cursor: pointer ? 'pointer' : '',
                display: inline ? '' : 'block',
                fill: 'currentColor',
                verticalAlign: 'middle',
              },
              'aria-hidden': true,
            },
            [
              h(
                'use',
                {
                  href: '#' + prefix + '-' + name,
                },
              ),
            ],
          )
      },
    })
  `)
}

export const createVueComponentType = (): string => {
  return dedent(`
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
  `)
}


export const createReactComponent = (): string => {
  return dedent(`
    import React from 'react'
    export default function SvgIcon({ name, size = '1em', pointer = false, inline = false, prefix = 'symbol' }) {
      return React.createElement(
        'svg',
        {
          style: {
            width: size,
            height: size,
            cursor: pointer ? 'pointer' : '',
            display: inline ? '' : 'block',
            fill: 'currentColor',
            verticalAlign: 'middle',
          },
          'aria-hidden': true,
        },
        React.createElement(
          'use',
          {
            href: '#' + prefix + '-' + name,
          },
        ),
      )
    }
  `)
}

export const createReactComponentType = (): string => {
  return dedent(`
    declare module 'virtual:svg-icons-component/react' {
      import type { ComponentType } from 'react'
      import type { IconName } from 'virtual:svg-icons-names'
      const SvgIcon: ComponentType<{
        name: IconName | (string & {})
        size?: string
        pointer?: boolean
        inline?: boolean
        prefix?: string
      }>
      export default SvgIcon
    }
  `)
}
