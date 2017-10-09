import React from 'react'
import { shallow } from 'enzyme'
import createObserver from '../src/createObserver'
import createStateStream from '../src/stateStream'

describe('createObserver', () => {
  it('throw if state$ is not instance of Observable', () => {
    expect(() =>
      createObserver(createStateStream('source').state$)
    ).not.toThrow()

    expect(() =>
      createObserver()
    ).toThrow()

    expect(() =>
      createObserver('')
    ).toThrow()

    expect(() =>
      createObserver(1)
    ).toThrow()

    expect(() =>
      createObserver({})
    ).toThrow()

    expect(() =>
      createObserver(Symbol(''))
    ).toThrow()
  })

  it('set displayName', () => {
    const source = createStateStream('source', '')

    const Component = () => (
      <div>Test Component</div>
    )

    const Component2 = function component2() {
      return <div>Test Component2</div>
    }

    class Component3 extends React.Component {
      render() {
        return (<div>Test Component3</div>)
      }
    }

    class Component4 extends React.Component {
      static displayName =  'comp4'

      render() {
        return (<div>Test Component3</div>)
      }
    }

    expect(source.observer()(Component).displayName).toEqual('RxactObserver(Component)')
    expect(source.observer()(Component2).displayName).toEqual('RxactObserver(component2)')
    expect(source.observer()(Component3).displayName).toEqual('RxactObserver(Component3)')
    expect(source.observer()(Component4).displayName).toEqual('RxactObserver(comp4)')
  })

  it('passes state to component', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { state: 'state' }
    const source = createStateStream('source', state)

    const Container = source.observer()(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual(state)
  })

  it('use mapStateToProps to select state', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createStateStream('source', state)
    const mapStateToProps = state => ({ stateB: state.stateB })

    const Container = source.observer(mapStateToProps)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateB: 'stateB' })
  })

  it('use mergeProps to merge state and props', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createStateStream('source', state)
    const mergeProps = (state, props) => ({
      stateA: state.stateA,
      stateC: props.stateC,
    })

    const Container = source.observer(null, mergeProps)(Component)

    const wrapper = shallow(<Container stateC="stateC" />)

    expect(wrapper.props()).toEqual({
      stateA: 'stateA',
      stateC: 'stateC',
    })
  })

  it('observe all state when combining sources', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const stateA = { stateA: 'stateA' }
    const stateB = { stateB: 'stateB' }
    const stateC = { stateC: 'stateC' }
    const sourceA = createStateStream('sourceA', stateA)
    const sourceB = createStateStream('sourceB', stateB)
    const sourceC = createStateStream('sourceC', stateC, [sourceA, sourceB])

    const Container = sourceC.observer()(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ sourceA: stateA, sourceB: stateB, sourceC: stateC })
  })

  it('trigger rendering when receiving new state', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const source = createStateStream('source', { state: 'A' })

    const Container = source.observer()(Component)
    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ state: 'A' })

    source.emitState(() => ({ state: 'B' }))

    expect(wrapper.props()).toEqual({ state: 'B' })
  })
})
