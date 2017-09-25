import createStateStream from '../src/stateStream'

describe('createStateStream with sources', () => {
  it('throw if source is not type of StateStream', () => {
    expect(() => {
      const source = createStateStream('source', '')
      createStateStream('stream', '', [source])
    }).not.toThrow()

    expect(() => {
      const source = createStateStream('source', '')
      const stream = createStateStream('stream', '', [source])
      createStateStream('stream', '', [source, stream])
    }).not.toThrow()

    expect(() => {
      const source = createStateStream('source', '')
      createStateStream('stream', '', ['', source])
    }).toThrow()
  })

  it('throw if sources have same name', () => {
    const sourceA = createStateStream('sourceA', 'A')
    const sourceB = createStateStream('sourceA', 'B')
    expect(() => {
      createStateStream('stream', null, [sourceA, sourceB])
    }).toThrow()
  })

  it('combine all sources together', () => {
    const sourceA = createStateStream('sourceA', 'A')
    const sourceB = createStateStream('sourceB', 'B')
    const sourceC = createStateStream('sourceC', 'C')

    const stream = createStateStream(
      'stream', 'stream1', [sourceA, sourceB, sourceC]
    )
    const stream2 = createStateStream('stream2', 'stream2', [stream, sourceA])

    stream.state$.subscribe(state => {
      expect(state).toEqual({
        sourceA: 'A', sourceB: 'B', sourceC: 'C', 'stream': 'stream1'
      })
    })

    stream2.state$.subscribe(state => {
      expect(state).toEqual({
        stream: {
          sourceA: 'A',
          sourceB: 'B',
          sourceC: 'C',
          stream: 'stream1',
        },
        sourceA: 'A',
        stream2: 'stream2',
      })
    })
  })

  it('observe new state when emit value to sources', () => {
    const sourceA = createStateStream('sourceA', 'A')
    const sourceB = createStateStream('sourceB', 'B')
    const sourceC = createStateStream('sourceC', 'C')
    const stream = createStateStream(
      'stream', 'source', [sourceA, sourceB, sourceC]
    )
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
            { sourceA: 'A', sourceB: 'B', sourceC: 'C', stream: 'source' },
            { sourceA: 'AA', sourceB: 'B', sourceC: 'C', stream: 'source' },
            { sourceA: 'AA', sourceB: 'BB', sourceC: 'C', stream: 'source' },
            { sourceA: 'AA', sourceB: 'BB', sourceC: 'CC', stream: 'source' },
          ])
        }
      })

    sourceA.emitState(() => 'AA')
    sourceB.emitState(() => 'BB')
    sourceC.emitState(() => 'CC')
  })

  it('observe all states when combining sources', () => {
    const stateA = { stateA: 'stateA' }
    const stateB = { stateB: 'stateB' }
    const stateC = { stateC: 'stateC' }
    const sourceA = createStateStream('sourceA', stateA)
    const sourceB = createStateStream('sourceB', stateB)
    const sourceC = createStateStream('sourceC', stateC, [sourceA, sourceB])

    sourceC.observe(state$ => state$
      .do(state => {
        expect(state).toEqual({ sourceA: stateA, sourceB: stateB, sourceC: stateC })
      })
    )
  })
})
