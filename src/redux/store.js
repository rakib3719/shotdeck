import { configureStore } from '@reduxjs/toolkit';
import { shotApi } from './api/shot';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    [shotApi.reducerPath]: shotApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shotApi.middleware),
});

setupListeners(store.dispatch);
