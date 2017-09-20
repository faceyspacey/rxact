import { ajax } from 'rxjs/observable/dom/ajax'
import { createSourceStateStream } from 'rxact/stateStream'
import createEmitter from 'rxact/helpers/createEmitter'

const posts = createSourceStateStream('posts', {
  reddit: 'reactjs',
  items: {},
  isFetching: false,
  lastUpdated: null,
})

const emitter = createEmitter(posts.emit)

posts.inFetching = emitter((state, isFetching) => ({
  ...state,
  isFetching,
}))

const stillFetching = (prev, next) => next.isFetching
const postsExist = (prevState, nextState) => {
  const posts = nextState.items[nextState.reddit]
  return posts && posts.length > 0
}

const fetchPosts = ({ reddit }) => ajax({
  url: `https://www.reddit.com/r/${reddit}.json`,
  crossDomain: true,
  responseType: 'json',
})

const normalize = children => children.map(child => child.data)

const updateState = items => posts.emit(state => ({
  ...state,
  items: {
    ...state.items,
    [state.reddit]: items,
  },
  lastUpdated: Date.now(),
}))

posts.clearCache = emitter((state, reddit) => ({
  ...state,
  items: {
    ...state.items,
    [reddit]: [],
  }
}))

posts.fetchPostsIfNeeded = () => posts.state$
  .distinctUntilChanged(stillFetching)
  .distinctUntilChanged(postsExist)
  .do(() => posts.inFetching(true))
  .switchMap(fetchPosts)
  .pluck('response', 'data', 'children')
  .map(normalize)
  .do(() => posts.inFetching(false))
  .subscribe(updateState)

posts.updateReddit = emitter((state, reddit) => ({
  ...state,
  reddit,
}))

export default posts
