import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function diagnose() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim().replace(/['\"]/g, '');
    const anonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1].trim().replace(/['\"]/g, '');
    const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1].trim().replace(/['\"]/g, '');

    if (!url || !anonKey || !serviceKey) {
        console.error('Missing env variables');
        return;
    }

    const anonClient = createClient(url, anonKey);
    const serviceClient = createClient(url, serviceKey);

    console.log('1. Testing insert with SERVICE ROLE...');
    const { error: sError } = await serviceClient.from('notifications').insert({
        user_id: '10000000-0000-0000-0000-000000000001',
        title: 'Test Service',
        content: 'Test Service'
    });
    console.log('Service Result:', sError ? sError.message : 'SUCCESS');

    console.log('\n2. Testing insert with ANON KEY...');
    const { error: aError } = await anonClient.from('notifications').insert({
        user_id: '10000000-0000-0000-0000-000000000001',
        title: 'Test Anon',
        content: 'Test Anon'
    });

    if (aError) {
        console.log('Anon Failed:', aError.message);
        console.log('Full Error:', JSON.stringify(aError, null, 2));
    } else {
        console.log('Anon Success!');
    }
}

diagnose();
