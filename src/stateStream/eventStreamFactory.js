// @flow
import type { ESObservable, IESObservable, Subscription } from '../Observable'
import isObservable from '../utils/isObservable'

type Run = Function => Subscription

const runner = (source$): Run => (onSubscribe) => {
  if (typeof onSubscribe === 'function') {
    return source$.subscribe(onSubscribe)
  }

  return source$.subscribe()
}

type Factory = IESObservable => IESObservable

export type CreateEventStream = (factory?: Factory, inputSource$?: IESObservable) => {
  run: Run,
}

type EventStreamFactory = (
  Observable: ESObservable, getState: Function
) => CreateEventStream

const defaultFactory = source => source

const source$Creator = (inputSource$, Observable, getState) => {
  if (inputSource$ === undefined) {
    return Observable.of(getState())
  }

  if (isObservable(inputSource$)) {
    return inputSource$
  }

  return Observable.of(inputSource$)
}

const eventStreamFactory: EventStreamFactory = (Observable, getState) => {
  const createEventStream = (factory?, inputSource$?) => {
    const source$ = source$Creator(inputSource$, Observable, getState)

    if (factory === null || factory === undefined) {
      factory = defaultFactory
    }

    if (typeof factory !== 'function') {
      throw new Error('Expected first parameter of createEventStream to be a function.')
    }

    const outputSource$ = factory(source$)

    if (!outputSource$ || !isObservable(outputSource$)) {
      throw new Error(
        'Expected an Observable object returned by factory in createStateStream'
      )
    }

    return {
      run: runner(outputSource$),
    }
  }

  return createEventStream
}

export default eventStreamFactory
