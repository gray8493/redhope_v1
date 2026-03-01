/**
 * Test: POST /api/donation/complete-notification
 * Updated for security-hardened route (hospitalId from JWT, donorId from body)
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
        user: { id: 'hospital-001', email: 'hospital@redhope.vn', role: 'hospital' },
        error: null,
    }),
    requireRole: jest.fn().mockResolvedValue({
        user: { id: 'hospital-001', email: 'hospital@redhope.vn', role: 'hospital' },
        error: null,
    }),
}));

// Mock SendGrid
const mockSend = jest.fn();
jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: mockSend
}));

// Mock React Email
jest.mock('@react-email/render', () => ({
    render: jest.fn(() => Promise.resolve('<html>Email</html>')),
}));

// Mock Supabase Admin
const mockFrom = jest.fn();
jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: mockFrom
    }
}));

/* ─────────── Helpers ─────────── */
function createRequest(body: any): Request {
    return { json: async () => body } as any;
}

const createMockChain = (resolvedData?: any, resolvedError?: any) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: resolvedData ?? null, error: resolvedError ?? null })
});

/* ─────────── Tests ─────────── */
describe('POST /api/donation/complete-notification', () => {
    let POST: any;

    beforeAll(() => {
        process.env.SENDGRID_API_KEY = 'SG.test';
        const route = require('@/app/api/donation/complete-notification/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SENDGRID_API_KEY = 'SG.test';
    });

    it('should return 500 when SENDGRID_API_KEY is missing', async () => {
        delete process.env.SENDGRID_API_KEY;
        const req = createRequest({ donorId: '1' });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.message).toContain('not configured');
    });

    it('should return 400 when donorId is missing', async () => {
        const req = createRequest({});
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('donorId');
    });

    it('should return 404 when donor email not found', async () => {
        mockFrom.mockReturnValue(createMockChain(null));

        const req = createRequest({ donorId: 'd1' });
        const res = await POST(req);

        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toContain('not found');
    });

    it('should send email successfully', async () => {
        const mockDonor = { full_name: 'Nguyen Van A', email: 'a@example.com' };
        const mockHospital = { hospital_name: 'BV Bach Mai' };

        mockFrom
            .mockReturnValueOnce(createMockChain(mockDonor))
            .mockReturnValueOnce(createMockChain(mockHospital));

        mockSend.mockResolvedValue({});

        const req = createRequest({ donorId: 'd1', volumeMl: 350 });
        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'a@example.com',
                subject: expect.stringContaining('hiến máu thành công')
            })
        );
    });

    it('should handle SendGrid error gracefully', async () => {
        const mockDonor = { full_name: 'Nguyen Van A', email: 'a@example.com' };
        const mockHospital = { hospital_name: 'BV Bach Mai' };

        mockFrom
            .mockReturnValueOnce(createMockChain(mockDonor))
            .mockReturnValueOnce(createMockChain(mockHospital));

        mockSend.mockRejectedValue(new Error('SendGrid Error'));

        const req = createRequest({ donorId: 'd1' });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        // Route returns generic error message for security
        expect(data.error).toBe('Internal Server Error');
    });
});

export { };
