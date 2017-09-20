import { createSourceStateStream, SOURCE } from '../src/stateStream'

describe('createSourceStateStream', () => {
  it('exposes the public API', () => {
    const stream = createSourceStateStream('stream', '')

    expect(stream.name).toBeDefined()
    expect(stream.state$).toBeDefined()
    expect(stream.type).toEqual(SOURCE)
    expect(stream.createEvent).toBeDefined()
    expect(stream.connect).toBeDefined()
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
    const { state$, createEvent } = createSourceStateStream('source', initialState)
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
        expect(state).toEqual(3)
        index += 1
      } else if (index === 3) {
        expect(state).toEqual(2)
        done()
      }
    })

    emit(1).delay(10).do(() => emit(2)).subscribe()
    emit(3)
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
})
