/**
 * Type declarations for third-party modules without TypeScript definitions
 */

declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: string;
    name: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}

declare module 'react-native-push-notification' {
  export interface PushNotificationOptions {
    onRegister?: (token: { os: string; token: string }) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (err: any) => void;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface LocalNotificationObject {
    id?: string;
    title?: string;
    message: string;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: 'day' | 'week' | 'month' | 'year';
    actions?: string[];
    userInfo?: object;
  }

  class PushNotificationClass {
    configure(options: PushNotificationOptions): void;
    localNotification(notification: LocalNotificationObject): void;
    localNotificationSchedule(notification: LocalNotificationObject & { date: Date }): void;
    cancelLocalNotifications(details: { id: string }): void;
    cancelAllLocalNotifications(): void;
    setApplicationIconBadgeNumber(number: number): void;
    getApplicationIconBadgeNumber(callback: (number: number) => void): void;
    popInitialNotification(callback: (notification: any) => void): void;
    abandonPermissions(): void;
    checkPermissions(callback: (permissions: object) => void): void;
    requestPermissions(permissions?: string[]): Promise<any>;
    registrationError?: any;
    remoteNotificationsRegistered?: any;
  }

  const PushNotification: PushNotificationClass;
  export default PushNotification;
}

declare module 'async' {
  export function queue<T>(
    worker: (task: T, callback: (error?: Error) => void) => void,
    concurrency?: number
  ): {
    push: (task: T | T[], callback?: (error?: Error) => void) => void;
    unshift: (task: T | T[], callback?: (error?: Error) => void) => void;
    pause: () => void;
    resume: () => void;
    idle: () => boolean;
    length: () => number;
    kill: () => void;
    drain?: () => void;
    error?: (error: Error, task: T) => void;
  };
}

// React Native global functions
declare global {
  function btoa(str: string): string;
  function atob(str: string): string;
}

export {};

