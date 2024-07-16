import { createHistogram } from 'node:perf_hooks'
import { isFunction } from './src/is-function.js'

const toDecimal = num => Math.round((num + Number.EPSILON) * 100) / 100
const nanosToMs = nanos => toDecimal(nanos / 1e+6)
const keysToMs = obj => (acc, key) => ({
  ...acc,
  [key]: isNaN(obj[key]) ? 0 : nanosToMs(obj[key])
})

const timerify = (fn, { histogram = createHistogram() } = {}) => {
  isFunction(fn)

  const timerified = performance.timerify(fn, { histogram })
  timerified.histogram = histogram

  Object.defineProperty(
      timerified,
      'histogramMs', {
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

  timerified.reset = () => timerified.histogram.reset()

  return timerified
}

export { timerify }
