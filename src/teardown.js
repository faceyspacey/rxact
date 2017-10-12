// @flow
import { cleanObservable } from './Observable'

const teardown = () => {
  cleanObservable()
}

export default teardown
