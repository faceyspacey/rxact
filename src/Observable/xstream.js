// @flow
import { MemoryStream, Stream } from 'xstream'
import type { SubscriberFunction } from './'

Stream.prototype._xsSubscribe = Stream.prototype.subscribe
Stream.prototype.subscribe = function subscribe(onNext, onError, onComplete) {
  let listener

  if (onNext && typeof onNext.next === 'function') {
    listener = onNext
  } else {
    listener = {
      next: onNext,
      error: onError,
      complete: onComplete,
    }
  }

  return this._xsSubscribe(listener)
}

// https://github.com/staltz/xstream/blob/master/src/index.ts#L85-L93
function internalizeProducer(producer) {
  return {
    ...producer,
    _start: function _start(il) {
      il.next = il._n
      il.error = il._e
      il.complete = il._c
      producer.start(il)
    },
    _stop: producer.stop

  }
}

export default class XStreamObservable extends MemoryStream {
  constructor(subscriber: SubscriberFunction) {
    let subscription = null
    const producer = {
      start: (listener) => {
        subscription = subscriber(listener)
      },
      stop: () => {
        if (subscription) {
          subscription.unsubscribe()
        }
      },
    }

    super(internalizeProducer(producer))
  }
}
