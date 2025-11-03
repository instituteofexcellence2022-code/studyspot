/**
 * StudySpot Mobile App - Deep Linking Service
 * Handles deep links for better user experience
 */

import { Linking, Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

export interface DeepLinkConfig {
  scheme: string;
  host: string;
  paths: string[];
}

export interface DeepLinkParams {
  screen: string;
  params?: Record<string, any>;
}

class DeepLinkingService {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private config: DeepLinkConfig = {
    scheme: 'studyspot',
    host: 'app',
    paths: ['library', 'booking', 'profile', 'payment', 'chat'],
  };

  /**
   * Initialize deep linking service
   */
  initialize(navigationRef: NavigationContainerRef<any>) {
    this.navigationRef = navigationRef;
    this.setupLinkingListeners();
    this.handleInitialURL();
  }

  /**
   * Setup linking event listeners
   */
  private setupLinkingListeners() {
    // Handle incoming links when app is already running
    Linking.addEventListener('url', this.handleIncomingURL);

    // Handle incoming links when app is opened from background
    Linking.addEventListener('url', this.handleIncomingURL);
  }

  /**
   * Handle initial URL when app is opened via deep link
   */
  private async handleInitialURL() {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        this.handleIncomingURL({ url: initialURL });
      }
    } catch (error) {
      console.error('Failed to get initial URL:', error);
    }
  }

  /**
   * Handle incoming deep link URL
   */
  private handleIncomingURL = (event: { url: string }) => {
    const { url } = event;
    console.log('Deep link received:', url);
    
    try {
      const parsedURL = this.parseURL(url);
      if (parsedURL) {
        this.navigateToScreen(parsedURL);
      }
    } catch (error) {
      console.error('Failed to handle deep link:', error);
    }
  };

  /**
   * Parse deep link URL
   */
  private parseURL(url: string): DeepLinkParams | null {
    try {
      const urlObj = new URL(url);
      
      // Check if it's our app's scheme
      if (urlObj.protocol !== `${this.config.scheme}:`) {
        return null;
      }

      // Parse path segments
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length === 0) {
        return { screen: 'Home' };
      }

      const screen = pathSegments[0];
      const params: Record<string, any> = {};

      // Parse query parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Parse path parameters
      if (pathSegments.length > 1) {
        params.id = pathSegments[1];
      }

      return {
        screen: this.mapPathToScreen(screen),
        params,
      };
    } catch (error) {
      console.error('Failed to parse URL:', error);
      return null;
    }
  }

  /**
   * Map URL path to screen name
   */
  private mapPathToScreen(path: string): string {
    const screenMap: Record<string, string> = {
      library: 'LibraryDetails',
      booking: 'BookingConfirmation',
      profile: 'Profile',
      payment: 'Payment',
      chat: 'Chatbot',
      home: 'Home',
      search: 'Search',
      bookings: 'Bookings',
    };

    return screenMap[path] || 'Home';
  }

  /**
   * Navigate to screen based on deep link
   */
  private navigateToScreen(deepLink: DeepLinkParams) {
    if (!this.navigationRef) {
      console.warn('Navigation ref not available');
      return;
    }

    try {
      const { screen, params } = deepLink;
      
      // Navigate to the specified screen
      this.navigationRef.navigate(screen as never, params as never);
      
      console.log(`Navigated to ${screen} with params:`, params);
    } catch (error) {
      console.error('Failed to navigate to screen:', error);
    }
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(screen: string, params?: Record<string, any>): string {
    const path = this.mapScreenToPath(screen);
    const url = new URL(`${this.config.scheme}://${this.config.host}/${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Map screen name to URL path
   */
  private mapScreenToPath(screen: string): string {
    const pathMap: Record<string, string> = {
      LibraryDetails: 'library',
      BookingConfirmation: 'booking',
      Profile: 'profile',
      Payment: 'payment',
      Chatbot: 'chat',
      Home: 'home',
      Search: 'search',
      Bookings: 'bookings',
    };

    return pathMap[screen] || 'home';
  }

  /**
   * Share deep link
   */
  async shareDeepLink(screen: string, params?: Record<string, any>) {
    try {
      const deepLink = this.generateDeepLink(screen, params);
      
      // Use React Native Share to share the deep link
      const Share = require('react-native-share');
      await Share.open({
        message: `Check this out on StudySpot: ${deepLink}`,
        url: deepLink,
        title: 'StudySpot Deep Link',
      });
    } catch (error) {
      console.error('Failed to share deep link:', error);
    }
  }

  /**
   * Handle universal links (iOS)
   */
  handleUniversalLink(url: string) {
    // Handle universal links for iOS
    console.log('Universal link received:', url);
    this.handleIncomingURL({ url });
  }

  /**
   * Handle app links (Android)
   */
  handleAppLink(url: string) {
    // Handle app links for Android
    console.log('App link received:', url);
    this.handleIncomingURL({ url });
  }
}

// Export singleton instance
export const deepLinkingService = new DeepLinkingService();

// Export types
export type { DeepLinkConfig, DeepLinkParams };

export default deepLinkingService;
