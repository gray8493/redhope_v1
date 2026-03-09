/**
 * Test: GET /api/hospital/screening/[userId]
 * Kiểm tra API xem kết quả sàng lọc AI của donor (cho bệnh viện)
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
const mockGetAuthenticatedUser = jest.fn();
jest.mock('@/lib/auth-helpers', () => ({
    getAuthenticatedUser: (...args: any[]) => mockGetAuthenticatedUser(...args),
}));

/* ─────────── Test Data ─────────── */
const MOCK_SCREENING_LOGS = [
    {
        id: 'log-1',
        user_id: 'donor-user-1',
        campaign_id: 'campaign-abc',
        appointment_id: null,
        ai_result: true,
        health_details: {
            score: 95,
            status: 'eligible',
            analysis: 'Sức khỏe tốt.',
            recommendations: ['Uống đủ nước'],
            answers: { 1: { value: 'very_good', severity: 'safe' } },
            analyzed_at: '2026-03-03T10:00:00Z',
        },
        created_at: '2026-03-03T10:00:00Z',
    },
];

const MOCK_DONOR = {
    id: 'donor-user-1',
    full_name: 'Nguyễn Văn A',
    email: 'donor@test.vn',
    phone: '0912345678',
    blood_group: 'O+',
    dob: '1995-01-15',
    gender: 'male',
    weight: 65,
    height: 170,
    health_history: null,
};

/* ─────────── Mock Supabase - Table-aware ─────────── */
// Track different behavior per table
let mockTableResults: Record<string, any> = {};

const createChainableMock = (result: any) => {
    const chainable: any = {};
    chainable.select = jest.fn(() => chainable);
    chainable.eq = jest.fn(() => chainable);
    chainable.order = jest.fn(() => chainable);
    chainable.limit = jest.fn(() => chainable);
    chainable.single = jest.fn(() => result);
    // For non-single queries (like screening_logs list), make it thenable
    chainable.then = (resolve: any) => resolve(result);
    return chainable;
};

const mockFrom = jest.fn((table: string) => {
    const result = mockTableResults[table] || { data: null, error: null };
    return createChainableMock(result);
});

jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: (...args: [string]) => mockFrom(...args),
    },
}));

/* ─────────── Helpers ─────────── */
function createGetRequest(userId: string, campaignId?: string): Request {
    const baseUrl = `http://localhost:3000/api/hospital/screening/${userId}`;
    const url = campaignId ? `${baseUrl}?campaignId=${campaignId}` : baseUrl;
    return { url, method: 'GET' } as any;
}

const makeParams = (userId: string) => Promise.resolve({ userId });

/* ─────────── Tests ─────────── */
describe('GET /api/hospital/screening/[userId]', () => {
    let GET: any;

    beforeAll(() => {
        const route = require('@/app/api/hospital/screening/[userId]/route');
        GET = route.GET;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Default: authenticated hospital user
        mockGetAuthenticatedUser.mockResolvedValue({
            user: { id: 'hospital-user-1', email: 'hospital@test.vn' },
            error: null,
        });

        // Default table results
        mockTableResults = {
            users: { data: { role: 'hospital' }, error: null },
            screening_logs: { data: MOCK_SCREENING_LOGS, error: null },
        };

        // Override mockFrom to return per-call results
        let callCount = 0;
        mockFrom.mockImplementation((table: string) => {
            if (table === 'users') {
                callCount++;
                if (callCount === 1) {
                    // First users call = caller role check
                    return createChainableMock({ data: mockTableResults.users?.data, error: null });
                } else {
                    // Second users call = donor profile
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
            }
            if (table === 'screening_logs') {
                return createChainableMock(mockTableResults.screening_logs);
            }
            return createChainableMock({ data: null, error: null });
        });
    });

    /* ── Authentication ── */
    describe('Authentication', () => {
        it('should return error when not authenticated', async () => {
            const authErrorResponse = {
                json: async () => ({ error: 'Unauthorized' }),
                status: 401,
            };
            mockGetAuthenticatedUser.mockResolvedValue({
                user: null,
                error: authErrorResponse,
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(401);
        });
    });

    /* ── Authorization ── */
    describe('Authorization', () => {
        it('should return 403 when caller is a donor', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: 'donor' }, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                return createChainableMock({ data: [], error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });
            const data = await res.json();

            expect(res.status).toBe(403);
            expect(data.error).toBeDefined();
        });

        it('should return 403 when caller role is null', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: null }, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                return createChainableMock({ data: [], error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(403);
        });

        it('should return 403 when callerProfile is null', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: null, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                return createChainableMock({ data: [], error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(403);
        });

        it('should allow access for hospital role', async () => {
            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(200);
        });

        it('should allow access for admin role', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: 'admin' }, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                if (table === 'screening_logs') {
                    return createChainableMock({ data: MOCK_SCREENING_LOGS, error: null });
                }
                return createChainableMock({ data: null, error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(200);
        });
    });

    /* ── Response format ── */
    describe('Response format', () => {
        it('should return donor and screening_logs fields', async () => {
            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toHaveProperty('donor');
            expect(data).toHaveProperty('screening_logs');
        });

        it('should return empty array when no screening logs', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: 'hospital' }, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                if (table === 'screening_logs') {
                    return createChainableMock({ data: [], error: null });
                }
                return createChainableMock({ data: null, error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.screening_logs).toEqual([]);
        });

        it('should return null donor when profile not found', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: 'hospital' }, error: null });
                    }
                    return createChainableMock({ data: null, error: null });
                }
                if (table === 'screening_logs') {
                    return createChainableMock({ data: MOCK_SCREENING_LOGS, error: null });
                }
                return createChainableMock({ data: null, error: null });
            });

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.donor).toBeNull();
        });
    });

    /* ── Error handling ── */
    describe('Error handling', () => {
        it('should return 500 when screening_logs query fails', async () => {
            let callCount = 0;
            mockFrom.mockImplementation((table: string) => {
                if (table === 'users') {
                    callCount++;
                    if (callCount === 1) {
                        return createChainableMock({ data: { role: 'hospital' }, error: null });
                    }
                    return createChainableMock({ data: MOCK_DONOR, error: null });
                }
                if (table === 'screening_logs') {
                    return createChainableMock({ data: null, error: { message: 'DB error' } });
                }
                return createChainableMock({ data: null, error: null });
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(500);

            consoleSpy.mockRestore();
        });
    });

    /* ── CampaignId ── */
    describe('CampaignId filtering', () => {
        it('should query screening_logs table', async () => {
            const req = createGetRequest('donor-user-1', 'campaign-abc');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(200);
            expect(mockFrom).toHaveBeenCalledWith('screening_logs');
        });

        it('should query without campaignId filter when not provided', async () => {
            const req = createGetRequest('donor-user-1');
            const res = await GET(req, { params: makeParams('donor-user-1') });

            expect(res.status).toBe(200);
            expect(mockFrom).toHaveBeenCalledWith('screening_logs');
        });
    });
});

export { };
