import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

test('#timerify()', async t => {
  await t.test('wrapping a function', async t => {
    let timerFn = null

    t.beforeEach(() => {
      timerFn = timerify(fibonacci)

      for (let i = 0; i < 10; i++)
        timerFn(30)
    })

    await t.test('returns a function', () => {
      assert.ok(timerFn, 'falsy return')
      assert.strictEqual(typeof timerFn, 'function')
    })

    await t.test('with stats in milliseconds', async t => {
      assert.ok(Object.hasOwn(timerFn, 'stats_ms'))

      assert.deepStrictEqual(Object.keys(timerFn.stats_ms), [
        'count', 'min', 'max', 'mean', 'exceeds', 'stddev', 'percentiles'
      ])

      await t.test('each value being a number', async t => {
        [
          'count', 'min', 'max', 'mean', 'exceeds', 'stddev'
        ].forEach(key => {
          assert.ok(!isNaN(timerFn.stats_ms[key]))
        })

        await t.test('within range for milliseconds', () => {
          assert.ok(timerFn.stats_ms.min > 0.1, timerFn.stats_ms.min)
          assert.ok(timerFn.stats_ms.min < 1000, timerFn.stats_ms.min)

          assert.ok(timerFn.stats_ms.max > 0.1, timerFn.stats_ms.mean)
          assert.ok(timerFn.stats_ms.max < 1000, timerFn.stats_ms.mean)

          assert.ok(timerFn.stats_ms.max > 0.1, timerFn.stats_ms.max)
          assert.ok(timerFn.stats_ms.max < 1000, timerFn.stats_ms.max)
        })
      })
    })

    await t.test('with stats in nanoseconds', async t => {
      assert.ok(Object.hasOwn(timerFn, 'stats_ns'))

      assert.deepStrictEqual(Object.keys(timerFn.stats_ms), [
        'count', 'min', 'max', 'mean', 'exceeds', 'stddev', 'percentiles'
      ])

      await t.test('each value being a number', async t => {
        [
          'count', 'min', 'max', 'mean', 'exceeds', 'stddev'
        ].forEach(key => {
          assert.ok(!isNaN(timerFn.stats_ms[key]))
        })

        await t.test('within range for nanoseconds', () => {
          assert.ok(timerFn.stats_ns.min > 10000, timerFn.stats_ns.min)
          assert.ok(timerFn.stats_ns.min < 100000000, timerFn.stats_ns.min)

          assert.ok(timerFn.stats_ns.max > 10000, timerFn.stats_ns.mean)
          assert.ok(timerFn.stats_ns.max < 100000000, timerFn.stats_ns.mean)

          assert.ok(timerFn.stats_ns.max > 10000, timerFn.stats_ns.max)
          assert.ok(timerFn.stats_ns.max < 100000000, timerFn.stats_ns.max)
        })
      })
    })
  })
})
