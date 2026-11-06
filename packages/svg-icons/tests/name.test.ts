import { expect, it } from 'vitest'
import { createNamesCode, createNamesType } from '../src/names.ts'


const names = [ 'FitView', 'ZoomIn' ]

it('createNamesCode', () => {
  expect(createNamesCode(names))
    .toContain(JSON.stringify(names))
  
  expect(createNamesCode([]))
    .toContain(`[]`)
})

it('createNamesType', () => {
  const type = createNamesType(names)
  expect(type).toContain('| \'FitView\'')
  expect(type).toContain('| \'ZoomIn\'')
  
  expect(createNamesType([]))
    .toContain('export type IconName = string')
})
