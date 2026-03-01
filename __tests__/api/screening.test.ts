/**
 * Test: POST /api/ai/screening
 * Kiểm tra API sàng lọc y tế AI (Gemini)
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
        user: { id: 'test-user', email: 'test@redhope.vn', role: 'donor' },
        error: null,
    }),
    requireRole: jest.fn().mockResolvedValue({
        user: { id: 'test-user', email: 'test@redhope.vn', role: 'admin' },
        error: null,
    }),
}));

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
}));

// Mock Supabase Admin
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockFrom = jest.fn(() => ({
    select: jest.fn(() => ({
        eq: mockEq
    }))
}));

jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: mockFrom,
    },
}));

/* ─────────── Test Data ─────────── */
const SAFE_ANSWERS = {
    // Trắc nghiệm (10 câu - tất cả safe)
    1: { value: 'very_good', severity: 'safe', id: 1 },
    2: { value: 'no_meds', severity: 'safe', id: 2 },
    3: { value: 'none', severity: 'safe', id: 3 },
    4: { value: 'over_12w', severity: 'safe', id: 4 },
    5: { value: 'none', severity: 'safe', id: 5 },
    6: { value: 'stable', severity: 'safe', id: 6 },
    7: { value: 'na', severity: 'safe', id: 7 },
    8: { value: 'above_50', severity: 'safe', id: 8 },
    9: { value: 'none', severity: 'safe', id: 9 },
    10: { value: 'no', severity: 'safe', id: 10 },
    // Tự luận (5 câu)
    11: { value: 'Tôi rất khỏe mạnh, ăn ngủ tốt', id: 11 },
    12: { value: 'Không có bệnh nền', id: 12 },
    13: { value: 'Ăn đủ 3 bữa, ngủ 8 tiếng', id: 13 },
    14: { value: 'Không có lo ngại', id: 14 },
    15: { value: 'Không dị ứng gì', id: 15 },
};

const HIGH_RISK_ANSWERS = {
    1: { value: 'sick', severity: 'high', id: 1 },
    2: { value: 'antibiotics', severity: 'high', id: 2 },
    3: { value: 'has_disease', severity: 'high', id: 3 },
    4: { value: 'under_8w', severity: 'high', id: 4 },
    5: { value: 'under_3m', severity: 'high', id: 5 },
    6: { value: 'high', severity: 'high', id: 6 },
    7: { value: 'pregnant', severity: 'high', id: 7 },
    8: { value: 'below_42', severity: 'high', id: 8 },
    9: { value: 'under_3d', severity: 'high', id: 9 },
    10: { value: 'risk_area', severity: 'high', id: 10 },
    11: { value: 'Tôi đang bị sốt cao', id: 11 },
    12: { value: 'Đang điều trị viêm gan B', id: 12 },
    13: { value: 'Không ăn gì, mất ngủ', id: 13 },
    14: { value: 'Rất lo lắng', id: 14 },
    15: { value: 'Dị ứng Penicillin', id: 15 },
};

/* ─────────── Helpers ─────────── */
function createRequest(body: any): Request {
    return {
        json: async () => body,
    } as any;
}

function mockAIResponse(jsonObj: any) {
    mockGenerateContent.mockResolvedValue({
        response: {
            text: () => JSON.stringify(jsonObj),
        },
    });
}

/* ─────────── Tests ─────────── */
describe('POST /api/ai/screening', () => {
    let POST: any;

    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'test-api-key-12345';
        const route = require('@/app/api/ai/screening/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-api-key-12345';
        mockSingle.mockResolvedValue({ data: { is_verified: true, role: 'donor' }, error: null });
    });

    /* ── API Key ── */
    describe('API Key validation', () => {
        it('should return 500 when GEMINI_API_KEY is missing', async () => {
            delete process.env.GEMINI_API_KEY;

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            const res = await POST(req);

            expect(res.status).toBe(500);
            const data = await res.json();
            expect(data.error).toBeDefined();
            expect(data.error).toContain('API Key');
        });
    });

    /* ── Eligible (đủ điều kiện) ── */
    describe('Eligible response', () => {
        it('should return eligible when all answers are safe', async () => {
            const aiOutput = {
                status: 'eligible',
                score: 95,
                analysis: 'Tất cả chỉ số sức khỏe đều ở mức an toàn. Bạn hoàn toàn phù hợp hiến máu.',
                recommendations: ['Uống đủ nước trước khi hiến', 'Ăn nhẹ trước 2 tiếng'],
            };
            mockAIResponse(aiOutput);

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('eligible');
            expect(data.score).toBe(95);
            expect(data.analysis).toBeDefined();
            expect(data.recommendations).toHaveLength(2);
        });
    });

    /* ── Ineligible (không đủ điều kiện) ── */
    describe('Ineligible response', () => {
        it('should return ineligible when answers have high severity', async () => {
            const aiOutput = {
                status: 'ineligible',
                score: 10,
                analysis: 'Phát hiện nhiều yếu tố nguy cơ cao. Bạn chưa đủ điều kiện hiến máu.',
                recommendations: ['Điều trị dứt bệnh trước', 'Tham khảo bác sĩ'],
            };
            mockAIResponse(aiOutput);

            const req = createRequest({ answers: HIGH_RISK_ANSWERS, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('ineligible');
            expect(data.score).toBeLessThan(50);
            expect(data.recommendations.length).toBeGreaterThanOrEqual(1);
        });
    });

    /* ── Warning ── */
    describe('Warning response', () => {
        it('should return warning when answers are mixed', async () => {
            const aiOutput = {
                status: 'warning',
                score: 65,
                analysis: 'Một số chỉ số cần theo dõi thêm.',
                recommendations: ['Nghỉ ngơi thêm', 'Kiểm tra lại huyết áp'],
            };
            mockAIResponse(aiOutput);

            const mixedAnswers = {
                ...SAFE_ANSWERS,
                1: { value: 'mild_tired', severity: 'moderate', id: 1 },
                6: { value: 'low_mild', severity: 'mild', id: 6 },
            };

            const req = createRequest({ answers: mixedAnswers, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('warning');
            expect(data.score).toBeGreaterThanOrEqual(50);
            expect(data.score).toBeLessThan(90);
        });
    });

    /* ── AI trả JSON lẫn markdown code block ── */
    describe('Handles AI response with markdown wrapper', () => {
        it('should parse JSON wrapped in ```json code block', async () => {
            const jsonObj = {
                status: 'eligible',
                score: 88,
                analysis: 'Sức khỏe tốt.',
                recommendations: ['Uống nước'],
            };
            // Giả lập AI trả về với markdown wrapper
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => '```json\n' + JSON.stringify(jsonObj) + '\n```',
                },
            });

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('eligible');
            expect(data.score).toBe(88);
        });
    });

    /* ── AI trả ra text không hợp lệ ── */
    describe('AI returns invalid response', () => {
        it('should fallback when AI returns non-JSON text', async () => {
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => 'Xin lỗi, tôi không thể phân tích được.',
                },
            });

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            // Fallback response
            expect(res.status).toBe(200);
            expect(data.status).toBe('warning');
            expect(data.score).toBe(50);
        });
    });

    /* ── AI service lỗi hoàn toàn ── */
    describe('AI service error', () => {
        it('should return fallback when Gemini throws error', async () => {
            mockGenerateContent.mockRejectedValue(new Error('Gemini quota exceeded'));

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('warning');
            expect(data.score).toBe(50);
            expect(data.analysis).toBeDefined();
            expect(data.recommendations).toBeDefined();
        });
    });

    /* ── Tách đúng trắc nghiệm vs tự luận ── */
    describe('Answer separation', () => {
        it('should call AI with separated choice and text answers', async () => {
            const aiOutput = {
                status: 'eligible',
                score: 90,
                analysis: 'OK',
                recommendations: [],
            };
            mockAIResponse(aiOutput);

            const req = createRequest({ answers: SAFE_ANSWERS, userId: 'test-user' });
            await POST(req);

            // Kiểm tra generateContent được gọi đúng 1 lần 
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);

            // Kiểm tra prompt chứa cả 2 phần dữ liệu
            const promptArg = mockGenerateContent.mock.calls[0][0];
            expect(promptArg).toContain('Dữ liệu trắc nghiệm');
            expect(promptArg).toContain('Dữ liệu tự luận');
            // Kiểm tra có chứa data thực tế
            expect(promptArg).toContain('very_good');
            expect(promptArg).toContain('Tôi rất khỏe mạnh');
        });
    });

    /* ── Empty answers ── */
    describe('Edge cases', () => {
        it('should handle empty answers object', async () => {
            const aiOutput = {
                status: 'warning',
                score: 0,
                analysis: 'Không có dữ liệu.',
                recommendations: ['Vui lòng hoàn thành bài test'],
            };
            mockAIResponse(aiOutput);

            const req = createRequest({ answers: {}, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toBeDefined();
        });

        it('should handle partial answers (only choice)', async () => {
            const partialAnswers: Record<string, any> = {};
            for (let i = 1; i <= 10; i++) {
                partialAnswers[i] = SAFE_ANSWERS[i as keyof typeof SAFE_ANSWERS];
            }

            const aiOutput = {
                status: 'warning',
                score: 70,
                analysis: 'Chỉ có phần trắc nghiệm, thiếu thông tin tự luận.',
                recommendations: ['Bổ sung phần tự luận'],
            };
            mockAIResponse(aiOutput);

            const req = createRequest({ answers: partialAnswers, userId: 'test-user' });
            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.status).toBe('warning');
        });
    });
});

export { };
