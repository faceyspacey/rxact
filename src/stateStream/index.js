// @flow
import type {
  ESObservable, IESObservable, Subscription, SubscriptionObserver,
} from '../Observable'
import { getObservable } from '../Observable'
import stateFactory from './stateFactory'
import combineStateStreams from './combineStateSteams'
import eventRunnerFactory from './eventRunnerFactory'

export interface IStateStream {
  constructor(streamName: string, initialState: any): void,

  streamName: string,

  Observable: ESObservable,

  state$: IESObservable,

  subscriptions: Array<Subscription>,

  observers: Array<SubscriptionObserver>,

  next(updater: Function): void,

  getState(): any,

  eventRunner: Function,

  instance(): IStateStream,

  dispose(): void,
}

export type StateStreams = Array<StateStream>

class StateStream implements IStateStream {
  state$: IESObservable
  streamName: string
  Observable: ESObservable
  getState: Function
  next: Function
  eventRunner: Function
  instance: Function

  constructor(streamName: string, initialState: any, stateStreams?: StateStreams) {
    if (typeof streamName !== 'string' || !streamName) {
      throw new Error('Expected the streamName to be a not none string.')
    }

    this.streamName = streamName
    this.Observable = getObservable()

    this.state$ = stateFactory.call(this, initialState)
    this.state$ = combineStateStreams.call(this, this.state$, streamName, stateStreams)
    this.eventRunner = eventRunnerFactory(this.Observable, this.getState)
  }

  subscriptions = []

  observers = []

  dispose = () => {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })

    this.observers.forEach(observer => {
      observer.complete()
    })
  }
}

StateStream.prototype.instance = function() {
  return this
}

export default StateStream
