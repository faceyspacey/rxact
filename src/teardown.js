// @flow
import { cleanObservable } from './observable'

export type Teardown = Function

const teardown: Teardown = () => {
  cleanObservable()
}

export default teardown
