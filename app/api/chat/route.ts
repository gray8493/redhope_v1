import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        // SECURITY: Verify authentication
        const { user: authUser, error: authError } = await getAuthenticatedUser();
        if (authError || !authUser) return authError!;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key chưa được cấu hình" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const body = await req.json();
        const { message, history } = body;

        // SECURITY: Validate input
        if (!message || typeof message !== 'string' || message.length > 2000) {
            return NextResponse.json(
                { error: "Tin nhắn không hợp lệ" },
                { status: 400 }
            );
        }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Bạn là Bác sĩ Trợ lý của REDHOPE. Hãy đóng vai một bác sĩ thân thiện, có kiến thức chuyên sâu về y học và hiến máu. Trả lời các câu hỏi chính xác về mặt y tế, đưa ra lời khuyên hữu ích, và giải tỏa lo lắng của người hiến máu. Sử dụng tiếng Việt, phong cách chuyên nghiệp nhưng ấm áp, có thể dùng emoji để tạo sự gần gũi." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Chào bạn! 🩺 Tôi là Bác sĩ AI của REDHOPE. Tôi ở đây để giải đáp mọi thắc mắc y tế về việc hiến máu và sức khỏe của bạn. Đừng ngần ngại hỏi nhé! 💉🏥" }],
                },
                // Append previous relevant history (limit to last 10 messages)
                ...(history || []).slice(-10).map((msg: any) => ({
                    role: msg.isBot ? "model" : "user",
                    parts: [{ text: String(msg.text).substring(0, 2000) }]
                }))
            ],
            generationConfig: {
                maxOutputTokens: 2000,
            },
            // SECURITY FIX: Keep safety filters at reasonable level
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini API Error:", error?.message);
        return NextResponse.json(
            { error: "Không thể kết nối với trợ lý ảo lúc này." },
            { status: 500 }
        );
    }
}
