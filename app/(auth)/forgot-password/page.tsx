"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error('[ForgotPassword] Error:', err);
            setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                <Link href="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#0065FF] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại đăng nhập
                </Link>

                {success ? (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Kiểm tra email của bạn</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến <strong>{email}</strong>.
                            Vui lòng kiểm tra hộp thư (và cả mục Spam) của bạn.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="w-full py-4 text-[#0065FF] font-bold text-sm bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                        >
                            Thử lại với email khác
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Quên mật khẩu?</h2>
                            <p className="text-gray-500 mt-2 font-medium">Nhập email của bạn để bắt đầu khôi phục</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Địa chỉ Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all bg-gray-50/50"
                                        placeholder="name@example.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-[#0065FF] text-white font-bold rounded-xl hover:bg-[#0052cc] shadow-lg shadow-indigo-100 transition-all flex justify-center transform active:scale-[0.98] disabled:opacity-70"
                                type="submit"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Gửi link khôi phục'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
