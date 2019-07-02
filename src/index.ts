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
 * It is a concept that 'redux-solve' introduces, you can think of each 'case' in a standard redux's reduxcer switch statement as an resolver.
 * Each resolver takes care of one `Action` type. The `type` string property is later on inferred from resolvers name.
 */
export type ActionResolver<TState = any> = (
  state: TState
) => (...payload: any[]) => TState;

/**
 * Record (aka Dictionary) of `ActionResolvers`.
 */
export type ActionResolvers<TState = any> = Record<
  string,
  ActionResolver<TState>
>;

/**
 * Extracts ActionCreator's type from an ActionResolver type.
 */
type GetActionCreator<
  TActionResolver extends ActionResolver,
  TType extends PropertyKey
> =
  /**
   *  If the ActionResolver's return type is a function of 0 arguments, return an ActionCreator without the payload property, otherwise return full ActionCreator type.
   *  Due to how TS `extends` assertion works, there's a bit of repetition here, PR's are welcome ;)
   */
  ReturnType<TActionResolver> extends () => any
    ? () => { type: TType }
    : ReturnType<TActionResolver> extends (...payload: infer U) => any
    ? (...payload: U) => { type: TType; payload: U }
    : () => { type: TType };

type GetActionCreators<TActionResolvers extends ActionResolvers> = {
  [K in keyof TActionResolvers]: GetActionCreator<TActionResolvers[K], K>;
};

/**
 * Take ActionResolvers and convert them to ActionCreators.
 * @param actionResolvers Record (aka Dictionary) of `ActionResolvers`. ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * @param initialState Initial state of the store
 * @returns Record (aka Dictionary) of `ActionCreators`
 */
export const makeActionCreators = <
  T extends ActionResolvers<TState>,
  TState = any
>(
  actionResolvers: T,
  _initialState?: TState
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
  ) as GetActionCreators<T>;

/**
 * Take ActionResolvers, initialState of your store and convert them into standard Redux's reducer.
 * @param actionResolvers Record (aka Dictionary) of `ActionResolvers`. ActionResolver is a function that takes `State`, Action's `Payload` property, and returns `State`.
 * @param initialState Initial state of the store
 */
export const makeReducer = <TState = any>(
  actionResolvers: ActionResolvers,
  initialState: TState
) => (state = initialState, action: Action): TState => {
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
