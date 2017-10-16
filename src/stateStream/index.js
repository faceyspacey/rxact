// @flow
import type {
  ESObservable,
  IESObservable,
  ISubscription,
  ISubscriptionObserver,
} from '../observable'
import type { EventRunner as EventRunnerType } from './eventRunnerFactory'
import { getObservable } from '../observable'
import stateFactory from './stateFactory'
import combineStateStreams from './combineStateSteams'
import eventRunnerFactory from './eventRunnerFactory'

export interface IStateStream {
  constructor(streamName: string, initialState: any): void,

  streamName: string,

  Observable: ESObservable,

  state$: IESObservable,

  subscriptions: Array<ISubscription>,

  observers: Array<ISubscriptionObserver>,

  next(updater: Function): void,

  getState(): any,

  eventRunner: Function,

  dispose(): void,
}

export type StateStreams = Array<IStateStream>
export type EventRunner = EventRunnerType

class StateStream implements IStateStream {
  state$: IESObservable
  streamName: string
  Observable: ESObservable
  getState: Function
  next: Function
  eventRunner: Function

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
  }
}

export default StateStream
