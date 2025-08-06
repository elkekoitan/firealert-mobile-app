import { environment } from '../utils/environment';
import { store } from '../store';
import { apiSlice } from '../store/services/api';

// WebSocket event types
export enum WebSocketEventType {
  NEW_REPORT = 'NEW_REPORT',
  REPORT_UPDATED = 'REPORT_UPDATED',
  REPORT_VERIFIED = 'REPORT_VERIFIED',
  CRITICAL_ALERT = 'CRITICAL_ALERT',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

// WebSocket event interface
export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
  id: string;
}

// WebSocket client class
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // 1 second
  private isConnecting = false;
  private messageQueue: any[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = Date.now();

  constructor(private url: string = environment.api.wsUrl) {}

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.lastHeartbeat = Date.now();
          
          // Send queued messages
          this.messageQueue.forEach(message => {
            this.send(message);
          });
          this.messageQueue = [];

          // Start heartbeat
          this.startHeartbeat();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect();
            }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        console.error('WebSocket connection error:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Send message
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
    }
  }

  // Handle incoming messages
  private handleMessage(data: string): void {
    try {
      const event: WebSocketEvent = JSON.parse(data);
      
      // Update heartbeat
      this.lastHeartbeat = Date.now();

      // Dispatch event to Redux store
      this.dispatchEvent(event);

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Dispatch event to Redux store
  private dispatchEvent(event: WebSocketEvent): void {
    const { dispatch } = store;
    
    switch (event.type) {
      case WebSocketEventType.NEW_REPORT:
        // Add new report to the reports list
        dispatch(apiSlice.util.updateQueryData('getReports', undefined, (draft) => {
          draft.unshift(event.payload);
        }));
        break;

      case WebSocketEventType.REPORT_UPDATED:
        // Update existing report
        dispatch(apiSlice.util.updateQueryData('getReports', undefined, (draft) => {
          const index = draft.findIndex(report => report.id === event.payload.id);
          if (index !== -1) {
            draft[index] = { ...draft[index], ...event.payload };
          }
        }));
        break;

      case WebSocketEventType.REPORT_VERIFIED:
        // Update report status to verified
        dispatch(apiSlice.util.updateQueryData('getReports', undefined, (draft) => {
          const index = draft.findIndex(report => report.id === event.payload.id);
          if (index !== -1) {
            draft[index].status = 'VERIFIED';
          }
        }));
        break;

      case WebSocketEventType.CRITICAL_ALERT:
        // Show critical alert notification
        dispatch({
          type: 'notifications/criticalAlert',
          payload: event.payload,
        });
        break;

      case WebSocketEventType.SYSTEM_NOTIFICATION:
        // Show system notification
        dispatch({
          type: 'notifications/systemNotification',
          payload: event.payload,
        });
        break;

      default:
        console.warn('Unknown WebSocket event type:', event.type);
    }
  }

  // Start heartbeat mechanism
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      // Check if connection is still alive
      if (Date.now() - this.lastHeartbeat > 30000) { // 30 seconds
        console.log('Heartbeat timeout, reconnecting...');
        this.reconnectAttempts++;
        this.connect();
        return;
      }

      // Send ping
      this.send({ type: 'PING', timestamp: new Date().toISOString() });
    }, 15000); // Send ping every 15 seconds
  }

  // Stop heartbeat mechanism
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Subscribe to events
  subscribe(callback: (event: WebSocketEvent) => void): () => void {
    const handler = (event: MessageEvent) => {
      try {
        const wsEvent: WebSocketEvent = JSON.parse(event.data);
        callback(wsEvent);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    if (this.ws) {
      this.ws.addEventListener('message', handler);
    }

    // Return unsubscribe function
    return () => {
      if (this.ws) {
        this.ws.removeEventListener('message', handler);
      }
    };
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getReadyState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }
}

// Global WebSocket client instance
let globalWebSocketClient: WebSocketClient | null = null;

// Get or create WebSocket client
export const getWebSocketClient = (): WebSocketClient => {
  if (!globalWebSocketClient) {
    globalWebSocketClient = new WebSocketClient();
  }
  return globalWebSocketClient;
};

// Initialize WebSocket connection
export const initializeWebSocket = async (): Promise<void> => {
  const client = getWebSocketClient();
  if (!client.isConnected()) {
    await client.connect();
  }
};

// Cleanup WebSocket connection
export const cleanupWebSocket = (): void => {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
    globalWebSocketClient = null;
  }
};

// Hook for using WebSocket in components
export const useWebSocket = () => {
  const client = getWebSocketClient();

  const connect = async () => {
    if (!client.isConnected()) {
      await client.connect();
    }
  };

  const disconnect = () => {
    client.disconnect();
  };

  const send = (message: any) => {
    client.send(message);
  };

  const subscribe = (callback: (event: WebSocketEvent) => void) => {
    return client.subscribe(callback);
  };

  const isConnected = client.isConnected();

  return {
    connect,
    disconnect,
    send,
    subscribe,
    isConnected,
  };
};