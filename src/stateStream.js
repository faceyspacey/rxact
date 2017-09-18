// @flow
import Rx from 'rxjs'
import { createChangeEmitter } from 'change-emitter'

export const SOURCE = 'SOURCE'
export const RELAY = 'RELAY'

type StreamType = 'SOURCE' | 'RELAY'
export interface StateStream {
  name: string,
  state$: Rx.Observable,
  type: StreamType,
}

type SourceStateStream = StateStream & { type: 'SOURCE', emit: Function }
type RelayStateStream = StateStream & { type: 'RELAY' }

const createSource = (name: string, initialState?: any): SourceStateStream => {
  const emitter = createChangeEmitter()

  let prevState = null

  const state$ = Rx.Observable
    .create((observer) => {
      emitter.listen(updater => {
        if (typeof updater !== 'function') {
          observer.next(updater)
        } else {
          observer.next(updater(prevState))
        }
      })
    })
    .startWith(initialState)
    .map(state => {
      prevState = state
      return state
    })

  return {
    name,
    state$,
    type: SOURCE,
    emit: emitter.emit,
  }
}

const createRelay = (name: string, sources: Array<StateStream>): RelayStateStream => {
  if (sources.length === 0) {
    throw new Error('Expected the sources to be passed.')
  }

  const sourceNames = {}
  sources.forEach((source) => {
    if (typeof source !== 'object' || !source.name || !source.state$ || !source.type) {
      throw new Error('Expected the source to be type of StateStream.')
    }

    sourceNames[source.name] = 1
  })

  if (Object.keys(sourceNames).length !== sources.length) {
    throw new Error('Sources\' name should be unique.')
  }

  const states$ = sources.map(source => source.state$)
  const state$ = Rx.Observable.combineLatest(...states$, (...states) => {
    let state = {}

    sources.forEach((source, index) => {
      state[source.name] = states[index]
    })

    return state
  })

  return {
    name,
    state$,
    type: RELAY,
  }
}

export const createStateStream = (
  name: string,
  type: StreamType,
  initialState: any,
  ...sources: Array<StateStream>
) => {
  if (typeof name !== 'string' || !name) {
    throw new Error('Expected the name to be a not none string.')
  }

  if (!type
    || typeof type !== 'string'
    || ![SOURCE, RELAY].find(streamType => streamType === type)
  ) {
    throw new Error('Expected the type to be one of [SOURCE, RELAY].')
  }

  let streamType = type.toUpperCase()

  if (streamType === SOURCE) {
    return createSource(name, initialState)
  } else if (streamType === RELAY) {
    return createRelay(name, [initialState, ...sources])
  }

  return null
}

export const createSourceStateStream = (
  name: string,
  initialState?: any
) => createStateStream(name, SOURCE, initialState)

export const createRelayStateStream = (
  name: string,
  sources: Array<StateStream>
) => createStateStream(name, RELAY, ...sources)
