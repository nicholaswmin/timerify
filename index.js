import { createHistogram } from 'node:perf_hooks'
import { HistogramMs } from './src/histogram-ms.js'
import { isFunction } from './src/errors.js'
import { log } from './src/log.js'

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
      return new HistogramMs(this.stats_ns)
    }
  })

  return timerified
}

export { timerify, log }
