import { useReducer, useMemo, Dispatch } from 'react';

/**
 * Action is simply an object of a fixed shape. The `type` string property is what differentiates actions between each other. Standard redux stuff.
 */
export type Action<T = any> = { type: string; payload?: T[] };

/**
 * ActionCreator, confusingly often just called an Action, is a function that always creates an `Action` object with a constant `type` property.
 */
export type ActionCreator<T = any> = (payload?: T) => Action<T>;

/**
 * ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * It is a concept that 'rezolve' introduces, you can think of each 'case' in a standard redux's reduxcer switch statement as an resolver.
 * Each resolver takes care of one `Action` type. The `type` string property is later on inferred from resolvers name.
 */
export type ActionResolver<T = any> = (state: T) => (...payload: any[]) => T;

/**
 * Record (aka Dictionary) of `ActionResolvers`.
 */
export type ActionResolvers<T = any> = Record<string, ActionResolver<T>>;

/**
 * Extracts ActionCreator's type from an ActionResolver type.
 */
type GetActionCreator<T extends ActionResolver, U extends PropertyKey> =
  /**
   *  If the ActionResolver's return type is a function of 0 arguments, return an ActionCreator without the payload property, otherwise return full ActionCreator type.
   */
  ReturnType<T> extends () => any
    ? () => { type: U }
    : ReturnType<T> extends (...payload: infer U) => any
    ? (...payload: U) => { type: U; payload: U }
    : never;

/**
 * Take ActionResolvers and convert them to ActionCreators.
 * @param actionResolvers Record (aka Dictionary) of `ActionResolvers`. ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * @param initialState Initial state of the store
 * @returns Record (aka Dictionary) of `ActionCreators`
 */
export const makeActionCreators = <T extends ActionResolvers<U>, U = any>(
  actionResolvers: T,
  _initialState?: U
) =>
  Object.keys(actionResolvers).reduce(
    (acc: Record<string, ActionCreator>, type) => {
      acc[type] = (...payload: any[]) => {
        if (payload.length === 0) {
          return { type };
        } else {
          return { type, payload };
        }
      };
      return acc;
    },
    {}
  ) as {
    [K in keyof T]: GetActionCreator<T[K], K>;
  };

/**
 * Take ActionResolvers, initialState of your store and convert them into standard Redux's reducer.
 * @param actionResolvers Record (aka Dictionary) of `ActionResolvers`. ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * @param initialState Initial state of the store
 * @returns a reducer function that can be used with Redux, useReducer or any other compatible library.
 */
export const makeReducer = <T = any>(
  actionResolvers: ActionResolvers,
  initialState: T
) => (state = initialState, action: Action): T => {
  const actionResolver = actionResolvers[action.type];

  if (typeof actionResolver === 'function') {
    if (action.payload) {
      return actionResolver(state)(...action.payload);
    } else {
      return actionResolver(state)();
    }
  }

  return state;
};

/**
 * This what an ActionCreator will become after wrapping it with dispatch() call.
 */
type GetActionDispatcher<T extends ActionResolver> = ReturnType<T> extends (
  ...payload: infer U
) => any
  ? (...payload: U) => void
  : never;

/**
 * Take ActionResolvers, initialState and convert them into ready to use hook.
 * @param actionResolvers Record (aka Dictionary) of `ActionResolvers`. ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * @param initialState Initial state of the store
 * @returns a hook that gives you state & already bound action creators.
 */
export const makeResolvers = <U, T extends ActionResolvers<U>>(
  actionResolvers: T,
  initialState: U
) => {
  const reducer = makeReducer(actionResolvers, initialState);
  const actions = makeActionCreators(actionResolvers, initialState);

  const wrapActionsWithDispatch = (dispatch: Dispatch<any>) =>
    Object.entries(actions).reduce(
      (acc, [key, action]) => ({
        ...acc,
        [key]: (...params: any[]) => dispatch(action(...params)),
      }),
      {}
    );

  return () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return [
      state,
      useMemo(() => wrapActionsWithDispatch(dispatch), [dispatch]),
    ] as [
      typeof state,
      {
        [K in keyof T]: GetActionDispatcher<T[K]>;
      }
    ];
  };
};
