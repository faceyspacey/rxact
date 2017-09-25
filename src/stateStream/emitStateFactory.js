import Rx from 'rxjs'

const emitStateFactory = (stateSubject) => {
  const subject = new Rx.Subject()

  subject.subscribe({
    next: updater => {
      const nextState = updater(stateSubject.getValue())
      stateSubject.next(nextState)
    }
  })

  const emitState = (updater) => {
    if (typeof updater !== 'function') {
      throw new Error('Expected passing a function to emitState.')
    }

    subject.next(updater)
  }

  return emitState
}

export default emitStateFactory
