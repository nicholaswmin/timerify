import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

test('example: #fibonacci()', async t => {
  let fibonacciTimerified = null

  t.beforeEach(function() {
    fibonacciTimerified = timerify(fibonacci)

    fibonacciTimerified(30)
  })

  await t.test('completes each cycle quickly', () => {
    const mean = fibonacciTimerified.stats_ms.mean

    assert.ok(mean < 100, `mean: ${mean} exceeds 100ms threshold`)
  })

  await t.test('never exceeds 100ms per cycle', () => {
    const max = fibonacciTimerified.stats_ms.max

    assert.ok(max < 200, `max: ${max} exceeds 200ms threshold`)
  })

  await t.test('has consistent running times', () => {
    const deviation = fibonacciTimerified.stats_ms.stddev

    assert.ok(deviation < 20, `deviation: ${deviation} exceeds 20ms threshold`)
  })
})
