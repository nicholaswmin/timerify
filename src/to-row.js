import { toMsKeys } from './numeric.js'

const toRow = () =>
  (acc, timerified) => ({
    ... acc,
    [timerified.name]: ['min', 'mean', 'max', 'stddev']
        .reduce(toMsKeys(timerified.histogram_ms),
          { count: timerified.histogram_ms.count }
        )
    })

export { toRow }
