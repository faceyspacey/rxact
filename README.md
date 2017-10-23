<h1 align="center">Rxact</h1>

[![npm version](https://img.shields.io/npm/v/rxact.svg?style=flat-square)](https://www.npmjs.com/package/rxact)
[![CircleCI master](https://img.shields.io/circleci/project/github/Darmody/rxact/master.svg?style=flat-square)](https://circleci.com/gh/Darmody/rxact/tree/master)
[![Coverage](https://codeclimate.com/github/Darmody/rxact/badges/coverage.svg)](https://codeclimate.com/github/Darmody/rxact)
[![Code Climate](https://codeclimate.com/github/Darmody/rxact/badges/gpa.svg)](https://codeclimate.com/github/Darmody/rxact)

Rxact is an observable state management for Javascript app.

## Installation

```
yarn add rxact
```

## Getting Started

#### Step 1, chosing your favorite observable lib.

`Rxact` supports any lib implement [ECMAScript Observable ](https://github.com/tc39/proposal-observable).
including(but not only):
* [RxJS 5](https://github.com/ReactiveX/rxjs)
* [zen-observable](https://github.com/zenparsing/zen-observable)
* [xstream](https://github.com/staltz/xstream) (combining with [rxact-xstream](https://github.com/Darmody/rxact-xstream))
* more...

#### Step 2, setup `Rxact`.

Assume you chosed `RXJS`, then

```javascript
import { StateStream } from 'rxact'
import Rx from 'rxjs'
import { setup } from 'rxact'

setup({ Observable: Rx.Observable })
```

#### Step 3, let's start by writing a counter

```javascript
import { StateStream } from 'rxact'

/**
 * StateStream is a stream for managing state and logic.
 * You shold named the stream and give it initial value.
 * After that, we can emit value and listen to it.
 */
const stream = new StateStream('stream', 0)

/**
 * Emitter is a operator for emitting new value. We define a emitter named "increment" here.
 * Everytime "increment" executed, "stream" will receive new value which equal to previous value plus input value.
*/
stream.emitter('increment', value => prevState => (prevState + value))

/**
 * Subscribing the stream and outputting values.
 * After you subscribed, it will output current value immediately, which means initial value here.
**/
stream.subscribe(value => { console.log(value) })

stream.increment(1)
// output 1.
stream.increment(1)
// output 2.
stream.increment(2)
// output 4.
```

For more infomation, please check documents below.

## Examples

Here are more complex exmaples

* [Counter](https://darmody.github.io/rxact-examples/counter)
* [TodoMVC](https://darmody.github.io/rxact-examples/todomvc)
* [Async](https://darmody.github.io/rxact-examples/async)
* [Real World](https://darmody.github.io/rxact-examples/real-world)

You can checkout the source code on [rxact-examples](https://github.com/darmody/rxact-examples).

## Plugins

You can enhance `Rxact` by adding plugins.
* [Rxact-React](https://github.com/Darmody/rxact-react) `Rxact` binding for `React`.
* [Rxact-Debugger](https://github.com/Darmody/rxact-debugger) debugging and friendly log.
* [Rxact-Rxjs](https://github.com/Darmody/rxact-rxjs) `Rxact` support `Rxjs` natively, but you can get advanced function here.
* [Rxact-Xstream](https://github.com/Darmody/rxact-xstream) Combine `Rxact` and `xstream`.

## Docs

Coming soon ...

## Lisence

[MIT](https://github.com/darmody/rxact/blob/master/LICENSE)
