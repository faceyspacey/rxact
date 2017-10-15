// @flow
import { cleanObservable } from './observable'

const teardown = () => {
  cleanObservable()
}

export default teardown
