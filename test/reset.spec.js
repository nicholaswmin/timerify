import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../index.js'

function fibonacci(n) {
   return n < 1 ? 0
        : n <= 2 ? 1
        : fibonacci(n - 1) + fibonacci(n - 2)
}

test('#reset', async t => {
  await t.test('when a timerified function runs', async t => {
    let timerFn = null

    t.beforeEach(() => {
      timerFn = timerify(fibonacci)

      for (let i = 0; i < 10; i++)
        timerFn(20)
    })

    await t.test('it logs a max (ms) value', () => {
      const max = timerFn.histogramMs.max

      assert.ok(max > 0, `max is: ${max} ms`)
    })

    await t.test('when #timerified.reset() is called()', async t => {
      t.beforeEach(() => {
        timerFn.reset()
      })

      await t.test('zeros the captured durations', async t => {
        await t.test('for nanoseconds', () => {
          const max = timerFn.histogram.max

          assert.strictEqual(max, 0)
        })

        await t.test('for milliseconds', () => {
          const max = timerFn.histogramMs.max

          assert.strictEqual(max, 0)
        })

        await t.test('when function is run again:', async t => {
          t.beforeEach(() => {
            for (let i = 0; i < 10; i++)
              timerFn(20)
          })

          await t.test('it logs a max (ms) value', () => {
            const max = timerFn.histogramMs.max

            assert.ok(max > 0, `max is: ${max} ms`)
          })
        })
      })
    })
  })
})
