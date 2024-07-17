import { toMsKeys } from './numeric.js'
import { isTimerifiedFunction } from './validate.js'

const toRow = () =>
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
      .reduce(toRow(), {})
    : [isTimerifiedFunction(timerified)]
      .reduce(toRow(), {})
}

export { toRows }
