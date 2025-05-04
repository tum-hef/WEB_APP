import { configureStore } from '@reduxjs/toolkit';
import rolesReducer from './rolesSlice';

export const store = configureStore({
  reducer: {
    roles: rolesReducer,
  },
});

// Types for usage in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
