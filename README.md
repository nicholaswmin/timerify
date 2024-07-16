[![test-workflow][test-badge]][test-workflow] [![test-workflow][size-badge]][test-workflow]

# timerify

tiny performance testing utility

> uses native [Performance Measurement APIs][perf_hooks]

## Usage

### Install

```bash
npm i @nicholaswmin/timerify
```

### `timerify()`

Instruments and returns a `function`.

You then use the instrumented function, preferrably `n` times.

> example: log `mean` runtime of a [`fibonacci function`][fib],
> in *milliseconds*:

```js
import { timerify } from 'timerify'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

const timerified = timerify(fibonacci)

timerified(10) // compute 10 fibonacci
timerified(5)  // another 5
timerified(2)  // another 3

console.log(timerified.histogram_ms.count)
// 3 (times called)

console.log(timerified.histogram_ms.mean)
// 2.94 (milliseconds on average)
```

> uses [`performance.timerify`][perf-timerify] so you can also get runtime
> stats by setting up a [`PerformanceObserver`][perf-observer].

#### [`Promise`][promise]/[`async`][async] functions

same as above, just `await` the returned function:

```js
const sleep = ms => new Promise((resolve => setTimeout(resolve, ms)))

const timerified = timerify(sleep)

await timerified(100)
await timerified(100)
await timerified(100)

console.log(timerified.histogram_ms.count)
// 3 (times called)

console.log(timerified.histogram_ms.mean)
// 100 (milliseconds)
```

### Histograms

Timerified functions contain 2 [`Histograms`][node-hgram]:

`timerified.histogram`

records durations in [*nanoseconds*][ns] (ns)

`timerified.histogram_ms`

records durations in [*milliseconds*][ms] (ms)

> example: run function `foo` 3 times, log `nanoseconds`:

```js
const timerified = timerify(foo)

timerified()
timerified()
timerified()

console.log(timerified.histogram)

//  count: 3,
//  min: 3971072,
//  max: 4030463,
//  mean: 4002406.4,
//  exceeds: 0,
//  stddev: 24349.677891914707,
//  percentiles: { '75': 4020224, '100': 4028416, '87.5': 4028416 }
```

> example: same as above, this time in `milliseconds`:

```js
const timerified = timerify(foo)

timerified()
timerified()
timerified()

console.log(timerified.histogram_ms)

//  count: 3,
//  min: 3.97,
//  max: 4.03,
//  mean: 4,
//  exceeds: 0,
//  stddev: 0.02,
//  percentiles: {  '75': 4.02, '100': 4.03, '87.5': 4.03 }
```

### `timerified.reset()`

`timerified.reset()` resets the histogram data.

> example: run `foo` 2 times, reset and continue running:

```js
const timerified = timerify(foo)

timerified()
timerified()

console.log(timerified.histogram_ms.max)
// 2.01

timerified.reset()

console.log(timerified.histogram_ms.max)
// 0

timerified()
timerified()

console.log(timerified.histogram_ms.max)
// 1.99
```

### `toRows()`

returns rows from timerified function which can be pretty-printed with
[`console.table`][console-table]:

> example: pretty-print the stats of `foo` and `bar`:

```js
import { timerify, toRows } from '@nicholaswmin/timerify'

const foo = ms => new Promise((resolve => setTimeout(resolve, ms)))
const bar = ms => new Promise((resolve => setTimeout(resolve, ms)))

const fooTimerified = timerify(foo)
const barTimerified = timerify(bar)

fooTimerified(10)
barTimerified(20)
fooTimerified(10)
barTimerified(30)
barTimerified(10)

console.table(toRows([fooTimerified, barTimerified]))
```

which logs:

```console
┌────────────────┬───────┬──────────┬───────────┬──────────┬─────────────┐
│                │ count │ min (ms) │ mean (ms) │ max (ms) │ stddev (ms) │
├────────────────┼───────┼──────────┼───────────┼──────────┼─────────────┤
│ timerified foo │ 2     │ 11.08    │ 11.29     │ 11.5     │ 0.2         │
│ timerified bar │ 3     │ 11.49    │ 36.23     │ 61.15    │ 20.26       │
└────────────────┴───────┴──────────┴───────────┴──────────┴─────────────┘
```

## Usage with test runners

Just assert the result in any test runner using any assertion library

> example: testing a `fibonacci` function using [mocha][mocha]:

```js
import assert from 'node:assert'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

describe('perf: #fibonacci() x 10 times', function () {
  beforeEach(function() {
    this.fibonacci = timerify(fibonacci)

    for (let i = 0; i < 10; i++)
      this.fibonacci(10)
  })

  it('completes each cycle quickly', function () {
    const mean = this.fibonacci.histogram_ms.mean

    assert.ok(mean < 30, 'mean exceeded 30ms threshold')
  })

  it('never exceeds 100ms', function () {
    const max = this.fibonacci.histogram_ms.max

    assert.ok(max < 100, 'max exceeded 100ms threshold')
  })

  it('exhibits consistent running times', function () {
    const deviation = this.fibonacci.histogram_ms.stddev

    assert.ok(deviation < 2, 'deviation exceeded 2ms threshold')
  })
})
```

### Caveats

By definition, performance tests are [*non-deterministic*][non-deterministic].
Their results are highly-dependent on uncontrollable environmental conditions.

Incorrect usage will lead to [test brittleness][brittle].

Because of these factors, it's only advisable to include them if
circumstances or requirements *specifically* call for them and even then they
should only be a part of integration-testing and above;
*never* as a part of unit-testing.

## Tests

Install deps

```bash
npm ci
```

Run unit tests

```bash
npm test
```

Run test coverage

```bash
npm run test:coverage
```

## Authors

[@nicholaswmin][nicholaswmin]

## License

[MIT-0 "No Attribution" License][license]


[test-badge]: https://github.com/nicholaswmin/automap/actions/workflows/test:unit.yml/badge.svg
[test-workflow]: https://github.com/nicholaswmin/automap/actions/workflows/test:unit.yml

[size-badge]: https://img.shields.io/badge/size-650%20bytes-kb.svg

[perf_hooks]: https://nodejs.org/api/perf_hooks.html
[node-hgram]: https://nodejs.org/api/perf_hooks.html#class-histogram
[perf-timerify]: https://nodejs.org/api/perf_hooks.html#performancetimerifyfn-options
[perf-observer]: https://nodejs.org/api/perf_hooks.html#class-performanceobserver

[fib]: https://en.wikipedia.org/wiki/Fibonacci_sequence
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[console-table]: https://nodejs.org/api/console.html#consoletabletabulardata-properties
[ns]: https://en.wikipedia.org/wiki/Nanosecond
[ms]: https://en.wikipedia.org/wiki/Millisecond

[mocha]: https://mochajs.org/
[brittle]: https://softwareengineering.stackexchange.com/a/356238/108346
[non-deterministic]: https://en.wikipedia.org/wiki/Nondeterministic_algorithm

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
