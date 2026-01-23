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
        role: 'donor' // Default role
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.signIn(formData.email, formData.password);

            // Fetch the actual authenticated user role
            const user = await authService.getCurrentUser();
            const role = user?.user_metadata?.role || 'donor';
            // Note: In a real app, rely on the public profile role if it differs/is managed there.

            if (role === 'admin') {
                router.push('/admin/global-ana');
            } else if (role === 'hospital') {
                router.push('/hospital');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            let message = err.message;
            if (message === 'Email not confirmed') {
                message = 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn (kể cả mục Spam).';
            } else if (message === 'Invalid login credentials') {
                message = 'Email hoặc mật khẩu không chính xác.';
            } else {
                message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Main Content Split Pane */}
            <main className="flex-grow flex items-stretch overflow-hidden">
                {/* Left Side: Visual/Mission (Hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-[#6324eb] items-center justify-center p-20 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%">
                            <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#fff" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
                        </svg>
                    </div>

                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-400/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl"></div>


                    <div className="relative z-10 text-white max-w-lg">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-widest mb-6">Mạng lưới Hiến máu Thông minh</span>
                        <h1 className="text-5xl font-bold mb-6 leading-tight">Mỗi giọt máu trao đi, một cuộc đời ở lại.</h1>
                        <p className="text-xl text-white/90 leading-relaxed mb-8">
                            Kết nối với bệnh viện, quản lý kho máu hoặc trở thành người hùng ngay hôm nay. REDHOPE là nền tảng thống nhất cho một hệ sinh thái hiến máu an toàn và thông minh hơn.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {/* Mock Avatars */}
                                <div className="w-10 h-10 rounded-full border-2 border-[#6324eb] bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500 bg-white">A</div>
                                <div className="w-10 h-10 rounded-full border-2 border-[#6324eb] bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500 bg-white">B</div>
                                <div className="w-10 h-10 rounded-full border-2 border-[#6324eb] bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500 bg-white">C</div>
                            </div>
                            <span className="text-sm font-medium">Tham gia cùng 50k+ người hiến trên cả nước</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto bg-gray-50/50">
                    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {/* Heading */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
                            <p className="text-gray-500 mt-2">Chọn vai trò để truy cập cổng thông tin</p>
                        </div>

                        {/* Role Selector Component */}
                        <div className="flex py-1">
                            <div className="grid grid-cols-3 gap-1 w-full p-1 bg-gray-100 rounded-xl">
                                {['donor', 'hospital', 'admin'].map((role) => (
                                    <label key={role} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            className="peer sr-only"
                                            value={role}
                                            checked={formData.role === role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        />
                                        <div className="flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-gray-500 transition-all peer-checked:bg-white peer-checked:text-[#6324eb] peer-checked:shadow-sm capitalize">
                                            {role === 'donor' ? 'Người hiến' : role === 'hospital' ? 'Bệnh viện' : 'Quản trị'}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all outline-none"
                                        placeholder="name@example.com"
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                    {/* <a className="text-sm font-semibold text-[#6324eb] hover:underline" href="#">Quên mật khẩu?</a> */}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                disabled={loading}
                                className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-[#6324eb] hover:bg-[#501ac2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6324eb] shadow-lg shadow-[#6324eb]/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Đăng nhập'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        {/* Social Auth */}
                        <div className="grid grid-cols-1 gap-3">
                            <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all hover:border-gray-300 gap-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.76.81-.08z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Tài khoản Google
                            </button>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-gray-500">
                            Chưa có tài khoản?{' '}
                            <Link className="font-bold text-[#6324eb] hover:underline hover:text-[#501ac2]" href="/register">
                                Tạo tài khoản mới
                            </Link>
                        </p>
                    </div>

                    {/* Footer Small Print */}
                    <div className="mt-8 text-center text-xs text-gray-400 space-x-4">
                        <Link className="hover:text-[#6324eb] transition-colors" href="/privacy-policy">Chính sách bảo mật</Link>
                        <Link className="hover:text-[#6324eb] transition-colors" href="/terms-of-service">Điều khoản dịch vụ</Link>
                        <span>© 2026 REDHOPE Global</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;

