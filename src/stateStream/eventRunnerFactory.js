// @flow
import type { ESObservable, IESObservable } from '../Observable'
import isObservable from '../utils/isObservable'

type Factory = IESObservable => IESObservable

export type EventRunner = (
  factory?: Factory, inputSource$?: IESObservable
) => IESObservable

type EventRunnerFactory = (
  Observable: ESObservable, getState: Function
) => EventRunner

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

const eventRunnerFactory: EventRunnerFactory = (Observable, getState) => {
  const eventRunner = (factory?, inputSource$?) => {
    const source$ = source$Creator(inputSource$, Observable, getState)

    if (factory === null || factory === undefined) {
      factory = defaultFactory
    }

    if (typeof factory !== 'function') {
      throw new Error('Expected first parameter of eventRunner to be a function.')
    }

    const outputSource$ = factory(source$)

    if (!outputSource$ || !isObservable(outputSource$)) {
      throw new Error(
        'Expected an Observable object returned by factory in eventRunner'
      )
    }

    outputSource$.subscribe(() => {})

    return outputSource$
  }

  return eventRunner
}

export default eventRunnerFactory
