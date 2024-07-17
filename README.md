[![test-workflow][test-badge]][test-workflow] [![coverage-workflow][coverage-badge]][coverage-report] [![codeql-workflow][codeql-badge]][codeql-workflow] [![size-report][size-badge]][size-report]

# timerify

tiny performance testing utility

> uses native [`PerformanceMeasurement APIs`][perf_hooks][^1]

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

console.log(timed_fibonacci.stats_ms.count)
// 3 (times called)

console.log(timed_fibonacci.stats_ms.mean)
// 2.94 (milliseconds, per run, on average)
```

#### [`Promise`][promise]/[`async`][async] functions

same as above, just `await` the returned function:

```js
const sleep = ms => new Promise((resolve => setTimeout(resolve, ms)))

const timed_sleep = timerify(sleep)

await timed_sleep(100)
await timed_sleep(100)
await timed_sleep(100)

console.log(timed_sleep.stats_ms.count)
// 3 (times called)

console.log(timed_sleep.stats_ms.mean)
// 100 (milliseconds)
```

### Recorded data

Timerified functions contain recorded statistics in:

#### milliseconds

`timerified.stats_ns`

> expresses durations in [*nanoseconds (ns)*][ns]

#### nanoseconds

`timerified.stats_ms`

> expresses durations in [*milliseconds (ms)*][ms]

#### Recorded values

Both contain the following:

| property      	| description                                      	  |
|---------------	|----------------------------------------------------	|
| `count`       	| count of function invocations                      	|
| `min`         	| fastest recorded duration                          	|
| `mean`        	| statistical [mean][mean] of all durations          	|
| `max`         	| slowest recorded duration                          	|
| `stddev`      	| [standard deviation][stddev] of all durations      	|
| `percentiles` 	| [k-th percentiles][percentiles] of all durations   	|

> example: log running time of `foo`, in `nanoseconds`:

```js
const timed_foo = timerify(foo)

timed_foo()
timed_foo()
timed_foo()

console.log(timed_foo.stats_ns)

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
const timed_foo = timerify(foo)

timed_foo()
timed_foo()
timed_foo()

console.log(timed_foo.stats_ms)

//  count: 3,
//  min: 3.97,
//  max: 4.03,
//  mean: 4,
//  exceeds: 0,
//  stddev: 0.02,
//  percentiles: {  '75': 4.02, '100': 4.03, '87.5': 4.03 }
```

> both are derived from an internal [`perf_hooks: Histogram`][node_hgram].

### `timerified.reset()`

`timerified.reset()` resets recorded stats.

> example: run `foo` 2 times, reset recorded stats to `0` & continue recording:

```js
const timed_foo = timerify(foo)

timed_foo()
timed_foo()

console.log(timed_foo.stats_ms.max)
// 2.01

timed_foo.reset()

console.log(timed_foo.stats_ms.max)
// 0

timed_foo()
timed_foo()

console.log(timed_foo.stats_ms.max)
// 1.99
```

### `log([fn,fn...])`

Pretty-prints the recorded durations of one or more timerified functions.

> example: pretty-print the stats of `foo` and `bar`:

```js
import { timerify, log } from '@nicholaswmin/timerify'

const foo = () => new Promise((resolve => setTimeout(resolve, 5)))
const bar = () => new Promise((resolve => setTimeout(resolve, 15)))

const timed_foo = timerify(foo)
const timed_bar = timerify(bar)

for (let i = 0; i < 30; i++)
  await timed_foo()

for (let i = 0; i < 50; i++)
  await timed_bar()

log([ timed_foo, timed_bar ])
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

> requires Node.js v20+

```js
import test from 'node:test'
import assert from 'node:assert'

import { timerify } from '@nicholaswmin/timerify'

const fibonacci = n => n < 1 ? 0 : n <= 2
  ? 1 : fibonacci(n - 1) + fibonacci(n - 2)

test('perf: #fibonacci(20) x 10 times', async t => {
  t.beforeEach(() => {
    for (let i = 0; i < 10; i++)
      timed_fibonacci(20)
  })

  await t.test('called 10 times', () => {
    const callCount = timed_fibonacci.stats_ms.count

    assert.strictEqual(callCount, 10)
  })

  await t.test('runs quickly, on average', () => {
    const mean = timed_fibonacci.stats_ms.mean

    assert.ok(mean < 30, `mean: ${mean} ms exceeded 30ms threshold`)
  })

  await t.test('has consistent running times', () => {
    const dev = timed_fibonacci.stats_ms.stddev

    assert.ok(dev < 2, `deviation: ${dev} ms exceeded 30ms threshold`)
  })
})
```

In the examples above, I specifically omit testing for the statistical
`min`/`max`, opting instead for `mean` and `deviation`.

This is *intentional*. `min`/`max` times aren't useful metrics unless you're
building a pacemaker or the chronometer that launches the Space Shuttle, in
which case you probably wouldn't be looking at this page.
They are also very susceptible to environmental events that are outside
your control hence they can make your tests [very brittle][brittle].

Performance-testing shouldn't ever be included as part of unit-testing.
At best my advice is to keep them around in a CI workflow and have them
serve as [canaries][canaries] that you check every now and then.

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

[codeql-badge]: https://github.com/nicholaswmin/timerify/actions/workflows/codeql.yml/badge.svg
[codeql-workflow]: https://github.com/nicholaswmin/timerify/actions/workflows/codeql.yml

[size-report]: https://bundlephobia.com/package/@nicholaswmin/timerify
[size-badge]: https://img.shields.io/badge/size-950%20bytes-b.svg

[hgram]: https://en.wikipedia.org/wiki/Histogram
[mean]: https://en.wikipedia.org/wiki/Mean
[stddev]: https://en.wikipedia.org/wiki/Standard_deviation
[percentiles]: https://en.wikipedia.org/wiki/Percentile

[perf_hooks]: https://nodejs.org/api/perf_hooks.html
[node_hgram]: https://nodejs.org/api/perf_hooks.html#class-histogram
[perf_timerify]: https://nodejs.org/api/perf_hooks.html#performancetimerifyfn-options

[fib]: https://en.wikipedia.org/wiki/Fibonacci_sequence
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[console-table]: https://nodejs.org/api/console.html#consoletabletabulardata-properties
[ns]: https://en.wikipedia.org/wiki/Nanosecond
[ms]: https://en.wikipedia.org/wiki/Millisecond

[node-test]: https://nodejs.org/api/test.html#test-runner
[brittle]: https://softwareengineering.stackexchange.com/a/356238/108346
[indeterminacy]: https://en.wikipedia.org/wiki/Indeterminacy_in_computation
[canaries]: https://review.gale.com/2020/09/08/canaries-in-the-coal-mine/

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE

## Footnotes

[^1]: This module assembles native [`PerformanceMeasurement`][perf_hooks]
      utilities such as [`performance.timerify`][perf_timerify] &
      [`Histogram`][node_hgram] into an easy-to-use unit which avoids
      repeated & elaborate test setups.
      You can skip this module entirely and just use the native functions.
