import { createStateStream, RELAY, SOURCE } from '../src/stateStream'

describe('createStateStream', () => {
  it('throw if name is invalid', () => {
    expect(() =>
      createStateStream('source', SOURCE)
    ).not.toThrow()

    expect(() =>
      createStateStream(1, SOURCE)
    ).toThrow()

    expect(() =>
      createStateStream(Symbol(''), SOURCE)
    ).toThrow()

    expect(() =>
      createStateStream('', SOURCE)
    ).toThrow()

    expect(() =>
      createStateStream({}, SOURCE)
    ).toThrow()

    expect(() =>
      createStateStream()
    ).toThrow()

    expect(() =>
      createStateStream(() => {}, SOURCE)
    ).toThrow()
  })

  it('throw if type is not one of [SOURCE, RELAY]', () => {
    expect(() =>
      createStateStream('source', SOURCE)
    ).not.toThrow()

    expect(() =>
      createStateStream('stream', RELAY, null, [createStateStream('source', SOURCE)])
    ).not.toThrow()

    expect(() =>
      createStateStream('source', '')
    ).toThrow()

    expect(() =>
      createStateStream('source')
    ).toThrow()

    expect(() =>
      createStateStream('source', () => {})
    ).toThrow()
  })
})
