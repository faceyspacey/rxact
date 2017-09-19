import { createSourceStateStream } from 'rxact/stateStream'
import createEmitter from 'rxact/helpers/createEmitter'

const counter = createSourceStateStream('counter', 0)
const emitter = createEmitter(counter.emit)

const increment = count => (count + 1)
counter.increment = emitter(increment)
counter.incrementAsync = emitter(count$ => count$.delay(1).map(increment), true)

counter.decrement = emitter(count => (count - 1))

export default counter
