import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../index.js'

function fibonacci(n) {
   return n < 1 ? 0
        : n <= 2 ? 1
        : fibonacci(n - 1) + fibonacci(n - 2)
}

test('README #fibonacci example:', async t => {
  let fibonacciTimerified = null

  t.beforeEach(function() {
    fibonacciTimerified = timerify(fibonacci)

    fibonacciTimerified(30)
  })

  await t.test('should complete each cycle quickly', () => {
    const mean = fibonacciTimerified.histogramMs.mean

    assert.ok(mean < 10, `mean duration was: ${mean} ms`)
  })

  await t.test('should never exceed 20ms per cycle', () => {
    const max = fibonacciTimerified.histogramMs.max

    assert.ok(max < 20, `max duration: ${max} exceed threshold`)
  })

  await t.test('should have consistent running times', () => {
    const deviation = fibonacciTimerified.histogramMs.stddev

    assert.ok(deviation < 5, `max duration: ${deviation} exceed threshold`)
  })
})
