export type CreateState<S extends object> = (
  setState: SetState<S>,
  getState: () => S,
  api: StoreAPI<S>
) => S

export type SetState<S extends object> = (
  state: S | ((prevState: S) => Partial<S>),
  replace?: boolean
) => void

export interface StoreAPI<S extends object> {
  setState: SetState<S>
  getState: () => S
  subscribe: (listener: (state: S, prevState: S) => void) => () => void
  destroy: () => void
}
