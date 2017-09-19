import { createSourceStateStream, SOURCE } from '../src/stateStream'

describe('createSourceStateStream', () => {
  it('exposes the public API', () => {
    const stream = createSourceStateStream('stream', '')

    expect(stream.name).toBeDefined()
    expect(stream.state$).toBeDefined()
    expect(stream.type).toEqual(SOURCE)
    expect(stream.emit).toBeDefined()
  })

  it('map new state after emitting state', () => {
    const initialState = 'initialState'
    const newState = 'newState'
    const { state$, emit } = createSourceStateStream('source', initialState)
    let index = 0

    state$.subscribe((state) => {
      if (index === 0) {
        expect(state).toEqual(initialState)
        index += 1
      } else if (index === 1) {
        expect(state).toEqual(newState)
      }
    })

    emit(newState)
  })

  it('emit can push state directly if updater is not a function', () => {
    const initialState = 'initialState'
    const newState = 'newState'
    const { state$, emit } = createSourceStateStream('source', initialState)

    state$.skip(1).subscribe(state => {
      expect(state).toEqual(newState)
    })

    emit(newState)
  })

  it('can access previous state when emit new state', () => {
    const initialState = 'initialState'
    const newState = 'newState'
    const { state$, emit } = createSourceStateStream('source', initialState)

    state$.subscribe(() => {})

    emit((prevState) => {
      expect(prevState).toEqual(initialState)
      return newState
    })

    emit((prevState) => {
      expect(prevState).toEqual(newState)
      return prevState
    })
  })

  it('applies observer if it passed', () => {
    const initialState = 'initialState'
    const newState = 'newState'
    const observer = state$ => state$.mapTo(newState)
    const { state$ } = createSourceStateStream('source', initialState, observer)

    state$.subscribe(state => {
      expect(state).toEqual(newState)
    })
  })
})
