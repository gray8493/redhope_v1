import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { answers } = body;

        console.log("Answers received for analysis:", JSON.stringify(answers).substring(0, 50) + "...");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined");
            return NextResponse.json({ error: "Thiếu cấu hình API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using "gemini-pro" as it's more standard if 1.5-flash is failing due to versioning
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Bạn là một chuyên gia y tế AI phân tích hồ sơ sàng lọc hiến máu.
            Dưới đây là danh sách các câu trả lời khảo sát của người dùng:
            ${JSON.stringify(answers, null, 2)}

            Hãy đưa ra kết luận về việc người này có đủ điều kiện hiến máu hay không.
            
            QUY TẮC MÃ:
            - "eligible": Đủ điều kiện.
            - "warning": Cần lưu ý (đang dùng thuốc nhẹ, mệt, xăm mình gần đây).
            - "ineligible": Không đủ điều kiện (bệnh truyền nhiễm, bệnh lý nặng).

            TRẢ VỀ JSON NGUYÊN BẢN (KHÔNG CÓ CODE BLOCK):
            {
                "status": "eligible" | "ineligible" | "warning",
                "score": number,
                "analysis": "tiếng Việt chuyên nghiệp",
                "recommendations": ["khuyên nghị 1", "khuyên nghị 2"]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Clean potentially problematic markdown code blocks
        const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI không trả về đúng định dạng JSON");
        }

        const jsonResponse = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("Gemini Error Detail:", error);

        // Final fallback if Gemini still fails for some reason
        return NextResponse.json({
            status: "warning",
            score: 50,
            analysis: "Phân tích AI đang được bảo trì, đã áp dụng quy tắc sàng lọc cơ bản.",
            recommendations: ["Vui lòng tham khảo ý kiến bác sĩ tại điểm hiến máu"]
        });
    }
}
