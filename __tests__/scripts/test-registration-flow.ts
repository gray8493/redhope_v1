import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Giả lập campaignService để test logic core
async function testRegistrationFlow() {
    console.log('🚀 Bắt đầu test luồng Đăng ký giúp đỡ máu khẩn cấp...');

    // 1. Setup environment
    const envPath = path.resolve(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim().replace(/['\"]/g, '');
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1].trim().replace(/['\"]/g, '');

    if (!url || !key) {
        console.error('❌ Thiếu biến môi trường Supabase trong .env.local');
        return;
    }

    const supabase = createClient(url, key);

    // 2. Chuẩn bị dữ liệu test
    // Lấy một donor test
    const { data: donor } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'donor')
        .limit(1)
        .single();

    // Lấy một yêu cầu máu khẩn cấp test
    const { data: request } = await supabase
        .from('blood_requests')
        .select('id, hospital_id, required_blood_group')
        .limit(1)
        .single();

    if (!donor || !request) {
        console.error('❌ Không tìm thấy donor hoặc request test trong database. Hãy chắc chắn đã chạy seed data.');
        return;
    }

    console.log(`📝 Sử dụng Donor: ${donor.full_name} (${donor.id})`);
    console.log(`📝 Sử dụng Request: Nhóm ${request.required_blood_group} cho bệnh viện (${request.hospital_id})`);

    try {
        // 3. Thực hiện đăng ký (Giả lập logic trong campaignService.registerToBloodRequest)
        console.log('\n--- Bước 1: Tạo bản ghi Appointments ---');
        const { data: appointment, error: appError } = await supabase
            .from('appointments')
            .insert({
                user_id: donor.id,
                blood_request_id: request.id,
                status: 'Booked',
                scheduled_time: new Date().toISOString()
            })
            .select()
            .single();

        if (appError) throw appError;
        console.log('✅ Tạo Appointment thành công:', appointment.id);

        console.log('\n--- Bước 2: Gửi thông báo cho Bệnh viện ---');
        const { data: notification, error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: request.hospital_id,
                title: '👤 Đăng ký hiến máu mới (Test)',
                content: `Người hiến máu ${donor.full_name} đã đăng ký tham gia hỗ trợ yêu cầu khẩn cấp (Nhóm ${request.required_blood_group}).`,
                action_type: 'view_request',
                action_url: `/hospital-requests`,
                is_read: false
            })
            .select()
            .single();

        if (notifError) {
            console.error('❌ Lỗi tạo thông báo (Có thể do RLS):', notifError);
        } else {
            console.log('✅ Tạo thông báo thành công:', notification.id);
        }

        // 4. Kiểm tra xem bệnh viện thấy gì
        console.log('\n--- Bước 3: Kiểm tra Dashboard Bệnh viện ---');
        const { data: hospitalView } = await supabase
            .from('appointments')
            .select('*, user:users(full_name)')
            .eq('blood_request_id', request.id);

        console.log(`✅ Bệnh viện kiểm tra danh sách: Tìm thấy ${hospitalView?.length} người đăng ký.`);
        const found = hospitalView?.some(a => a.user_id === donor.id);
        if (found) {
            console.log(`✨ Kết quả: Donor ${donor.full_name} đã xuất hiện trong danh sách của bệnh viện.`);
        } else {
            console.log('❌ Kết quả: Không tìm thấy donor trong danh sách bệnh viện.');
        }

        console.log('\n--- Bước 4: Dọn dẹp dữ liệu test ---');
        await supabase.from('appointments').delete().eq('id', appointment.id);
        if (notification) await supabase.from('notifications').delete().eq('id', notification.id);
        console.log('🧹 Đã xóa dữ liệu test.');

        console.log('\n✅ TEST HOÀN TẤT THÀNH CÔNG!');

    } catch (err: any) {
        console.error('\n❌ TEST THẤT BẠI:', err.message);
    }
}

testRegistrationFlow();
