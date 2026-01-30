import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function testNotification() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim().replace(/['\"]/g, '');
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1].trim().replace(/['\"]/g, '');

    if (!url || !key) {
        console.error('Missing URL or Key');
        return;
    }

    const supabase = createClient(url, key);

    console.log('Testing notification insert...');
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: '10000000-0000-0000-0000-000000000001', // Example hospital ID
            title: 'Test Registration',
            content: 'Test content',
            action_type: 'view_request',
            action_url: '/hospital-requests',
            is_read: false,
            metadata: {}
        })
        .select()
        .single();

    if (error) {
        console.error('Insert Failed:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testNotification();
