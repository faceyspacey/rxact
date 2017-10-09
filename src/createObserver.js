// @flow
import Rx from 'rxjs'
import hoistStatics from 'hoist-non-react-statics'
import React, { Component } from 'react'
import type { ComponentType } from 'react'

type MapStateToProps = (stateProps: any, ownProps: {}) => any
type MergeProps = (stateProps: any, ownProps: {}) => any

type State = {
  component: any,
}

type Props = {
}

type CreateObserver = (state$: Rx.Observable) => (
  mapStateToProps?: MapStateToProps, mergeProps?: MergeProps,
) => (WrappedComponent: ComponentType<any>) => ComponentType<any>

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

const createObserver: CreateObserver = state$ => {
  if (!(state$ instanceof Rx.Observable)) {
    throw new Error('Expect state$ to be instance of Observable')
  }

  return (mapStateToProps, mergeProps = defaultMergeProps) =>
    (WrappedComponent) => {
      class Observer extends Component<Props, State> {
        static displayName = setDisplayName(WrappedComponent)

        subscription = null

        setProps = fn => fn

        props$ = Rx.Observable.create(observer => {
          this.setProps = props => observer.next(props)
        })

        state = {
          component: null,
        }

        component = null

        componentWillMount() {
          let stream$ = state$

          this.subscription = stream$
            .combineLatest(this.props$, (state, props) => {
              let nextState = state

              if (typeof mapStateToProps === 'function') {
                nextState = mapStateToProps(state, props)
              }

              const componentProps = mergeProps(nextState, props)

              return (
                <WrappedComponent {...componentProps} />
              )
            })
            .subscribe((component) => {
              if (this.subscription && component !== this.component) {
                this.component = component
                this.forceUpdate()
              }
            })

          this.setProps(this.props)
        }

        componentWillUnMount() {
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
}
export default createObserver
