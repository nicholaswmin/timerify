[![test-workflow][test-badge]][test-workflow] [![coverage-workflow][coverage-badge]][coverage-report] [![test-workflow][size-badge]][size-report]

# timerify

tiny performance testing utility

> uses native [Performance Measurement APIs][perf_hooks]

## Usage

### Install

```bash
npm i @nicholaswmin/timerify
```

### `timerify(fn)`

Instruments and returns a `function`.

You then use the instrumented function, preferrably `n` times.

> example: log the `mean` runtime duration from 3 runs of:

> a [`fibonacci function`][fib] computing the 10th fibonacci number

```js
import { timerify } from 'timerify'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

const timed_fibonacci = timerify(fibonacci)

timed_fibonacci(10)  // recorded
timed_fibonacci(10)  // recorded
timed_fibonacci(10)  // recorded

console.log(timed_fibonacci.histogram_ms.count)
// 3 (times called)

console.log(timed_fibonacci.histogram_ms.mean)
// 2.94 (milliseconds, per run, on average)
```

> uses [`performance.timerify`][perf-timerify] so you can also get runtime
> stats by setting up a [`PerformanceObserver`][perf-observer].

#### [`Promise`][promise]/[`async`][async] functions

same as above, just `await` the returned function:

```js
const sleep = ms => new Promise((resolve => setTimeout(resolve, ms)))

const timed_sleep = timerify(sleep)

await timed_sleep(100)
await timed_sleep(100)
await timed_sleep(100)

console.log(timerified.histogram_ms.count)
// 3 (times called)

console.log(timerified.histogram_ms.mean)
// 100 (milliseconds)
```

### Histograms

Timerified functions contain 2 [`Histograms`][hgram]:

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

> the histograms are JSONs of [`perf_hooks: Histogram`][node-hgram].

### `timerified.reset()`

`timerified.reset()` resets recorded stats.

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

### `log([fn,fn...])`

Pretty-prints the recorded durations of one or more timerified functions.

> example: pretty-print the stats of `foo` and `bar`:

```js
import { timerify, log } from '@nicholaswmin/timerify'

const foo = () => new Promise((resolve => setTimeout(resolve, 5)))
const bar = () => new Promise((resolve => setTimeout(resolve, 15)))

const fooTimerified = timerify(foo)
const barTimerified = timerify(bar)

for (let i = 0; i < 30; i++)
  await fooTimerified()

for (let i = 0; i < 50; i++)
  await barTimerified()

log([ fooTimerified, barTimerified ])
```

logs:

```console
┌────────────────┬───────┬──────────┬───────────┬──────────┬─────────────┐
│ (index)        │ count │ min (ms) │ mean (ms) │ max (ms) │ stddev (ms) │
├────────────────┼───────┼──────────┼───────────┼──────────┼─────────────┤
│ timerified foo │ 30    │ 4.56     │ 5.68      │ 6.25     │ 0.25        │
│ timerified bar │ 50    │ 15.14    │ 16.04     │ 16.21    │ 0.23        │
└────────────────┴───────┴──────────┴───────────┴──────────┴─────────────┘
```

## Usage with test runners

Just assert the result in any test runner using any assertion library

> example: using [node test-runner][node-test]:

> requires Node.js v22+

```js
import test from 'node:test'
import { timerify } from '@nicholaswmin/timerify'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

test('perf: #fibonacci(20) x 10 times', async t => {
  t.beforeEach(() => {
    console.log('called')
    for (let i = 0; i < 10; i++)
      timed_fibonacci(20)
  })

  await t.test('called 10 times', t => {
    const callCount = timed_fibonacci.histogram_ms.count

    t.assert.strictEqual(callCount, 10)
  })

  await t.test('runs quickly, on average', t => {
    const mean = timed_fibonacci.histogram_ms.mean

    t.assert.ok(mean < 30, `mean: ${mean} ms exceeded 30ms threshold`)
  })

  await t.test('has consistent running times', t => {
    const dev = timed_fibonacci.histogram_ms.stddev

    t.assert.ok(dev < 2, `deviation: ${dev} ms exceeded 30ms threshold`)
  })
})
```

### Caveats

By definition, performance tests are [*non-deterministic*][indeterminacy].
Their results are highly-dependent on uncontrollable environmental conditions.

Incorrect usage will lead to [test brittleness][brittle].

In the examples above, I specifically omit testing for the statistical
`min`/`max`, opting instead for statistical `mean` and `deviation`.
While more predictable, they are still environmentally-dependent variables.

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

[coverage-badge]: https://coveralls.io/repos/github/nicholaswmin/timerify/badge.svg?branch=main
[coverage-report]: https://coveralls.io/github/nicholaswmin/timerify?branch=main

[size-report]: https://bundlephobia.com/package/@nicholaswmin/timerify@0.1.0
[size-badge]: https://img.shields.io/badge/size-950%20bytes-b.svg

[hgram]: https://en.wikipedia.org/wiki/Histogram
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

[node-test]: https://nodejs.org/api/test.html#test-runner
[brittle]: https://softwareengineering.stackexchange.com/a/356238/108346
[indeterminacy]: https://en.wikipedia.org/wiki/Indeterminacy_in_computation

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
