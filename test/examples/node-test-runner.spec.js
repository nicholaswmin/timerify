import test from 'node:test'
import { timerify } from '../../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

const timed_fibonacci = timerify(fibonacci)

test('perf: #fibonacci(20) x 10 times', async t => {
  t.beforeEach(() => {
    console.log('called')
    for (let i = 0; i < 10; i++)
      timed_fibonacci(20)
  })

  await t.test('called 10 times', t => {
    const callCount = timed_fibonacci.histogram_ms.count

    t.assert.strictEqual(callCount, 10)
  })

  await t.test('runs quickly, on average', t => {
    const mean = timed_fibonacci.histogram_ms.mean

    t.assert.ok(mean < 30, `mean: ${mean} ms exceeded 30ms threshold`)
  })

  await t.test('has consistent running times', t => {
    const dev = timed_fibonacci.histogram_ms.stddev

    t.assert.ok(dev < 2, `deviation: ${dev} ms exceeded 30ms threshold`)
  })
})
