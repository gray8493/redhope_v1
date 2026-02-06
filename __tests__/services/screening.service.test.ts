import { screeningService } from '@/services/screening.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
            updateUser: jest.fn(),
        },
    },
}));

describe('screeningService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Date.now() để test expiry
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-02-06T10:00:00Z').getTime());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getScreeningStatus', () => {
        test('should return screening status from user metadata', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'passed',
                    screening_verified_at: '2026-02-06T09:00:00Z', // 1 hour ago
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.getScreeningStatus('user-1');

            expect(result.status).toBe('passed');
            expect(result.verified_at).toBe('2026-02-06T09:00:00Z');
        });

        test('should auto-expire screening after 24 hours', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'passed',
                    screening_verified_at: '2026-02-04T09:00:00Z', // More than 24h ago
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

            const result = await screeningService.getScreeningStatus('user-1');

            expect(result.status).toBe('not_done');
            expect(result.verified_at).toBeNull();
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: {
                    screening_status: 'not_done',
                    screening_verified_at: null,
                },
            });
        });

        test('should return not_done when no metadata', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {},
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.getScreeningStatus('user-1');

            expect(result.status).toBe('not_done');
            expect(result.verified_at).toBeNull();
        });

        test('should return not_done when user fetch fails', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: { message: 'User not found' },
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await screeningService.getScreeningStatus('user-1');

            expect(result.status).toBe('not_done');
            expect(result.verified_at).toBeNull();

            consoleSpy.mockRestore();
        });

        test('should return not_done when user ID mismatch', async () => {
            const mockUser = {
                id: 'different-user',
                user_metadata: {
                    screening_status: 'passed',
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.getScreeningStatus('user-1');

            expect(result.status).toBe('not_done');
        });
    });

    describe('updateScreeningStatus', () => {
        test('should update status to passed with timestamp', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

            const result = await screeningService.updateScreeningStatus('user-1', 'passed');

            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: {
                    screening_status: 'passed',
                    screening_verified_at: expect.any(String),
                },
            });
            expect(result).toBe(true);
        });

        test('should update status to failed without timestamp', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

            const result = await screeningService.updateScreeningStatus('user-1', 'failed');

            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: {
                    screening_status: 'failed',
                    screening_verified_at: null,
                },
            });
            expect(result).toBe(true);
        });

        test('should update status to not_done without timestamp', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

            const result = await screeningService.updateScreeningStatus('user-1', 'not_done');

            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: {
                    screening_status: 'not_done',
                    screening_verified_at: null,
                },
            });
            expect(result).toBe(true);
        });

        test('should return false when update fails', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
                error: { message: 'Update failed' },
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await screeningService.updateScreeningStatus('user-1', 'passed');

            expect(result).toBe(false);

            consoleSpy.mockRestore();
        });
    });

    describe('checkEligibility', () => {
        test('should return eligible when status is passed', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'passed',
                    screening_verified_at: '2026-02-06T09:00:00Z',
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.checkEligibility('user-1');

            expect(result.eligible).toBe(true);
            expect(result.status).toBe('passed');
            expect(result.reason).toContain('đủ điều kiện');
        });

        test('should return not eligible when status is failed', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'failed',
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.checkEligibility('user-1');

            expect(result.eligible).toBe(false);
            expect(result.status).toBe('failed');
            expect(result.reason).toContain('chưa đủ điều kiện');
        });

        test('should return not eligible when status is not_done', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'not_done',
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await screeningService.checkEligibility('user-1');

            expect(result.eligible).toBe(false);
            expect(result.status).toBe('not_done');
            expect(result.reason).toContain('chưa thực hiện');
        });

        test('should return not eligible when screening expired', async () => {
            const mockUser = {
                id: 'user-1',
                user_metadata: {
                    screening_status: 'passed',
                    screening_verified_at: '2026-02-04T09:00:00Z', // Expired
                },
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

            const result = await screeningService.checkEligibility('user-1');

            expect(result.eligible).toBe(false);
            expect(result.status).toBe('not_done');
        });
    });
});
