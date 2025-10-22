/**
 * StudySpot Mobile App - Network Service
 * Service for monitoring network connectivity
 */

import NetInfo from '@react-native-community/netinfo';
import {store} from '@store/index';
import {setNetworkStatus} from '@store/slices/appSlice';

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
}

export const NetworkService = new NetworkService();
export default NetworkService;
