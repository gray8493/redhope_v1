/**
 * @jest-environment node
 * 
 * INTEGRATION TEST: Chat functionality
 */

import { POST } from '@/app/api/chat/route';

const hasGeminiKey = process.env.GEMINI_API_KEY;
const describeOrSkip = hasGeminiKey ? describe : describe.skip;

describeOrSkip('Chat API Integration Test', () => {

    it('should respond to user message via Gemini AI', async () => {
        const body = {
            messages: [{ role: 'user', content: 'Xin chào, bạn có thể giúp gì cho tôi?' }]
        };

        const req = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });

        const res = await POST(req);

        // Cần đảm bảo route xử lý trả về NextResponse hoặc stream logic
        expect(res).toBeDefined();
        // Since the route streams data back (Next.js AI stream), verifying status is enough for basic integration
        expect(res.status).toBe(200);

        console.log("✅ Chat Streaming Response received");
    });
});
