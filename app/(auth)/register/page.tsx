"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { userService } from "@/services/user.service";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, Info, CheckCircle2, Home } from "lucide-react";
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
        }, 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#161121] p-6 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-[#1c162e] p-10 rounded-3xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500 border border-[#6324eb]/10">
          <div className="inline-flex items-center justify-center size-20 bg-green-100 dark:bg-green-950/30 text-green-600 rounded-full">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-[#120e1b] dark:text-white mt-4 tracking-tight">Đăng ký thành công!</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">
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
    <div className="font-sans bg-black min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}


      {/* Main Content Split Pane */}
      <main className="flex-grow flex items-stretch overflow-hidden">
        {/* Left Side: Visual/Mission */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center p-20 overflow-hidden text-white border-r border-white/5">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1615461066841-6116ecaabb04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4a0404]/90 via-black/95 to-[#1a0b2e]/90"></div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-3 py-1 rounded-full bg-[#800000]/20 text-[#cc0000] text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md border border-[#800000]/30">
              Cộng đồng cứu người
            </span>
            <h1 className="text-6xl font-black mb-6 leading-tight drop-shadow-2xl">Bắt đầu <span className="text-[#990000]">hành trình</span> của bạn.</h1>
            <p className="text-xl text-white/80 leading-relaxed mb-8 font-medium">
              Chỉ mất 2 phút để tạo tài khoản. Tham gia cùng hàng nghìn người khác đang góp phần xây dựng một cộng đồng khỏe mạnh và an toàn hơn.
            </p>
            <div className="space-y-4 font-bold opacity-80">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-[#990000]" />
                <span>Nhận thông báo khi có yêu cầu khẩn cấp</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-[#990000]" />
                <span>Tích lũy điểm thưởng khi hiến máu</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-[#990000]" />
                <span>Quản lý sức khỏe cá nhân thông minh</span>
              </div>
            </div>
          </div>

          <div className="absolute top-[-10%] right-[-10%] size-96 bg-[#800000]/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-[#4b0082]/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#0a0a0b]">
          {/* Back to Home Button */}
          <div className="w-full max-w-md mb-4 flex justify-start">
            <Button asChild variant="ghost" className="gap-2 text-gray-500 hover:text-[#990000] font-bold p-0 transition-colors">
              <Link href="/">
                <Home className="size-4" />
                Quay về trang chủ
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-md space-y-8 bg-[#121214] p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 border-t-8 border-t-[#800000] relative">

            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight">Tạo tài khoản mới</h2>
              <p className="text-gray-400 mt-2 font-medium tracking-tight">Tham gia vào cộng đồng cứu người của chúng tôi</p>
            </div>

            {/* Role Selector */}
            <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
              {['donor', 'hospital'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${selectedRole === role
                    ? "bg-[#800000] text-white shadow-xl scale-[1.02]"
                    : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                  <span className="capitalize">{role === 'donor' ? 'Người hiến máu' : 'Bệnh viện'}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-950/10 border border-[#800000]/30 rounded-2xl text-red-400 text-sm animate-shake">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-gray-300 ml-1">Họ và tên</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#cc0000] transition-colors z-10">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 py-6 rounded-2xl bg-black/40 border-white/10 text-white focus:ring-4 focus:ring-[#800000]/20 focus:border-[#800000]"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-300 ml-1">Địa chỉ Email</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#cc0000] transition-colors z-10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 py-6 rounded-2xl bg-black/40 border-white/10 text-white focus:ring-4 focus:ring-[#800000]/20 focus:border-[#800000]"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-300 ml-1">Mật khẩu</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#cc0000] transition-colors z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 py-6 rounded-2xl bg-black/40 border-white/10 text-white focus:ring-4 focus:ring-[#800000]/20 focus:border-[#800000] text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-300 ml-1">Xác nhận</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#cc0000] transition-colors z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 py-6 rounded-2xl bg-black/40 border-white/10 text-white focus:ring-4 focus:ring-[#800000]/20 focus:border-[#800000] text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" required className="size-4 rounded border-white/10 bg-black/40 text-[#cc0000] focus:ring-[#800000]" />
                <span className="text-xs text-gray-500 font-medium">Tôi đồng ý với các điều khoản bảo mật</span>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-gray-500 hover:text-[#cc0000] transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-7 text-base font-black rounded-2xl bg-[#800000] hover:bg-[#600000] text-white shadow-xl shadow-[#800000]/20 transition-all transform active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Đăng ký tài khoản ngay"}
              </Button>
            </form>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full py-6 border-white/10 rounded-2xl font-bold bg-transparent text-white hover:bg-white/5 shadow-none transition-all flex items-center justify-center gap-3"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#121214] text-gray-500 font-medium tracking-tight">Hoặc sử dụng email</span>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full py-6 border-white/10 rounded-2xl font-bold bg-transparent text-white hover:bg-white/5 shadow-none transition-all">
              <Link href="/login">Đã có tài khoản? Đăng nhập</Link>
            </Button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 font-medium">
            © 2024 RedHope - Hệ thống hiến máu an toàn
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
