import Observable from 'zen-observable'
import setup from '../src/setup'
import teardown from '../src/teardown'

describe('setup', () => {
  beforeEach(() => {
    teardown()
  })

  it('throw error if options is not an object', () => {
    expect(() => {
      setup(Observable)
    }).toThrow()

    expect(() => {
      setup('')
    }).toThrow()
  })

  it('throw error when setup with invalid observable', () => {
    expect(() => {
      setup({ Observable: '' })
    }).toThrow()
    expect(() => {
      setup({ Observable })
    }).not.toThrow()
  })

  it('Expect setup only once in app lifetime', () => {
    setup({ Observable })
    expect(() => {
      setup({ Observable })
    }).toThrow()
  })
})
