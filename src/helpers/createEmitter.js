// @flow
type CreateEmitter = Function => Function => Function

const createEmitter: CreateEmitter = emit => updater => (...params) =>
  emit(prevState => updater(prevState, ...params))

export default createEmitter
