import { supabase } from '@/lib/supabase';
import { userService } from '@/services/user.service';

export const authService = {
    // Sign Up
    // Sign Up
    async signUp(email: string, password: string, fullName: string) {
        // Enforce role policy: Public registration is always 'donor'
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
                throw new Error('Failed to create user profile. Please try again.');
            } catch (profileError) {
                console.error('Failed to create public profile:', profileError);
                // Rollback: Ideally we delete the auth user here.
                // Since specific admin API is needed, we log this critical error.
                // TODO: Implement server-side compensation or admin-alert.
                throw new Error('Failed to create user profile. Please contact support.');
            }
        }

        return authData;
    },

    // Sign In
    // Sign In
    async signIn(email: string, password: string) {
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
