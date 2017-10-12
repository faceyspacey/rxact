import $$observable from 'symbol-observable'

const isObservable = (Observable) => Boolean(
  Observable && (Observable[$$observable] || Observable.prototype[$$observable])
)

export default isObservable
