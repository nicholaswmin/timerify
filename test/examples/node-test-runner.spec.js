import test from 'node:test'
import assert from 'node:assert'

import { timerify } from '../../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

const timed_fibonacci = timerify(fibonacci)

test('perf: #fibonacci(20) x 10 times', async t => {
  t.beforeEach(() => {
    for (let i = 0; i < 10; i++)
      timed_fibonacci(20)
  })

  await t.test('called 10 times', () => {
    const callCount = timed_fibonacci.stats_ms.count

    assert.strictEqual(callCount, 10)
  })

  await t.test('runs quickly, on average', () => {
    const mean = timed_fibonacci.stats_ms.mean

    assert.ok(mean < 30, `mean: ${mean} ms exceeded 30ms threshold`)
  })

  await t.test('has consistent running times', () => {
    const dev = timed_fibonacci.stats_ms.stddev

    assert.ok(dev < 2, `deviation: ${dev} ms exceeded 30ms threshold`)
  })
})
