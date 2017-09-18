import React from 'react'
import { shallow } from 'enzyme'
import connect from '../src/connect'
import {
  createSourceStateStream,
  createRelayStateStream,
} from '../src/stateStream'

describe('connect', () => {
  it('throw if stateStream is not instance of StateStream', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    expect(() =>
      connect(createSourceStateStream('source'))(Component)
    ).not.toThrow()

    expect(() => {
      const source = createSourceStateStream('source')
      const stream = createRelayStateStream('stream', [source])
      connect(stream)(Component)
    }).not.toThrow()

    expect(() =>
      connect()(Component)
    ).toThrow()

    expect(() =>
      connect('')(Component)
    ).toThrow()

    expect(() =>
      connect(1)(Component)
    ).toThrow()

    expect(() =>
      connect({})(Component)
    ).toThrow()

    expect(() =>
      connect(Symbol(''))(Component)
    ).toThrow()
  })

  it('passes state to component', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { state: 'state' }
    const source = createSourceStateStream('source', state)

    const Container = connect(source)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual(state)
  })

  it('use obsever to change states', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createSourceStateStream('source', state)
    const observer = state$ => state$.mapTo({ stateC: 'stateC' })

    const Container = connect(source, observer)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateC: 'stateC' })
  })

  it('use selector to select states', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { stateA: 'stateA', stateB: 'stateB' }
    const source = createSourceStateStream('source', state)
    const selector = state => ({ stateB: state.stateB })

    const Container = connect(source, null, selector)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateB: 'stateB' })
  })
})
