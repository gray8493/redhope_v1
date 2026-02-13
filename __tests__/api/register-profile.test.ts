/**
 * Test: POST /api/auth/register-profile
 * Kiểm tra API đăng ký profile cho user mới
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

// Mock Supabase Admin
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

const mockSupabaseAdmin = {
    from: jest.fn(() => ({
        upsert: mockUpsert.mockReturnValue({
            select: mockSelect.mockReturnValue({
                single: mockSingle,
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
    });

    /* ── Validation ── */
    it('should return 400 when userId is missing', async () => {
        const req = createRequest({ email: 'test@email.com' });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when email is missing', async () => {
        const req = createRequest({ userId: 'user-123' });
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
            userId: 'user-123',
            email: 'donor@example.com',
            fullName: 'Trần Văn B',
            role: 'donor',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.email).toBe('donor@example.com');
    });

    it('should create hospital profile with null points', async () => {
        const mockUser = {
            id: 'hospital-123',
            email: 'hospital@example.com',
            full_name: 'Bệnh viện ABC',
            role: 'hospital',
            current_points: null,
        };

        mockSingle.mockResolvedValue({ data: mockUser, error: null });

        const req = createRequest({
            userId: 'hospital-123',
            email: 'hospital@example.com',
            fullName: 'Bệnh viện ABC',
            role: 'hospital',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        // Kiểm tra upsert được gọi với current_points = null cho hospital
        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                role: 'hospital',
                current_points: null,
            }),
            expect.any(Object)
        );
    });

    it('should default role to donor when not provided', async () => {
        mockSingle.mockResolvedValue({ data: { id: 'u1', role: 'donor' }, error: null });

        const req = createRequest({
            userId: 'u1',
            email: 'test@example.com',
            fullName: 'Test User',
        });

        await POST(req);

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'donor' }),
            expect.any(Object)
        );
    });

    /* ── DB Error ── */
    it('should return 500 when database upsert fails', async () => {
        mockSingle.mockResolvedValue({
            data: null,
            error: { message: 'duplicate key violation' },
        });

        const req = createRequest({
            userId: 'user-999',
            email: 'fail@example.com',
            fullName: 'Fail User',
        });

        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toContain('duplicate key');
    });

    /* ── Exception ── */
    it('should return 500 on unexpected error', async () => {
        const req = {
            json: async () => { throw new Error('JSON parse error'); },
        } as any;

        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toContain('JSON parse error');
    });
});

export { };
