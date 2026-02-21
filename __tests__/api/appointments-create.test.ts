/**
 * Test: POST /api/appointments/create
 * Kiểm tra API tạo appointment đăng ký hiến máu
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

// Mock Supabase
const createMockChain = (resolvedData?: any, resolvedError?: any) => {
    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: resolvedData ?? null, error: resolvedError ?? null }),
    };
    return chain;
};

const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: mockFrom,
    })),
}));

/* ─────────── Test Data ─────────── */
const MOCK_CAMPAIGN = {
    id: 'campaign-001',
    name: 'Chiến dịch Xuân 2026',
    start_time: '2026-03-15T08:00:00Z',
    end_time: '2026-03-15T17:00:00Z',
    hospital_id: 'hospital-001',
    hospital: { hospital_name: 'Bệnh viện Bạch Mai' },
};

const MOCK_DONOR = {
    id: 'user-001',
    full_name: 'Nguyễn Văn A',
    email: 'donor@example.com',
};

const MOCK_APPOINTMENT = {
    id: 'appt-001',
    user_id: 'user-001',
    campaign_id: 'campaign-001',
    status: 'Booked',
    qr_code: 'QR-12345-user-001',
};

/* ─────────── Helpers ─────────── */
function createRequest(body: any): Request {
    return { json: async () => body } as any;
}

/* ─────────── Tests ─────────── */
describe('POST /api/appointments/create', () => {
    let POST: any;

    beforeAll(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        const route = require('@/app/api/appointments/create/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 when userId is missing', async () => {
        const req = createRequest({ campaignId: 'c1' });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when campaignId is missing', async () => {
        const req = createRequest({ userId: 'u1' });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Missing required fields');
    });

    it('should return 404 when campaign not found', async () => {
        const campaignChain = createMockChain(null, { message: 'not found' });
        mockFrom.mockReturnValueOnce(campaignChain);

        const req = createRequest({ userId: 'user-001', campaignId: 'invalid-id' });
        const res = await POST(req);

        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe('Campaign not found');
    });

    it('should return 404 when user not found', async () => {
        const campaignChain = createMockChain(MOCK_CAMPAIGN);
        const donorChain = createMockChain(null, { message: 'not found' });

        mockFrom
            .mockReturnValueOnce(campaignChain)
            .mockReturnValueOnce(donorChain);

        const req = createRequest({ userId: 'invalid-user', campaignId: 'campaign-001' });
        const res = await POST(req);

        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe('User not found');
    });

    it('should return 403 when donation interval not met', async () => {
        const campaignChain = createMockChain(MOCK_CAMPAIGN);
        const donorChain = createMockChain(MOCK_DONOR);
        const settingsChain = createMockChain({ donation_interval_months: 3 });
        // Last appointment was yesterday
        const lastApptChain = createMockChain({
            scheduled_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
        });

        mockFrom
            .mockReturnValueOnce(campaignChain)
            .mockReturnValueOnce(donorChain)
            .mockReturnValueOnce(settingsChain)
            .mockReturnValueOnce(lastApptChain);

        const req = createRequest({ userId: 'user-001', campaignId: 'campaign-001' });
        const res = await POST(req);

        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toContain('chưa đủ điều kiện');
    });

    it('should create appointment successfully when eligible', async () => {
        const campaignChain = createMockChain(MOCK_CAMPAIGN);
        const donorChain = createMockChain(MOCK_DONOR);
        const settingsChain = createMockChain({ donation_interval_months: 3 });
        // No last appointment
        const lastApptChain = createMockChain(null, null);
        // Insert appointment
        const insertChain = createMockChain(MOCK_APPOINTMENT);
        // Two notification inserts
        const notif1Chain = createMockChain(null);
        const notif2Chain = createMockChain(null);

        mockFrom
            .mockReturnValueOnce(campaignChain)
            .mockReturnValueOnce(donorChain)
            .mockReturnValueOnce(settingsChain)
            .mockReturnValueOnce(lastApptChain)
            .mockReturnValueOnce(insertChain)
            .mockReturnValueOnce(notif1Chain)
            .mockReturnValueOnce(notif2Chain);

        const req = createRequest({ userId: 'user-001', campaignId: 'campaign-001' });
        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.appointment).toBeDefined();
        expect(data.message).toContain('thành công');
    });

    it('should return 500 when appointment insert fails', async () => {
        const campaignChain = createMockChain(MOCK_CAMPAIGN);
        const donorChain = createMockChain(MOCK_DONOR);
        const settingsChain = createMockChain({ donation_interval_months: 3 });
        const lastApptChain = createMockChain(null, null);
        // Insert fails
        const insertChain = createMockChain(null, { message: 'insert failed' });

        mockFrom
            .mockReturnValueOnce(campaignChain)
            .mockReturnValueOnce(donorChain)
            .mockReturnValueOnce(settingsChain)
            .mockReturnValueOnce(lastApptChain)
            .mockReturnValueOnce(insertChain);

        const req = createRequest({ userId: 'user-001', campaignId: 'campaign-001' });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toBe('Failed to create appointment');
    });
});

export { };
