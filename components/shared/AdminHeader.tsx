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
} from "@/components/ui/avatar";
import { notificationService } from "@/services";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Droplet, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

export interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title = "Hệ thống Quản trị" }: AdminHeaderProps) {
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!authUser?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(authUser.id);

      const mapped = data.map((n: any) => {
        let Icon = CheckCircle;
        let color = "text-green-500";
        let bg = "bg-green-100";

        const isDonorRelated = ['view_registrations', 'view_appointment', 'view_request'].includes(n.action_type);
        const isHospitalRelated = ['view_campaign', 'campaign_approved', 'campaign_rejected'].includes(n.action_type);

        let category = "Hệ thống";
        if (isDonorRelated) {
          Icon = Droplet;
          color = "text-rose-500";
          bg = "bg-rose-100";
          category = "Người hiến";
        } else if (isHospitalRelated) {
          Icon = LayoutGrid;
          color = "text-indigo-600";
          bg = "bg-indigo-100";
          category = "Bệnh viện";
        } else if (n.title.includes('Cảnh báo') || n.title.includes('⚠️')) {
          Icon = AlertTriangle;
          color = "text-amber-500";
          bg = "bg-amber-100";
        }

        return {
          id: n.id,
          title: n.title,
          desc: n.content,
          time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi }),
          is_read: n.is_read,
          icon: Icon,
          color,
          bg,
          category,
          action_url: n.action_url,
          isDonorRelated,
          isHospitalRelated
        };
      })
        .filter((n: any) => {
          if (userRole === 'hospital') return n.isDonorRelated;
          return true; // Admin sees everything
        });

      setNotifications(mapped);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    if (!authUser?.id) return;
    const channel = supabase
      .channel(`admin-header-notifs-${authUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${authUser.id}`
      }, (payload) => {
        const n = payload.new;
        let Icon = CheckCircle;
        let color = "text-green-500";
        let bg = "bg-green-100";

        const isDonorRelated = ['view_registrations', 'view_appointment', 'view_request'].includes(n.action_type);
        const isHospitalRelated = ['view_campaign', 'campaign_approved', 'campaign_rejected'].includes(n.action_type);

        let category = "Hệ thống";
        if (isDonorRelated) {
          Icon = Droplet;
          color = "text-rose-500";
          bg = "bg-rose-100";
          category = "Người hiến";
        } else if (isHospitalRelated) {
          Icon = LayoutGrid;
          color = "text-indigo-600";
          bg = "bg-indigo-100";
          category = "Bệnh viện";
        }

        // Role-based filtering for realtime
        const shouldDisplay = (userRole === 'hospital' && (isDonorRelated || isHospitalRelated)) || (userRole === 'admin');

        if (shouldDisplay) {
          const mapped = {
            id: n.id,
            title: n.title,
            desc: n.content,
            time: 'vừa xong',
            is_read: false,
            icon: Icon,
            color,
            bg,
            category,
            action_url: n.action_url
          };
          setNotifications(prev => [mapped, ...prev]);
          toast.info(n.title, { description: n.content });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authUser?.id]);

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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    if (!authUser?.id) return;
    try {
      await notificationService.markAllAsRead(authUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleMarkAsRead = async (notif: any) => {
    if (notif.is_read) return;
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const getIconByType = (notif: any) => {
    const Icon = notif.icon || Info;
    return <div className={`p-2 ${notif.bg} ${notif.color} rounded-full`}><Icon className="w-5 h-5" /></div>;
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-3 sticky top-0 z-20 w-full shrink-0">
      <div className="flex items-center gap-8 flex-1">
        {/* Title and Search removed per user request */}
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
                      onClick={() => handleMarkAsRead(notif)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors cursor-pointer flex gap-4 ${!notif.is_read ? 'bg-slate-50/50 dark:bg-[#251e36]/30' : ''}`}
                    >
                      <div className="shrink-0 mt-1">
                        {getIconByType(notif)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-0.5 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded w-fit ${notif.category === 'Người hiến' ? 'bg-rose-50 text-rose-500' :
                            notif.category === 'Bệnh viện' ? 'bg-indigo-50 text-indigo-600' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                            {notif.category}
                          </span>
                          <p className={`text-sm font-bold ${!notif.is_read ? 'text-[#120e1b] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{notif.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {loading ? "Đang tải..." : "Không có thông báo nào"}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-[#251e36]/50">
                <Link
                  href={userRole === 'hospital' ? "/hospital-notifications" : "/admin-notifications"}
                  className="block w-full text-center py-2 text-xs font-bold text-[#6324eb] hover:bg-[#6324eb]/5 rounded-lg transition-colors"
                >
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
