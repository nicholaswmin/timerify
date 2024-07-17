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

  Object.defineProperty(timerified, 'stats_ns', {
    get: function() {
      return timerified.histogram.toJSON()
    }
  })

  Object.defineProperty(timerified, 'stats_ms', {
    get: function() {
      return {
        ...timerified.stats_ns,
        ...['min','mean','max','stddev']
              .reduce(nanoKeysToMs(timerified.stats_ns), {
          percentiles: Object.keys(timerified.stats_ns.percentiles)
              .reduce(nanoKeysToMs(timerified.stats_ns.percentiles), {})
        })
      }
    }
  })

  return timerified
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

export { timerify, log }
