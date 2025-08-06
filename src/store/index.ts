import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './slices/authSlice';
import reportsSlice from './slices/reportsSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';
import websocketSlice from './slices/websocketSlice';
import { fireAlertApi } from '../api/generated';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
  reports: reportsSlice,
  notifications: notificationsSlice,
  settings: settingsSlice,
  websocket: websocketSlice,
  [fireAlertApi.reducerPath]: fireAlertApi.reducer,
});

// Persist configuration for auth slice
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], // Only persist auth and settings
  blacklist: ['reports', 'notifications', 'websocket', fireAlertApi.reducerPath], // Don't persist these
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(fireAlertApi.middleware),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
