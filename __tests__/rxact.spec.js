import * as Rxact from '../src'
describe('rxact', () => {
  it('exposes the public API', () => {
    expect(Rxact.StateStream).toBeDefined()
    expect(Rxact.createReactObserver).toBeDefined()
    expect(Rxact.setup).toBeDefined()
    expect(Rxact.teardown).toBeDefined()
  })
})
