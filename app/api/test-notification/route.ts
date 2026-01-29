import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint để test thông báo real-time
 * Sử dụng Service Role Key để bypass RLS
 */

// Server-side Supabase client với Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, title, content, action_url, action_type } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Tạo thông báo test - Dùng supabaseAdmin để bypass RLS
        const { data: notification, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                title: title || '🧪 Test Notification',
                content: content || 'Đây là thông báo test real-time từ API',
                action_type: action_type || 'view_campaign',
                action_url: action_url || '/dashboard',
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString(),
                },
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Test notification created successfully!',
            notification,
        });

    } catch (error: any) {
        console.error('Error creating test notification:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint để lấy userId hiện tại (để dễ test)
 */
export async function GET(req: Request) {
    return NextResponse.json({
        message: 'Test Notification API',
        usage: {
            method: 'POST',
            endpoint: '/api/test-notification',
            body: {
                userId: 'string (required) - ID của user nhận thông báo',
                title: 'string (optional) - Tiêu đề thông báo',
                content: 'string (optional) - Nội dung thông báo',
                action_type: 'string (optional) - Loại action: view_campaign, view_appointment, etc.',
                action_url: 'string (optional) - URL chuyển hướng khi click',
            },
            examples: [
                {
                    name: 'Thông báo chiến dịch mới',
                    code: `fetch('/api/test-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    title: '🩸 Chiến dịch hiến máu mới gần bạn!',
    content: 'Bệnh viện Chợ Rẫy tổ chức chiến dịch "Giọt máu hồng" tại Quận 5',
    action_type: 'view_campaign',
    action_url: '/campaigns'
  })
}).then(r => r.json()).then(console.log);`
                },
                {
                    name: 'Thông báo đăng ký thành công',
                    code: `fetch('/api/test-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    title: '✅ Đăng ký thành công!',
    content: 'Bạn đã đăng ký tham gia chiến dịch "Hiến máu Xuân 2026"',
    action_type: 'view_appointment',
    action_url: '/appointments'
  })
}).then(r => r.json()).then(console.log);`
                },
                {
                    name: 'Thông báo cảnh báo',
                    code: `fetch('/api/test-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    title: '⚠️ Cảnh báo quan trọng',
    content: 'Vui lòng cập nhật thông tin hồ sơ để tiếp tục sử dụng dịch vụ',
    action_url: '/settings'
  })
}).then(r => r.json()).then(console.log);`
                }
            ]
        },
        tips: [
            'Để lấy userId của bạn, mở Console và gõ: localStorage.getItem("user_id")',
            'Hoặc kiểm tra trong AuthContext: console.log(user?.id)',
            'Toast notification sẽ tự động hiện lên khi thông báo được tạo',
            'Kiểm tra Console để xem log "New notification received:"',
        ]
    });
}
