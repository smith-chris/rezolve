import { renderHook, act } from '@testing-library/react-hooks';
import { makeResolvers } from '../src/index';

const useCounterResolvers = makeResolvers(
  {
    increment: state => () => state + 1,
    decrement: state => () => state - 1,
    add: state => (amount: number) => state + amount,
  },
  0
);

test('should increment counter', () => {
  const { result } = renderHook(() => useCounterResolvers());
  act(() => {
    const actions = result.current[1];
    actions.increment();
  });

  const [state] = result.current;

  expect(state).toBe(1);
});
