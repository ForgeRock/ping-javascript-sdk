import { configureStore } from '@reduxjs/toolkit';
import { fetchWellKnownConfig } from './wellknown.slice.js';
import { authorizeSlice } from './authorize.slice.js';

export const store = configureStore({
  reducer: {
    [fetchWellKnownConfig.reducerPath]: fetchWellKnownConfig.reducer,
    [authorizeSlice.reducerPath]: authorizeSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(fetchWellKnownConfig.middleware)
      .concat(authorizeSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
