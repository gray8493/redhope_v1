import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check connection
export async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('_dummy_check').select('*').limit(1);
        if (error && error.code !== 'PGRST116') {
            // PGRST116 means table doesn't exist, which is fine - connection works
            console.error('Supabase connection error:', error);
            return false;
        }
        console.log('✅ Supabase connected successfully!');
        return true;
    } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        return false;
    }
}

// Export types for TypeScript (can be extended based on your database schema)
export type Database = {
    // Add your table types here as you create them
    // Example:
    // users: {
    //     id: string;
    //     email: string;
    //     created_at: string;
    // };
};
