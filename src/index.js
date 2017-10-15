// @flow
import StateStream from './stateStream'
import setup from './setup'
import teardown from './teardown'
import { getObservable } from './Observable'
import isObservable from './utils/isObservable'

import type {
  ISubscriptionObserver,
  IObserver,
  SubscriberFunction,
  ISubscription,
  IESObservable,
  ESObservable,
} from './Observable'

export {
  StateStream,
  setup,
  teardown,
  getObservable,
  isObservable,
}

export type {
  ISubscriptionObserver,
  IObserver,
  SubscriberFunction,
  ISubscription,
  IESObservable,
  ESObservable,
}
