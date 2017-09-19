import { createSourceStateStream } from 'rxact/stateStream'

const counter = createSourceStateStream('counter', 0)

counter.increment = () => counter.emit(count => (count + 1))
counter.decrement = () => counter.emit(count => (count - 1))

export default counter
