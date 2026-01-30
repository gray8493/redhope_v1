import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function forceFixRLS() {
    console.log('--- FORCING RLS FIX VIA SERVICE ROLE ---');
    const envPath = path.resolve(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim().replace(/['\"]/g, '');
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1].trim().replace(/['\"]/g, '');

    if (!url || !key) {
        console.error('Missing URL or Service Role Key');
        return;
    }

    const supabase = createClient(url, key);

    const sql = `
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
        CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
        CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    `;

    // Try rpc if exists
    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql });
        if (error) {
            console.log('RPC execute_sql failed (expected if not enabled).');
        } else {
            console.log('SQL executed successfully via RPC!');
            return;
        }
    } catch (e) {
        console.log('RPC call failed.');
    }

    console.log('Checking current policies...');
    const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'notifications');

    if (polError) {
        console.error('Could not check policies:', polError);
    } else {
        console.log('Current Policies:', policies.map(p => p.policyname));
    }
}

forceFixRLS();
