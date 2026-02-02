
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestUser() {
    const email = 'test@redhope.vn';
    const password = 'Password123!';

    console.log('--- ĐANG TẠO USER TEST THẬT ---');

    // 1. Tạo user trong Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'donor', full_name: 'Test Thực Tế' }
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('Tài khoản đã tồn tại, hãy dùng nó để đăng nhập.');
        } else {
            console.error('Lỗi tạo Auth:', authError.message);
            return;
        }
    }

    // 2. Tạo profile trong bảng users (nếu chưa có)
    if (authData?.user) {
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: 'Test Thực Tế',
                role: 'donor'
            });

        if (profileError) console.error('Lỗi tạo Profile:', profileError.message);
        else console.log('==> THÀNH CÔNG! Hãy dùng test@redhope.vn / Password123! để đăng nhập.');
    }
}

createTestUser();
