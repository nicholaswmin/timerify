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

export { isFunction }
