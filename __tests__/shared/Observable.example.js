import { getObservable, setObservable, cleanObservable } from '../../src/Observable'
import teardown from '../../src/teardown'

export default (Observable) => {
  describe('Observable', () => {
    afterEach(() => {
      teardown()
    })

    it('Throw error if Observable did not configure', () => {
      expect(() => {
        getObservable()
      }).toThrow()
    })

    it('Throw error if setObservable called after Observable configured', () => {
      setObservable(Observable)

      expect(() => {
        setObservable(Observable)
      }).toThrow()
    })

    it('Clean the Observable configuration', () => {
      setObservable(Observable)

      cleanObservable()

      expect(() => {
        setObservable(Observable)
      }).not.toThrow()
    })
  })
}
