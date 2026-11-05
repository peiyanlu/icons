import { expect, it } from 'vitest'
import { createSpriteCode } from '../src/sprite.js'


it('createSpriteCode', () => {
  const code = createSpriteCode('<symbol id="symbol-home"/>', 'dom-id')
  
  expect(code).toContain('<symbol id=\\"symbol-home\\"/>')
  expect(code).toContain('id=\\"dom-id\\"')
})
