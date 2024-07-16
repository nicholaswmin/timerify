class InvalidArgumentError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidArgumentError'
  }
}

const isFunction = value => {
  const expected = `Expected an argument of type: "function"`

  if (!value || typeof value === 'undefined' || typeof value !== 'function')
    throw new InvalidArgumentError(`${expected}, got: ${typeof value}`)

  return value
}

const isTimerifiedFunction = value => {
  const expectedType = `Expected an argument of type: "function"`
  const expectedDuck = `Expected a function returned by timerify(fn)`

  if (!value || typeof value === 'undefined' || typeof value !== 'function')
    throw new InvalidArgumentError(`${expectedType}, got: ${typeof value}`)

  if (!value.histogram)
    throw new InvalidArgumentError(`${expectedDuck}, got: plain function`)

  return value
}

export { isFunction, isTimerifiedFunction }
