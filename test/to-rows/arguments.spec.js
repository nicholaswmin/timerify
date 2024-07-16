import { test } from 'node:test'
import assert from 'node:assert'

import { timerify, toRows } from '../../index.js'

test('#toRows() arguments', async t => {
  let fibonacciTimerified, sleepTimerified = null

  t.beforeEach(async () => {
    const fibonacci = () => { }
    const sleep = () => {}

    fibonacciTimerified = timerify(fibonacci)
    sleepTimerified = timerify(sleep)
  })

  await t.test('passed a non-timerified function', async t => {
    await t.test('throws "InvalidArgumentError"', async t => {
       assert.throws(() => {
         return toRows(function foo(){})
       }, { name: 'InvalidArgumentError' })

       await t.test('with a descriptive message', () => {
         assert.throws(() => toRows(function foo(){}), {
           name: 'InvalidArgumentError',
           message: 'Expected a function returned by timerify(fn), got: plain function'
         })
       })
     })
  })

  await t.test('passed an array', async t => {
    await t.test('an array item is not a timerified function', async t => {
      await t.test('throws "InvalidArgumentError"', async t => {
         assert.throws(() => {
           return toRows([
             function foo(){},
             function bar(){}
           ])
         }, { name: 'InvalidArgumentError' })

         await t.test('with a descriptive message', () => {
           assert.throws(() => toRows([
             function foo(){},
             function bar(){}
           ]), {
             name: 'InvalidArgumentError',
             message: 'Expected a function returned by timerify(fn), got: plain function'
           })
         })
       })
    })

    await t.test('all array items are timerified functions', async t => {
      await t.test('does not throw', () => {
         assert.doesNotThrow(() => {
           return toRows([fibonacciTimerified, sleepTimerified])
         }, { name: 'InvalidArgumentError' })
       })
    })
  })

  await t.test('passed a timerified function', async t => {
    await t.test('does not throw', () => {
       assert.doesNotThrow(() => {
         return toRows(fibonacciTimerified)
       }, { name: 'InvalidArgumentError' })
     })
  })
})
