// @flow
type CreateEmitter = Function => (Function, ?Boolean) => Function

const createEmitter: CreateEmitter = (emit) => (updater, observable) => (...params) =>
  emit(prevState => updater(prevState, ...params), observable)

export default createEmitter
