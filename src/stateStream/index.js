// @flow
import type { ComponentType } from 'react'
import type {
  ESObservable, IESObservable, Subscription, SubscriptionObserver,
} from '../Observable'
import { getObservable } from '../Observable'
import stateFactory from './stateFactory'
import combineStateStreams from './combineStateSteams'
import createReactObserver from '../createReactObserver'
import eventRunnerFactory from './eventRunnerFactory'

export interface IStateStream {
  constructor(name: string, initialState: any): void,

  name: ?string,

  Observable: ESObservable,

  state$: ?IESObservable,

  subscriptions: Array<Subscription>,

  observers: Array<SubscriptionObserver>,

  reactObserver: Function,

  next(updater: Function): void,

  getState(): any,

  eventRunner: Function,

  dispose(): void,
}

const defaultFn = () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('You are calling function on a disposed StateStream.')
  }
}

export type StateStreams = Array<StateStream>

export default class StateStream implements IStateStream {
  constructor(name: string, initialState: any, stateStreams?: StateStreams) {
    if (typeof name !== 'string' || !name) {
      throw new Error('Expected the name to be a not none string.')
    }

    this.name = name
    this.Observable = getObservable()

    this.state$ = stateFactory.call(this, initialState, defaultFn)
    this.state$ = combineStateStreams.call(this, this.state$, name, stateStreams)
    const {
      decorator: reactObserver,
      subscription: streamSubscription
    } = createReactObserver(this.state$)

    this.reactObserver = reactObserver
    this.subscriptions.push(streamSubscription)
    this.eventRunner = eventRunnerFactory(this.Observable, this.getState)
  }

  name = null

  Observable = getObservable()

  state$ = null

  subscriptions = []

  observers = []

  next = defaultFn

  reactObserver = (component: ComponentType<any>) => component

  getState = () => {
    throw new Error('StateStream is invalid.')
  }

  eventRunner = defaultFn

  dispose = () => {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })

    this.observers.forEach(observer => {
      observer.complete()
    })
  }
}
