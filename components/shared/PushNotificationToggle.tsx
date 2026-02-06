"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

export function PushNotificationToggle() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [loading, setLoading] = useState(true);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        const init = async () => {
            // Check if push notifications are supported
            const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
            setIsSupported(supported);

            if (!supported) {
                setLoading(false);
                return;
            }

            // Get current permission
            setPermission(Notification.permission);

            // Register service worker if not already registered
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                setSwRegistration(registration);
                await navigator.serviceWorker.ready;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }

            setLoading(false);
        };

        init();
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            toast.error("Trình duyệt không hỗ trợ thông báo đẩy");
            return;
        }

        setLoading(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.success("Đã bật thông báo đẩy!", {
                    description: "Bạn sẽ nhận được thông báo về các chiến dịch và cập nhật mới."
                });

                // Send a test notification
                if (swRegistration) {
                    await swRegistration.showNotification("RedHope", {
                        body: "Thông báo đẩy đã được kích hoạt thành công!",
                        icon: "/icons/icon-192x192.png",
                        tag: "welcome",
                    });
                }
            } else if (result === 'denied') {
                toast.error("Thông báo bị chặn", {
                    description: "Vui lòng bật lại trong cài đặt trình duyệt."
                });
            }
        } catch (error) {
            console.error('Permission request failed:', error);
            toast.error("Không thể yêu cầu quyền thông báo");
        }
        setLoading(false);
    };

    const sendTestNotification = async () => {
        if (!swRegistration || permission !== 'granted') {
            toast.error("Vui lòng bật thông báo trước");
            return;
        }

        await swRegistration.showNotification("Thông báo Test", {
            body: "Đây là thông báo kiểm tra từ RedHope!",
            icon: "/icons/icon-192x192.png",
            tag: "test-notification",
        });

        toast.success("Đã gửi thông báo test!");
    };

    if (!isSupported) {
        return (
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <BellOff className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">Thông báo đẩy</p>
                        <p className="text-xs text-slate-400">Trình duyệt không hỗ trợ</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${permission === 'granted'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : permission === 'denied'
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                        {permission === 'granted' ? (
                            <BellRing className="w-5 h-5 text-emerald-600" />
                        ) : permission === 'denied' ? (
                            <BellOff className="w-5 h-5 text-red-500" />
                        ) : (
                            <Bell className="w-5 h-5 text-amber-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white">Thông báo đẩy (Push)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {permission === 'granted'
                                ? 'Đã bật - Bạn sẽ nhận thông báo ngay cả khi không mở app'
                                : permission === 'denied'
                                    ? 'Đã bị chặn - Bật lại trong cài đặt trình duyệt'
                                    : 'Chưa bật - Nhận thông báo về chiến dịch mới'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {permission === 'granted' && (
                        <button
                            onClick={sendTestNotification}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            Test
                        </button>
                    )}
                    <button
                        onClick={requestPermission}
                        disabled={loading || permission === 'denied'}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${permission === 'granted'
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : permission === 'denied'
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#6324eb] text-white hover:bg-[#501ac2]'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : permission === 'granted' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Đã bật
                            </>
                        ) : permission === 'denied' ? (
                            'Bị chặn'
                        ) : (
                            'Bật thông báo'
                        )}
                    </button>
                </div>
            </div>

            {permission === 'denied' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Hướng dẫn bật lại:</strong> Click vào biểu tượng 🔒 bên cạnh thanh địa chỉ → Chọn "Thông báo" → Cho phép
                    </p>
                </div>
            )}
        </div>
    );
}
