import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WebSocketEventType, WebSocketEvent } from '../../services/websocket';

interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastEvent: WebSocketEvent | null;
  events: WebSocketEvent[];
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

const initialState: WebSocketState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  lastEvent: null,
  events: [],
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Connection status changes
    connecting: (state) => {
      state.connectionStatus = 'connecting';
    },
    connected: (state) => {
      state.isConnected = true;
      state.connectionStatus = 'connected';
      state.reconnectAttempts = 0;
    },
    disconnected: (state) => {
      state.isConnected = false;
      state.connectionStatus = 'disconnected';
    },
    connectionError: (state) => {
      state.isConnected = false;
      state.connectionStatus = 'error';
    },
    
    // Reconnection attempts
    reconnectAttempt: (state, action: PayloadAction<number>) => {
      state.reconnectAttempts = action.payload;
    },
    
    // Event handling
    eventReceived: (state, action: PayloadAction<WebSocketEvent>) => {
      const event = action.payload;
      state.lastEvent = event;
      state.events.unshift(event); // Add to beginning of array
      
      // Keep only last 100 events
      if (state.events.length > 100) {
        state.events = state.events.slice(0, 100);
      }
    },
    
    // Clear events
    clearEvents: (state) => {
      state.events = [];
      state.lastEvent = null;
    },
    
    // Reset state
    reset: () => initialState,
  },
});

// Export actions
export const {
  connecting,
  connected,
  disconnected,
  connectionError,
  reconnectAttempt,
  eventReceived,
  clearEvents,
  reset,
} = websocketSlice.actions;

// Export selectors
export const selectWebSocketState = (state: { websocket: WebSocketState }) => state.websocket;
export const selectIsWebSocketConnected = (state: { websocket: WebSocketState }) => state.websocket.isConnected;
export const selectWebSocketConnectionStatus = (state: { websocket: WebSocketState }) => state.websocket.connectionStatus;
export const selectWebSocketLastEvent = (state: { websocket: WebSocketState }) => state.websocket.lastEvent;
export const selectWebSocketEvents = (state: { websocket: WebSocketState }) => state.websocket.events;

// Export reducer
export default websocketSlice.reducer;