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

    useEffect(() => {
        // Initial check
        refreshUser();

        // Listen for auth changes
        const subscription = authService.onAuthStateChange((userData) => {
            if (userData) {
                setUser(userData);
                setProfile(userData.profile);
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
        try {
            console.log("[AuthContext] Signing out...");
            await authService.signOut();
            // Xóa state ngay lập tức
            setUser(null);
            setProfile(null);
            // Chuyển hướng và reload để đảm bảo sạch session
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during signOut call:', error);
            // Kể cả lỗi vẫn nên ép về login
            window.location.href = '/login';
        }
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
