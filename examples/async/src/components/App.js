import React, { Component } from 'react'
import PropTypes from 'prop-types'
import stream from '../streams/posts'
import Picker from './Picker'
import Posts from './Posts'

class App extends Component {
  static propTypes = {
    selectedReddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
  }

  componentDidMount() {
    stream.fetchPostsIfNeeded()
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker
          value={selectedReddit}
          onChange={stream.updateReddit}
          options={['reactjs', 'frontend']}
        />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!isFetching &&
            <button onClick={stream.fetchPosts}>
              Refresh
            </button>
          }
        </p>
        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>
        }
      </div>
    )
  }
}

export default stream.connect(state => ({
  selectedReddit: state.reddit,
  posts: state.items[state.reddit] || [],
  isFetching: state.isFetching,
  lastUpdated: state.lastUpdated,
}))(App)
