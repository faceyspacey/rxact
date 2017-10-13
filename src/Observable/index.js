// @flow
// https://github.com/tc39/proposal-observable
import $$observable from 'symbol-observable'
import isObservable from '../utils/isObservable'

interface ISubscriptionObserver {

    // Sends the next value in the sequence
    next(value: any): void,

    // Sends the sequence error
    error(errorValue: Error): void,

    // Sends the completion notification
    complete(): void,

    // A boolean value indicating whether the subscription is closed
    +closed: Boolean,
}

export type SubscriptionObserver = ISubscriptionObserver

interface IObserver {

    // Receives the subscription object when `subscribe` is called
    start(subscription: Subscription): void,

    // Receives the next value in the sequence
    next(value: any): void,

    // Receives the sequence error
    error(errorValue: Error): void,

    // Receives a completion notification
    complete(): void,
}

type Observer = IObserver

type SubscriberFunction = (observer: SubscriptionObserver) =>
  (void => void) | Subscription

interface ISubscription {

    // Cancels the subscription
    unsubscribe(): void,

    // A boolean value indicating whether the subscription is closed
    +closed?: Boolean,
}

export type Subscription = ISubscription

export interface IESObservable {
    constructor(subscriber: SubscriberFunction): void,

    // Subscribes to the sequence with an observer
    subscribe(observer?: Observer): Subscription,

    // Subscribes to the sequence with callbacks
    subscribe(onNext: Function,
              onError?: Function,
              onComplete?: Function): Subscription,

    // Returns itself
    [$$observable]: () => IESObservable,

    // Converts items to an Observable
    static of(...items: Array<any>): IESObservable,

    // Converts an observable or iterable to an Observable
    static from(observable: ESObservable | Iterable<any>): IESObservable,
}

let Observable: ?ESObservable = null

const setObservable = (ObservableImplement: ESObservable) => {
  if (isObservable(Observable)) {
    throw new Error('Expected setup once in your app lifetime.')
  }
  Observable = ObservableImplement
}

const getObservable = (): ESObservable => {
  if (!Observable) {
    throw Error('You must configure Observable first.')
  }

  return Observable
}

const cleanObservable = () => {
  Observable = null
}

export type ESObservable = Class<IESObservable>

export {
  setObservable,
  getObservable,
  cleanObservable,
}
