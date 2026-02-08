"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { Bell, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestNotificationPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        userId: '',
        title: '🧪 Test Notification',
        content: 'Đây là thông báo test real-time',
        action_type: 'view_campaign',
        action_url: '/dashboard',
    });

    const testTemplates = [
        {
            name: 'Chiến dịch mới',
            data: {
                title: '🩸 Chiến dịch hiến máu mới gần bạn!',
                content: 'Bệnh viện Chợ Rẫy tổ chức chiến dịch "Giọt máu hồng" tại Quận 5',
                action_type: 'view_campaign',
                action_url: '/campaigns',
            }
        },
        {
            name: 'Đăng ký thành công',
            data: {
                title: '✅ Đăng ký thành công!',
                content: 'Bạn đã đăng ký tham gia chiến dịch "Hiến máu Xuân 2026"',
                action_type: 'view_appointment',
                action_url: '/appointments',
            }
        },
        {
            name: 'Có người đăng ký',
            data: {
                title: '👤 Có người đăng ký mới!',
                content: 'Nguyễn Văn A vừa đăng ký tham gia chiến dịch của bạn',
                action_type: 'view_registrations',
                action_url: '/hospital-campaign',
            }
        },
        {
            name: 'Cảnh báo',
            data: {
                title: '⚠️ Cảnh báo quan trọng',
                content: 'Vui lòng cập nhật thông tin hồ sơ để tiếp tục sử dụng dịch vụ',
                action_type: 'view_campaign',
                action_url: '/settings',
            }
        },
    ];

    const handleSendTest = async () => {
        if (!formData.userId) {
            alert('Vui lòng nhập User ID');
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/test-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setResult({ success: true, data });
            } else {
                setResult({ success: false, error: data.error });
            }
        } catch (error: any) {
            setResult({ success: false, error: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const applyTemplate = (template: any) => {
        setFormData(prev => ({
            ...prev,
            ...template.data,
        }));
    };

    return (
        <div className="flex h-screen w-full flex-row overflow-hidden bg-slate-50 dark:bg-[#0f0a19]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
                <TopNav title="Test Notifications" />

                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-[#2d263d] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Test Real-time Notifications
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Tạo thông báo test để kiểm tra tính năng real-time
                                </p>
                            </div>
                        </div>

                        {/* Current User Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                                Thông tin User hiện tại:
                            </h3>
                            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                <p><strong>ID:</strong> {user?.id || 'Chưa đăng nhập'}</p>
                                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                            </div>
                            {user?.id && (
                                <Button
                                    onClick={() => setFormData(prev => ({ ...prev, userId: user.id }))}
                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                    size="sm"
                                >
                                    Sử dụng ID của tôi
                                </Button>
                            )}
                        </div>

                        {/* Templates */}
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                                Templates nhanh:
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {testTemplates.map((template, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => applyTemplate(template)}
                                        className="p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left"
                                    >
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            {template.name}
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                            {template.data.title}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    User ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.userId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                                    placeholder="Nhập User ID nhận thông báo"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Content
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                        Action Type
                                    </label>
                                    <select
                                        value={formData.action_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, action_type: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    >
                                        <option value="view_campaign">view_campaign</option>
                                        <option value="view_appointment">view_appointment</option>
                                        <option value="view_registrations">view_registrations</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                        Action URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.action_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSendTest}
                                disabled={isLoading || !formData.userId}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Gửi Test Notification
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className={`mt-6 p-4 rounded-lg border-2 ${result.success
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                }`}>
                                <div className="flex items-start gap-3">
                                    {result.success ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`font-bold mb-2 ${result.success ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
                                            }`}>
                                            {result.success ? '✅ Thành công!' : '❌ Lỗi!'}
                                        </h4>
                                        <p className={`text-sm ${result.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                                            }`}>
                                            {result.success
                                                ? 'Thông báo đã được tạo. Kiểm tra toast notification và icon Bell!'
                                                : `Lỗi: ${result.error}`
                                            }
                                        </p>
                                        {result.success && result.data && (
                                            <pre className="mt-3 p-3 bg-slate-900 text-green-400 rounded text-xs overflow-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                        <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-3">
                            📋 Hướng dẫn test:
                        </h3>
                        <ol className="text-sm text-amber-800 dark:text-amber-400 space-y-2 list-decimal list-inside">
                            <li>Nhập User ID của người nhận thông báo (hoặc click "Sử dụng ID của tôi")</li>
                            <li>Chọn template hoặc tự điền thông tin</li>
                            <li>Click "Gửi Test Notification"</li>
                            <li>Quan sát:
                                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                                    <li>Toast notification hiện lên ở góc trên bên phải</li>
                                    <li>Badge số lượng thông báo chưa đọc tăng lên</li>
                                    <li>Click icon Bell để xem thông báo mới</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
