import { createHistogram } from 'node:perf_hooks'
import { isFunction } from './src/validate.js'
import { nanoKeysToMs } from './src/numeric.js'
import { toRows } from './src/to-row.js'

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

const log = async timerified => {
  const rows = await toRows(timerified)

  if (['test'].includes(process.env?.NODE_ENV))
    return rows

  return (['test'].includes(process.env?.NODE_ENV))
    ? console.table(rows)
    : rows
}

export { timerify, log }
