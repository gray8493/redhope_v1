import { supabase } from '@/lib/supabase';
import { userService } from '@/services/user.service';

export const authService = {
    // Sign Up
    async signUp(email: string, password: string, fullName: string, role: string = 'donor') {
        const safeRole = role.toLowerCase();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: safeRole },
            },
        });
        if (authError) throw authError;

        if (authData.user) {
            try {
                await userService.upsert(authData.user.id, {
                    email: email,
                    full_name: fullName,
                    role: safeRole as any
                });
            } catch (e) {
                console.error('Profile creation error:', e);
            }
        }
        return authData;
    },

    // Sign In
    async signIn(email: string, password: string) {
        console.log(`[authService] Calling Supabase signIn: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get Current User
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let profile = null;
        try {
            // Lấy profile bằng ID là cách nhanh nhất và chính xác nhất
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!error) profile = data;
        } catch (e) {
            console.warn('[authService] Profile fetch failed:', e);
        }

        return { ...user, profile };
    },

    // Listener tối giản nhất để tránh treo
    onAuthStateChange(callback: (user: any) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // Trả về user cơ bản trước để tránh block UI
                callback(session.user);
            } else {
                callback(null);
            }
        });
        return subscription;
    }
};
