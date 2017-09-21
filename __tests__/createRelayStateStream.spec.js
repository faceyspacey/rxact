import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/mapTo'

import {
  createRelayStateStream, createSourceStateStream, RELAY
} from '../src/stateStream'

describe('createRelayStateStream', () => {
  it('exposes the public API', () => {
    const source = createSourceStateStream('source', '')
    const stream = createRelayStateStream('stream', [source])

    expect(stream.name).toBeDefined()
    expect(stream.state$).toBeDefined()
    expect(stream.type).toEqual(RELAY)
    expect(stream.emit).not.toBeDefined()
  })

  it('throw if source is empty or is not type of StateStream', () => {
    expect(() => {
      const source = createSourceStateStream('source', '')
      createRelayStateStream('stream', [source])
    }).not.toThrow()

    expect(() => {
      const source = createSourceStateStream('source', '')
      const stream = createRelayStateStream('stream', [source])
      createRelayStateStream('stream', [source, stream])
    }).not.toThrow()

    expect(() => {
      createRelayStateStream('stream')
    }).toThrow()

    expect(() => {
      createRelayStateStream('stream', [])
    }).toThrow()

    expect(() => {
      const source = createSourceStateStream('source', '')
      createRelayStateStream('stream', ['', source])
    }).toThrow()
  })

  it('throw if sources have same name', () => {
    const sourceA = createSourceStateStream('sourceA', 'A')
    const sourceB = createSourceStateStream('sourceA', 'B')
    expect(() => {
      createRelayStateStream('stream', [sourceA, sourceB])
    }).toThrow()
  })

  it('combine all sources together', () => {
    const sourceA = createSourceStateStream('sourceA', 'A')
    const sourceB = createSourceStateStream('sourceB', 'B')
    const sourceC = createSourceStateStream('sourceC', 'C')

    const stream = createRelayStateStream('stream', [sourceA, sourceB, sourceC])
    const stream2 = createRelayStateStream('stream2', [stream, sourceA])

    stream.state$.subscribe(state => {
      expect(state).toEqual({ sourceA: 'A', sourceB: 'B', sourceC: 'C' })
    })

    stream2.state$.subscribe(state => {
      expect(state).toEqual({
        stream: { sourceA: 'A', sourceB: 'B', sourceC: 'C' },
        sourceA: 'A',
      })
    })
  })

  it('observe new state when emit value to sources', () => {
    const sourceA = createSourceStateStream('sourceA', 'A')
    const sourceB = createSourceStateStream('sourceB', 'B')
    const sourceC = createSourceStateStream('sourceC', 'C')
    const stream = createRelayStateStream('stream', [sourceA, sourceB, sourceC])
    let index = 0

    stream.state$
      .scan((results, result) => {
        index += 1
        results.push(result)

        return results
      }, [])
      .subscribe((results) => {
        if (index === 4) {
          expect(results).toEqual([
            { sourceA: 'A', sourceB: 'B', sourceC: 'C' },
            { sourceA: 'AA', sourceB: 'B', sourceC: 'C' },
            { sourceA: 'AA', sourceB: 'BB', sourceC: 'C' },
            { sourceA: 'AA', sourceB: 'BB', sourceC: 'CC' },
          ])
        }
      })

    sourceA.createEvent((state$) => state$.mapTo('AA'))()
    sourceB.createEvent((state$) => state$.mapTo('BB'))()
    sourceC.createEvent((state$) => state$.mapTo('CC'))()
  })
})
