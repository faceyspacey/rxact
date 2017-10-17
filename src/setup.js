// @flow
import StateStream from './stateStream'
import { setObservable } from './observable'
import isObservable from './utils/isObservable'
import type { ESObservable } from './observable'

export type Setup = {
  Observable: ESObservable,
  plugins: Array<Function>,
} => void

const setup: Setup = (options) => {
  if (typeof options !== 'object') {
    throw new Error('setup(): Expected options to be an object.')
  }

  const { Observable, plugins = [] } = options

  if (!isObservable(Observable)) {
    throw new Error('setup(): Expected an ES Observable. For more info: https://github.com/tc39/proposal-observable')
  }

  setObservable(Observable)

  if (!Array.isArray(plugins)) {
    throw new Error('setup(): Expected plugins to be an array')
  }

  StateStream.addPlugin(...plugins)
}

export default setup
