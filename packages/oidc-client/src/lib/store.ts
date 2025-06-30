import { configureStore } from '@reduxjs/toolkit';
import { wellknownSlice } from './wellknown.slice.js';

export const store = configureStore({
  reducer: {
    wellknown: wellknownSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
