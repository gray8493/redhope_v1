// Push Notification Service for RedHope
// This service handles browser push notifications

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: {
        url?: string;
        [key: string]: any;
    };
}

class PushNotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private isSupported: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        }
    }

    /**
     * Initialize Service Worker and Push Notifications
     */
    async init(): Promise<boolean> {
        if (!this.isSupported) {
            console.warn('[Push] Push notifications are not supported in this browser');
            return false;
        }

        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('[Push] Service Worker registered:', this.swRegistration);

            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('[Push] Service Worker is ready');

            return true;
        } catch (error) {
            console.error('[Push] Service Worker registration failed:', error);
            return false;
        }
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled(): boolean {
        return this.isSupported && Notification.permission === 'granted';
    }

    /**
     * Get current permission status
     */
    getPermissionStatus(): NotificationPermission | 'unsupported' {
        if (!this.isSupported) return 'unsupported';
        return Notification.permission;
    }

    /**
     * Request notification permission from user
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!this.isSupported) {
            console.warn('[Push] Notifications not supported');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('[Push] Permission result:', permission);
            return permission;
        } catch (error) {
            console.error('[Push] Permission request failed:', error);
            return 'denied';
        }
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe(): Promise<PushSubscription | null> {
        if (!this.swRegistration) {
            console.warn('[Push] Service Worker not registered');
            return null;
        }

        try {
            // Check existing subscription
            let subscription = await this.swRegistration.pushManager.getSubscription();

            if (subscription) {
                console.log('[Push] Already subscribed:', subscription);
                return subscription;
            }

            // Create new subscription
            const options: PushSubscriptionOptionsInit = {
                userVisibleOnly: true,
            };

            // Add VAPID key if available
            if (VAPID_PUBLIC_KEY) {
                options.applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;
            }

            subscription = await this.swRegistration.pushManager.subscribe(options);
            console.log('[Push] New subscription:', subscription);

            // Send subscription to server (implement your backend endpoint)
            await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(): Promise<boolean> {
        if (!this.swRegistration) return false;

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('[Push] Unsubscribed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return false;
        }
    }

    /**
     * Show a local notification (not push, but useful for testing)
     */
    async showLocalNotification(payload: NotificationPayload): Promise<void> {
        if (!this.swRegistration) {
            console.warn('[Push] Service Worker not registered');
            return;
        }

        if (Notification.permission !== 'granted') {
            console.warn('[Push] Notification permission not granted');
            return;
        }

        await this.swRegistration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
            tag: payload.tag || 'redhope-local',
            data: payload.data,
            requireInteraction: true,
        });
    }

    /**
     * Send subscription to your backend server
     */
    private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        try {
            // TODO: Implement your backend endpoint
            console.log('[Push] Would send subscription to server:', JSON.stringify(subscription));

            // Example:
            // await fetch('/api/push/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(subscription)
            // });
        } catch (error) {
            console.error('[Push] Failed to send subscription to server:', error);
        }
    }

    /**
     * Convert VAPID key from base64 to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// React hook for push notifications
import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const supported = await pushNotificationService.init();
            setIsSupported(supported);
            setPermission(pushNotificationService.getPermissionStatus());
            setIsSubscribed(pushNotificationService.isEnabled());
            setLoading(false);
        };
        init();
    }, []);

    const requestPermission = useCallback(async () => {
        setLoading(true);
        const result = await pushNotificationService.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            const subscription = await pushNotificationService.subscribe();
            setIsSubscribed(!!subscription);
        }
        setLoading(false);
        return result;
    }, []);

    const unsubscribe = useCallback(async () => {
        setLoading(true);
        const success = await pushNotificationService.unsubscribe();
        if (success) setIsSubscribed(false);
        setLoading(false);
        return success;
    }, []);

    const showNotification = useCallback(async (payload: NotificationPayload) => {
        await pushNotificationService.showLocalNotification(payload);
    }, []);

    return {
        isSupported,
        isSubscribed,
        permission,
        loading,
        requestPermission,
        unsubscribe,
        showNotification
    };
}
