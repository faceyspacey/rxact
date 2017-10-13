import { MemoryStream, Stream } from 'xstream'
import noop from '../utils/noop'

Stream.prototype._xsSubscribe = Stream.prototype.subscribe
Stream.prototype.subscribe = function subscribe(onNext, onError, onComplete) {
  let listener

  if (!onNext) {
    listener = {}
  } else if (typeof onNext.next === 'function') {
    listener = onNext
  } else {
    listener = {
      next: onNext || noop,
      error: onError || noop,
      complete: onComplete || noop,
    }
  }

  return this._xsSubscribe(listener)
}

// https://github.com/staltz/xstream/blob/master/src/index.ts#L85-L93
function internalizeProducer(producer) {
  producer._start = function _start(il) {
    il.next = il._n
    il.error = il._e
    il.complete = il._c
    this.start(il)
  }
  producer._stop = producer.stop
}

export default class XStreamObservable extends MemoryStream {
  constructor(observer) {
    const producer = {
      subscription: null,
      start: (listener) => {
        this.subscription = observer(listener)
      },
      stop: () => {
        this.subscription.unsubscribe()
      },
    }

    internalizeProducer(producer)

    super(producer)
  }
}
