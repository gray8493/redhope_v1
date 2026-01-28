"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff, Info, ArrowLeft, Home } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
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
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        }

        const role = profile?.role || 'donor';

        Cookies.set('auth-token', data.session?.access_token || '', { expires: 7 });
        Cookies.set('user-role', role, { expires: 7 });

        switch (role) {
          case 'admin':
            router.push('/admin-dashboard');
            break;
          case 'hospital':
            router.push('/hospital-dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (err: any) {
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Đăng nhập bằng Google thất bại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow flex items-stretch">
        <div className="hidden lg:flex lg:w-1/2 bg-[#6324eb] items-center justify-center p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#fff" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
            </svg>
          </div>
          <div className="z-10 text-white max-w-lg">
            <h1 className="text-5xl font-bold mb-6">Mỗi giọt máu trao đi, một cuộc đời ở lại.</h1>
            <p className="text-xl opacity-90 leading-relaxed">Kết nối với cộng đồng hiến máu an toàn và thông minh hơn cùng REDHOPE.</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại</h2>
              <p className="text-gray-500 mt-2 font-medium">Đăng nhập để vào hệ thống điều hành</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</Label>
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

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <Label className="text-sm font-bold text-gray-700">Mật khẩu</Label>
                  <Link href="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-[#6324eb] hover:underline transition-colors hover:text-[#501ac2]">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6324eb] transition-colors z-10">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#6324eb]/10 focus:border-[#6324eb] outline-none transition-all bg-gray-50/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6324eb] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#6324eb] text-white font-bold rounded-xl hover:bg-[#501ac2] shadow-lg shadow-indigo-100 transition-all flex justify-center transform active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Đăng nhập"}
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
              Chưa có tài khoản?{' '}
              <Link href="/register" title="Đăng ký" className="font-bold text-[#6324eb] hover:underline transition-colors">
                Tham gia ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
