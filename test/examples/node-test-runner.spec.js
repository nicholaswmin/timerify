import test from 'node:test'
import { timerify } from '../../index.js'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

await test('perf: #fibonacci(20) x 10 times', async t => {
  const timed_fibonacci = timerify(fibonacci)

  t.beforeEach(() => {
    for (let i = 0; i < 10; i++)
      timed_fibonacci(20)
  })

  await t.test('completes each cycle quickly', t => {
    const mean = timed_fibonacci.histogram_ms.mean

    t.assert.ok(mean < 30, `mean: ${mean} ms exceeded 30ms threshold`)
  })

  await t.test('never exceeds 100ms', t => {
    const max = timed_fibonacci.histogram_ms.max

    t.assert.ok(max < 100, `max: ${max} ms exceeded 100ms threshold`)
  })

  await t.test('has consistent running times', t => {
    const dev = timed_fibonacci.histogram_ms.stddev

    t.assert.ok(dev < 2, `deviation: ${dev} ms exceeded 30ms threshold`)
  })
})
