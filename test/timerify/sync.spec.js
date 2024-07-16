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

    await t.test('with a histogram in milliseconds', async t => {
      assert.ok(Object.hasOwn(timerFn, 'histogram_ms'))

      assert.deepStrictEqual(Object.keys(timerFn.histogram_ms), [
        'count', 'min', 'max', 'mean', 'exceeds', 'stddev', 'percentiles'
      ])

      await t.test('each value being a number', async t => {
        [
          'count', 'min', 'max', 'mean', 'exceeds', 'stddev'
        ].forEach(key => {
          assert.ok(!isNaN(timerFn.histogram_ms[key]))
        })

        await t.test('within range for milliseconds', () => {
          assert.ok(timerFn.histogram_ms.min > 0.1, timerFn.histogram_ms.min)
          assert.ok(timerFn.histogram_ms.min < 1000, timerFn.histogram_ms.min)

          assert.ok(timerFn.histogram_ms.max > 0.1, timerFn.histogram_ms.mean)
          assert.ok(timerFn.histogram_ms.max < 1000, timerFn.histogram_ms.mean)

          assert.ok(timerFn.histogram_ms.max > 0.1, timerFn.histogram_ms.max)
          assert.ok(timerFn.histogram_ms.max < 1000, timerFn.histogram_ms.max)
        })
      })
    })

    await t.test('with a histogram in nanoseconds', async t => {
      assert.ok(Object.hasOwn(timerFn, 'histogram'))

      assert.deepStrictEqual(Object.keys(timerFn.histogram_ms), [
        'count', 'min', 'max', 'mean', 'exceeds', 'stddev', 'percentiles'
      ])

      await t.test('each value being a number', async t => {
        [
          'count', 'min', 'max', 'mean', 'exceeds', 'stddev'
        ].forEach(key => {
          assert.ok(!isNaN(timerFn.histogram_ms[key]))
        })

        await t.test('within range for nanoseconds', () => {
          assert.ok(timerFn.histogram.min > 10000, timerFn.histogram.min)
          assert.ok(timerFn.histogram.min < 100000000, timerFn.histogram.min)

          assert.ok(timerFn.histogram.max > 10000, timerFn.histogram.mean)
          assert.ok(timerFn.histogram.max < 100000000, timerFn.histogram.mean)

          assert.ok(timerFn.histogram.max > 10000, timerFn.histogram.max)
          assert.ok(timerFn.histogram.max < 100000000, timerFn.histogram.max)
        })
      })
    })
  })
})
