import { pointService } from '@/services/point.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('pointService', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabaseQuery = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
    });

    describe('getAll', () => {
        test('should return all vouchers', async () => {
            const mockVouchers = [
                { id: '1', title: 'Voucher 1' },
                { id: '2', title: 'Voucher 2' },
            ];
            mockSupabaseQuery.order.mockResolvedValue({ data: mockVouchers, error: null });

            const result = await pointService.getAll();

            expect(supabase.from).toHaveBeenCalledWith('vouchers');
            expect(result).toEqual(mockVouchers);
        });

        test('should throw error on database error', async () => {
            const dbError = { message: 'Error' };
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: dbError });

            await expect(pointService.getAll()).rejects.toEqual(dbError);
        });
    });

    describe('getById', () => {
        test('should return voucher when found', async () => {
            const mockVoucher = { id: 'voucher-1', title: 'Test Voucher' };
            mockSupabaseQuery.single.mockResolvedValue({ data: mockVoucher, error: null });

            const result = await pointService.getById('voucher-1');

            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'voucher-1');
            expect(result).toEqual(mockVoucher);
        });

        test('should return null when not found', async () => {
            mockSupabaseQuery.single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
            });

            const result = await pointService.getById('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create voucher', async () => {
            const newVoucher = { title: 'New Voucher', point_cost: 100 };
            const created = { id: 'new-id', ...newVoucher };

            mockSupabaseQuery.single.mockResolvedValue({ data: created, error: null });

            const result = await pointService.create(newVoucher as any);
            expect(result).toEqual(created);
        });
    });

    describe('update', () => {
        test('should update voucher', async () => {
            const updates = { title: 'Updated' };
            const updated = { id: 'v-1', title: 'Updated' };

            mockSupabaseQuery.single.mockResolvedValue({ data: updated, error: null });

            const result = await pointService.update('v-1', updates as any);
            expect(result).toEqual(updated);
        });
    });

    describe('delete', () => {
        test('should delete voucher when exists', async () => {
            mockSupabaseQuery.select.mockResolvedValue({ data: [{ id: 'v-1' }], error: null });

            await expect(pointService.delete('v-1')).resolves.not.toThrow();
        });

        test('should throw error when voucher not found', async () => {
            mockSupabaseQuery.select.mockResolvedValue({ data: [], error: null });

            await expect(pointService.delete('non-existent')).rejects.toThrow(
                'Voucher not found or already deleted'
            );
        });
    });

    describe('calculatePoints', () => {
        test('should return 100 points', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await pointService.calculatePoints({ volume: 450 });

            expect(result).toBe(100);
            consoleSpy.mockRestore();
        });
    });

    describe('redeemVoucher', () => {
        test('should redeem voucher successfully', async () => {
            const mockVoucher = { id: 'v-1', point_cost: 50, stock_quantity: 10 };
            const mockUser = { id: 'u-1', current_points: 100 };
            const mockRedemption = { id: 'r-1', status: 'Redeemed' };

            // Mock chain for single() after eq()
            const createMockChain = (resolveData: any) => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(resolveData),
            });

            // Setup mocks for Promise.all queries
            (supabase.from as jest.Mock)
                .mockReturnValueOnce(createMockChain({ data: mockVoucher, error: null }))  // vouchers query
                .mockReturnValueOnce(createMockChain({ data: mockUser, error: null }));    // users query

            // Mock update for points deduction
            (supabase.from as jest.Mock).mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ error: null }),
            });

            // Mock insert for redemption
            (supabase.from as jest.Mock).mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockRedemption, error: null }),
            });

            // Mock update for stock quantity
            (supabase.from as jest.Mock).mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ error: null }),
            });

            const result = await pointService.redeemVoucher('u-1', 'v-1');

            expect(result.success).toBe(true);
            expect(result.redemption).toEqual(mockRedemption);
        });

        test('should throw error when not enough points', async () => {
            const mockVoucher = { id: 'v-1', point_cost: 200, stock_quantity: 10 };
            const mockUser = { id: 'u-1', current_points: 50 };

            const createMockChain = (resolveData: any) => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(resolveData),
            });

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(createMockChain({ data: mockVoucher, error: null }))
                .mockReturnValueOnce(createMockChain({ data: mockUser, error: null }));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(pointService.redeemVoucher('u-1', 'v-1')).rejects.toThrow(
                'Bạn không đủ điểm để đổi voucher này'
            );

            consoleSpy.mockRestore();
        });

        test('should throw error when voucher out of stock', async () => {
            const mockVoucher = { id: 'v-1', point_cost: 50, stock_quantity: 0 };
            const mockUser = { id: 'u-1', current_points: 100 };

            const createMockChain = (resolveData: any) => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(resolveData),
            });

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(createMockChain({ data: mockVoucher, error: null }))
                .mockReturnValueOnce(createMockChain({ data: mockUser, error: null }));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(pointService.redeemVoucher('u-1', 'v-1')).rejects.toThrow(
                'Voucher đã hết lượt đổi'
            );

            consoleSpy.mockRestore();
        });
    });

    describe('getRedemptions', () => {
        test('should return user redemptions', async () => {
            const mockRedemptions = [
                { id: 'r-1', voucher_id: 'v-1', status: 'Redeemed' },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockRedemptions, error: null });

            const result = await pointService.getRedemptions('u-1');

            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'u-1');
            expect(result).toEqual(mockRedemptions);
        });

        test('should return empty array on permission error', async () => {
            mockSupabaseQuery.order.mockResolvedValue({
                data: null,
                error: { code: '42501' }
            });

            const result = await pointService.getRedemptions('u-1');
            expect(result).toEqual([]);
        });

        test('should return empty array on empty error object', async () => {
            mockSupabaseQuery.order.mockResolvedValue({
                data: null,
                error: {}
            });

            const result = await pointService.getRedemptions('u-1');
            expect(result).toEqual([]);
        });
    });
});
