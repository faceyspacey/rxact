<h1 align="center">Rxact</h1>

[![npm version](https://img.shields.io/npm/v/rxact.svg?style=flat-square)](https://www.npmjs.com/package/rxact)
[![CircleCI master](https://img.shields.io/circleci/project/github/Darmody/rxact/master.svg?style=flat-square)](https://circleci.com/gh/Darmody/rxact/tree/master)
[![Coverage](https://codeclimate.com/github/Darmody/rxact/badges/coverage.svg)](https://codeclimate.com/github/Darmody/rxact)
[![Code Climate](https://codeclimate.com/github/Darmody/rxact/badges/gpa.svg)](https://codeclimate.com/github/Darmody/rxact)

Rxact 是一个基于 `Observable` 实现的 `Javascript app` 数据管理容器。

## 安装

```
yarn add rxact
```

## 起步

第一步, 选择你喜欢的 Observable 库。

`Rxact` 支持任何基于[ECMAScript Observable 标准](https://github.com/tc39/proposal-observable) 的实现。
目前可以配合使用的库包括（但不仅限于）:
* [RxJS 5](https://github.com/ReactiveX/rxjs)
* [zen-observable](https://github.com/zenparsing/zen-observable)
* [xstream](https://github.com/staltz/xstream) (配合使用：[rxact-xstream](https://github.com/Darmody/rxact-xstream))
* 更多...

第二步，配置 `Rxact`。

假设你选择了 `RxJS` 作为 `Observable` 实现，现在你需要配置 `Rxact`:

```javascript
import { StateStream } from 'rxact'
import Rx from 'rxjs'
import { setup } from 'rxact'

setup({ Observable: Rx.Observable })
```

第三步，我们以计数器为例写一个简单的样例

```javascript
import { StateStream } from 'rxact'

/**
 * StateStream 是一个管理 state 的流。
 * 你需要为流起一个名字，并赋予一个初始值。有了这个流后，就可以往流里更新新的数据，
 * 并监听流的变化，做出相应的动作
 */
const stream = new StateStream('stream', 0)

/**
 * emitter 用于定义数据的更新操作，这里定义了一个名为 increment 的操作，
 * 每次执行这个操作，"stream"流将会得到之前数据加上输入值的新值。
*/
stream.emitter('increment', value => prevState => (prevState + value))

/**
 * 通过订阅 stream 获取最新的值并打印出来。
 * 在 subscribe 时就会立刻输出当前值，在这里就是初始值 0
**/
stream.subscribe(value => { console.log(value) })

stream.increment(1)
// subscribe 将会输出 1
stream.increment(1)
// subscribe 将会输出 2
stream.increment(2)
// subscribe 将会输出 4
```

更多信息请查看详细文档。

## 示例

下面是更复杂，更多功能的示例

* [计数器](https://darmody.github.io/rxact-examples/counter)
* [TodoMVC](https://darmody.github.io/rxact-examples/todomvc)
* [异步事件案例](https://darmody.github.io/rxact-examples/async)
* [贴近现实的复杂案例](https://darmody.github.io/rxact-examples/real-world)

你可以在 [rxact-examples](https://github.com/darmody/rxact-examples) 看到上述例子的源代码。

## 插件

`Rxact` 可以配置插件来增强功能。常用的插件有：
* [Rxact-React](https://github.com/Darmody/rxact-react) `Rxact` 对 `React` 的支持。
* [Rxact-Debugger](https://github.com/Darmody/rxact-debugger) `Rxact` 调试插件，可以在浏览器控制台下调用 `StateStream`， 并有友好的日志帮助调试。
* [Rxact-Rxjs](https://github.com/Darmody/rxact-rxjs) `Rxact` 天然支持 `Rxjs`, 这个组件提供了更高级的功能支持。
* [Rxact-Xstream](https://github.com/Darmody/rxact-xstream) `Rxact` 对 `xstream` 的支持。

## 文档

敬请期待...

## 协议

[MIT](https://github.com/darmody/rxact/blob/master/LICENSE)
