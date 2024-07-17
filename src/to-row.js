import { toMsKeys } from './numeric.js'
import { isTimerifiedFunction } from './validate.js'

const cleanupName = name => name.replace(/timerified|bound/gi, '').trim()

const toRow = () =>
  (acc, timerified) => ({
    ... acc,
    [cleanupName(timerified.name)]: ['min', 'mean', 'max', 'stddev']
        .reduce(toMsKeys(timerified.stats_ms),
          { count: timerified.stats_ms.count }
        )
    })

const toRows = timerified => {
  return Array.isArray(timerified)
    ? timerified.map(isTimerifiedFunction)
      .reduce(toRow(), {})
    : [isTimerifiedFunction(timerified)]
      .reduce(toRow(), {})
}

export { toRows }
