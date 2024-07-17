import { createHistogram } from 'node:perf_hooks'

class TimedTaskQueue {
  constructor({ baseline }, funcs, { cycles }) {
    // @TODO, validate baselineFunc, funcs, cycles etc...
    this.tasks = funcs.map(func => new TimedTask(func, cycles))
    this.baselineTask = new BaselineTimedTask(baseline, cycles)
  }

  run() {
    return Promise.all(
      this.tasks.concat([this.baselineTask]).map(task => task.run())
    )
    .then(tasks =>
      tasks.filter(task => !(task instanceof BaselineTimedTask))
        .reduce((acc, task) => ({
          ...acc,
          ...this.baselineTask.setDeltaAgainst(task)
        }), {})
    )
  }
}

class Delta {
  constructor(name, delta) {
    this.tolerance = 200
    this.percentage =  this.#round(delta * 100 - 100)

    const by = {
      byPercentage: {
        between: (min, max) => {
          return this.percentage > min && this.percentage < max
        }
      }
    }

    this.name = name
    this.isEqualToBaseline = delta === 1
    this.isSlowerThanBaseline = by
    this.isFasterThanBaseline = by
    this.message = this.#constructMessage()
  }

  #round(num, decimals = 3) {
    const up = Math.pow(10, decimals)

    return Math.round((num * up) * (1 + Number.EPSILON)) / up
  }

  #constructMessage() {
    const isWhat = this.isEqualToBaseline
      ? 'equal to'
      : this.isSlowerThanBaseline
        ? 'slower than'
        : 'faster than'
    return `${this.name} is ${isWhat} baseline by: ${this.percentage} %`
  }
}

class TimedTask {
  constructor(fn, cycles) {
    this.cycles = cycles
    this.name = fn.name
    this.histogram = createHistogram()
    this.timerifiedFn = performance.timerify(fn, {
      histogram: this.histogram
    })
  }

  setDelta(delta) {
    this.difference = new Delta(this.name, delta)

    return this
  }

  async run() {
    for (let i = 0; i < this.cycles; i++)
      await this.timerifiedFn()

    return this
  }

  setDeltaAgainst(task) {
    const delta = task.histogram.mean / this.histogram.mean

    return { [task.name]: new Delta(task.name, delta) }
  }
}

class BaselineTimedTask extends TimedTask {
  constructor(...args) {
    super(...args)
  }
}

const setup = ({ baseline }, funcs, { cycles }) => {
  return new TimedTaskQueue({ baseline }, funcs, { cycles })
}

const log = (timerified, { title = null } = {}) => {
  const rows = toRows(timerified)

  if (['test'].includes(process.env.NODE_ENV))
    return rows

  if (title)
    console.log('\n','\n', title, '\n', '-'.repeat(title.length))

  console.table(rows)

  return rows
}

export { setup, log }

/*
Usage:

import assert from 'node:assert'
import { setup, log } from './index.js'

const baseline = (ms = 1) =>
  new Promise((resolve =>
    setTimeout(resolve, 1)))

const sleepyFoo = (ms = 10) =>
  new Promise((resolve =>
    setTimeout(resolve, ms)))

const sleepyBar = (ms = 1) =>
  new Promise((resolve =>
    setTimeout(resolve, ms)))

const test = setup({
  baseline: (ms = 1) => {
    return new Promise((resolve => setTimeout(resolve, 1)))
  }
}, [
  sleepyFoo,
  sleepyBar
], { cycles: 10 })


;(async () => {
  const { sleepyFoo } = await test.run()

  assert.ok(
    sleepyFoo
    .isSlowerThanBaseline
    .byPercentage.between(600, 1000),
    sleepyFoo.message()
  )
})()
*/
