import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/mapTo'

import { createSourceStateStream, SOURCE } from '../src/stateStream'

describe('createSourceStateStream', () => {
  it('exposes the public API', () => {
    const stream = createSourceStateStream('stream', '')

    expect(stream.name).toBeDefined()
    expect(stream.state$).toBeDefined()
    expect(stream.type).toEqual(SOURCE)
    expect(stream.createEvent).toBeDefined()
    expect(stream.emitState).toBeDefined()
    expect(stream.connect).toBeDefined()
    expect(stream.observe).toBeDefined()
    expect(stream.getState).toBeDefined()
  })

  describe('createEvent', () => {
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

    it('update state after event happened', () => {
      const initialState = 'initialState'
      const newState = 'newState'
      const {
        state$, createEvent, emitState,
      } = createSourceStateStream('source', initialState)
      const emit = createEvent(
        event$ => event$
          .pluck('payload', 'value')
          .do(value => emitState(() => value)),
        value => ({ value }),
      )

      state$.skip(1).subscribe((state) => {
        expect(state).toEqual(newState)
      })

      emit(newState)
    })

    it('get stream return by event', (done) => {
      const initialState = 0
      const {
        state$,
        createEvent,
        emitState,
        getState,
      } = createSourceStateStream('source', initialState)
      const emit = createEvent(
        event$ => event$
          .pluck('payload')
          .map(value => {
            emitState(() => value)

            return value
          })
      )
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
        .do(value => emit(getState() + value))
        .subscribe()
      emit(5)
    })
  })

  describe('getState', () => {
    it('getState can get latest state of stream', () => {
      const initialState = 0
      const {
        emitState,
        getState,
      } = createSourceStateStream('source', initialState)
      const emit = (value) => emitState(() => value)

      expect(getState()).toEqual(initialState)

      emit(1)

      expect(getState()).toEqual(1)
    })
  })

  describe('observe', () => {
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

      source.emitState(() => newState)

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

      source.emitState(() => newState)
    })
  })

  describe('emitState', () => {
    it('throw if emitState don\'t receive function param', () => {
      const source = createSourceStateStream('source', 0)
      expect(() => {
        source.emitState(state => state)
      }).not.toThrow()

      expect(() => {
        source.emitState()
      }).toThrow()

      expect(() => {
        source.emitState('')
      }).toThrow()

      expect(() => {
        source.emitState(1)
      }).toThrow()

      expect(() => {
        source.emitState({})
      }).toThrow()
    })

    it('emit new state throw emitState', () => {
      const source = createSourceStateStream('source', 0)
      source.emitState(() => 1)
      expect(source.getState()).toEqual(1)
    })

    it('emit new state based on previous state', () => {
      const source = createSourceStateStream('source', 0)
      source.emitState(count => count + 1)
      source.emitState(count => count + 2)

      expect(source.getState()).toEqual(3)
    })
  })
})
