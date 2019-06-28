# Redux Solve

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
store.dispatch(actions.foo()); // Error: Property 'foo' does not exist on type [...].
store.dispatch(actions.add(5)); // Value of the counter is: 5
store.dispatch(actions.add('bar')); // Error: Argument of type '"bar"' is not assignable to parameter of type 'number'.
```

## Other examples

You can also take a look at standard [Counter](https://github.com/smith-chris/redux-solve-counter-example) and [TodoMVC](https://github.com/smith-chris/redux-solve-todomvc-example) examples implemented using `redux-solve`.

## Support

Please [open an issue](https://github.com/smith-chris/redux-solve/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/smith-chris/redux-solve/compare).
