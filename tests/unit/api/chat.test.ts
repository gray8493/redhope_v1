/**
 * Test: POST /api/chat
 * Kiểm tra API Chatbot AI (Gemini)
 */

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data: any, init?: { status?: number }) => ({
            json: async () => data,
            status: init?.status || 200,
        })),
    },
}));

// Mock auth-helpers
jest.mock('@/lib/auth-helpers', () => ({
    getAuthenticatedUser: jest.fn().mockResolvedValue({
        user: { id: 'user-001', email: 'test@redhope.vn', role: 'donor' },
        error: null,
    }),
    requireRole: jest.fn().mockResolvedValue({
        user: { id: 'user-001', email: 'test@redhope.vn', role: 'admin' },
        error: null,
    }),
}));

// Mock GoogleGenerativeAI
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
    sendMessage: mockSendMessage,
}));
const mockGetGenerativeModel = jest.fn(() => ({
    startChat: mockStartChat,
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
    HarmCategory: {},
    HarmBlockThreshold: {},
}));

/* ─────────── Helpers ─────────── */
function createRequest(body: any): Request {
    return {
        json: async () => body,
    } as any;
}

/* ─────────── Tests ─────────── */
describe('POST /api/chat', () => {
    let POST: any;

    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'test-key';
        const route = require('@/app/api/chat/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-key';
    });

    it('should return 500 when API Key is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        const req = createRequest({ message: 'Hello' });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it('should process user message and return AI response', async () => {
        mockSendMessage.mockResolvedValue({
            response: {
                text: () => 'Chào bạn! Tôi có thể giúp gì?',
            },
        });

        const req = createRequest({ message: 'Xin chào', history: [] });
        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.text).toBe('Chào bạn! Tôi có thể giúp gì?');
        expect(mockStartChat).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalledWith('Xin chào');
    });

    it('should handle chat history correctly', async () => {
        mockSendMessage.mockResolvedValue({
            response: { text: () => 'OK' },
        });

        const history = [
            { isBot: false, text: 'Hi' },
            { isBot: true, text: 'Hello' }
        ];

        const req = createRequest({ message: 'Next', history });
        await POST(req);

        // Check if history is passed to startChat
        const startChatCall = (mockStartChat.mock.calls as any)[0][0];
        const passedHistory = startChatCall.history;

        // History include system prompt (2) + user history (2)
        expect(passedHistory.length).toBeGreaterThanOrEqual(4);
        expect(passedHistory).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ role: 'user', parts: [{ text: 'Hi' }] }),
                expect.objectContaining({ role: 'model', parts: [{ text: 'Hello' }] })
            ])
        );
    });

    it('should return 500 on Gemini API error', async () => {
        mockSendMessage.mockRejectedValue(new Error('API Error'));

        const req = createRequest({ message: 'Error me' });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toContain('Không thể kết nối');
    });
});

export { };
