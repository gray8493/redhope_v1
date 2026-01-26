import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = createRouteHandlerClient({ cookies });
        await supabase.auth.exchangeCodeForSession(code);

        // Sau khi có session, ta sẽ lấy thông tin user để định tuyến
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const role = (user.user_metadata?.role || 'donor').toLowerCase();

            // Nếu là admin đi thẳng vào /admin
            if (role === 'admin') {
                return NextResponse.redirect(`${requestUrl.origin}/admin`);
            }

            // Nếu là hospital đi vào /hospital
            if (role === 'hospital') {
                return NextResponse.redirect(`${requestUrl.origin}/hospital`);
            }

            // Với donor, kiểm tra xem đã xong profile chưa (đây là kiểm tra thô, RoleGuard sẽ xử lý kỹ hơn)
            return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        }
    }

    // Fallback về trang chủ nếu có lỗi
    return NextResponse.redirect(`${requestUrl.origin}/login`);
}
