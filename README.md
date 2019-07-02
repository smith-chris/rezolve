# <img src='https://github.com/smith-chris/redux-solve/raw/master/logo.png' height='60' alt='Redux Solve' />

Redux helper that reduces boilerplate to the complete minimum. Simple as that.

Best used with Typescript.

## Installation

```bash
npm i redux-solve
```

or

```bash
yarn add redux-solve
```

## Basic example

```ts
import { createStore } from 'redux';
import { makeReducer, makeActionCreators } from 'redux-solve';

type State = number;

const initialState: State = 0;

const resolvers = {
  increment: (state: State) => (): State => state + 1,
  decrement: (state: State) => (): State => state - 1,
  add: (state: State) => (amount: number): State => state + amount,
};

export const actions = makeActionCreators(resolvers, initialState);
export const reducer = makeReducer(resolvers, initialState);

const store = createStore(reducer);

store.subscribe(() => {
  console.log('Value of the counter is: ', store.getState());
});

store.dispatch(actions.increment()); // Value of the counter is: 1
store.dispatch(actions.decrement()); // Value of the counter is: 0
store.dispatch(actions.add(5)); // Value of the counter is: 5

store.dispatch(actions.foo()); // Error: Property 'foo' does not exist on type [...].
store.dispatch(actions.add('bar')); // Error: Argument of type '"bar"' is not assignable to parameter of type 'number'.
```

I encourage you to take a look at [Counter example repo](https://github.com/smith-chris/redux-solve-counter-example).

## Advanced example

The file structure presented here is just a suggestion, it showcases how you could go about spreding the logic into separate modules. You can also see [TodoMVC example](https://github.com/smith-chris/redux-solve-todomvc-example) for more advanced usage.

> src/reducers/counter/resolvers.ts

```ts
export type CounterState = number;

export const increment = (state: CounterState) => (): CounterState => state + 1;

export const decrement = (state: CounterState) => (): CounterState => state - 1;

export const add = (state: CounterState) => (amount: number): CounterState =>
  state + amount;
```

> src/reducers/counter/index.ts

```ts
import { makeActionCreators, makeReducer } from 'redux-solve';
import { CounterState } from './resolvers';
import * as counterResolvers from './resolvers';

export const initialState: CounterState = 0;

export const counterActions = makeActionCreators(
  counterResolvers,
  initialState
);
export const counterReducer = makeReducer(counterResolvers, initialState);
```

> src/reducers/index.ts

```ts
import { combineReducers } from 'redux';
import { counterReducer } from './counter';

export const rootReducer = combineReducers({
  counter: counterReducer,
});
```

> src/index.ts

```ts
import { createStore } from 'redux';
import { rootReducer } from './reducers';
import { counterActions } from './reducers/counter';

const store = createStore(rootReducer);

store.subscribe(() => {
  console.log('Value of the counter is: ', store.getState().counter);
});

store.dispatch(counterActions.increment()); // Value of the counter is: 1
store.dispatch(counterActions.decrement()); // Value of the counter is: 0
store.dispatch(counterActions.add(5)); // Value of the counter is: 5

store.dispatch(actions.foo()); // Error: Property 'foo' does not exist on type [...].
store.dispatch(actions.add('bar')); // Error: Argument of type '"bar"' is not assignable to parameter of type 'number'.
```

## Support

Please [open an issue](https://github.com/smith-chris/redux-solve/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/smith-chris/redux-solve/compare).
