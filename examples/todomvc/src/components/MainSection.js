import React, { Component } from 'react'
import PropTypes from 'prop-types'
import stream from '../streams/todos'
import TodoItem from './TodoItem'
import Footer from './Footer'

const TODO_FILTERS = {
  [stream.FILTERS.SHOW_ALL]: () => true,
  [stream.FILTERS.SHOW_ACTIVE]: todo => !todo.completed,
  [stream.FILTERS.SHOW_COMPLETED]: todo => todo.completed
}

class MainSection extends Component {
  static defaultProps = {
    completedCount: 0,
  }

  static propTypes = {
    todos: PropTypes.array.isRequired,
    completedCount: PropTypes.number,
  }

  state = { filter: stream.FILTERS.SHOW_ALL }

  handleShow = filter => {
    this.setState({ filter })
  }

  renderToggleAll(completedCount) {
    const { todos } = this.props
    if (todos.length > 0) {
      return (
        <div>
          <input className="toggle-all"
            id="toggle-all"
            type="checkbox"
            checked={completedCount === todos.length}
            onChange={stream.completeAll}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
        </div>
      )
    }
  }

  renderFooter(completedCount) {
    const { todos } = this.props
    const { filter } = this.state
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <Footer
          completedCount={completedCount}
          activeCount={activeCount}
          filter={filter}
          onShow={this.handleShow}
        />
      )
    }
  }

  render() {
    const { todos, completedCount } = this.props
    const { filter } = this.state

    const filteredTodos = todos.filter(TODO_FILTERS[filter])

    return (
      <section className="main">
        {this.renderToggleAll(completedCount)}
        <ul className="todo-list">
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} />
          )}
        </ul>
        {this.renderFooter(completedCount)}
      </section>
    )
  }
}

export default stream.connect(
  (todos) => ({
    todos,
    completedCount: todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count, 0
    ),
  }),
)(MainSection)
