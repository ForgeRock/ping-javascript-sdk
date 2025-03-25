# Middleware and Enhancer options

## Top-level API

```ts
import { createClientStore } from './client.store.utils.js';

function davinci({
  config: DaVinciConfig,
  requestMiddleware?: RequestMiddleware[],
  dispatchMiddleware?: DispatchMiddleware[],
}) {
  const store = createClientStore({ requestMiddleware, dispatchMiddleware });

  // ...
}
```

## Store creation module

```ts
import { prepareMiddleware } from './state.utilities.js';

export function createClientStore({
  requestMiddleware?: RequestMiddleware[],
  dispatchMiddleware?: DispatchMiddleware[],
}) {
  // Converts a simplified middleware structure to proper Redux middleware
  const preparedMiddleware = prepareMiddleware(dispatchMiddleware);

  return configureStore({
    reducer: {
      config: configSlice.reducer,
      node: nodeSlice.reducer,
      [davinciApi.reducerPath]: davinciApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            /**
             * This becomes the `api.extra` argument, and will be passed into the
             * customer query wrapper for `baseQuery`
             */
            requestMiddleware: requestMiddleware,
          },
        },
      })
        .concat(davinciApi.middleware)
        .concat(wellknownApi.middleware)
        .concat(preparedMiddleware)
  });
});
```

## Redux API module

```ts
import { initRequest } from './request.utils.js';

export const davinciApi = createApi({
  reducerPath: 'davinci',
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    next: builder.mutation({
      async queryFn(body, api, __, baseQuery) {
        const request = {
          url: href,
          credentials: 'include',
          method: 'POST',
          headers: {},
          body: {},
        };

        const response = await initRequest(request)
          .applyMiddleware(api.extra.requestMiddleware)
          .applyQuery(baseQuery);

        return response;
      },
    }),
  }),
});
```

## Request effect utility

```ts
export function initQuery(request) {
  const queryApi = {
    applyMiddleware(middleware) {
      // Iterates and executes provided middleware functions
      // Allow middleware to mutate `request` argument
      return queryApi;
    },
    applyQuery(query) {
      return query(request);
    },
  };

  return queryApi;
}
```

## State middleware utility

```ts
export prepareStateMiddleware(middleware) {
  return middleware.map((func) => {
    return function exampleMiddleware(storeAPI) {
      return function wrapDispatch(next) {
        return function handleAction(action) {
          const state = storeAPI.state();
          return fn(state, action, next);
        }
      }
    }
  });
}
```

## References

1. [Text](https://redux.js.org/tutorials/fundamentals/part-4-store#writing-custom-middleware)
2. [Text](https://dev.to/ajmal_hasan/creating-a-scalable-react-native-app-with-redux-toolkit-query-31hh)
3. [What is a Redux Enhancer?](https://dev.to/pandresdev/redux-enhancer-j9i)
4. [Text](https://stackoverflow.com/questions/77568444/what-is-the-use-of-extra-and-extraoptions-in-redux-toolkit-query-how-could-we-p)
5. [Text](https://stackoverflow.com/questions/65126859/redux-rtk-create-enhancer-for-one-slice)
6. [Extra argument for Thunks and baseQuery](https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument)
