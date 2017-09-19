import createEmitter from '../../src/helpers/createEmitter'
import { createSourceStateStream } from '../../src/stateStream'

describe('createEmitter', () => {
  it('create an event function for emiiting state for stream', () => {
    const initialState = 'initialState'
    const newState = 'newState'

    const source = createSourceStateStream('source', initialState)
    const emitter = createEmitter(source.emit)

    const action = emitter((state, payload) => {
      expect(state).toEqual(initialState)

      return payload
    })

    source.state$.skip(1).subscribe(state => {
      expect(state).toEqual(newState)
    })

    action(newState)
  })
})
