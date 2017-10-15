// @flow
import { setObservable } from './observable'
import isObservable from './utils/isObservable'
import type { ESObservable } from './observable'

const setup = (Observable: ESObservable) => {
  if (!isObservable(Observable)) {
    throw new Error('Expected an ES Observable. For more info: https://github.com/tc39/proposal-observable')
  }

  setObservable(Observable)
}

export default setup
