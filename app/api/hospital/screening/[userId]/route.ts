import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { user: authUser, error: authError } = await getAuthenticatedUser();
        if (authError || !authUser) return authError!;

        const { supabaseAdmin } = await import('@/lib/supabase-admin');

        // Verify caller is hospital or admin
        const { data: callerProfile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();

        if (!callerProfile || !['hospital', 'admin'].includes(callerProfile.role || '')) {
            return NextResponse.json({ error: "Bạn không có quyền truy cập" }, { status: 403 });
        }

        const { userId } = await params;

        // Optional: filter by campaignId
        const { searchParams } = new URL(req.url);
        const campaignId = searchParams.get('campaignId');

        // Build query
        let query = supabaseAdmin
            .from('screening_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (campaignId) {
            query = query.eq('campaign_id', campaignId);
        }

        const { data: logs, error } = await query;

        if (error) {
            console.error('Error fetching screening logs:', error);
            return NextResponse.json({ error: "Lỗi truy vấn dữ liệu" }, { status: 500 });
        }

        // Also fetch donor basic info
        const { data: donorProfile } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, blood_group, dob, gender, weight, height, health_history')
            .eq('id', userId)
            .single();

        return NextResponse.json({
            donor: donorProfile || null,
            screening_logs: logs || [],
        });

    } catch (error: any) {
        console.error('Hospital screening API error:', error?.message);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}
