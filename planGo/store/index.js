import { configureStore } from '@reduxjs/toolkit';
import { attractionsApi } from './attractionsApi';
import userReducer from './slices/userSlice';
import tripReducer from './slices/tripSlice';
import { usersApi } from './usersApi';

export const store = configureStore({
  reducer: {
    [attractionsApi.reducerPath]: attractionsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    user: userReducer,
    trip: tripReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(attractionsApi.middleware, usersApi.middleware)
});
