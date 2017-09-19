import React from 'react'
import { shallow } from 'enzyme'
import createConnect from '../src/createConnect'
import { createSourceStateStream } from '../src/stateStream'

describe('createConnect', () => {
  it('throw if state$ is not instance of Observable', () => {
    expect(() =>
      createConnect(createSourceStateStream('source').state$)
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

  it('passes state to component', () => {
    const Component = () => (
      <div>Test Component</div>
    )
    const state = { state: 'state' }
    const source = createSourceStateStream('source', state)

    const Container = source.connect()(Component)

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

    const Container = source.connect(null, observer)(Component)

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

    const Container = source.connect(selector)(Component)

    const wrapper = shallow(<Container />)

    expect(wrapper.props()).toEqual({ stateB: 'stateB' })
  })
})
