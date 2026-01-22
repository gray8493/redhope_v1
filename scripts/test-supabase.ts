// Test connection with users table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

async function testUsersTable() {
    console.log('');
    console.log('========================================');
    console.log('  TEST BANG USERS - SUPABASE');
    console.log('========================================');
    console.log('');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        // Test 1: Select all users
        console.log('1. Lay danh sach users...');
        const { data: users, error: selectError } = await supabase
            .from('users')
            .select('*')
            .limit(10);

        if (selectError) {
            console.log('   LOI: ' + selectError.message);
            console.log('   Code: ' + selectError.code);
        } else {
            console.log('   THANH CONG!');
            console.log('   So users: ' + (users?.length || 0));
            if (users && users.length > 0) {
                console.log('   Users:');
                users.forEach((u, i) => {
                    const maskedEmail = u.email ? u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'N/A';
                    const maskedBlood = '***';
                    console.log(`   ${i + 1}. ${u.full_name} (${maskedEmail}) - ${maskedBlood}`);
                });
            }
        }

        console.log('');

        // Test 2: Count users
        console.log('2. Dem so luong users...');
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.log('   LOI: ' + countError.message);
        } else {
            console.log('   Tong so users: ' + (count || 0));
        }

        console.log('');

        // Test 3: Check table structure
        console.log('3. Kiem tra cau truc bang...');
        const { data: sample, error: structError } = await supabase
            .from('users')
            .select('id, full_name, email, blood_group, city, district, current_points, created_at')
            .limit(1);

        if (structError) {
            console.log('   LOI: ' + structError.message);
        } else {
            console.log('   CAU TRUC BANG DUNG!');
            console.log('   Cac cot: id, full_name, email, blood_group, city, district, current_points, created_at');
        }

    } catch (err: any) {
        console.log('LOI NGOAI LE: ' + err.message);
    }

    console.log('');
    console.log('========================================');
    console.log('  KET THUC TEST');
    console.log('========================================');
    console.log('');
}

testUsersTable();
