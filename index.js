import { createHistogram } from 'node:perf_hooks'
import { isFunction, isTimerifiedFunction } from './src/validate.js'

const toDecimal = num => Math.round((num + Number.EPSILON) * 100) / 100

const nanosToMs = nanos => toDecimal(nanos / 1e+6)

const keysToMs = obj =>
  (acc, key) => ({
      ...acc,
      [key]: isNaN(obj[key]) ? 0 : nanosToMs(obj[key])
    })

const toMsKeys = histogram =>
  (acc, key) =>
    ({ ...acc, [key + ' (ms)']: histogram[key] })

const toPrintableRow = () =>
  (acc, timerified) => ({
    ... acc,
    [timerified.name]: ['min', 'mean', 'max', 'stddev']
        .reduce(toMsKeys(timerified.histogram_ms),
          { count: timerified.histogram_ms.count }
        )
    })

const toRows = timerified => {
  return Array.isArray(timerified)
    ? timerified.map(isTimerifiedFunction)
      .reduce(toPrintableRow(), {})
    : [isTimerifiedFunction(timerified)]
      .reduce(toPrintableRow(), {})
}

const timerify = (fn, { histogram = createHistogram() } = {}) => {
  isFunction(fn)

  const timerified = performance.timerify(fn, { histogram })

  timerified.histogram = histogram

  timerified.reset = () => {
    timerified.histogram.reset()

    return timerified
  }

  Object.defineProperty(
      timerified,
      'histogram_ms', {
        get: function() {
          const histogram = timerified.histogram.toJSON()

          return {
            ...histogram,
            ...['min','mean','max','stddev'].reduce(keysToMs(histogram), {
              percentiles: Object.keys(histogram.percentiles)
                  .reduce(keysToMs(histogram.percentiles), {})
            })
          }
        }
      }
  )

  return timerified
}

export { timerify, toRows }
