import Rx from 'rxjs'
import createSource from '../src/createSource'
import StateStream from '../src/StateStream'

describe('StateStream', () =>  {
  it('exposes the public API', () => {
    const stateStream = new StateStream()

    expect(stateStream).toBeDefined()
    expect(stateStream.observeState).toBeDefined()
    expect(stateStream.emit).toBeDefined()
  })

  it('throw if source is passed and is not a Source', () => {
    expect(() =>
      new StateStream(null, null, createSource('source', Rx.Observable.of('')))
    ).not.toThrow()

    expect(() =>
      new StateStream(null, null, {})
    ).toThrow()

    expect(() =>
      new StateStream(null, null, () => {})
    ).toThrow()

    expect(() =>
      new StateStream(null, null, '')
    ).toThrow()

    expect(() =>
      new StateStream(null, null, 1)
    ).toThrow()
  })

  it('throw if observer is passed and is not a function', () => {
    expect(() =>
      new StateStream(() => {})
    ).not.toThrow()

    expect(() =>
      new StateStream()
    ).not.toThrow()

    expect(() =>
      new StateStream('')
    ).toThrow()

    expect(() =>
      new StateStream(1)
    ).toThrow()

    expect(() =>
      new StateStream({})
    ).toThrow()
  })

  it('passes initial state', (done) => {
    const initialState = { initialState: 'initialState' }
    const stateStream = new StateStream(null, initialState)

    stateStream
      .observeState(state => {
        expect(state).toEqual(initialState)
        done()
      })
  })

  it('applies the observer to the previous state', (done) => {
    const initialState = { initialState: 'initialState' }
    const outputState = 'outputState'
    const observer = state$ => state$.mapTo(outputState)
    const stateStream = new StateStream(observer, initialState)

    stateStream
      .observeState(state => {
        expect(state).toEqual(outputState)
        done()
      })
  })

  it('observe new state when emitted', (done) => {
    const initialState = { initialState: 'initialState' }
    const newState = 'newState'
    const stateStream = new StateStream(null, initialState)
    let index = 0

    stateStream
      .observeState(state => {
        if (index === 0) {
          expect(state).toEqual(initialState)
          index += 1
        } else if (index === 1) {
          expect(state).toEqual(newState)
          done()
        }
      })
      .emit(newState)
  })

  it('connect single source', (done) => {
    const initialState = { initialState: 'initialState' }
    const sourceState = 'sourceState'
    const source = createSource('source', Rx.Observable.of(sourceState))
    const stateStream = new StateStream(null, initialState, source)

    stateStream
      .observeState(state => {
        expect(state).toEqual({ ...initialState, source: sourceState })
        done()
      })
  })

  it('connect multiple sources', (done) => {
    const initialState = { initialState: 'initialState' }
    const sourceAState = 'sourceAState'
    const sourceBState = 'sourceBAState'
    const sourceA = createSource('sourceA', Rx.Observable.of(sourceAState))
    const sourceB = createSource('sourceB', Rx.Observable.of(sourceBState))
    const stateStream = new StateStream(null, initialState, sourceA, sourceB)

    stateStream
      .observeState(state => {
        expect(state).toEqual({ ...initialState, sourceA: sourceAState, sourceB: sourceBState })
        done()
      })
  })

  it('transform state into object when connect sources', (done) => {
    const initialState = 'initialState'
    const sourceState = 'sourceState'
    const source = createSource('source', Rx.Observable.of(sourceState))
    const stateStream = new StateStream(null, initialState, source)

    stateStream
      .observeState(state => {
        expect(state).toEqual({ $: initialState, source: sourceState })
        done()
      })
  })

  it('observe new state when emit new value to source', (done) => {
    const initialState = { initialState: 'initialState' }
    const newState = { newState: 'newState' }
    const sourceState = 'sourceState'
    const sourceStream = new StateStream(null, sourceState)
    const source = sourceStream.asSource('source')
    const stateStream = new StateStream(null, initialState, source)
    let index = 0

    stateStream.observeState(state => {
      if (index === 0) {
        expect(state).toEqual({ ...initialState, source: sourceState })
        index += 1
      } else if (index === 1) {
        expect(state).toEqual({ ...initialState, source: newState })
        done()
      }
    })

    sourceStream.emit(newState)
  })

  it('observe new state when emit new value to stream', (done) => {
    const initialState = { initialState: 'initialState' }
    const newState = { newState: 'newState' }
    const sourceState = 'sourceState'
    const sourceStream = new StateStream(null, sourceState)
    const source = sourceStream.asSource('source')
    const stateStream = new StateStream(null, initialState, source)
    let index = 0

    stateStream.observeState(state => {
      if (index === 0) {
        expect(state).toEqual({ ...initialState, source: sourceState })
        index += 1
      } else if (index === 1) {
        expect(state).toEqual({ ...newState, source: sourceState })
        done()
      }
    })

    stateStream.emit(newState)
  })

  it('asSource transform stream into source', () => {
    const sourceState = 'sourceState'
    const sourceStream = new StateStream(null, sourceState)
    const sourceName = 'source'
    const source = sourceStream.asSource(sourceName)

    expect(source.name).toEqual(sourceName)
    expect(source.state$).toBeInstanceOf(Rx.Observable)
  })
})
