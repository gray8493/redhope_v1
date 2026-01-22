import { supabase } from '@/lib/supabase';
import { userService } from '@/services/user.service';

export const authService = {
    // Sign Up
    async signUp(email: string, password: string, fullName: string, role: string = 'donor') {
        // Enforce role policy: Public registration is always 'donor' (or check if admin)
        // For now we force 'donor' or just store what is requested in metadata but purely informational
        const safeRole = 'donor';

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: safeRole // Store safe role in metadata
                },
            },
        });

        if (authError) throw authError;

        // 2. Create public user profile if signup is successful
        if (authData.user) {
            try {
                // Check if user already exists in public table
                const existing = await userService.getByEmail(email);
                if (!existing) {
                    await userService.create({
                        email: email,
                        full_name: fullName,
                    });
                }
            } catch (profileError) {
                console.error('Failed to create public profile:', profileError);
                // Rollback: Delete the auth user if profile creation fails
                // Note: accurate rollback depends on RLS; users often can't delete themselves.
                // Assuming we can or we just log it for manual fix. 
                // Using admin client would be better but we are client-side here.
                // We will try best effort or just throw.
                throw new Error('Failed to create user profile. Please try again.');
            }
        }

        return authData;
    },

    // Sign In
    async signIn(email: string, password: string, role?: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        // Optionally verify role here if stored in metadata
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
        if (user.email) {
            try {
                profile = await userService.getByEmail(user.email);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        }

        return {
            ...user,
            profile // Attach public profile
        };
    },

    // Auth State Change Listener (Run in useEffect)
    onAuthStateChange(callback: (user: any) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                try {
                    const profile = session.user.email ? await userService.getByEmail(session.user.email) : null;
                    callback({ ...session.user, profile });
                } catch (error) {
                    console.error('AuthStateChange error:', error);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
        return subscription;
    }
};
