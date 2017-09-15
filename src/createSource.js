// @flow
import Rx from 'rxjs'

export type Source = {
  name: string,
  state$: Rx.Observable
}

const createSource = (name: string, state$: Rx.Observable): Source => {
  if ((!name && name !== 0) || typeof name === 'object' || typeof name === 'function') {
    throw new Error('Expected the name to be a not none string or number or Symbol.')
  }

  if (!state$ || !(state$ instanceof Rx.Observable)) {
    throw new Error('Expected the state$ to be a Rx.Observable instance.')
  }

  return {
    name,
    state$,
  }
}

export default createSource
