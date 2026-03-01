"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

interface AuthContextType {
    user: any;
    profile: any;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

import Cookies from 'js-cookie';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Auth init error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signOut = async () => {
        try {
            await authService.signOut();
            // SECURITY: No more insecure client-side cookies to clear
            // Supabase SSR handles session cookie cleanup automatically
            setUser(null);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile: user?.profile, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
