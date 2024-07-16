[![test-workflow][test-badge]][test-workflow] [![coverage-workflow][coverage-badge]][coverage-report] [![codeql-workflow][codeql-badge]][codeql-workflow]

# timerify
tiny function for quick performance testing

uses the native [Performance Measurement API][perf_hooks]

## Basic Usage

- pass the function under-test to `timerify(func)`
- call the returned function `x amount of times`
- assert if the `min`/`mean`/`max` and the
standard deviation between these values is below an acceptable
threshold.

> example: testing a [`fibonacci`][fib] function using [mocha][mocha]

```js
import assert from 'node:assert'

function fibonacci(n) {
   return n < 1 ? 0
        : n <= 2 ? 1
        : fibonacci(n - 1) + fibonacci(n - 2)
}

describe('perf: #fibonacci()', function () {
  beforeEach(function() {
    this.fibonacci = timerify(fibonacci)

    this.fibonacci(10)
  })

  it('should complete each cycle quickly', function () {
    const mean = this.fibonacci.histogramMs.mean

    assert.ok(mean < 30, `mean: ${mean} ms exceeds threshold`)
  })

  it('should never exceed 100ms', function () {
    const max = this.fibonacci.histogramMs.max

    assert.ok(max < 100, `max: ${max} ms exceeds 100ms`)
  })

  it('should have consistent running times', function () {
    const deviation = this.fibonacci.histogramMs.stddev

    assert.ok(deviation < 2, `stddev: ${max} ms exceeds threshold`)
  })
})
```

### Histograms

Timerified functions contain 2 [histograms][node-hgram].

- `timerified.histogram` logs durations in nanoseconds (ns)
- `timerified.histogramMs` logs durations in milliseconds (ms)

### nanosecond durations

> example: run function `foo` 3 times, log nanoseconds

```js
const timerified = timerify(foo)

timerified()
timerified()
timerified()

console.log(timerified.histogram)
// Durations in nanoseconds:

//  count: 3,
//  min: 3971072,
//  max: 4030463,
//  mean: 4002406.4,
//  exceeds: 0,
//  stddev: 24349.677891914707,
//  percentiles: { '75': 4020224, '100': 4028416, '87.5': 4028416 }
```

### millisecond durations

> example: run function `foo` 3 times, log milliseconds

```js
const timerified = timerify(foo)

timerified()
timerified()
timerified()

console.log(timerified.histogramMs)
// Durations in milliseconds:

//  count: 3,
//  min: 3.97,
//  max: 4.03,
//  mean: 4,
//  exceeds: 0,
//  stddev: 0.02,
//  percentiles: {  '75': 4.02, '100': 4.03, '87.5': 4.03 }
```

### `reset`

Calling `timerified.reset()` resets the histogram data:

> example: run `foo` 2 times, reset and continue running

```js
const timerified = timerify(foo)

timerified()
timerified()

console.log(timerified.histogramMs.max)
// 2.01

timerified.reset()

console.log(timerified.histogramMs.max)
// 0

timerified()
timerified()

console.log(timerified.histogramMs.max)
// 1.99
```


## Tests

Install deps:

```bash
npm ci
```

Run unit tests:

```bash
npm test
```

Run test-coverage:

```bash
npm run test:coverage
```


## Authors

- [@nicholaswmin][nicholaswmin]


## License

[MIT "No Attribution" License][license]

[test-badge]: https://github.com/nicholaswmin/automap/actions/workflows/test:unit.yml/badge.svg
[test-workflow]: https://github.com/nicholaswmin/automap/actions/workflows/test:unit.yml

[coverage-badge]: https://coveralls.io/repos/github/nicholaswmin/timerify/badge.svg?branch=main
[coverage-report]: https://coveralls.io/github/nicholaswmin/timerify?branch=main

[codeql-badge]: https://github.com/nicholaswmin/timerify/actions/workflows/codeql.yml/badge.svg
[codeql-workflow]: https://github.com/nicholaswmin/timerify/actions/workflows/codeql.yml

[license]: ./LICENSE
[mocha]: https://mochajs.org/
[node-hgram]: https://nodejs.org/api/perf_hooks.html#class-histogram
[fib]: https://en.wikipedia.org/wiki/Fibonacci_sequence
[nicholaswmin]: https://github.com/nicholaswmin
[perf_hooks]: https://nodejs.org/api/perf_hooks.html
