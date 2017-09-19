// @flow
import Rx from 'rxjs'
import { createChangeEmitter } from 'change-emitter'
import createConnect from './createConnect'

export const SOURCE = 'SOURCE'
export const RELAY = 'RELAY'

type StreamType = 'SOURCE' | 'RELAY'
export interface StateStream {
  name: string,
  state$: Rx.Observable,
  type: StreamType,
  connect: Function,
}

type SourceStateStream = StateStream & { type: 'SOURCE', emit: Function }
type RelayStateStream = StateStream & { type: 'RELAY' }
type Observer = Rx.Observable => Rx.Observable

const createSource = (
  name: string,
  initialState?: any,
  observer?: Observer,
): SourceStateStream => {
  const emitter = createChangeEmitter()

  let prevState = null

  let state$ = Rx.Observable
    .create((observer) => {
      emitter.listen((updater, observable) => {
        if (typeof updater !== 'function') {
          observer.next(updater)
        } else if (observable){
          updater(Rx.Observable.of(prevState)).subscribe(value => observer.next(value))
        } else {
          observer.next(updater(prevState))
        }
      })
    })
    .startWith(initialState)

  if (typeof observer === 'function') {
    state$ = observer(state$)
  }

  state$ = state$.map(state => {
    prevState = state
    return state
  })

  return {
    name,
    state$,
    type: SOURCE,
    emit: emitter.emit,
    connect: createConnect(state$),
  }
}

const createRelay = (
  name: string,
  sources: Array<StateStream>,
  observer?: Observer,
): RelayStateStream => {
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
  let state$ = Rx.Observable.combineLatest(...states$, (...states) => {
    let state = {}

    sources.forEach((source, index) => {
      state[source.name] = states[index]
    })

    return state
  })

  if (typeof observer === 'function') {
    state$ = observer(state$)
  }

  return {
    name,
    state$,
    type: RELAY,
    connect: createConnect(state$),
  }
}

export const createStateStream = (
  name: string,
  type: StreamType,
  initialState: any,
  sources?: Array<StateStream>,
  observer?: Observer,
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
    return createSource(name, initialState, observer)
  } else if (streamType === RELAY) {
    return createRelay(name, sources || [], observer)
  }

  return null
}

export const createSourceStateStream = (
  name: string,
  initialState?: any,
  observer?: Observer,
) => createStateStream(name, SOURCE, initialState, [], observer)

export const createRelayStateStream = (
  name: string,
  sources: Array<StateStream>,
  observer?: Observer,
) => createStateStream(name, RELAY, null, sources, observer)
