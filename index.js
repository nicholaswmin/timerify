import { createHistogram } from 'node:perf_hooks'
import { isFunction, isTimerifiedFunction } from './src/validate.js'
import { nanoKeysToMs, toMsKeys } from './src/numeric.js'
import { toRow } from './src/to-row.js'

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
            ...['min','mean','max','stddev'].reduce(nanoKeysToMs(histogram), {
              percentiles: Object.keys(histogram.percentiles)
                  .reduce(nanoKeysToMs(histogram.percentiles), {})
            })
          }
        }
      }
  )

  return timerified
}

const toRows = timerified => {
  return Array.isArray(timerified)
    ? timerified.map(isTimerifiedFunction)
      .reduce(toRow(), {})
    : [isTimerifiedFunction(timerified)]
      .reduce(toRow(), {})
}

export { timerify, toRows }
