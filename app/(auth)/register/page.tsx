"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { userService } from "@/services/user.service";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        await userService.create({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          role: selectedRole as any,
          current_points: selectedRole === 'donor' ? 0 : null,
        });

        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500 border border-gray-100">
          <div className="inline-flex items-center justify-center size-20 bg-emerald-50 text-emerald-500 rounded-full">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-4 tracking-tight">Đăng ký thành công!</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Tài khoản của bạn đã được tạo. Bạn đang được chuyển hướng đến trang đăng nhập...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#6324eb]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow flex items-stretch overflow-hidden">
        {/* Left Side: Visual/Mission */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#6324eb] items-center justify-center p-20 overflow-hidden text-white">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#fff" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-widest mb-6">Tham gia Mạng lưới</span>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Mỗi giọt máu trao đi, một cuộc đời ở lại.</h1>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Tạo tài khoản và tham gia mạng lưới toàn cầu gồm các nhà tài trợ và tổ chức y tế. Cùng nhau, chúng ta giúp cứu sống nhiều người hơn.
            </p>
            <div className="space-y-4 font-medium opacity-80 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-white" />
                <span>Nhận thông báo khi có yêu cầu khẩn cấp</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-white" />
                <span>Tích lũy điểm thưởng khi hiến máu</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-white" />
                <span>Quản lý sức khỏe cá nhân thông minh</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50/50 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tạo tài khoản</h2>
              <p className="text-gray-500 mt-2 font-medium">Bắt đầu bằng cách chọn loại tài khoản của bạn</p>
            </div>

            {/* Role Selector - Limited to 2 roles */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {['donor', 'hospital'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 ${selectedRole === role
                    ? "bg-white text-[#6324eb] shadow-sm scale-[1.02]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <span className="capitalize">{role === 'donor' ? 'Người hiến máu' : 'Bệnh viện'}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700 ml-1">Họ và tên</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors z-10">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] outline-none transition-all bg-gray-50/50"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700 ml-1">Địa chỉ Email</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors z-10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] outline-none transition-all bg-gray-50/50"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 ml-1">Mật khẩu</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] outline-none transition-all bg-gray-50/50 text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 ml-1">Xác nhận</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] outline-none transition-all bg-gray-50/50 text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" required className="size-4 rounded border-gray-300 text-[#6324eb] focus:ring-[#6324eb]" />
                <span className="text-xs text-gray-500 font-medium">Tôi đồng ý với các điều khoản bảo mật</span>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-gray-400 hover:text-[#6324eb] transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-base font-bold rounded-xl bg-[#6324eb] hover:bg-[#501ac2] text-white shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Đăng ký ngay"}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400">
                <span className="bg-white px-2">Hoặc</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
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
              Tiếp tục với Google
            </Button>

            <p className="text-center text-sm font-medium text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-bold text-[#6324eb] hover:underline transition-colors">Đăng nhập</Link>
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 space-x-4">
            <span>© 2026 REDHOPE Global</span>
          </div>
        </div>
      </main>
    </div>
  );
}
