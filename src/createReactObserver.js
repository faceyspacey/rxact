// @flow
import hoistStatics from 'hoist-non-react-statics'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import type { Subscription, IESObservable } from './Observable'
import { getObservable } from './Observable'
import isObservable from './utils/isObservable'

export type MapStateToProps = (stateProps: any, ownProps: {}) => any
export type MergeProps = (stateProps: any, ownProps: {}) => any

type State = {
  component: any,
}

type Props = {
}

type Decorator = (
  mapStateToProps?: MapStateToProps, mergeProps?: MergeProps,
) => (WrappedComponent: ComponentType<any>) => ComponentType<any>

type CreateReactObserver = (state$: IESObservable) => {
  subscription: Subscription,
  decorator: Decorator,
}

const setDisplayName = component => {
  const displayName = component.displayName
  || component.name
  || 'Component'

  return `RxactObserver(${displayName})`
}

const defaultMergeProps = (state, props) => ({
  ...props,
  ...state,
})

const createReactObserver: CreateReactObserver = (state$) => {
  const Observable = getObservable()

  if (!(isObservable(state$))) {
    throw new Error('Expect state$ to be instance of Observable')
  }

  let streamSubscription = { unsubscribe: () => {} }
  const decorator = (mapStateToProps, mergeProps = defaultMergeProps) =>
    (WrappedComponent) => {
      class Observer extends Component<Props, State> {
        static displayName = setDisplayName(WrappedComponent)

        subscription = null

        setProps = fn => fn

        props$ = new Observable(observer => {
          this.setProps = props => observer.next(props)

          this.setProps(this.props)

          return {
            unsubscribe: () => {
              this.setProps = fn => fn
            }
          }
        })

        state = {
          component: null,
        }

        component = null

        componentWillMount() {
          let stream$ = state$

          const vdom$ = new Observable(observer => {
            let readyCount = 0
            let streamState
            let propState

            const propSubscription = this.props$.subscribe((state) => {
              propState = state

              if (readyCount < 2) {
                readyCount += 1
              }

              if (readyCount > 1) {
                let nextState = streamState

                if (typeof mapStateToProps === 'function') {
                  nextState = mapStateToProps(streamState, propState)
                }

                const componentProps = mergeProps(nextState, propState)

                const nextVdom = (
                  <WrappedComponent {...componentProps} />
                )
                observer.next(nextVdom)

              }
            })
            streamSubscription = stream$.subscribe((state) => {

              streamState = state

              if (readyCount < 2) {
                readyCount += 1
              }

              if (readyCount > 1) {
                let nextState = streamState

                if (typeof mapStateToProps === 'function') {
                  nextState = mapStateToProps(streamState, propState)
                }

                const componentProps = mergeProps(nextState, propState)

                const nextVdom = (
                  <WrappedComponent {...componentProps} />
                )
                observer.next(nextVdom)

              }
            })

            return {
              unsubscribe: () => {
                streamSubscription.unsubscribe()
                propSubscription.unsubscribe()
              }
            }
          })

          this.subscription = vdom$.subscribe(component => {
            if (component !== this.component) {
              this.component = component
              this.forceUpdate()
            }
          })
        }

        componentWillUnmount() {
          if (this.subscription && typeof this.subscription.unsubscribe === 'function') {
            this.subscription.unsubscribe()
            this.subscription = null
          }
        }

        componentWillReceiveProps(nextProps) {
          this.setProps(nextProps)
        }

        shouldComponentUpdate() {
          return false
        }

        render() {
          return this.component
        }
      }

      return hoistStatics(Observer, WrappedComponent)
    }

  return {
    decorator,
    subscription: streamSubscription,
  }
}
export default createReactObserver
