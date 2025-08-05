
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import reportsSlice from './slices/reportsSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    reports: reportsSlice,
    notifications: notificationsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
