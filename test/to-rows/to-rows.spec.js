import { test } from 'node:test'
import assert from 'node:assert'

import { timerify, toRows } from '../../index.js'

test('#toRows', async t => {
  const rowKeys = ['count', 'min (ms)', 'mean (ms)', 'max (ms)','stddev (ms)']

  let fibonacciTimerified = null

  t.beforeEach(() => {
    const fibonacci = n => n < 1 ? 0 : n <= 2
      ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

    fibonacciTimerified = timerify(fibonacci)

    for (let i = 0; i < 5; i++) fibonacciTimerified(20)
  })

  await t.test('passed a timerified function', async t => {
    let result = null

    t.beforeEach(() => {
      result = toRows(fibonacciTimerified)
    })

    await t.test('returns an object', async t => {
      assert.strictEqual(typeof result, 'object')

      await t.test('with 1 key', async t => {
        assert.strictEqual(Object.keys(result).length, 1)

        await t.test('set to the function name', () => {
          assert.strictEqual(Object.keys(result).pop(), 'timerified fibonacci')
        })
      })

      await t.test('with human readable keys', async t => {
        Object.values(result).forEach(value => {
          rowKeys.forEach(key => {
            assert.ok(Object.hasOwn(value, key), `no such key "${key}"`)
          })
        })

        await t.test('set to positive numeric values', () => {
          Object.values(result).forEach(value => {
            rowKeys.forEach(key => {
              assert.ok(value[key] >= 0, `${key} not 0 or a positive number`)
            })
          })
        })
      })
    })
  })

  await t.test('passed an array of timerified functions', async t => {
    let result = null

    t.beforeEach(async () => {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

      const sleepTimerified = timerify(sleep)

      for (let i = 0; i < 5; i++) await sleepTimerified(10)

      result = toRows([fibonacciTimerified, sleepTimerified])
    })

    await t.test('returns an object', async t => {
      await t.test('with 2 keys', async t => {
        const keys = Object.keys(result)

        assert.strictEqual(keys.length, 2)

        await t.test('set to the function names', () => {
          assert.ok(keys.includes('timerified fibonacci'))
          assert.ok(keys.includes('timerified sleep'))
        })
      })

      await t.test('with human readable keys', async t => {
        Object.values(result).forEach(value => {
          rowKeys.forEach(key => {
            assert.ok(Object.hasOwn(value, key), `no such key "${key}"`)
          })
        })

        await t.test('set to positive numeric values', () => {
          Object.values(result).forEach(value => {
            rowKeys.forEach(key => {
              assert.ok(value[key] >= 0, `${key} not 0 or a positive number`)
            })
          })
        })
      })
    })
  })
})
