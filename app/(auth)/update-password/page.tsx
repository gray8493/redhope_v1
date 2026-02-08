"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

const UpdatePasswordPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        try {
            await authService.updatePassword(formData.password);
            setSuccess(true);
            // Sau 3 giây tự động về trang login
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            console.error('[UpdatePassword] Error:', err);
            setError('Không thể cập nhật mật khẩu. Link có thể đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                {success ? (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Thành công!</h2>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            Mật khẩu của bạn đã được cập nhật thành công.
                            Hệ thống sẽ chuyển bạn về trang đăng nhập trong giây lát...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Mật khẩu mới</h2>
                            <p className="text-gray-500 mt-2 font-medium">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all bg-gray-50/50"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all bg-gray-50/50"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-[#0065FF] text-white font-bold rounded-xl hover:bg-[#0052cc] shadow-lg shadow-indigo-100 transition-all flex justify-center transform active:scale-[0.98] disabled:opacity-70"
                                type="submit"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
