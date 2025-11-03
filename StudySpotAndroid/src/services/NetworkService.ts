/**
 * StudySpot Mobile App - Network Service
 * Service for monitoring network connectivity
 */

import NetInfo from '@react-native-community/netinfo';
import {store} from '../store/index';
import {setNetworkStatus} from '../store/slices/appSlice';

class NetworkService {
  private unsubscribe: (() => void) | null = null;

  initialize(): void {
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(state => {
      store.dispatch(setNetworkStatus({
        isConnected: state.isConnected ?? false,
        type: state.type as any,
        isInternetReachable: state.isInternetReachable ?? false,
      }));
    });
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async getNetworkState() {
    return await NetInfo.fetch();
  }

  // HTTP methods for API calls
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default new NetworkService();
