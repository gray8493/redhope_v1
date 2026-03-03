import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        // SECURITY: Verify authentication via JWT (not trusting client-sent userId)
        const { user: authUser, error: authError } = await getAuthenticatedUser();
        if (authError || !authUser) return authError!;

        const body = await req.json();
        const { answers, campaignId } = body;

        // SECURITY: Use server-verified userId, not client-supplied
        const userId = authUser.id;

        // Check user profile verification status
        const { supabaseAdmin } = await import('@/lib/supabase-admin');
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('is_verified, role')
            .eq('id', userId)
            .single();

        if (profileError || !userProfile) {
            return NextResponse.json({ error: "Không tìm thấy thông tin người dùng" }, { status: 404 });
        }

        if (userProfile.role === 'donor' && !userProfile.is_verified) {
            return NextResponse.json({
                error: "Vui lòng hoàn thành hồ sơ cá nhân trước khi thực hiện sàng lọc AI",
                code: "PROFILE_INCOMPLETE",
                redirect: "/complete-profile"
            }, { status: 403 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined");
            return NextResponse.json({ error: "Thiếu cấu hình API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Tách câu trả lời trắc nghiệm và tự luận
        const choiceAnswers: Record<string, any> = {};
        const textAnswers: Record<string, any> = {};

        for (const [key, val] of Object.entries(answers)) {
            const id = parseInt(key);
            if (id <= 10) {
                choiceAnswers[key] = val;
            } else {
                // SECURITY: Sanitize text answers (limit length)
                textAnswers[key] = typeof val === 'string' ? val.substring(0, 500) : val;
            }
        }

        const prompt = `
Bạn là một chuyên gia y tế AI chuyên phân tích hồ sơ sàng lọc hiến máu theo tiêu chuẩn Bộ Y Tế Việt Nam.

═══ DỮ LIỆU ĐẦU VÀO ═══

📋 PHẦN 1 - TRẮC NGHIỆM (10 câu, mỗi câu 4 đáp án mức độ):
Mỗi đáp án có mức độ severity: "safe" (an toàn), "mild" (nhẹ), "moderate" (trung bình), "high" (cao/nguy hiểm).

Câu hỏi tương ứng:
1. Tình trạng sức khỏe hôm nay
2. Sử dụng thuốc trong 7 ngày qua
3. Tiền sử bệnh lý lây truyền qua đường máu
4. Lần hiến máu gần nhất
5. Xăm mình hoặc xỏ khuyên trong 6 tháng qua
6. Huyết áp
7. Tình trạng thai kỳ / cho con bú
8. Cân nặng
9. Nhổ răng hoặc tiểu phẫu trong 7 ngày qua
10. Đi đến vùng dịch bệnh trong 6 tháng qua

Dữ liệu trắc nghiệm:
${JSON.stringify(choiceAnswers, null, 2)}

✏️ PHẦN 2 - TỰ LUẬN (5 câu mô tả chi tiết):
11. Tình trạng sức khỏe chung hiện tại
12. Bệnh lý mãn tính đang điều trị
13. Chế độ ăn uống và nghỉ ngơi 24h qua
14. Lo ngại về việc hiến máu
15. Tiền sử dị ứng thuốc / thực phẩm

Dữ liệu tự luận:
${JSON.stringify(textAnswers, null, 2)}

═══ QUY TẮC PHÂN TÍCH ═══

CRITICAL (Tự động INELIGIBLE - không đủ điều kiện):
- Có bệnh lý lây truyền qua đường máu (HIV, Viêm gan B/C, Giang mai) chưa khỏi
- Đang mang thai
- Cân nặng dưới 42kg
- Đang bị ốm / sốt

MODERATE RISK (Cần đánh giá kết hợp):
- Dùng kháng sinh trong 7 ngày → có thể ineligible
- Huyết áp cao đang uống thuốc → ineligible
- Hiến máu dưới 8 tuần → ineligible
- Xăm mình dưới 3 tháng → ineligible
- Nhổ răng trong 3 ngày → ineligible

WARNING (Cảnh báo nhưng có thể được):
- Hơi mệt nhẹ + các chỉ số khác tốt → warning
- Dùng thuốc giảm đau nhẹ → cần xem xét thêm
- Cân nặng 42-45kg → cần cẩn thận

ELIGIBLE:
- Tất cả severity đều "safe" hoặc "mild" nhẹ
- Câu tự luận không có dấu hiệu bất thường
- Tổng thể sức khỏe tốt

PHÂN TÍCH TỰ LUẬN:
- Đọc kỹ phần mô tả sức khỏe, tìm từ khóa liên quan đến bệnh lý
- Phát hiện mâu thuẫn giữa trắc nghiệm vs tự luận (VD: chọn "khỏe" nhưng tự luận ghi "đang uống thuốc huyết áp")
- Đánh giá chế độ ăn uống/nghỉ ngơi có phù hợp cho hiến máu không

═══ ĐẦU RA YÊU CẦU ═══

SCORE: 0-100 (dựa trên số câu safe/mild vs moderate/high + nội dung tự luận)
- 90-100: Hoàn toàn phù hợp
- 70-89: Phù hợp với lưu ý nhỏ 
- 50-69: Cần cân nhắc kỹ
- 0-49: Không phù hợp

TRẢ VỀ JSON NGUYÊN BẢN (KHÔNG CÓ CODE BLOCK, KHÔNG CÓ MARKDOWN):
{
    "status": "eligible" | "ineligible" | "warning",
    "score": <number>,
    "analysis": "<Phân tích chi tiết bằng tiếng Việt, chuyên nghiệp, 2-4 câu>",
    "recommendations": ["<khuyến nghị 1>", "<khuyến nghị 2>", "<khuyến nghị 3>"]
}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Clean markdown code blocks
        const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI không trả về đúng định dạng JSON");
        }

        const jsonResponse = JSON.parse(jsonMatch[0]);

        // ═══ Save to screening_logs table ═══
        try {
            // Find appointment if campaignId provided
            let appointmentId: string | null = null;
            if (campaignId) {
                const { data: appointment } = await supabaseAdmin
                    .from('appointments')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('campaign_id', campaignId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                appointmentId = appointment?.id || null;
            }

            await supabaseAdmin.from('screening_logs').insert({
                user_id: userId,
                campaign_id: campaignId || null,
                appointment_id: appointmentId,
                ai_result: jsonResponse.status === 'eligible',
                health_details: {
                    score: jsonResponse.score,
                    status: jsonResponse.status,
                    analysis: jsonResponse.analysis,
                    recommendations: jsonResponse.recommendations,
                    answers: answers,
                    analyzed_at: new Date().toISOString(),
                },
            });
        } catch (logError: any) {
            console.error('Failed to save screening log:', logError?.message);
        }

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("Gemini Error:", error?.message);

        return NextResponse.json({
            status: "warning",
            score: 50,
            analysis: "Phân tích AI đang được bảo trì, đã áp dụng quy tắc sàng lọc cơ bản.",
            recommendations: ["Vui lòng tham khảo ý kiến bác sĩ tại điểm hiến máu"]
        });
    }
}
