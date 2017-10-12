import xs from 'xstream'
import $$observable from 'symbol-observable'
import noop from '../utils/noop'

export default class XStreamObservable {
  constructor(observer) {
    const XStream = xs.createWithMemory({
      subscription: null,
      start: (listener) => {
        this.subscription = observer(listener)
      },
      stop: () => {
        this.subscription.unsubscribe()
      },
    })

    XStream.xsSubscribe = XStream.subscribe
    XStream.subscribe = function subscribe(onNext, onError, onComplete) {
      let listener = {}

      if (typeof onNext.next === 'function') {
        listener = onNext
      } else {
        listener = {
          next: onNext || noop,
          error: onError || noop,
          complete: onComplete || noop,
        }
      }

      return this.xsSubscribe(listener)
    }

    return XStream
  }

  [$$observable]() {
    return this
  }
}
