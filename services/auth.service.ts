import { supabase } from '@/lib/supabase';

export const authService = {
    getCurrentUser: async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) return null;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        // Fetch profile
        const { data: profile } = await supabase
            .from('users') // Changed from profiles to users
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            ...user,
            role: profile?.role || 'donor', // Mặc định là donor nếu chưa có role
            profile
        };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    updatePassword: async (password: string) => {
        return await supabase.auth.updateUser({ password });
    }
};
