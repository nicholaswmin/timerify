import assert from 'node:assert'
import { test } from 'node:test'

import { timerify } from '../index.js'

await test('#timerify() arguments', async t => {
 await t.test('no parameters are passed', async t => {
   await t.test('throws "InvalidArgumentError"', () => {
      assert.throws(() => {
        timerify()
      }, { name: 'InvalidArgumentError' })
    })

   await t.test('with a descriptive message', () => {
     assert.throws(() => timerify('foo'), {
       name: 'InvalidArgumentError',
       message: 'Expected an argument of type: "function", got: string'
     })
   })
  })

  await t.test('passed parameter is not a function', async t => {
    await t.test('throws "InvalidArgumentError"', () => {
      assert.throws(() => timerify('foo'), {
        name: 'InvalidArgumentError'
      })
    })

    await t.test('with a descriptive message', () => {
      assert.throws(() => timerify('foo'), {
        name: 'InvalidArgumentError',
        message: 'Expected an argument of type: "function", got: string'
      })
    })
  })

  await t.test('passed parameter is a function', async t => {
    await t.test('does not throw"', () => {
      assert.doesNotThrow(() =>  timerify(function fooBar() { }) )
    })

    await t.test('called', async t => {
      await t.test('returns its result', () => {
        const fn = function sayFoobar() {
          return 'foobar'
        }

        assert.strictEqual(fn(), 'foobar')
      })
    })
  })
})
