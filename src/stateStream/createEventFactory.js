// @flow
import Rx from 'rxjs'

const createEventFactory = (stateSubject: Rx.Subject) => {
  const eventSource$ = Rx.Observable.create(() => {})
  const eventSubject = new Rx.Subject()
  const event$ = eventSource$.multicast(eventSubject).refCount()

  event$
    .mergeMap(({ factory, payload, subject }) => {
      return factory(Rx.Observable.of({
        state: stateSubject.getValue(),
        payload,
      })).do(result => subject.next(result))
    })
    .subscribe()

  const createEvent = (factory: Function, payloadCreator: Function) => {
    if (typeof factory !== 'function') {
      throw new Error('Expected params of createEvent to be a function.')
    }

    if (payloadCreator && typeof payloadCreator !== 'function') {
      throw new Error('Expected params of createEvent to be a function.')
    }

    const subject = new Rx.BehaviorSubject()

    return (...params: any) => {

      const payload = payloadCreator ? payloadCreator(...params) : params[0]

      subject.mergeMap()

      eventSubject.next({ payload, subject, factory })

      return subject.first()
    }
  }

  return createEvent
}

export default createEventFactory
