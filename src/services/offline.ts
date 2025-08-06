import { store } from '../store';
import { apiSlice } from '../store/services/api';
import * as SecureStore from 'expo-secure-store';

// Offline queue item interface
export interface OfflineQueueItem {
  id: string;
  type: 'createReport' | 'updateReport' | 'uploadImage' | 'syncData';
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Offline storage keys
const OFFLINE_QUEUE_KEY = 'firealert_offline_queue';
const LAST_SYNC_KEY = 'firealert_last_sync';
const OFFLINE_DATA_KEY = 'firealert_offline_data';

// Offline service class
export class OfflineService {
  private queue: OfflineQueueItem[] = [];
  private isProcessing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
  }

  // Load queue from secure storage
  private async loadQueue(): Promise<void> {
    try {
      const queueData = await SecureStore.getItemAsync(OFFLINE_QUEUE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  // Save queue to secure storage
  private async saveQueue(): Promise<void> {
    try {
      await SecureStore.setItemAsync(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  // Add item to offline queue
  async addToQueue(
    type: OfflineQueueItem['type'],
    payload: any,
    maxRetries: number = 3
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(item);
    await this.saveQueue();

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return item.id;
  }

  // Remove item from queue
  async removeFromQueue(itemId: string): Promise<void> {
    this.queue = this.queue.filter(item => item.id !== itemId);
    await this.saveQueue();
  }

  // Update item status
  async updateItemStatus(
    itemId: string,
    status: OfflineQueueItem['status'],
    error?: string
  ): Promise<void> {
    const item = this.queue.find(item => item.id === itemId);
    if (item) {
      item.status = status;
      if (error) {
        item.error = error;
      }
      await this.saveQueue();
    }
  }

  // Process offline queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Check network connectivity
      const isConnected = await this.isNetworkConnected();
      
      if (!isConnected) {
        // Wait for network connection
        setTimeout(() => {
          this.processQueue();
        }, 5000);
        return;
      }

      // Process pending items
      const pendingItems = this.queue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        try {
          await this.processQueueItem(item);
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error);
          
          // Update retry count
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            item.status = 'failed';
            item.error = error instanceof Error ? error.message : 'Unknown error';
          } else {
            item.status = 'pending';
          }
          
          await this.saveQueue();
        }
      }

      // Check if there are more items to process
      const hasPendingItems = this.queue.some(item => item.status === 'pending');
      if (hasPendingItems) {
        setTimeout(() => {
          this.processQueue();
        }, 1000);
      } else {
        this.isProcessing = false;
      }

    } catch (error) {
      console.error('Error processing offline queue:', error);
      this.isProcessing = false;
    }
  }

  // Process individual queue item
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    await this.updateItemStatus(item.id, 'processing');

    switch (item.type) {
      case 'createReport':
        await this.processCreateReport(item);
        break;
      case 'updateReport':
        await this.processUpdateReport(item);
        break;
      case 'uploadImage':
        await this.processUploadImage(item);
        break;
      case 'syncData':
        await this.processSyncData(item);
        break;
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }

    await this.updateItemStatus(item.id, 'completed');
    await this.removeFromQueue(item.id);
  }

  // Process create report
  private async processCreateReport(item: OfflineQueueItem): Promise<void> {
    const { payload } = item;
    
    // Create report via API
    const result = await store.dispatch(
      apiSlice.endpoints.createReport.initiate(payload)
    );
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to create report');
    }
  }

  // Process update report
  private async processUpdateReport(item: OfflineQueueItem): Promise<void> {
    const { payload } = item;
    
    // Update report via API
    const result = await store.dispatch(
      apiSlice.endpoints.updateReport.initiate(payload)
    );
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to update report');
    }
  }

  // Process upload image
  private async processUploadImage(item: OfflineQueueItem): Promise<void> {
    const { payload } = item;
    
    // Upload image via API
    const result = await store.dispatch(
      apiSlice.endpoints.uploadImage.initiate(payload)
    );
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to upload image');
    }
  }

  // Process sync data
  private async processSyncData(item: OfflineQueueItem): Promise<void> {
    // Sync data with backend
    const result = await store.dispatch(
      apiSlice.endpoints.syncData.initiate(item.payload)
    );
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to sync data');
    }
  }

  // Check network connectivity
  private async isNetworkConnected(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Start periodic sync
  startPeriodicSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      if (await this.isNetworkConnected()) {
        this.processQueue();
      }
    }, intervalMs);
  }

  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Get queue status
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      processing: this.queue.filter(item => item.status === 'processing').length,
      completed: this.queue.filter(item => item.status === 'completed').length,
      failed: this.queue.filter(item => item.status === 'failed').length,
    };
  }

  // Clear completed items
  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter(item => item.status !== 'completed');
    await this.saveQueue();
  }

  // Clear all items
  async clearAll(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  // Get failed items
  getFailedItems(): OfflineQueueItem[] {
    return this.queue.filter(item => item.status === 'failed');
  }

  // Retry failed items
  async retryFailed(): Promise<void> {
    const failedItems = this.getFailedItems();
    for (const item of failedItems) {
      item.status = 'pending';
      item.retryCount = 0;
      item.error = undefined;
    }
    await this.saveQueue();
    this.processQueue();
  }

  // Store offline data
  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      offlineData[key] = {
        data,
        timestamp: Date.now(),
      };
      await SecureStore.setItemAsync(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  // Get offline data
  async getOfflineData(key?: string): Promise<any> {
    try {
      const data = await SecureStore.getItemAsync(OFFLINE_DATA_KEY);
      const offlineData = data ? JSON.parse(data) : {};
      
      if (key) {
        return offlineData[key]?.data;
      }
      
      return offlineData;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return key ? undefined : {};
    }
  }

  // Remove offline data
  async removeOfflineData(key: string): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      delete offlineData[key];
      await SecureStore.setItemAsync(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  // Cleanup old data
  async cleanupOldData(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const now = Date.now();
      
      // Remove old data
      Object.keys(offlineData).forEach(key => {
        if (now - offlineData[key].timestamp > maxAgeMs) {
          delete offlineData[key];
        }
      });
      
      await SecureStore.setItemAsync(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
      
      // Remove old queue items
      this.queue = this.queue.filter(item => now - item.timestamp < maxAgeMs);
      await this.saveQueue();
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
}

// Global offline service instance
let globalOfflineService: OfflineService | null = null;

// Get or create offline service
export const getOfflineService = (): OfflineService => {
  if (!globalOfflineService) {
    globalOfflineService = new OfflineService();
  }
  return globalOfflineService;
};

// Initialize offline service
export const initializeOfflineService = (): void => {
  const service = getOfflineService();
  service.startPeriodicSync();
};

// Cleanup offline service
export const cleanupOfflineService = (): void => {
  if (globalOfflineService) {
    globalOfflineService.stopPeriodicSync();
    globalOfflineService = null;
  }
};

// Hook for using offline service in components
export const useOfflineService = () => {
  const service = getOfflineService();

  const addToQueue = async (
    type: OfflineQueueItem['type'],
    payload: any,
    maxRetries?: number
  ) => {
    return await service.addToQueue(type, payload, maxRetries);
  };

  const getQueueStatus = service.getQueueStatus.bind(service);
  const clearCompleted = service.clearCompleted.bind(service);
  const getFailedItems = service.getFailedItems.bind(service);
  const retryFailed = service.retryFailed.bind(service);

  return {
    addToQueue,
    getQueueStatus,
    clearCompleted,
    getFailedItems,
    retryFailed,
  };
};