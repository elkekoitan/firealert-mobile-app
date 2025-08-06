
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import reportsSlice from './slices/reportsSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';
import websocketSlice from './slices/websocketSlice';
import { apiSlice } from './services/api';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    reports: reportsSlice,
    notifications: notificationsSlice,
    settings: settingsSlice,
    websocket: websocketSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
