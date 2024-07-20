const toDecimal = num => Math.round((num + Number.EPSILON) * 100) / 100
const nanosToMs = nanos => toDecimal(nanos / 1e+6)
const nanoKeysToMs = obj => (acc, key) => ({
  ...acc,
  [key]: isNaN(obj[key]) ? 0 : nanosToMs(obj[key])
})

class HistogramMs {
  constructor(histogram) {
    Object.assign(this, {
      ...histogram,
      ...['min','mean','max','stddev']
            .reduce(nanoKeysToMs(histogram), {
        percentiles: Object.keys(histogram.percentiles)
            .reduce(nanoKeysToMs(histogram.percentiles), {})
      })
    })
  }
}

export { HistogramMs }
