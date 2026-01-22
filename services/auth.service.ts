import { supabase } from '@/lib/supabase';
import { userService } from '@/services/user.service';

export const authService = {
    // Sign Up
    async signUp(email: string, password: string, fullName: string) {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (authError) throw authError;

        // 2. Create public user profile if signup is successful
        if (authData.user) {
            // Check if user already exists in public table to avoid duplicates if using same email
            const existing = await userService.getByEmail(email);
            if (!existing) {
                await userService.create({
                    email: email,
                    full_name: fullName,
                    // Map auth.uid to public.users.id if your table allows it, 
                    // OR rely on email matching. 
                    // Ideally, public.users.id should be the auth.user.id.
                    // But your current setup-database.sql uses random uuid for public.users.
                    // We will just create it for now.
                });
            }
        }

        return authData;
    },

    // Sign In
    async signIn(email: string, password: string) {
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

        // Optionally fetch profile
        const profile = await userService.getByEmail(user.email || '');

        return {
            ...user,
            profile // Attach public profile
        };
    },

    // Auth State Change Listener (Run in useEffect)
    onAuthStateChange(callback: (user: any) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await userService.getByEmail(session.user.email || '');
                callback({ ...session.user, profile });
            } else {
                callback(null);
            }
        });
        return subscription;
    }
};
