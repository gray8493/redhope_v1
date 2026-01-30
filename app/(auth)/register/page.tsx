"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { userService } from "@/services/user.service";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("donor");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Gọi API route để tạo hồ sơ (Bypass RLS)
        const profileResponse = await fetch('/api/auth/register-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            email: email,
            fullName: fullName,
            role: selectedRole,
          }),
        });

        if (!profileResponse.ok) {
          const profileError = await profileResponse.json();
          throw new Error(profileError.error || "Không thể tạo hồ sơ người dùng.");
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      // Map common Supabase Auth errors to Vietnamese messages
      const errorMap: Record<string, string> = {
        'User already registered': 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
        'Invalid email': 'Địa chỉ email không hợp lệ.',
        'Signup requires a valid password': 'Mật khẩu không hợp lệ.',
        'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
        'Email rate limit exceeded': 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
      };
      const errorMessage = errorMap[err?.message] || err?.message ||
        err?.error_description || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Đăng ký bằng Google thất bại.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500 border border-gray-100">
          <div className="inline-flex items-center justify-center size-20 bg-emerald-50 text-emerald-500 rounded-full">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">Đăng ký thành công!</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Chào mừng bạn đến với REDHOPE. Tài khoản của bạn đã được tạo. Vui lòng đợi trong khi chúng tôi đưa bạn đến cổng đăng nhập...
          </p>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#6324eb]" />
          </div>
        </div>
      </div>
    );
  }

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
        {/* Left Side: Visual/Mission */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#6324eb] items-center justify-center p-20 overflow-hidden text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#fff" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 border border-white/20">
              Tham gia Mạng lưới Hiến máu
            </span>
            <h1 className="text-4xl xl:text-5xl font-extrabold mb-6 leading-[1.15] tracking-tight">Cùng nhau kiến tạo <br /> nguồn hy vọng mới.</h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10 font-medium max-w-md">
              Đăng ký để trở thành một phần của hệ sinh thái y tế thông minh. REDHOPE kết nối và tối ưu hóa mọi nguồn lực để bảo vệ sự sống.
            </p>

            <div className="space-y-5 font-semibold text-white/90">
              {[
                "Nhận thông báo máu khẩn cấp tại khu vực",
                "Tích lũy điểm uy tín và đổi quà tặng",
                "Quản lý lịch sử hiến máu minh bạch",
                "Tiếp cận báo cáo tồn kho máu thời gian thực"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="flex items-center justify-center size-8 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <CheckCircle2 className="size-5 text-white" />
                  </div>
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px]"></div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50/50 overflow-y-auto relative">


          <div className="w-full max-w-md space-y-8 bg-white p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-indigo-100/50 border border-gray-100 relative z-10">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tạo tài khoản</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Bắt đầu bằng cách chọn loại tài khoản của bạn</p>
            </div>

            {/* Role Selector */}
            <div className="flex p-1 bg-gray-100 rounded-2xl">
              {['donor', 'hospital'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-wider ${selectedRole === role
                    ? "bg-white text-[#6324eb] shadow-sm active:scale-95"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {role === 'donor' ? 'Người hiến máu' : 'Bệnh viện'}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium"
                    placeholder="hero@redhope.vn"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 ml-1">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 ml-1">Xác nhận</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] transition-all outline-none font-medium text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-1">
                <input type="checkbox" required className="size-5 rounded-lg border-gray-300 text-[#6324eb] focus:ring-[#6324eb] cursor-pointer" />
                <span className="text-xs text-gray-500 font-bold">Tôi đồng ý với Điều khoản & Chính sách</span>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-gray-400 hover:text-[#6324eb] transition-colors">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 text-base font-extrabold rounded-2xl bg-[#6324eb] hover:bg-[#501ac2] text-white shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Đăng ký ngay"}
              </button>
            </form>

            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-extrabold text-gray-400">
                <span className="px-4 bg-white">Hoặc tiếp tục với</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
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

            <p className="text-center text-sm font-medium text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-bold text-[#6324eb] hover:underline">Đăng nhập</Link>
            </p>
          </div>

          <div className="mt-10 text-center text-xs text-gray-400 space-x-6 font-medium">
            <span className="opacity-50">© 2026 REDHOPE Global</span>
          </div>
        </div>
      </main>
    </div>
  );
}
