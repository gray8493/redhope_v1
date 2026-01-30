import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env loading
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function finalNotificationTest() {
    console.log('🚀 [KIỂM TRA CUỐI CÙNG] Đang giả lập luồng thực tế...');
    console.log('------------------------------------------------------------');

    try {
        // 1. Tìm tài khoản của BẠN (để test nhận thông báo thật)
        // Bạn có thể thay đổi email bên dưới cho đúng tài khoản đang đăng nhập trên trình duyệt
        const testEmail = 'nguyenvanan@gmail.com'; // Email mặc định trong seed-data

        const { data: me, error: meErr } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .single();

        if (meErr || !me) {
            console.error('❌ Không tìm thấy tài khoản donor để test.');
            console.log('💡 Gợi ý: Hãy đảm bảo email trong script khớp với email bạn dùng đăng nhập.');
            return;
        }

        console.log(`👤 Tài khoản nhận thông báo: ${me.full_name} (${me.blood_group} tại ${me.city})`);

        // 2. Tạo một chiến dịch KHỚP với thông tin của bạn
        console.log(`\n🏗️ Đang tạo chiến dịch khẩn cấp cho nhóm ${me.blood_group} tại ${me.city}...`);

        const campaignId = crypto.randomUUID();
        const { error: cErr } = await supabase
            .from('campaigns')
            .insert({
                id: campaignId,
                hospital_id: '10000000-0000-0000-0000-000000000002', // Bệnh viện Chợ Rẫy
                name: `🆘 KHẨN CẤP: Cần nhóm máu ${me.blood_group} ngay bây giờ!`,
                description: `Yêu cầu đặc biệt cho nhóm máu ${me.blood_group}. TEST THỰC TẾ.`,
                city: me.city,
                district: 'Quận Trung Tâm',
                target_blood_group: me.blood_group,
                status: 'active',
                location_name: 'Khu A - Tầng 1'
            });

        if (cErr) throw cErr;
        console.log('✅ Đã tạo chiến dịch thành công.');

        // 3. Đợi Robot (Trigger) xử lý trong 2 giây
        console.log('⌛ Đang đợi Robot xử lý thông báo...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. Kiểm tra xem thông báo đã xuất hiện cho BẠN chưa
        const { data: myNotifs, error: nErr } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', me.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (nErr) throw nErr;

        if (myNotifs && myNotifs.length > 0 && myNotifs[0].title.includes(me.blood_group)) {
            console.log('\n✨ [KẾT QUẢ THỰC TẾ]');
            console.log('------------------------------------------------------------');
            console.log('✅ TRẠNG THÁI: THÀNH CÔNG RỰC RỠ!');
            console.log(`🔔 Thông báo đã được gửi đến bạn: "${myNotifs[0].title}"`);
            console.log(`📝 Nội dung: ${myNotifs[0].content}`);
            console.log('\n🚀 BÂY GIỜ BẠN HÃY KIỂM TRA CHUÔNG THÔNG BÁO TRÊN WEB!');
            console.log('------------------------------------------------------------');
        } else {
            console.log('\n❌ [THẤT BẠI] Không tìm thấy thông báo nào được tạo.');
            console.log('💡 Nguyên nhân có thể:');
            console.log('  1. Script Trigger chưa được chạy vào Database.');
            console.log('  2. Cột target_blood_group chưa được thêm vào bảng campaigns.');
        }

    } catch (error: any) {
        console.error('\n❌ Lỗi hệ thống:', error.message);
    }
}

finalNotificationTest();
