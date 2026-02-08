import { settingService } from '@/services/setting.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('settingService', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabaseQuery = {
            select: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
    });

    describe('getSettings', () => {
        test('should return settings from database', async () => {
            const mockSettings = {
                id: 1,
                low_stock_alert: true,
                donation_reminder: true,
                emergency_broadcast: false,
                ai_sensitivity: 7,
                min_hemoglobin: 12.5,
                min_weight: 50,
                question_version: 'V4.2',
                points_per_donation: 1000,
                referral_bonus: 250,
                exchange_rate: 500,
                points_expiry: true,
                donation_interval_months: 3,
                two_factor_auth: 'Bắt buộc cho tất cả Quản trị viên',
            };

            mockSupabaseQuery.single.mockResolvedValue({ data: mockSettings, error: null });

            const result = await settingService.getSettings();

            expect(supabase.from).toHaveBeenCalledWith('system_settings');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 1);
            expect(result).toEqual(mockSettings);
        });

        test('should return default settings when database error', async () => {
            const dbError = { message: 'Database error' };
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: dbError });

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = await settingService.getSettings();

            expect(result).toEqual({
                low_stock_alert: false,
                donation_reminder: true,
                emergency_broadcast: false,
                ai_sensitivity: 7,
                min_hemoglobin: 12.5,
                min_weight: 50,
                question_version: 'V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)',
                points_per_donation: 1000,
                referral_bonus: 250,
                exchange_rate: 500,
                points_expiry: true,
                donation_interval_months: 3,
                two_factor_auth: 'Bắt buộc cho tất cả Quản trị viên',
            });

            consoleSpy.mockRestore();
        });

        test('should return default settings when no data', async () => {
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = await settingService.getSettings();

            expect(result.ai_sensitivity).toBe(7);
            expect(result.points_per_donation).toBe(1000);

            consoleSpy.mockRestore();
        });
    });

    describe('updateSettings', () => {
        test('should update settings successfully', async () => {
            const updates = {
                low_stock_alert: true,
                ai_sensitivity: 8,
                donation_interval_months: 4,
            };

            mockSupabaseQuery.upsert.mockResolvedValue({ error: null });

            await settingService.updateSettings(updates);

            expect(supabase.from).toHaveBeenCalledWith('system_settings');
            expect(mockSupabaseQuery.upsert).toHaveBeenCalledWith({
                id: 1,
                ...updates,
                updated_at: expect.any(String),
            });
        });

        test('should include updated_at timestamp', async () => {
            const updates = { ai_sensitivity: 9 };
            mockSupabaseQuery.upsert.mockResolvedValue({ error: null });

            await settingService.updateSettings(updates);

            const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];
            expect(upsertCall.updated_at).toBeDefined();
            expect(typeof upsertCall.updated_at).toBe('string');
        });

        test('should throw error when update fails', async () => {
            const dbError = { message: 'Update failed' };
            mockSupabaseQuery.upsert.mockResolvedValue({ error: dbError });

            await expect(settingService.updateSettings({ ai_sensitivity: 10 })).rejects.toEqual(
                dbError
            );
        });

        test('should update all setting types', async () => {
            const updates = {
                low_stock_alert: false,
                donation_reminder: false,
                emergency_broadcast: true,
                ai_sensitivity: 5,
                min_hemoglobin: 13.0,
                min_weight: 55,
                question_version: 'V5.0',
                points_per_donation: 1500,
                referral_bonus: 300,
                exchange_rate: 600,
                points_expiry: false,
                donation_interval_months: 2,
                two_factor_auth: 'Tùy chọn',
            };

            mockSupabaseQuery.upsert.mockResolvedValue({ error: null });

            await expect(settingService.updateSettings(updates)).resolves.not.toThrow();

            const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];
            expect(upsertCall).toMatchObject(updates);
        });

        test('should handle partial updates', async () => {
            const partialUpdates = {
                ai_sensitivity: 6,
            };

            mockSupabaseQuery.upsert.mockResolvedValue({ error: null });

            await settingService.updateSettings(partialUpdates);

            const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];
            expect(upsertCall.ai_sensitivity).toBe(6);
            expect(upsertCall.updated_at).toBeDefined();
        });
    });
});
