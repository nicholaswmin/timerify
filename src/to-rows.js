import { isTimerifiedFunction } from './errors.js'

const cleanupName = name => name.replace(/timerified|bound/gi, '').trim()
const toMsKeys = nsKeys => (ac, key) => ({...ac, [key + ' (ms)']: nsKeys[key] })
const toRow = () => (acc, timerified) => ({
  ... acc,
  [cleanupName(timerified.name)]: ['min', 'mean', 'max', 'stddev']
    .reduce(toMsKeys(timerified.stats_ms), {
      count: timerified.stats_ms.count
    })
  })

const toRows = timerified => {
  return Array.isArray(timerified)
    ? timerified.map(isTimerifiedFunction).reduce(toRow(), {})
    : [isTimerifiedFunction(timerified)].reduce(toRow(), {})
}

export { toRows }
