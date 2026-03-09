/**
 * Test: POST /api/auth/register-profile
 * Updated for security-hardened route (userId from JWT, role from DB)
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
const mockGetAuthenticatedUser = jest.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'test@redhope.vn', role: 'donor' },
    error: null,
});
jest.mock('@/lib/auth-helpers', () => ({
    getAuthenticatedUser: (...args: any[]) => mockGetAuthenticatedUser(...args),
    requireRole: jest.fn().mockResolvedValue({
        user: { id: 'user-123', email: 'test@redhope.vn', role: 'admin' },
        error: null,
    }),
}));

// Mock Supabase Admin
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockEq = jest.fn();

const mockSupabaseAdmin = {
    from: jest.fn(() => ({
        upsert: mockUpsert.mockReturnValue({
            select: mockSelect.mockReturnValue({
                single: mockSingle,
            }),
        }),
        select: jest.fn().mockReturnValue({
            eq: mockEq.mockReturnValue({
                maybeSingle: mockMaybeSingle,
            }),
        }),
    })),
};

jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: mockSupabaseAdmin,
}));

/* ─────────── Helpers ─────────── */
function createRequest(body: any): Request {
    return { json: async () => body } as any;
}

/* ─────────── Tests ─────────── */
describe('POST /api/auth/register-profile', () => {
    let POST: any;

    beforeAll(() => {
        const route = require('@/app/api/auth/register-profile/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAuthenticatedUser.mockResolvedValue({
            user: { id: 'user-123', email: 'test@redhope.vn', role: 'donor' },
            error: null,
        });
        // Default: no existing user in DB
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    });

    /* ── Validation ── */
    it('should return 400 when email is missing', async () => {
        const req = createRequest({ fullName: 'Test User' });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Missing required fields');
    });

    /* ── Success ── */
    it('should create donor profile successfully', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'donor@example.com',
            full_name: 'Trần Văn B',
            role: 'donor',
            current_points: 0,
        };

        mockSingle.mockResolvedValue({ data: mockUser, error: null });

        const req = createRequest({
            email: 'donor@example.com',
            fullName: 'Trần Văn B',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
    });

    it('should default role to donor when no existing user in DB', async () => {
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });
        mockSingle.mockResolvedValue({ data: { id: 'user-123', role: 'donor' }, error: null });

        const req = createRequest({
            email: 'test@example.com',
            fullName: 'Test User',
        });

        await POST(req);

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'donor' }),
            expect.any(Object)
        );
    });

    it('should preserve existing role from DB (prevents role injection)', async () => {
        mockMaybeSingle.mockResolvedValue({ data: { role: 'hospital' }, error: null });
        mockSingle.mockResolvedValue({ data: { id: 'user-123', role: 'hospital' }, error: null });

        const req = createRequest({
            email: 'hospital@example.com',
            fullName: 'Bệnh viện ABC',
        });

        await POST(req);

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'hospital' }),
            expect.any(Object)
        );
    });

    /* ── DB Error ── */
    it('should return 409 when database upsert fails with duplicate key', async () => {
        mockSingle.mockResolvedValue({
            data: null,
            error: { message: 'duplicate key violation' },
        });

        const req = createRequest({
            email: 'fail@example.com',
            fullName: 'Fail User',
        });

        const res = await POST(req);

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toContain('Email này đã có người đăng ký');
    });

    /* ── Exception ── */
    it('should return 500 on unexpected error', async () => {
        const req = {
            json: async () => { throw new Error('JSON parse error'); },
        } as any;

        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toContain('Internal server error');
    });
});

export { };
