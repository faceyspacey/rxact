import { createSourceStateStream } from 'rxact/stateStream'

const todos = createSourceStateStream('todos', [])

todos.add = text => todos.emit(state => [
  ...state,
  {
    text,
    id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
    completed: false,
  },
])

todos.edit = (id, text) => todos.emit(state =>
  state.map(todo => todo.id === id ? { ...todo, text } : todo)
)

todos.delete = id => todos.emit(state =>
  state.filter(todo => todo.id !== id )
)

todos.complete = (id) => todos.emit(state =>
  state.map(todo => todo.id === id ?
    { ...todo, completed: !todo.completed } :
    todo
  )
)

todos.completeAll = () => todos.emit(state => {
  const areAllMarked = state.every(todo => todo.completed)

  return state.map(todo => ({
    ...todo,
    completed: !areAllMarked
  }))
})

todos.clearCompleted = () => todos.emit(state =>
  state.filter(todo => todo.completed === false)
)

todos.FILTERS = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE',
}

export default todos
