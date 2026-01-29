"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  Search,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title = "Hệ thống Quản trị" }: AdminHeaderProps) {
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Derived State from Auth Context
  const userRole = authUser?.role || 'admin';
  const userProfile = authUser?.profile || {};

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
      : 'A';
  };

  const displayName = userProfile?.full_name || authUser?.user_metadata?.full_name || authUser?.email || "Người dùng";
  const userEmail = authUser?.email || "";
  const displayRole = userRole === 'admin' ? "Quản trị viên" : (userRole === 'hospital' ? "Bệnh viện" : "Đối tác");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  // State for mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Người hiến mới đăng ký', desc: 'Có 5 người dùng vừa đăng ký hiến máu tại khu vực TP.HCM.', time: 'vừa xong', read: false },
    { id: 2, type: 'warning', title: 'Yêu cầu máu khẩn cấp', desc: 'Bệnh viện Chợ Rẫy cần gấp 50 đơn vị nhóm máu O- cho ca phẫu thuật.', time: '15 phút trước', read: false },
    { id: 3, type: 'success', title: 'Chiến dịch hoàn thành', desc: 'Chiến dịch "Giọt máu hồng" đã đạt 100% chỉ tiêu. Vui lòng duyệt báo cáo.', time: '1 giờ trước', read: false },
    { id: 4, type: 'info', title: 'Hệ thống bảo trì', desc: 'Hệ thống sẽ bảo trì định kỳ vào 02:00 AM ngày mai.', time: '3 giờ trước', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-100 text-emerald-500 rounded-full"><CheckCircle className="w-5 h-5" /></div>;
      case 'warning': return <div className="p-2 bg-rose-100 text-rose-500 rounded-full"><AlertTriangle className="w-5 h-5" /></div>;
      case 'info': default: return <div className="p-2 bg-blue-100 text-blue-500 rounded-full"><Info className="w-5 h-5" /></div>;
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 sticky top-0 z-20 w-full shrink-0">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-slate-100 text-[#6324eb]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-96 bg-white dark:bg-[#1c162e] rounded-2xl shadow-xl border border-slate-100 dark:border-[#2d263d] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
              <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1c162e]">
                <h3 className="font-bold text-base text-[#120e1b] dark:text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#6324eb] hover:bg-[#6324eb]/10 px-2 py-1 rounded transition-colors">
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors cursor-pointer flex gap-4 ${!notif.read ? 'bg-slate-50/50 dark:bg-[#251e36]/30' : ''}`}
                    >
                      <div className="shrink-0 mt-1">
                        {getIconByType(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-bold ${!notif.read ? 'text-[#120e1b] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{notif.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">Không có thông báo nào</div>
                )}
              </div>
              <div className="p-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-[#251e36]/50">
                <Link href="/admin-notifications" className="block w-full text-center py-2 text-xs font-bold text-[#6324eb] hover:bg-[#6324eb]/5 rounded-lg transition-colors">
                  Xem tất cả
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-full pl-3 transition-colors text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6324eb]">{displayRole}</p>
            </div>

            <Avatar className={`size-10 border-2 transition-colors ${showUserMenu ? 'border-[#6324eb]' : 'border-emerald-500/20'}`}>
              {userProfile?.avatar_url && <AvatarImage src={userProfile.avatar_url} alt={displayName} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-[#6324eb] to-[#501ac2] text-white font-bold">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-[#1c162e] rounded-xl shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="p-4 border-b border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50/50 dark:bg-[#251e36]/50">
                <p className="text-sm font-bold text-[#120e1b] dark:text-white">{displayName}</p>
                <p className="text-xs text-[#654d99] dark:text-[#a594c9] truncate">{userEmail}</p>
              </div>
              <div className="p-2">
                <Link
                  href={userRole === 'admin' ? "/admin-dashboard" : "/hospital-dashboard"}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" /> Bảng điều khiển
                </Link>
                <Link
                  href={userRole === 'admin' ? "/system-setting" : "/hospital-settings"}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> Cài đặt
                </Link>
              </div>
              <div className="p-2 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
