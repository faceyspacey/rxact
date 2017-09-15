// @flow
import Rx from 'rxjs'
import createSource from '../src/createSource'
import type { Source } from '../src/createSource'

export default class StateStream {
  constructor(observer: Function, initialState: any, ...sources: Array<Source>) {
    if (observer !== null && observer !== undefined && typeof observer !== 'function') {
      throw new Error('Expected the observer to be a function.')
    }

    if (sources) {
      sources.forEach((source) => {
        if (typeof source !== 'object' || !source.name || !source.state$) {
          throw new Error('Expected the source to be a Source.')
        }
      })
    }

    this.observer = observer
    this.state$ = Rx.Observable.create((observer) => {
      this.emit = (state: any) => observer.next(state)
      if (initialState !== null && initialState !== undefined) {
        this.emit(initialState)
      }
    })

    this.connect(sources)
  }

  observer = null
  state$ = Rx.Observable.of(null)
  emit = () => {}

  connect = (sources: Array<Source>) => {
    let state$ = this.state$;

    (sources || []).map((source) => {
      state$ = Rx.Observable.combineLatest(state$, source.state$, (state, sourceState) => {
        if (typeof state !== 'object') {
          return {
            $: state,
            [source.name]:  sourceState
          }
        }

        return ({
          ...state,
          [source.name]:  sourceState
        })
      })
    })

    this.state$ = state$
  }

  observeState = (selector: Function) => {
    let state$ = this.state$

    if (this.observer) {
      state$ = this.observer(state$)
    }

    state$.subscribe({ next: selector })

    return this
  }

  asSource = (name: string) => createSource(name, this.state$)
}
