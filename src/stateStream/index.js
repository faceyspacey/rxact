// @flow
import type {
  ESObservable,
  IESObservable,
  ISubscription,
  ISubscriptionObserver,
} from '../observable'
import type { EventRunner as EventRunnerType } from './eventRunnerFactory'
import { getObservable } from '../observable'
import stateFactory from './stateFactory'
import combineStateStreams from './combineStateSteams'
import eventRunnerFactory from './eventRunnerFactory'

export interface IStateStream {
  static plugins: Array<Function>,

  static addPlugin: (...Array<Function>) => void,
  static removePlugin: (...Array<Function>) => void,

  constructor(streamName: string, initialState: any): void,

  streamName: string,

  Observable: ESObservable,

  state$: IESObservable,

  updaters: Object,

  events: Object,

  updater(name: string, fn: Function): void,

  event(name: string, sourceCreator: Function, runner?: Function): void,

  subscriptions: Array<ISubscription>,

  observers: Array<ISubscriptionObserver>,

  next(updater: Function): void,

  getState(): any,

  eventRunner: Function,

  dispose(): void,

  installPlugins: () => void,
}

export type StateStreams = Array<IStateStream>
export type EventRunner = EventRunnerType

class StateStream implements IStateStream {
  state$: IESObservable
  streamName: string
  Observable: ESObservable
  getState: Function
  next: Function
  eventRunner: Function

  static plugins = []

  static addPlugin = (...plugins) => {
    plugins.forEach(plugin => {
      if (typeof plugin !== 'function') {
        throw new Error('Expected plugin to be a function.')
      }
    })

    StateStream.plugins = [...StateStream.plugins, ...plugins]
  }

  static removePlugin = (...plugins) => {
    let finalPlugins = []
    if (plugins.length !== 0) {
      finalPlugins = StateStream.plugins.filter(
        plugin => !plugins.find(removedPlugin => removedPlugin === plugin)
      )
    }

    StateStream.plugins = finalPlugins
  }

  constructor(streamName: string, initialState: any, stateStreams?: StateStreams) {
    if (typeof streamName !== 'string' || !streamName) {
      throw new Error('Expected the streamName to be a not none string.')
    }

    this.streamName = streamName
    this.Observable = getObservable()

    this.state$ = stateFactory.call(this, initialState)
    this.state$ = combineStateStreams.call(this, this.state$, streamName, stateStreams)
    this.eventRunner = eventRunnerFactory(this.Observable, this.getState)
    this.installPlugins()
  }

  updaters = {}

  events = {}

  subscriptions = []

  observers = []

  updater = (name: string, _updater: Function) => {
    if (!name) {
      throw new Error('updater(): name should not be blank.')
    }

    // $flow-ignore
    if (this[name]) {
      throw new Error(`updater(): operator ${name} exist.`)
    }

    if (typeof _updater !== 'function') {
      throw new Error('updater(): expect second parameter to be a function.')
    }

    // $flow-ignore
    this[name] = (...params) => this.next(_updater(...params))
    // $flow-ignore
    this.updaters[name] = this[name]
  }

  event = (name: string, runner: Function, sourceCreator?: Function) => {
    if (!name) {
      throw new Error('event(): name should not be blank.')
    }

    // $flow-ignore
    if (this[name]) {
      throw new Error(`event(): operator ${name} exist.`)
    }

    if (sourceCreator && typeof sourceCreator !== 'function') {
      throw new Error('updater(): expect sourceCreator to be a function.')
    }

    if (typeof runner !== 'function') {
      throw new Error('updater(): expect runner to be a function.')
    }

    // $flow-ignore
    this[name] = (...params) => {
      let source$ = undefined

      if (sourceCreator) {
        source$ = sourceCreator(...params)
      }

      const _runner = source$ => runner(source$, ...params)

      return this.eventRunner(_runner, source$)
    }
    // $flow-ignore
    this.events[name] = this[name]
  }

  dispose = () => {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  installPlugins = () => {
    StateStream.plugins.forEach(plugin => {
      if (typeof plugin !== 'function') {
        throw new Error('Expected plugin to be a function.')
      }

      plugin(this)
    })
  }
}

export default StateStream
