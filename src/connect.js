// @flow
import Rx from 'rxjs'
import React, { PureComponent } from 'react'
import type { ComponentType } from 'react'
import type { StateStream } from './stateStream'

type Observer = Rx.Observable => Rx.Observable
type Selector = (state: any) => any

type State = {
  streamState: {}
}

type Props = {
}

const connect = (
  stateStream: StateStream, observer?: Observer, selector?: Selector,
) => (WrappedComponent: ComponentType<any>) => {
  if (!stateStream
    || typeof stateStream !== 'object'
    || !(stateStream.state$ instanceof Rx.Observable)
  ) {
    throw new Error('Expect stateStream to be instance of StateStream')
  }

  return class Container extends PureComponent<Props, State> {
    state = {
      streamState: {}
    }

    componentWillMount() {
      let stream$ = stateStream.state$
      if (typeof observer === 'function') {
        stream$ = observer(stream$)
      }

      stream$
        .subscribe((state) => {
          let nextState = state

          if (typeof selector === 'function') {
            nextState = selector(state)
          }

          this.setState({ streamState: nextState })
        })
    }

    render() {
      return (
        <WrappedComponent {...this.state.streamState} />
      )
    }
  }
}

export default connect
