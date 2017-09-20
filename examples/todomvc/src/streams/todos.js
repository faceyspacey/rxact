import { createSourceStateStream } from 'rxact/stateStream'

const todos = createSourceStateStream('todos', [])
const createEvent = todos.createEvent

todos.add = createEvent((event$, text) => event$
  .pluck('state')
  .map(state => [
    ...state,
    {
      text,
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
    },
  ]))

todos.edit = createEvent((event$, id, text) => event$
  .pluck('state')
  .map(state => state.map(
    todo => todo.id === id ? { ...todo, text } : todo
  ))
)

todos.delete = createEvent((event$, id) => event$
  .pluck('state')
  .map(state => state.filter(todo => todo.id !== id ))
)

todos.complete = createEvent((event$, id) => event$
  .pluck('state')
  .map(state => state.map(
    todo => todo.id === id ?
      { ...todo, completed: !todo.completed } :
      todo
  ))
)

todos.completeAll = createEvent(event$ => event$
  .pluck('state')
  .map(state => {
    const areAllMarked = state.every(todo => todo.completed)

    return state.map(todo => ({
      ...todo,
      completed: !areAllMarked
    }))
  })
)

todos.clearCompleted = createEvent(event$ => event$
  .pluck('state')
  .map(state => state.filter(todo => todo.completed === false))
)

todos.FILTERS = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE',
}

export default todos
