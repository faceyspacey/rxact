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

type SourceStateStream = StateStream & { type: 'SOURCE', createEvent: Function }
type RelayStateStream = StateStream & { type: 'RELAY' }

const createSource = (
  name: string,
  initialState?: any,
): SourceStateStream => {
  const stateEmitter = createChangeEmitter()
  const eventEmitter = createChangeEmitter()
  let observers = []

  const currentState$ = Rx.Observable.create((observer) => {
    stateEmitter.listen(value => observer.next(value))
  }).startWith(initialState)

  let currentState = initialState

  const event$ = Rx.Observable
    .create((observer) => {
      eventEmitter.listen(value => observer.next(value))
    })
    .mergeMap((event) => {
      const currentObserver = observers.find(observer => observer === event.type)
      const currentEvent$ = Rx.Observable.of({ state: currentState })

      if (currentObserver) {
        return currentObserver(currentEvent$, ...event.params).map(state => ({
          state,
          hookEmitter: currentObserver.hookEmitter,
        }))
      }

      return Rx.Observable.empty()
    })

  event$.subscribe(event => {
    if (!event) { return }

    const { state: updater, hookEmitter } = event

    if (updater === undefined) { return }

    let nextState = updater
    if (typeof updater === 'function') {
      nextState = updater(currentState)
    }
    currentState = nextState
    stateEmitter.emit(nextState)

    if (hookEmitter) {
      hookEmitter.emit({ state: nextState })
    }
  })

  const createEvent = fn => {
    if (typeof fn !== 'function') {
      throw new Error('Expected param of createEvent to be a function.')
    }

    const hookEmitter = createChangeEmitter()
    const hook$ = Rx.Observable.create((observer) => {
      hookEmitter.listen(value => observer.next(value))
    })

    fn.hookEmitter = hookEmitter

    observers = [...observers, fn]

    return (...params) => {

      eventEmitter.emit({
        type: fn,
        params,
      })

      return hook$.first()
    }
  }


  return {
    name,
    createEvent,
    state$: currentState$,
    type: SOURCE,
    connect: createConnect(currentState$),
  }
}

const createRelay = (
  name: string,
  sources: Array<StateStream>,
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
    connect: createConnect(state$),
  }
}

export const createStateStream = (
  name: string,
  type: StreamType,
  initialState: any,
  sources?: Array<StateStream>,
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
    return createRelay(name, sources || [])
  }

  return null
}

export const createSourceStateStream = (
  name: string,
  initialState?: any,
) => createStateStream(name, SOURCE, initialState, [])

export const createRelayStateStream = (
  name: string,
  sources: Array<StateStream>,
) => createStateStream(name, RELAY, null, sources)
