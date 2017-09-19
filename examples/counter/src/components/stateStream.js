import { createSourceStateStream } from 'rxact/stateStream'
import createEmitter from 'rxact/helpers/createEmitter'

const counter = createSourceStateStream('counter', 0)
const emitter = createEmitter(counter.emit)

counter.increment = emitter(count => (count + 1))
counter.decrement = emitter(count => (count - 1))

export default counter
