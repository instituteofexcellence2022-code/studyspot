/**
 * StudySpot Mobile App - Offline Service
 * Service for handling offline capabilities and data synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineAction {
  id: string;
  type: 'CREATE_BOOKING' | 'CANCEL_BOOKING' | 'CHECKIN' | 'CHECKOUT' | 'UPDATE_PROFILE';
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

interface OfflineData {
  libraries: any[];
  bookings: any[];
  userProfile: any;
  lastSyncTime: string;
}

class OfflineService {
  private static instance: OfflineService;
  private actionQueue: OfflineAction[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // =============================================================================
  // NETWORK MONITORING
  // =============================================================================

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        this.handleConnectionRestored();
      }

      this.notifyListeners();
    });
  }

  private handleConnectionRestored() {
    console.log('Connection restored, syncing offline actions...');
    this.syncOfflineActions();
  }

  public addNetworkListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  // =============================================================================
  // OFFLINE DATA STORAGE
  // =============================================================================

  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(`offline_${key}`, jsonData);
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  async getOfflineData(key: string): Promise<any | null> {
    try {
      const jsonData = await AsyncStorage.getItem(`offline_${key}`);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async removeOfflineData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`offline_${key}`);
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  // =============================================================================
  // OFFLINE ACTIONS QUEUE
  // =============================================================================

  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    try {
      const existingActions = await this.getOfflineActions();
      existingActions.push(offlineAction);
      await this.storeOfflineData('pending_actions', existingActions);

      if (this.isOnline) {
        this.actionQueue.push(offlineAction);
      }
    } catch (error) {
      console.error('Failed to add offline action:', error);
    }
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    const actions = await this.getOfflineData('pending_actions');
    return actions || [];
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const filteredActions = actions.filter(action => action.id !== actionId);
      await this.storeOfflineData('pending_actions', filteredActions);
    } catch (error) {
      console.error('Failed to remove offline action:', error);
    }
  }

  // =============================================================================
  // ACTION PROCESSING
  // =============================================================================

  private async processAction(action: OfflineAction, callback: (error?: Error) => void): Promise<void> {
    try {
      if (!this.isOnline) {
        callback(new Error('No internet connection'));
        return;
      }

      const success = await this.executeAction(action);

      if (success) {
        await this.removeOfflineAction(action.id);
        callback();
      } else {
        action.retryCount++;
        if (action.retryCount >= action.maxRetries) {
          await this.removeOfflineAction(action.id);
          callback(new Error('Max retries exceeded'));
        } else {
          callback(new Error('Action failed, will retry'));
        }
      }
    } catch (error) {
      action.retryCount++;
      if (action.retryCount >= action.maxRetries) {
        await this.removeOfflineAction(action.id);
      }
      callback(error as Error);
    }
  }

  private async executeAction(action: OfflineAction): Promise<boolean> {
    // This would integrate with your actual API services
    // For now, we'll simulate the API calls
    switch (action.type) {
      case 'CREATE_BOOKING':
        return await this.simulateCreateBooking(action.data);
      case 'CANCEL_BOOKING':
        return await this.simulateCancelBooking(action.data);
      case 'CHECKIN':
        return await this.simulateCheckIn(action.data);
      case 'CHECKOUT':
        return await this.simulateCheckOut(action.data);
      case 'UPDATE_PROFILE':
        return await this.simulateUpdateProfile(action.data);
      default:
        return false;
    }
  }

  // =============================================================================
  // SYNC OPERATIONS
  // =============================================================================

  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const actions = await this.getOfflineActions();
      for (const action of actions) {
        this.actionQueue.push(action);
      }
    } catch (error) {
      console.error('Failed to sync offline actions:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncOfflineData(): Promise<void> {
    try {
      // Sync libraries data
      await this.syncLibrariesData();

      // Sync bookings data
      await this.syncBookingsData();

      // Sync user profile
      await this.syncUserProfile();

      await this.storeOfflineData('last_sync_time', new Date().toISOString());
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private async syncLibrariesData(): Promise<void> {
    // This would fetch from your actual API
    const libraries = await this.fetchLibrariesFromAPI();
    await this.storeOfflineData('libraries', libraries);
  }

  private async syncBookingsData(): Promise<void> {
    // This would fetch from your actual API
    const bookings = await this.fetchBookingsFromAPI();
    await this.storeOfflineData('bookings', bookings);
  }

  private async syncUserProfile(): Promise<void> {
    // This would fetch from your actual API
    const profile = await this.fetchUserProfileFromAPI();
    await this.storeOfflineData('user_profile', profile);
  }

  // =============================================================================
  // SIMULATED API CALLS
  // =============================================================================

  private async simulateCreateBooking(data: any): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.2; // 80% success rate
  }

  private async simulateCancelBooking(data: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return Math.random() > 0.1; // 90% success rate
  }

  private async simulateCheckIn(data: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return Math.random() > 0.15; // 85% success rate
  }

  private async simulateCheckOut(data: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return Math.random() > 0.15; // 85% success rate
  }

  private async simulateUpdateProfile(data: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return Math.random() > 0.1; // 90% success rate
  }

  private async fetchLibrariesFromAPI(): Promise<any[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    return []; // Return actual libraries data
  }

  private async fetchBookingsFromAPI(): Promise<any[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    return []; // Return actual bookings data
  }

  private async fetchUserProfileFromAPI(): Promise<any> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return {}; // Return actual profile data
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  public isConnected(): boolean {
    return this.isOnline;
  }

  async clearAllOfflineData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      await AsyncStorage.multiRemove(offlineKeys);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  async getOfflineDataSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      return offlineKeys.length;
    } catch (error) {
      console.error('Failed to get offline data size:', error);
      return 0;
    }
  }
}

export const offlineService = OfflineService.getInstance();
export default offlineService;


