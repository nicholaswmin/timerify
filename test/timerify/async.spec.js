import { test } from 'node:test'
import assert from 'node:assert'

import { timerify } from '../../index.js'

test('#timerify() - async', async t => {
  const sleep = ms =>
      new Promise((resolve =>
        setTimeout(resolve, ms)))

  await t.test('passed an async function', async t => {
    let timerFn = null

    t.beforeEach(async () => {
      timerFn = timerify(sleep)

      for (let i = 0; i < 2; i++)
        await timerFn(50)
    })

    await t.test('it logs a count', () => {
      const count = timerFn.stats_ms.count

      assert.strictEqual(count, 2)
    })

    await t.test('it logs a reasonable mean duration', () => {
      const mean = timerFn.stats_ms.mean

      assert.ok(mean > 45, `mean is: ${mean} ms`)
      assert.ok(mean < 200, `mean is: ${mean} ms`)
    })
  })
})
