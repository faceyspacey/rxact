import { createSourceStateStream } from 'rxact/stateStream'

const counter = createSourceStateStream('counter', 0)
const createEvent = counter.createEvent
const updater = diff => count => (count + diff)

counter.increment = createEvent(event$ => event$
  .pluck('state')
  .map(updater(1))
)

counter.incrementAsync = createEvent(event$ => event$
  .delay(1000)
  .mapTo(updater(1))
)

counter.decrement = createEvent(event$ => event$
  .pluck('state')
  .map(updater(-1))
)

counter.incrementIfOdd = createEvent(event$ => event$
  .pluck('state')
  .skipWhile(state => state % 2 === 0)
  .map(updater(1))
)

export default counter
