const toDecimal = num => Math.round((num + Number.EPSILON) * 100) / 100

const nanosToMs = nanos => toDecimal(nanos / 1e+6)

const nanoKeysToMs = obj =>
  (acc, key) => ({
      ...acc,
      [key]: isNaN(obj[key]) ? 0 : nanosToMs(obj[key])
    })

const toMsKeys = nsKeys =>
  (acc, key) =>
    ({ ...acc, [key + ' (ms)']: nsKeys[key] })

export { nanoKeysToMs, toMsKeys }
