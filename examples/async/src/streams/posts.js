import { ajax } from 'rxjs/observable/dom/ajax'
import { createSourceStateStream } from 'rxact/stateStream'

const posts = createSourceStateStream('posts', {
  reddit: 'reactjs',
  items: {},
  isFetching: false,
  lastUpdated: null,
})
const createEvent = posts.createEvent

posts.inFetching = createEvent((event$, isFetching) => event$
  .pluck('state')
  .map(state => ({
    ...state,
    isFetching,
  }))
)

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
  .pluck('response', 'data', 'children')
  .map(normalize)

const normalize = children => children.map(child => child.data)

const updatePosts = createEvent((event$, items) => event$
  .pluck('state')
  .map(state => ({
    ...state,
    items: {
      ...state.items,
      [state.reddit]: items,
    },
    isFetching: false,
    lastUpdated: Date.now(),
  }))
)

posts.fetchPosts = createEvent((event$) => event$
  .do(() => posts.inFetching(true))
  .switchMap(({ state: { reddit }}) => fetchPosts({ reddit }))
  .map((items) => {
    const hook$ = updatePosts(items)
    hook$.subscribe(() => posts.inFetching(false))
  })
)

posts.fetchPostsIfNeeded = () => posts.state$
  .distinctUntilChanged(stillFetching)
  .distinctUntilChanged(postsExist)
  .do(() => posts.inFetching(true))
  .switchMap(fetchPosts)
  .subscribe((items) => {
    updatePosts(items)
      .subscribe(() => posts.inFetching(false))
  })

posts.updateReddit = createEvent((event$, reddit) => event$
  .pluck('state')
  .map(state => ({
    ...state,
    reddit,
  }))
)

export default posts
