import { dedent, newline } from '@peiyanlu/ts-utils'


export const createRegisterCode = (symbols: string, domId: string, hmrCode: string): string => {
  return newline(2) + dedent(`
    function loadSvg(domId, symbols) {
      let svgDom = document.getElementById(domId)
      if(!svgDom) {
        svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svgDom.id = domId
        svgDom.style.display = 'none'
        document.body.appendChild(svgDom)
      }
      svgDom.innerHTML = symbols
    }
    
    const handleLoad = () => loadSvg('${ domId }', ${ JSON.stringify(symbols) })
    
    if(document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleLoad)
    } else {
      handleLoad()
    }
    
    ${ hmrCode }
    
    export default {}
  `)
}

export const createRegisterType = () => {
  return dedent(`
    declare module 'virtual:svg-icons-register'
  `)
}
