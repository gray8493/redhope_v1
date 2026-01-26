"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'donor'
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("[Login] Starting sign in...");
            const { user } = await authService.signIn(formData.email, formData.password);

            if (!user) {
                throw new Error("Đăng nhập không thành công.");
            }

            console.log("[Login] Auth successful, checking role...");

            // Lấy role ưu tiên từ metadata (nhanh nhất) sau đó mới tới profile
            const metadataRole = user.user_metadata?.role;
            const actualRole = (metadataRole || 'donor').toLowerCase().trim();

            console.log(`[Login] Role detected: ${actualRole}`);

            // 1. Nếu là Admin -> Chuyển hướng ngay lập tức
            if (actualRole === 'admin') {
                console.log("[Login] Admin detected. Redirecting to /admin...");
                window.location.href = '/admin'; // Dùng window.location để force reload tránh kẹt state
                return;
            }

            // 2. Với các role khác, kiểm tra khớp role đã chọn
            if (formData.role !== actualRole) {
                const roleLabels: Record<string, string> = {
                    donor: 'Người hiến',
                    hospital: 'Bệnh viện'
                };
                setError(`Tài khoản này là "${roleLabels[actualRole] || actualRole}", không phải "${roleLabels[formData.role] || formData.role}".`);
                await authService.signOut();
                setLoading(false);
                return;
            }

            // 3. Điều hướng Hospital và Donor
            if (actualRole === 'hospital') {
                router.push('/hospital');
            } else {
                // Với Donor, ta cần load profile để xem đã xong bước nào chưa
                const userData = await authService.getCurrentUser();
                const profile = userData?.profile;
                if (!profile?.blood_group) {
                    router.push('/complete-profile');
                } else if (!profile?.weight) {
                    router.push('/complete-profile/verification');
                } else {
                    router.push('/dashboard');
                }
            }

        } catch (err: any) {
            console.error('[Login] Error:', err);
            setError(err.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng.' : 'Đã có lỗi xảy ra.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <main className="flex-grow flex items-stretch">
                <div className="hidden lg:flex lg:w-1/2 bg-[#6324eb] items-center justify-center p-20 relative">
                    <div className="z-10 text-white max-w-lg">
                        <h1 className="text-5xl font-bold mb-6">Mỗi giọt máu trao đi, một cuộc đời ở lại.</h1>
                        <p className="text-xl opacity-90">Hệ thống quản lý hiến máu REDHOPE.</p>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-50">
                    <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold">Chào mừng trở lại</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
                            {['donor', 'hospital', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-2 text-sm font-bold rounded-lg transition-all ${formData.role === role ? 'bg-white text-[#6324eb] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {role === 'donor' ? 'Người hiến' : role === 'hospital' ? 'Bệnh viện' : 'Quản trị'}
                                </button>
                            ))}
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">{error}</div>}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6324eb]/20 outline-none"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6324eb]/20 outline-none"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full py-4 bg-[#6324eb] text-white font-bold rounded-xl hover:bg-[#501ac2] shadow-lg shadow-indigo-200 transition-all flex justify-center"
                                type="submit"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Đăng nhập'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
