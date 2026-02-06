import { bloodService } from '@/services/blood.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

// Mock fetch for notification
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
    } as Response)
) as jest.Mock;

describe('bloodService', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabaseQuery = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
    });

    describe('completeDonation', () => {
        test('should create donation record successfully', async () => {
            const mockRecord = {
                id: 'record-1',
                appointment_id: 'apt-1',
                donor_id: 'donor-1',
                hospital_id: 'hospital-1',
                volume_ml: 450,
            };

            mockSupabaseQuery.single.mockResolvedValue({ data: mockRecord, error: null });

            const result = await bloodService.completeDonation(
                'apt-1',
                'donor-1',
                'hospital-1',
                450
            );

            expect(supabase.from).toHaveBeenCalledWith('donation_records');
            expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    appointment_id: 'apt-1',
                    donor_id: 'donor-1',
                    hospital_id: 'hospital-1',
                    volume_ml: 450,
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRecord);
        });

        test('should trigger notification API call', async () => {
            mockSupabaseQuery.single.mockResolvedValue({
                data: { id: 'record-1' },
                error: null
            });

            await bloodService.completeDonation('apt-1', 'donor-1', 'hospital-1', 450);

            // Wait for async fetch
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/donation/complete-notification',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        test('should throw error when insert fails', async () => {
            const dbError = { message: 'Insert failed', details: 'constraint' };
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: dbError });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(
                bloodService.completeDonation('apt-1', 'donor-1', 'hospital-1', 450)
            ).rejects.toEqual(dbError);

            consoleSpy.mockRestore();
        });

        test('should still succeed even if notification API fails', async () => {
            mockSupabaseQuery.single.mockResolvedValue({
                data: { id: 'record-1' },
                error: null
            });

            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await bloodService.completeDonation('apt-1', 'donor-1', 'hospital-1', 450);

            expect(result.success).toBe(true);

            consoleSpy.mockRestore();
        });
    });

    describe('getHospitalStats', () => {
        test('should return hospital donation stats', async () => {
            const mockStats = [
                { volume_ml: 450, blood_group_confirmed: 'O+' },
                { volume_ml: 350, blood_group_confirmed: 'A+' },
            ];

            mockSupabaseQuery.eq.mockResolvedValue({ data: mockStats, error: null });

            const result = await bloodService.getHospitalStats('hospital-1');

            expect(supabase.from).toHaveBeenCalledWith('donation_records');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('volume_ml, blood_group_confirmed');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('hospital_id', 'hospital-1');
            expect(result).toEqual(mockStats);
        });

        test('should return empty array when no data', async () => {
            mockSupabaseQuery.eq.mockResolvedValue({ data: null, error: null });

            const result = await bloodService.getHospitalStats('hospital-1');
            expect(result).toEqual([]);
        });

        test('should throw error on database error', async () => {
            const dbError = { message: 'Database error' };
            mockSupabaseQuery.eq.mockResolvedValue({ data: null, error: dbError });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(bloodService.getHospitalStats('hospital-1')).rejects.toEqual(dbError);

            consoleSpy.mockRestore();
        });
    });

    describe('getDonorStats', () => {
        test('should return donor donation stats', async () => {
            const mockStats = [
                { volume_ml: 450, verified_at: '2026-01-01' },
                { volume_ml: 350, verified_at: '2025-10-01' },
            ];

            mockSupabaseQuery.eq.mockResolvedValue({ data: mockStats, error: null });

            const result = await bloodService.getDonorStats('donor-1');

            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('volume_ml, verified_at');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('donor_id', 'donor-1');
            expect(result).toEqual(mockStats);
        });

        test('should return empty array when no donations', async () => {
            mockSupabaseQuery.eq.mockResolvedValue({ data: [], error: null });

            const result = await bloodService.getDonorStats('donor-1');
            expect(result).toEqual([]);
        });
    });

    describe('getDonations', () => {
        test('should return donor donations with hospital info', async () => {
            const mockDonations = [
                {
                    id: 'donation-1',
                    donor_id: 'donor-1',
                    volume_ml: 450,
                    hospital: {
                        hospital_name: 'Hospital A',
                        city: 'HCM',
                        district: 'Q1',
                    },
                },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockDonations, error: null });

            const result = await bloodService.getDonations('donor-1');

            expect(mockSupabaseQuery.select).toHaveBeenCalledWith(expect.stringContaining('hospital:hospital_id'));
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('donor_id', 'donor-1');
            expect(mockSupabaseQuery.order).toHaveBeenCalledWith('verified_at', { ascending: false });
            expect(result).toEqual(mockDonations);
        });

        test('should return empty array when no donations', async () => {
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: null });

            const result = await bloodService.getDonations('donor-1');
            expect(result).toEqual([]);
        });

        test('should throw error on database error', async () => {
            const dbError = { message: 'Query failed' };
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: dbError });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(bloodService.getDonations('donor-1')).rejects.toEqual(dbError);

            consoleSpy.mockRestore();
        });
    });
});
