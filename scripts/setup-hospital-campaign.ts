
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vmqeknrfbaazaxqhsdib.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_YMIk-OHk3en5FZgWlA139Q_1BDsI6Hf';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setup() {
    const email = 'bvquynhon@redhope.vn';
    const password = '123456';
    const hospitalName = 'Bệnh viện Đa khoa Tỉnh Bình Định';
    const city = 'Bình Định';
    const district = 'Thành phố Quy Nhơn';
    const address = '106 Nguyễn Huệ, Trần Phú, Thành phố Quy Nhơn, Bình Định';

    console.log('--- ĐANG TẠO CHIẾN DỊCH CHO BỆNH VIỆN QUY NHƠN ---');

    // Lấy ID user (đã tạo ở bước trước)
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser.users.find(u => u.email === email);
    if (!user) throw new Error('Không tìm thấy tài khoản bệnh viện.');
    const userId = user.id;

    // 3. Tạo chiến dịch (Sử dụng status lowercase: 'active')
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
            hospital_id: userId,
            name: 'Chiến dịch Hiến máu Nhân đạo Quy Nhơn 2026',
            description: 'Chương trình hiến máu tình nguyện vì sức khỏe cộng đồng tại Quy Nhơn. Hãy cùng chung tay cứu giúp những mảnh đời khó khăn.',
            location_name: 'Sảnh chính Bệnh viện Đa khoa Tỉnh',
            city: city,
            district: district,
            start_time: new Date('2026-03-01T08:00:00Z').toISOString(),
            end_time: new Date('2026-03-05T17:00:00Z').toISOString(),
            target_units: 500,
            status: 'active'
        })
        .select()
        .single();

    if (campaignError) {
        console.error('Lỗi tạo Chiến dịch:', campaignError.message);
    } else {
        console.log('==> Đã tạo xong chiến dịch:', campaign.name);
        console.log(`\nTài khoản đăng nhập bệnh viện:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
}

setup();
