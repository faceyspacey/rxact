// @flow
import $$observable from 'symbol-observable'

const isObservable = (Observable: any) => {
  if (!Observable) {
    return false
  }

  if (Observable[$$observable]) {
    return true
  }

  if (Observable.prototype && Observable.prototype[$$observable]) {
    return true
  }

  return false
}

export default isObservable
