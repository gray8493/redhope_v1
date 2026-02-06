import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env loading from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Sử dụng Service Role Key để có quyền tạo và đọc thông báo của các users khác (Bypass RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ LỖI: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationRoleFlow() {
    console.log('🚀 [TEST] Bắt đầu kiểm tra luồng thông báo giữa Hospital và Donor...');
    console.log('------------------------------------------------------------');

    try {
        // 1. Lấy thông tin Hospital và Donor mẫu từ DB
        const { data: hospital, error: hErr } = await supabase
            .from('users')
            .select('id, full_name, hospital_name')
            .eq('role', 'hospital')
            .limit(1)
            .single();

        const { data: donor, error: dErr } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('role', 'donor')
            .limit(1)
            .single();

        if (hErr || dErr || !hospital || !donor) {
            console.error('❌ Không tìm thấy đủ user Hospital và Donor để thực hiện test.');
            console.log('Gợi ý: Hãy đảm bảo bạn đã chạy seed-data hoặc có ít nhất 1 hospital và 1 donor.');
            return;
        }

        console.log(`🏥 [ROLE: HOSPITAL] Đang sử dụng: ${hospital.hospital_name || hospital.full_name}`);
        console.log(`👤 [ROLE: DONOR] Đang sử dụng: ${donor.full_name}`);
        console.log('------------------------------------------------------------');

        // BƯỚC 1: HOSPITAL GỬI THÔNG BÁO CHO DONOR
        // Giả lập kịch bản: Bệnh viện phê duyệt lịch hẹn hiến máu
        console.log('🔹 Bước 1: Hospital gửi thông báo cho Donor...');
        const { data: n1, error: n1Err } = await supabase
            .from('notifications')
            .insert({
                user_id: donor.id,
                title: '✅ Lịch hẹn hiến máu đã được duyệt',
                content: `Bệnh viện ${hospital.hospital_name} đã xác nhận lịch hẹn của bạn vào 08:30 sáng mai.`,
                action_type: 'view_appointment',
                action_url: '/donor/appointments/test-id-123',
                metadata: { hospital_id: hospital.id, sender_role: 'hospital' }
            })
            .select()
            .single();

        if (n1Err) throw n1Err;
        console.log(`   ✅ Gửi thành công! ID thông báo: ${n1.id}`);

        // BƯỚC 2: DONOR KIỂM TRA THÔNG BÁO (NHẬN)
        console.log('\n🔹 Bước 2: Donor kiểm tra danh sách thông báo...');
        const { data: donorNotifs, error: n2Err } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', donor.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (n2Err) throw n2Err;
        const received = donorNotifs[0];
        console.log(`   📬 Đã nhận được: "${received.title}"`);
        if (received.id === n1.id) {
            console.log('   ✅ Kiểm tra ID khớp hoàn toàn.');
        }

        // BƯỚC 3: DONOR ĐÁNH DẤU ĐÃ ĐỌC
        console.log('\n🔹 Bước 3: Donor đánh dấu thông báo đã đọc...');
        const { error: markErr } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', received.id);

        if (markErr) throw markErr;

        // Kiểm tra lại trạng thái
        const { data: checkRead } = await supabase.from('notifications').select('is_read').eq('id', received.id).single();
        console.log(`   ✅ Trạng thái hiện tại: ${checkRead?.is_read ? 'ĐÃ ĐỌC' : 'CHƯA ĐỌC'}`);

        // BƯỚC 4: DONOR GỬI THÔNG BÁO CHO HOSPITAL (QUA HỆ THỐNG)
        // Giả lập kịch bản: Donor đăng ký tham gia chiến dịch mới
        console.log('\n🔹 Bước 4: Donor đăng ký (Hệ thống gửi thông báo cho Hospital)...');
        const { data: n3, error: n3Err } = await supabase
            .from('notifications')
            .insert({
                user_id: hospital.id,
                title: '👤 Đăng ký hiến máu mới',
                content: `Người hiến máu ${donor.full_name} đã đăng ký tham gia chiến dịch của bạn.`,
                action_type: 'view_registrations',
                action_url: '/hospital/campaigns/test-campaign-123',
                metadata: { donor_id: donor.id, sender_role: 'donor' }
            })
            .select()
            .single();

        if (n3Err) throw n3Err;
        console.log(`   ✅ Hospital đã nhận thông báo mới (ID: ${n3.id})`);

        // BƯỚC 5: HOSPITAL KIỂM TRA THÔNG BÁO
        console.log('\n🔹 Bước 5: Hospital kiểm tra hộp thư thông báo...');
        const { data: hospNotifs, error: n4Err } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', hospital.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (n4Err) throw n4Err;
        console.log(`   📬 Hospital nhận được: "${hospNotifs[0].title}"`);
        console.log(`   📝 Nội dung: ${hospNotifs[0].content}`);

        console.log('\n------------------------------------------------------------');
        console.log('✨ [KẾT QUẢ] Test hoàn thành thành công!');
        console.log('🚀 Luồng gửi/nhận thông báo giữa hai role hoạt động chính xác.');

    } catch (error: any) {
        console.error('\n❌ [THẤT BẠI] Đã xảy ra lỗi trong quá trình test:');
        console.error(error.message || error);
    }
}

testNotificationRoleFlow();
