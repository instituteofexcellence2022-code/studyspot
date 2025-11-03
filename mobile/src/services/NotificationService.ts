/**
 * StudySpot Mobile App - Notification Service
 * Firebase push notifications and local notifications
 */

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'booking' | 'payment' | 'system' | 'promotional';
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private fcmToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) {return;}

    try {
      await this.requestPermissions();
      await this.configurePushNotifications();
      await this.getFCMToken();
      this.setupMessageHandlers();

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  private configurePushNotifications(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('FCM Token:', token);
        this.fcmToken = token.token;
      },
      onNotification: (notification) => {
        console.log('Local notification received:', notification);
        this.handleNotification(notification);
      },
      onAction: (notification) => {
        console.log('Notification action:', notification);
      },
      onRegistrationError: (err) => {
        console.error('Push notification registration error:', err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create default channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'studyspot-default',
          channelName: 'StudySpot Notifications',
          channelDescription: 'Default notification channel for StudySpot',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('FCM Token obtained:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Handle notification taps
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle notification when app is killed
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  // =============================================================================
  // NOTIFICATION HANDLING
  // =============================================================================

  private handleNotification(notification: any): void {
    // Handle notification based on type
    const {type, data} = notification;

    switch (type) {
      case 'booking':
        this.handleBookingNotification(data);
        break;
      case 'payment':
        this.handlePaymentNotification(data);
        break;
      case 'system':
        this.handleSystemNotification(data);
        break;
      case 'promotional':
        this.handlePromotionalNotification(data);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  private handleNotificationTap(remoteMessage: any): void {
    // Navigate to appropriate screen based on notification data
    const {data} = remoteMessage;

    if (data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to screen:', data.screen);
    }
  }

  private showLocalNotification(remoteMessage: any): void {
    PushNotification.localNotification({
      id: `notification-${Date.now()}`,
      channelId: 'studyspot-default',
      title: remoteMessage.notification?.title || 'StudySpot',
      message: remoteMessage.notification?.body || 'You have a new notification',
      playSound: true,
      soundName: 'default',
      actions: ['View', 'Dismiss'],
      userInfo: remoteMessage.data,
    });
  }

  // =============================================================================
  // NOTIFICATION TYPES
  // =============================================================================

  private handleBookingNotification(data: any): void {
    console.log('Booking notification:', data);
    // Handle booking-related notifications
  }

  private handlePaymentNotification(data: any): void {
    console.log('Payment notification:', data);
    // Handle payment-related notifications
  }

  private handleSystemNotification(data: any): void {
    console.log('System notification:', data);
    // Handle system notifications
  }

  private handlePromotionalNotification(data: any): void {
    console.log('Promotional notification:', data);
    // Handle promotional notifications
  }

  // =============================================================================
  // LOCAL NOTIFICATIONS
  // =============================================================================

  scheduleLocalNotification(
    notification: NotificationData,
    date: Date
  ): void {
    PushNotification.localNotificationSchedule({
      id: `scheduled-${Date.now()}`,
      channelId: 'studyspot-default',
      title: notification.title,
      message: notification.body,
      playSound: true,
      soundName: 'default',
      userInfo: notification.data,
    });
  }

  cancelLocalNotification(id: string): void {
    PushNotification.cancelLocalNotifications({id});
  }

  cancelAllLocalNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // =============================================================================
  // BOOKING NOTIFICATIONS
  // =============================================================================

  scheduleBookingReminder(bookingId: string, reminderTime: Date): void {
    this.scheduleLocalNotification(
      {
        title: 'Booking Reminder',
        body: 'Your library booking is starting soon!',
        data: {bookingId, type: 'booking_reminder'},
        type: 'booking',
      },
      reminderTime
    );
  }

  showBookingConfirmation(bookingId: string): void {
    this.showLocalNotification({
      title: 'Booking Confirmed!',
      body: 'Your library booking has been confirmed successfully.',
      data: {bookingId, type: 'booking_confirmed'},
      type: 'booking',
    });
  }

  showBookingCancellation(bookingId: string): void {
    this.showLocalNotification({
      title: 'Booking Cancelled',
      body: 'Your library booking has been cancelled.',
      data: {bookingId, type: 'booking_cancelled'},
      type: 'booking',
    });
  }

  // =============================================================================
  // PAYMENT NOTIFICATIONS
  // =============================================================================

  showPaymentSuccess(amount: number): void {
    this.showLocalNotification({
      title: 'Payment Successful',
      body: `Payment of ₹${amount} has been processed successfully.`,
      data: {type: 'payment_success'},
      type: 'payment',
    });
  }

  showPaymentFailure(amount: number): void {
    this.showLocalNotification({
      title: 'Payment Failed',
      body: `Payment of ₹${amount} could not be processed. Please try again.`,
      data: {type: 'payment_failed'},
      type: 'payment',
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async refreshFCMToken(): Promise<string | null> {
    try {
      await messaging().deleteToken();
      return await this.getFCMToken();
    } catch (error) {
      console.error('Failed to refresh FCM token:', error);
      return null;
    }
  }

  clearBadge(): void {
    PushNotification.setApplicationIconBadgeNumber(0);
  }

  setBadgeCount(count: number): void {
    PushNotification.setApplicationIconBadgeNumber(count);
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;


