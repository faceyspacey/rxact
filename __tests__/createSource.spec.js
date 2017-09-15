import Rx from 'rxjs'
import createSource from '../src/createSource'

describe('createSource', () =>  {
  it('exposes the public API', () => {
    const source = createSource('source', Rx.Observable.of(''))

    expect(source.name).toBeDefined()
    expect(source.state$).toBeDefined()
  })

  it('throw if name is invalid', () => {
    const state$ = Rx.Observable.of('')

    expect(() =>
      createSource('source', state$)
    ).not.toThrow()

    expect(() =>
      createSource(1, state$)
    ).not.toThrow()

    expect(() =>
      createSource(Symbol(''), state$)
    ).not.toThrow()

    expect(() =>
      createSource('', state$)
    ).toThrow()

    expect(() =>
      createSource({}, state$)
    ).toThrow()

    expect(() =>
      createSource()
    ).toThrow()

    expect(() =>
      createSource(() => {}, state$)
    ).toThrow()
  })

  it('throw if state$ is invalid', () => {
    const state$ = Rx.Observable.of('')

    expect(() =>
      createSource('source', state$)
    ).not.toThrow()

    expect(() =>
      createSource('source', {})
    ).toThrow()
  })
})
