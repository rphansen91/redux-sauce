import { MapPayload } from "../redux"
import { Action, ActionCreator, createAction } from "../action"
import { Reducer, createReducer } from "../reducer"

export interface AsyncActionCreator<T> {
  (payload: any): (dispatch: any) => Promise<any>
  reducer: Reducer<AsyncState<T>>
  loading: ActionCreator
  success: ActionCreator
  failure: ActionCreator
}

export interface AsyncState<T> {
  loading: boolean
  error: string
  data?: T
}

export interface AsyncCb<T> {
  (payload: any, dispatch: any, getState: any): Promise<T>
}

export function asyncState<T>(data?: T, loading: boolean = false, error: string = ''): AsyncState<T> {
  return { loading, data, error };
}

export function asyncAction<T> (
  type: string,
  mapToPayload: (payload: any, dispatch: any, getState: any) => Promise<T> = (v => v),
): AsyncActionCreator<T> {
  const loading = createAction(`${type}_LOADING`);
  const success = createAction(`${type}_SUCCESS`);
  const failure = createAction(`${type}_FAILURE`);

  const thunk: any = (payload: any) => (dispatch: any, getState: any) => {
    dispatch(loading(payload));

    return Promise.resolve()
      .then(() => mapToPayload(payload, dispatch, getState))
      .then(res => dispatch(success(res)))
      .catch(err => dispatch(failure(err)));
  }

  thunk.reducer = createReducer<AsyncState<T>>(asyncState(), [
    loading.case((_, payload) => asyncState(null, true)),
    success.case((_, data) => asyncState(data)),
    failure.case(({ data }, err) => asyncState(data, false, err.message))
  ]);

  thunk.loading = loading;
  thunk.success = success;
  thunk.failure = failure;

  return thunk
}