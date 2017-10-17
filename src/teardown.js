// @flow
import StateStream from './stateStream'
import { cleanObservable } from './observable'

export type Teardown = Function

const teardown: Teardown = () => {
  cleanObservable()
  StateStream.removePlugin()
}

export default teardown
