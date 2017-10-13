import setup from '../../src/setup'
import teardown from '../../src/teardown'
import StateStream from '../../src/stateStream'

export default (Observable) => {
  beforeEach(() => {
    setup(Observable)
  })

  afterEach(() => {
    teardown()
  })

  describe('StateStream', () => {
    it('exposes the public API', () => {
      const stateStream = new StateStream('stream')

      expect(stateStream.name).toBeDefined()
      expect(stateStream.state$).toBeDefined()
      expect(stateStream.reactObserver).toBeDefined()
      expect(stateStream.getState).toBeDefined()
      expect(stateStream.next).toBeDefined()
      expect(stateStream.eventRunner).toBeDefined()
      expect(stateStream.dispose).toBeDefined()
    })

    it('throw if name is invalid', () => {
      expect(() =>
        new StateStream('stream')
      ).not.toThrow()

      expect(() =>
        new StateStream(1)
      ).toThrow()

      expect(() =>
        new StateStream('')
      ).toThrow()

      expect(() =>
        new StateStream({})
      ).toThrow()

      expect(() =>
        new StateStream()
      ).toThrow()

      expect(() =>
        new StateStream(() => {})
      ).toThrow()
    })

    describe('state$', () => {
      it('always can get current value whenever subscribing', () => {
        const initialState = 0
        const stateStream = new StateStream('stream', initialState)
        const newState = 1
        let count = 0

        stateStream.state$.subscribe(state => {
          if (count > 0) {
            return
          }

          count += 1
          expect(state).toEqual(initialState)
        })

        stateStream.next(() => newState)

        stateStream.state$.subscribe(state => {
          expect(state).toEqual(newState)
        }, false)
      })

      it('multiple subscribers receive same state at meantime', () => {
        const stateStream = new StateStream('stream', 0)
        const newState = 1
        const mockSubscriber1 = jest.fn()
        const mockSubscriber2 = jest.fn()

        stateStream.state$.subscribe(mockSubscriber1)
        stateStream.state$.subscribe(mockSubscriber2)

        stateStream.next(() => newState)

        expect(mockSubscriber1.mock.calls).toEqual([[0], [1]])
        expect(mockSubscriber2.mock.calls).toEqual([[0], [1]])
      })
    })

    describe('getState', () => {
      it('getState always get latest state of stream', () => {
        const initialState = 0
        const stateStream = new StateStream('stream', initialState)
        const emit = (value) => stateStream.next(() => value)

        expect(stateStream.getState()).toEqual(initialState)

        emit(1)

        expect(stateStream.getState()).toEqual(1)

        emit(2)
        emit(3)

        expect(stateStream.getState()).toEqual(3)
      })
    })

    describe('next', () => {
      it('throw if next don\'t receive function param', () => {
        const stateStream = new StateStream('stream', 0)
        expect(() => {
          stateStream.next(state => state)
        }).not.toThrow()

        expect(() => {
          stateStream.next()
        }).toThrow()

        expect(() => {
          stateStream.next('')
        }).toThrow()

        expect(() => {
          stateStream.next(1)
        }).toThrow()

        expect(() => {
          stateStream.next({})
        }).toThrow()
      })

      it('emit new state through next', () => {
        const stateStream = new StateStream('stateStream', 0)
        stateStream.next(() => 1)
        expect(stateStream.getState()).toEqual(1)
      })

      it('emit new state based on previous state', () => {
        const stateStream = new StateStream('stateStream', 0)
        stateStream.next(count => count + 1)
        stateStream.next(count => count + 2)

        expect(stateStream.getState()).toEqual(3)
      })
    })

    describe('eventRunner', () => {
      it('throw error if factory is not a function', () => {
        const stateStream = new StateStream('stateStream', 0)

        expect(() => {
          stateStream.eventRunner()
        }).not.toThrow()

        expect(() => {
          stateStream.eventRunner(event$ => event$)
        }).not.toThrow()

        expect(() => {
          stateStream.eventRunner('')
        }).toThrow()
      })

      it ('throw error if factory do not return an observable', () => {
        const stateStream = new StateStream('stateStream', 0)

        expect(() => {
          stateStream.eventRunner(() => {})
        }).toThrow()

        expect(() => {
          stateStream.eventRunner(() => '')
        }).toThrow()
      })

      it('make state as input source if no source passed', () => {
        const stateStream = new StateStream('stateStream', 0)

        stateStream.eventRunner(event$ => {
          event$.subscribe(state => {
            expect(state).toEqual(0)
          })

          return event$
        })
      })

      it('accept input source if it is an observable', () => {
        const stateStream = new StateStream('stateStream', 0)

        stateStream.eventRunner(event$ => {
          event$.subscribe(state => {
            expect(state).toEqual('value')
          })

          return event$
        }, stateStream.Observable.of('value'))
      })

      it(
        'transform input source to observable if it is not null and not observable',
        () => {
          const stateStream = new StateStream('stateStream', 0)

          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual('value')
            })

            return event$
          }, 'value')
          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual(1)
            })

            return event$
          }, 1)
          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual({})
            })

            return event$
          }, {})
        })

      it('return event stream$ by eventRunner', () => {
        const stateStream = new StateStream('stateStream', 0)

        stateStream.eventRunner().subscribe(state => {
          expect(state).toEqual(0)
        })
      })
    })

    describe('dispose', () => {
      it('cannot calling next after stateStream disposed', () => {
        const stateStream = new StateStream('stateStream', 0)
        const mockSubscriber = jest.fn()

        stateStream.state$.subscribe(mockSubscriber)

        stateStream.dispose()
        stateStream.next(() => 1)

        expect(mockSubscriber.mock.calls.length).toEqual(1)
      })
    })
  })
}
