import React from 'react'
import { shallow } from 'enzyme'
import createConnect from '../src/createConnect'
import createStateStream from '../src/stateStream'

describe('createConnect', () => {
  it('throw if state$ is not instance of Observable', () => {
    expect(() =>
      createConnect(createStateStream('source').state$)
    ).not.toThrow()

    expect(() =>
      createConnect()
    ).toThrow()

    expect(() =>
      createConnect('')
    ).toThrow()

    expect(() =>
      createConnect(1)
    ).toThrow()

    expect(() =>
      createConnect({})
    ).toThrow()

    expect(() =>
      createConnect(Symbol(''))
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

    expect(source.connect()(Component).displayName).toEqual('RxactConnected(Component)')
    expect(source.connect()(Component2).displayName).toEqual('RxactConnected(component2)')
    expect(source.connect()(Component3).displayName).toEqual('RxactConnected(Component3)')
    expect(source.connect()(Component4).displayName).toEqual('RxactConnected(comp4)')
  })

  it('passes state to component', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { state: 'state' }
    const source = createStateStream('source', state)

    const Container = source.connect()(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual(state)
  })

  it('use obsever to change states', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createStateStream('source', state)
    const observer = state$ => state$.mapTo({ stateC: 'stateC' })

    const Container = source.connect(null, observer)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateC: 'stateC' })
  })

  it('use selector to select states', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createStateStream('source', state)
    const selector = state => ({ stateB: state.stateB })

    const Container = source.connect(selector)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateB: 'stateB' })
  })

  it('connect all states when combining sources', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const stateA = { stateA: 'stateA' }
    const stateB = { stateB: 'stateB' }
    const stateC = { stateC: 'stateC' }
    const sourceA = createStateStream('sourceA', stateA)
    const sourceB = createStateStream('sourceB', stateB)
    const sourceC = createStateStream('sourceC', stateC, [sourceA, sourceB])

    const Container = sourceC.connect()(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ sourceA: stateA, sourceB: stateB, sourceC: stateC })
  })
})
