import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

test('#reset()', async t => {
  await t.test('a timerified function runs', async t => {
    let timerFn = null

    t.beforeEach(() => {
      timerFn = timerify(fibonacci)

      for (let i = 0; i < 10; i++)
        timerFn(20)
    })

    await t.test('it logs a max (ms) value', () => {
      const max = timerFn.stats_ms.max

      assert.ok(max > 0, `max is: ${max} ms`)
    })

    await t.test('#timerified.reset() is called()', async t => {
      let result = null

      t.beforeEach(() => {
        result = timerFn.reset()
      })

      await t.test('zeroes the captured durations', async t => {
        await t.test('of nanosecond stats', () => {
          const max = timerFn.stats_ns.max

          assert.strictEqual(max, 0)
        })

        await t.test('of millisecond stats', () => {
          const max = timerFn.stats_ms.max

          assert.strictEqual(max, 0)
        })

        await t.test('function is run again:', async t => {
          t.beforeEach(() => {
            for (let i = 0; i < 10; i++)
              timerFn(20)
          })

          await t.test('it logs a max (ms) value', () => {
            const max = timerFn.stats_ms.max

            assert.ok(max > 0, `max is: ${max} ms`)
          })
        })
      })

      await t.test('returns the timerified function', () => {
        assert.deepStrictEqual(result, timerFn)
      })
    })
  })
})
