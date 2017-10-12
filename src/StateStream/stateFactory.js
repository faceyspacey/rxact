// @flow
function stateFactory(initialState: any, defaultNext: Function) {
  let state = initialState
  this.observers = []

  this.getState = () => state

  const state$ = new this.Observable(observer => {
    this.observers.push(observer)

    observer.next(state)

    return {
      unsubscribe: () => {
        this.observers = this.observers.filter(item => item !== observer)
      }
    }
  })

  const stateUpdater$ = new this.Observable(observer => {
    this.next = (updater: Function) => {
      if (typeof updater !== 'function') {
        throw new Error('Expected passing a function to emitState.')
      }

      observer.next(updater)
    }

    return {
      unsubscribe: () => {
        this.next = defaultNext
      },
    }
  })

  const emitState = (value) => {
    this.observers.forEach(observer => {
      observer.next(value)
    })
  }

  const stateUpdaterSubscription = stateUpdater$.subscribe((updater) => {
    const nextState = updater(state)
    emitState(nextState)
    state = nextState
  })

  this.subscriptions.push(stateUpdaterSubscription)

  return state$
}


export default stateFactory
