// @flow
import type { IESObservable } from '../Observable'
import type { StateStreams } from './'

function combineStateStreams(
  currentState$: IESObservable, name: string, stateStreams?: StateStreams,
) {
  if (!stateStreams || stateStreams.length === 0) {
    return currentState$
  }

  const streamNames = {}

  stateStreams.forEach((source) => {
    if (typeof source !== 'object' || !source.name || !source.state$) {
      throw new Error('Expected the element of stateStreams to be type of StateStream.')
    }

    streamNames[source.name] = true
  })

  if (Object.keys(streamNames).length !== stateStreams.length) {
    throw new Error('StateStreams\' name should be unique.')
  }

  const sources = [...stateStreams, { name, state$: currentState$ }]
  const combinedState$ = new this.Observable(observer => {
    let currentState = {}

    // $flow-ignore
    const subscriptions = sources.map((source) => source.state$.subscribe((state) => {
      const sourceName = source.name || ''

      const nextState = { ...currentState, [sourceName]: state }
      currentState = nextState

      if (Object.keys(currentState).length === sources.length) {
        observer.next(currentState)
      }
    }))

    this.subscriptions = this.subscriptions.concat(subscriptions)

    return () => {
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
    }
  })

  return combinedState$
}

export default combineStateStreams
