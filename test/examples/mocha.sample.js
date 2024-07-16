// Example using mocha, from README.
// Not part of these unit-tests.
// Run with:
// - `npx mocha test/mocha/basic.sample.js`
// When it asks you to install mocha, press yes.

import assert from 'node:assert'

import { timerify } from '../../index.js'

function fibonacci(n) {
   return n < 1 ? 0
        : n <= 2 ? 1
        : fibonacci(n - 1) + fibonacci(n - 2)
}

describe('perf: #fibonacci()', function () {
  beforeEach(function() {
    this.fibonacci = timerify(fibonacci)

    this.fibonacci(30)
  })

  it('should complete each cycle quickly', function () {
    const mean = this.fibonacci.histogramMs.mean

    assert.ok(mean < 10, `mean duration was: ${mean} ms`)
  })

  it('should never exceed 20ms per cycle', function () {
    const max = this.fibonacci.histogramMs.max

    assert.ok(max < 20, `max duration: ${max} exceed threshold`)
  })

  it('should have consistent running times', function () {
    const deviation = this.fibonacci.histogramMs.stddev

    assert.ok(deviation < 5, `max duration: ${deviation} exceed threshold`)
  })
})
