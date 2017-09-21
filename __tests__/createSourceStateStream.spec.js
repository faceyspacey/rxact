import { createSourceStateStream, SOURCE } from '../src/stateStream'

describe('createSourceStateStream', () => {
  it('exposes the public API', () => {
    const stream = createSourceStateStream('stream', '')

    expect(stream.name).toBeDefined()
    expect(stream.state$).toBeDefined()
    expect(stream.type).toEqual(SOURCE)
    expect(stream.createEvent).toBeDefined()
    expect(stream.connect).toBeDefined()
    expect(stream.observe).toBeDefined()
    expect(stream.getState).toBeDefined()
  })

  it('throw error if passing param is not a function for createEvent', () => {
    expect(() => {
      createSourceStateStream('stream', '').createEvent(() => {})
    }).not.toThrow()

    expect(() => {
      createSourceStateStream('stream', '').createEvent()
    }).toThrow()

    expect(() => {
      createSourceStateStream('stream', '').createEvent('')
    }).toThrow()

    expect(() => {
      createSourceStateStream('stream', '').createEvent(1)
    }).toThrow()

    expect(() => {
      createSourceStateStream('stream', '').createEvent({})
    }).toThrow()
  })

  it('getState can get latest state of stream', () => {
    const initialState = 0
    const {
      createEvent,
      getState,
    } = createSourceStateStream('source', initialState)
    const emit = createEvent((event$, state) => event$.mapTo(state))

    expect(getState()).toEqual(initialState)

    emit(1)

    expect(getState()).toEqual(1)
  })

  it('update state through event', () => {
    const initialState = 'initialState'
    const newState = 'newState'
    const { state$, createEvent } = createSourceStateStream('source', initialState)
    const emit = createEvent((event$, value) => event$.mapTo(value))
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

  it('update state through event by updater', () => {
    const initialState = { initialState: 'initialState' }
    const newState = 'newState'
    const { state$, createEvent } = createSourceStateStream('source', initialState)
    const emit = createEvent((event$, value) =>
      event$.mapTo((state) => ({ ...state, value: value }))
    )
    let index = 0

    state$.subscribe((state) => {
      if (index === 0) {
        expect(state).toEqual(initialState)
        index += 1
      } else if (index === 1) {
        expect(state).toEqual({ ...initialState, value: newState })
      }
    })

    emit(newState)
  })

  it('do not update state if return undefined in event stream', () => {
    const initialState = { initialState: 'initialState' }
    const { state$, createEvent } = createSourceStateStream('source', initialState)
    const emit = createEvent(event$ => event$.mapTo(undefined))
    const subscribe = jest.fn()

    state$.subscribe(subscribe)
    emit()

    expect(subscribe).toHaveBeenCalledTimes(1)
  })

  it('get stream return by event', (done) => {
    const initialState = 0
    const {
      state$,
      createEvent,
      getState,
    } = createSourceStateStream('source', initialState)
    const emit = createEvent((event$, state) => event$.mapTo(state))
    let index = 0

    state$.subscribe((state) => {
      if (index === 0) {
        expect(state).toEqual(0)
        index += 1
      } else if (index === 1) {
        expect(state).toEqual(1)
        index += 1
      } else if (index === 2) {
        expect(state).toEqual(5)
        index += 1
      } else if (index === 3) {
        expect(state).toEqual(6)
        done()
      }
    })

    emit(1)
      .delay(20)
      .do(() => emit(getState() + 1))
      .subscribe()
    emit(5)
  })

  it('update state correctly in asynchronous way', (done) => {
    const initialState = { initialState: 'initialState' }
    const newState = 'newState'
    const newState2 = 'newState2'
    const { state$, createEvent } = createSourceStateStream('source', initialState)
    const emit = createEvent((event$, value) =>
      event$.mapTo((state) => ({ ...state, newState: value }))
    )

    const emitAsync = createEvent((event$, value) =>
      event$
        .delay(10)
        .mapTo((state) => ({ ...state, newState2: value }))
    )

    let index = 0

    state$.subscribe((state) => {
      if (index === 0) {
        expect(state).toEqual(initialState)
        index += 1
      } else if (index === 1) {
        index += 1
        expect(state).toEqual({ ...initialState, newState: newState })
      } else if (index === 2) {
        expect(state).toEqual({
          ...initialState,
          newState,
          newState2,
        })
        done()
      }
    })

    emitAsync(newState2)
    emit(newState)
  })

  it('throw if observe is not a function, and not return Observable', () => {
    expect(() => {
      createSourceStateStream('source', '').observe(state$ => state$)
    }).not.toThrow()

    expect(() => {
      createSourceStateStream('source', '').observe(() => {})
    }).toThrow()

    expect(() => {
      createSourceStateStream('source', '').observe()
    }).toThrow()

    expect(() => {
      createSourceStateStream('source', '').observe({})
    }).toThrow()

    expect(() => {
      createSourceStateStream('source', '').observe('')
    }).toThrow()

    expect(() => {
      createSourceStateStream('source', '').observe(1)
    }).toThrow()
  })

  it('always can get current value whenever observing', () => {
    const initialState = 0
    const source = createSourceStateStream('source', initialState)
    const newState = 1

    source.observe(state$ => state$.first().do(state => {
      expect(state).toEqual(initialState)
    }))

    source.createEvent(state$ => state$.mapTo(newState))()

    source.observe(state$ => state$.do(state => {
      expect(state).toEqual(newState)
    }))
  })

  it('multiple subscribe will receive same state', () => {
    const source = createSourceStateStream('source', 0)
    const newState = 1

    source.observe(state$ => state$.skip(1).do(state => {
      expect(state).toEqual(newState)
    }))

    source.observe(state$ => state$.skip(1).do(state => {
      expect(state).toEqual(newState)
    }))

    source.createEvent(state$ => state$.mapTo(newState))()
  })
})
