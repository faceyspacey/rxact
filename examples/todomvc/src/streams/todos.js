import { createSourceStateStream } from 'rxact/stateStream'
import createEmitter from 'rxact/helpers/createEmitter'

const todos = createSourceStateStream('todos', [])
const emitter = createEmitter(todos.emit)

todos.add = emitter((state, text) => [
  ...state,
  {
    text,
    id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
    completed: false,
  },
])

todos.edit = emitter((state, id, text) =>
  state.map(todo => todo.id === id ? { ...todo, text } : todo)
)

todos.delete = emitter((state, id) =>
  state.filter(todo => todo.id !== id )
)

todos.complete = emitter((state, id) =>
  state.map(todo => todo.id === id ?
    { ...todo, completed: !todo.completed } :
    todo
  )
)

todos.completeAll = emitter(state => {
  const areAllMarked = state.every(todo => todo.completed)

  return state.map(todo => ({
    ...todo,
    completed: !areAllMarked
  }))
})

todos.clearCompleted = emitter(state =>
  state.filter(todo => todo.completed === false)
)

todos.FILTERS = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE',
}

export default todos
