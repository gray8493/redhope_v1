
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

async function testGemini() {
    console.log('🔄 Đang kiểm tra kết nối Gemini API...');

    // 1. Load API Key
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        // Try to read from .env.local
        try {
            const envPath = path.resolve(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf-8');
                const match = envContent.match(/GEMINI_API_KEY=(.+)/);
                if (match && match[1]) {
                    apiKey = match[1].trim();
                    console.log('✅ Đã tìm thấy API Key trong .env.local');
                }
            }
        } catch (err) {
            console.error('⚠️ Không thể đọc file .env.local');
        }
    }

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('❌ LỖI: Chưa cấu hình GEMINI_API_KEY.');
        console.error('👉 Vui lòng mở file .env.local và nhập API Key của bạn.');
        return;
    }

    // 2. Init Client
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        console.log('📤 Đang gửi tin nhắn test: "Chào bạn, hãy giới thiệu ngắn gọn về bản thân."');

        const result = await model.generateContent("Chào bạn, hãy giới thiệu ngắn gọn về bản thân.");
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ KẾT NỐI THÀNH CÔNG!');
        console.log('----------------------------------------');
        console.log('🤖 Phản hồi từ Gemini:');
        console.log(text);
        console.log('----------------------------------------');

    } catch (error: any) {
        console.error('\n❌ KẾT NỐI THẤT BẠI');
        console.error('Lỗi:', error.message);
        if (error.message.includes('API_KEY_INVALID')) {
            console.error('👉 Nguyên nhân: API Key không hợp lệ.');
        }
    }
}

testGemini();
