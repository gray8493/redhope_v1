"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { User } from '@/lib/database.types';

interface AuthContextType {
    user: any | null;
    profile: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            setLoading(true);
            const userData = await authService.getCurrentUser();
            if (userData) {
                setUser(userData);
                setProfile(userData.profile);
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        } finally {
            setLoading(false);
        }
    };

    const isSigningOut = React.useRef(false);

    useEffect(() => {
        // Initial check
        refreshUser();

        // Listen for auth changes
        const subscription = authService.onAuthStateChange((userData) => {
            if (isSigningOut.current) return; // Nếu đang logout thì bỏ qua mọi data mới

            if (userData) {
                // Chỉ cập nhật profile nếu có profile mới trong userData, 
                // hoặc nếu đây là một user hoàn toàn khác (chuyển account)
                setUser(userData);

                if (userData.profile) {
                    setProfile(userData.profile);
                } else {
                    // Nếu userData không có profile (thường là lượt gọi đầu tiên của SIGNED_IN)
                    // thì chúng ta kiểm tra nếu là user mới (id khác) mới xóa profile cũ.
                    // Nếu id vẫn vậy, giữ nguyên profile cũ để tránh flicker UI.
                    setProfile(prev => (prev && prev.id === userData.id) ? prev : null);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        isSigningOut.current = true; // Chặn mọi cập nhật state từ listener
        console.log("[AuthContext] Sign out triggered, redirecting immediately...");

        // 1. Xóa trạng thái cục bộ ngay lập tức
        setUser(null);
        setProfile(null);

        // 2. Thực hiện đăng xuất ở background (không await để tránh treo UI)
        authService.signOut().catch(err => {
            console.warn("[AuthContext] Background sign out error:", err);
        });

        // 3. Chuyển hướng ngay lập tức
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
