"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        // Ưu tiên lấy role từ metadata (vì nó có sẵn ngay sau khi signIn)
        // Sau đó mới lấy từ DB (có thể bị chặn bởi RLS lúc mới login)
        const role = profile?.role || data.user.user_metadata?.role || 'donor';

        if (profileError && profileError.code !== 'PGRST116') {
          // Log nhẹ nhàng hơn vì đã có fallback
          console.log("Note: Profile fetch from DB skipped or limited by RLS, using metadata fallback.");
        }

        Cookies.set('auth-token', data.session?.access_token || '', { expires: 7 });
        Cookies.set('user-role', role, { expires: 7 });

        // Cập nhật trạng thái auth global trước khi chuyển trang
        await refreshUser();

        // Logic redirection based on actual DB role
        switch (role) {
          case 'admin':
            router.push('/admin-dashboard');
            break;
          case 'hospital':
            router.push('/hospital-dashboard');
            break;
          default:
            router.push('/requests');
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng.' : 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Đăng nhập bằng Google thất bại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans relative">
      {/* Back to Home Button - Top Left of the whole page */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-all group z-50"
      >
        <div className="flex items-center justify-center size-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </div>
        <span className="hidden sm:inline">Quay về trang chủ</span>
      </Link>

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
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px]"></div>

          <div className="relative z-10 text-white max-w-lg">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 border border-white/20">
              Mạng lưới Hiến máu Thông minh
            </span>
            <h1 className="text-4xl xl:text-5xl font-extrabold mb-6 leading-[1.15] tracking-tight">
              Mỗi giọt máu trao đi, <br /> một cuộc đời ở lại.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10 font-medium max-w-md">
              Kết nối với bệnh viện, quản lý kho máu hoặc trở thành người hùng ngay hôm nay.
              <span className="font-bold text-white"> REDHOPE</span> là nền tảng thống nhất cho một hệ sinh thái hiến máu an toàn.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {['D', 'H', 'A'].map((char, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#6324eb] bg-white flex items-center justify-center text-sm font-bold text-[#6324eb] shadow-lg">
                    {char}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold opacity-90">Tham gia cùng 50,000+ người hùng REDHOPE</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto bg-gray-50/50 relative">
          {/* Back to Home Button */}


          <div className="w-full max-w-md space-y-8 bg-white p-8 lg:p-10 rounded-3xl shadow-2xl shadow-indigo-100/50 border border-gray-100 relative z-10">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chào mừng trở lại</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Đăng nhập để vào hệ thống điều hành</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium"
                    placeholder="hero@redhope.vn"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between ml-1">
                  <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                  <Link href="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-[#6324eb] hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6324eb] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-extrabold rounded-2xl text-white bg-[#6324eb] hover:bg-[#501ac2] focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Đăng nhập ngay"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-extrabold text-gray-400">
                <span className="px-4 bg-white">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Auth */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all hover:border-gray-300 gap-3 shadow-sm"
              disabled={loading}
            >
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Tài khoản Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm font-medium text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" title="Tham gia ngay" className="font-bold text-[#6324eb] hover:underline">
                Tham gia ngay
              </Link>
            </p>
          </div>

          {/* Footer Small Print */}
          <div className="mt-10 lg:mt-16 text-center text-xs text-gray-400 space-x-6 font-medium">
            <Link href="#" className="hover:text-[#6324eb] transition-colors">Chính sách bảo mật</Link>
            <Link href="#" className="hover:text-[#6324eb] transition-colors">Điều khoản dịch vụ</Link>
            <span className="opacity-50">© 2026 REDHOPE Global</span>
          </div>
        </div>
      </main>
    </div>
  );
}
