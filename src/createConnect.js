// @flow
import Rx from 'rxjs'
import React, { PureComponent } from 'react'
import type { ComponentType } from 'react'

type Observer = Rx.Observable => Rx.Observable
type Selector = (state: any) => any

type State = {
  streamState: {}
}

type Props = {
}

type CreateConnect = (state$: Rx.Observable) => (
  selector?: Selector,
  observer?: Observer,
) => (WrappedComponent: ComponentType<any>) => ComponentType<any>

const createConnect: CreateConnect = state$ => {
  if (!(state$ instanceof Rx.Observable)) {
    throw new Error('Expect state$ to be instance of Observable')
  }

  return (selector, observer) =>
    (WrappedComponent) => {
      return class Connect extends PureComponent<Props, State> {
        state = {
          streamState: {}
        }

        subscription = null

        componentWillMount() {
          let stream$ = state$
          if (typeof observer === 'function') {
            stream$ = observer(stream$)
          }

          this.subscription = stream$
            .subscribe((state) => {
              let nextState = state

              if (typeof selector === 'function') {
                nextState = selector(state)
              }

              this.setState({ streamState: nextState })
            })
        }

        componentWillUnMount() {
          if (this.subscription && typeof this.subscription.unsubscribe === 'function') {
            this.subscription.unsubscribe()
          }
        }

        render() {
          return (
            <WrappedComponent {...this.state.streamState} />
          )
        }
      }
    }
}
export default createConnect
