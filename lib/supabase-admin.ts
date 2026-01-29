import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase Service Role Key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
}

/**
 * Server-side Supabase client with Service Role Key
 * 
 * ⚠️ WARNING: This client bypasses Row Level Security (RLS)
 * Only use this in server-side code (API routes, server components)
 * NEVER expose this to the client-side!
 * 
 * Use cases:
 * - Creating notifications for other users
 * - Admin operations
 * - Bulk operations
 * - Background jobs
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
