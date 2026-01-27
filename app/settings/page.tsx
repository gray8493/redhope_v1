"use client";

import {
    User,
    Bell,
    Lock,
    Moon,
    Sun,
    LogOut,
    Trash2,
    Shield,
    Mail,
    Smartphone,
    Camera
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
// import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";

export default function SettingsPage() {
    const router = useRouter();
    // Mock Data
    const user = { id: 'mock-id', email: 'quan@example.com', user_metadata: { full_name: 'Minh Quan' } };
    const profile = {
        role: 'donor',
        full_name: 'Minh Quan',
        phone: '0901234567',
        email: 'quan@example.com',
        address: 'Ho Chi Minh City',
        blood_group: 'O+'
    };

    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    // Sync state with profile data
    useEffect(() => {
        if (profile || user) {
            setName(profile?.full_name || user?.user_metadata?.full_name || "");
            setPhone(profile?.phone || "");
            setEmail(profile?.email || user?.email || "");
            setAddress(profile?.address || "");
        }
    }, [profile, user]);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await userService.update(user.id, {
                full_name: name,
                phone: phone,
                address: address
            });
            toast.success("Đã lưu thông tin thành công!", {
                description: "Thông tin cá nhân của bạn đã được cập nhật trên hệ thống.",
                duration: 3000,
            });
        } catch (error: any) {
            toast.error("Lỗi cập nhật", {
                description: error.message || "Không thể lưu thông tin. Vui lòng thử lại.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin!", {
                description: "Bạn cần nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới không khớp!", {
                description: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu quá ngắn!", {
                description: "Mật khẩu mới phải có ít nhất 6 ký tự.",
            });
            return;
        }

        // Simulate API call
        toast.success("Đổi mật khẩu thành công!", {
            description: "Mật khẩu của bạn đã được cập nhật.",
            duration: 3000,
        });

        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // Create refs for sections
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const securityRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (section: string, ref: React.RefObject<HTMLDivElement | null>) => {
        setActiveTab(section);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleLogout = async () => {
        // await authService.signOut();
        router.push("/login"); // Might 404 now but user deleted auth pages
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1024px] flex-1 px-4 md:px-10 gap-8">

                            {/* Page Header */}
                            <div>
                                <h1 className="text-3xl font-black text-[#120e1b] dark:text-white mb-2">Cài đặt</h1>
                                <p className="text-[#654d99] dark:text-[#a594c9]">Quản lý thông tin cá nhân và tùy chọn ứng dụng của bạn.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Navigation/Tabs (Simplified as a list for now, or just stacked sections) */}
                                {/* Actually, let's do a single column flow or a 2-col layout where Left is Menu, Right is Content.
                                    For simplicity and mobile-first, I'll stack cards in the main area (col-span-3 or 2).
                                    Let's try a split layout:
                                    Left: Profile Summary & Quick Actions
                                    Right: Detailed Forms
                                */}

                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    {/* Profile Card */}
                                    <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-6 shadow-sm text-center">
                                        <div className="relative mx-auto w-24 h-24 mb-4">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#2d263d] shadow-lg">
                                                <img
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI4faTCJTkv8OO6MUFrzxQB3yJcWE7Zkm3Y9_WkORgcZUhg0mk8rv7geI97EgbgP3xfDraG1Oy9Psl47i83JoPayPQNpCHWNrSkQfnybH55NGY5MeYil6abA0jZHtNJmfXNyZTl8KPnYoPJdsSVNf-MVgxmvZSicOMuVKfMBGWKjOnheH0k_JUU5GhZRy0Go2cQ6u1xBc8VpgcwkOhb7P0b4kGQIcQ_8z8WaWBcp-2kVgx8l9LfAVeffjFZ8WyB63LgiErOcfK7o26"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button className="absolute bottom-0 right-0 p-2 bg-[#6324eb] text-white rounded-full hover:bg-[#501ac2] transition-colors border-2 border-white dark:border-[#1c162e]">
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">{name}</h2>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mb-4">
                                            {profile?.role === 'admin' ? "Quản trị viên" : profile?.role === 'hospital' ? "Bệnh viện" : profile?.blood_group ? `Nhóm máu ${profile.blood_group}` : "Thành viên"}
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => scrollToSection("profile", profileRef)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${activeTab === "profile"
                                                    ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20"
                                                    : "bg-[#f6f6f8] dark:bg-[#251e36] text-[#120e1b] dark:text-white hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a]"
                                                    }`}
                                            >
                                                <User className={`w-5 h-5 ${activeTab === "profile" ? "text-white" : "text-[#6324eb]"}`} /> Hồ sơ cá nhân
                                            </button>
                                            <button
                                                onClick={() => scrollToSection("notifications", notificationsRef)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${activeTab === "notifications"
                                                    ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20"
                                                    : "text-[#654d99] dark:text-[#a594c9] hover:bg-[#f6f6f8] dark:hover:bg-[#251e36]"
                                                    }`}
                                            >
                                                <Bell className={`w-5 h-5 ${activeTab === "notifications" ? "text-white" : ""}`} /> Thông báo
                                            </button>
                                            <button
                                                onClick={() => scrollToSection("security", securityRef)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${activeTab === "security"
                                                    ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20"
                                                    : "text-[#654d99] dark:text-[#a594c9] hover:bg-[#f6f6f8] dark:hover:bg-[#251e36]"
                                                    }`}
                                            >
                                                <Lock className={`w-5 h-5 ${activeTab === "security" ? "text-white" : ""}`} /> Bảo mật
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danger Zone Mini */}
                                    <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-6 shadow-sm">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 text-red-500 font-bold w-full hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" /> Đăng xuất
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Content Forms */}
                                <div className="lg:col-span-2 flex flex-col gap-8">

                                    {/* Personal Info */}
                                    <div ref={profileRef} className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-6 shadow-sm scroll-mt-24">
                                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-[#ebe7f3] dark:border-[#2d263d] flex items-center gap-2">
                                            <User className="w-5 h-5 text-[#6324eb]" /> Thông tin cá nhân
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Họ và tên</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Địa chỉ</label>
                                                <textarea
                                                    rows={3}
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={handleSave}
                                                className="px-6 py-2 bg-[#6324eb] text-white font-bold rounded-lg hover:bg-[#501ac2] transition-colors shadow-lg shadow-[#6324eb]/20"
                                            >
                                                Lưu thay đổi
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    <div ref={notificationsRef} className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-6 shadow-sm scroll-mt-24">
                                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-[#ebe7f3] dark:border-[#2d263d] flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-[#6324eb]" /> Cài đặt thông báo
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36]">
                                                <div>
                                                    <p className="font-bold text-[#120e1b] dark:text-white">Email nhắc nhở</p>
                                                    <p className="text-sm text-[#654d99] dark:text-[#a594c9]">Nhận email về lịch hiến máu sắp tới</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6324eb]"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36]">
                                                <div>
                                                    <p className="font-bold text-[#120e1b] dark:text-white">Thông báo khẩn cấp</p>
                                                    <p className="text-sm text-[#654d99] dark:text-[#a594c9]">Khi có ca cấp cứu cần nhóm máu O+</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6324eb]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security */}
                                    <div ref={securityRef} className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-6 shadow-sm scroll-mt-24">
                                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-[#ebe7f3] dark:border-[#2d263d] flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-[#6324eb]" /> Bảo mật
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Mật khẩu hiện tại</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Mật khẩu mới</label>
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Xác nhận mật khẩu</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="px-4 py-3 rounded-lg bg-[#f6f6f8] dark:bg-[#251e36] border-none text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    onClick={handleChangePassword}
                                                    className="px-6 py-2 border border-[#ebe7f3] dark:border-[#3d335a] bg-transparent text-[#120e1b] dark:text-white font-bold rounded-lg hover:bg-[#f6f6f8] dark:hover:bg-[#251e36] transition-colors"
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Account */}
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 p-6">
                                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5" /> Xóa tài khoản
                                        </h3>
                                        <p className="text-sm text-red-500/80 mb-4">
                                            Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                                        </p>
                                        <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                                            Xóa tài khoản
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
