/**
 * Custom type declarations for missing modules
 */

declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency?: string;
    key: string;
    amount: number;
    name?: string;
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

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}

declare module 'react-native-push-notification' {
  interface PushNotificationOptions {
    onRegister?: (token: any) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (err: any) => void;
    requestPermissions?: boolean;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
  }

  interface NotificationData {
    id: string;
    title: string;
    message: string;
    userInfo?: any;
    channelId?: string;
    playSound?: boolean;
    soundName?: string;
    actions?: string[];
  }

  const PushNotification: {
    configure(options: PushNotificationOptions): void;
    localNotification(notification: NotificationData): void;
    localNotificationSchedule(notification: NotificationData): void;
    cancelLocalNotifications(options: {id: string}): void;
    cancelAllLocalNotifications(): void;
    setApplicationIconBadgeNumber(count: number): void;
    requestPermissions(): Promise<any>;
    checkPermissions(callback: (permissions: any) => void): void;
    createChannel(channel: any, callback: (created: any) => void): void;
    getFCMToken(): string | null;
    isInitialized(): boolean;
  };

  export default PushNotification;
}

declare module 'async' {
  interface Queue<T> {
    push(task: T): void;
    length(): number;
    running(): number;
    idle(): boolean;
    pause(): void;
    resume(): void;
    kill(): void;
    concurrency: number;
    drain?: () => void;
    empty?: () => void;
    saturated?: () => void;
    unsaturated?: () => void;
    error?: (err: Error, task: T) => void;
  }

  export function queue<T>(
    worker: (task: T, callback: (error?: Error, result?: any) => void) => void,
    concurrency?: number
  ): Queue<T>;
}
