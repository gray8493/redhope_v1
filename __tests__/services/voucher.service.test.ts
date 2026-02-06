import { voucherService } from '@/services/voucher.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('voucherService', () => {
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
        test('should return all vouchers ordered by created_at', async () => {
            const mockVouchers = [
                { id: '1', title: 'Voucher 1', point_cost: 100 },
                { id: '2', title: 'Voucher 2', point_cost: 200 },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockVouchers, error: null });

            const result = await voucherService.getAll();

            expect(supabase.from).toHaveBeenCalledWith('vouchers');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual(mockVouchers);
        });

        test('should throw error with message on database error', async () => {
            const dbError = { message: 'Database error' };
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: dbError });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            await expect(voucherService.getAll()).rejects.toThrow('Database error');
            consoleSpy.mockRestore();
        });
    });

    describe('create', () => {
        test('should create voucher and return it', async () => {
            const newVoucher = { title: 'New Voucher', point_cost: 150 };
            const createdVoucher = { id: 'new-id', ...newVoucher };

            mockSupabaseQuery.single.mockResolvedValue({ data: createdVoucher, error: null });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await voucherService.create(newVoucher as any);

            expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(newVoucher);
            expect(result).toEqual(createdVoucher);
            consoleSpy.mockRestore();
        });

        test('should throw error when no data returned', async () => {
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            await expect(voucherService.create({} as any)).rejects.toThrow(
                'Không nhận được dữ liệu sau khi tạo voucher'
            );
            consoleSpy.mockRestore();
        });

        test('should throw error on database error', async () => {
            const dbError = { message: 'Validation failed', details: 'bad data' };
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: dbError });

            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(voucherService.create({} as any)).rejects.toThrow('Validation failed');

            consoleLogSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('update', () => {
        test('should update voucher and return it', async () => {
            const updates = { title: 'Updated Voucher' };
            const updatedVoucher = { id: 'voucher-1', title: 'Updated Voucher' };

            mockSupabaseQuery.single.mockResolvedValue({ data: updatedVoucher, error: null });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await voucherService.update('voucher-1', updates as any);

            expect(mockSupabaseQuery.update).toHaveBeenCalledWith(updates);
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'voucher-1');
            expect(result).toEqual(updatedVoucher);
            consoleSpy.mockRestore();
        });

        test('should throw error when no data returned', async () => {
            mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            await expect(voucherService.update('id', {} as any)).rejects.toThrow(
                'Không nhận được dữ liệu sau khi cập nhật voucher'
            );
            consoleSpy.mockRestore();
        });
    });

    describe('delete', () => {
        test('should delete voucher without error', async () => {
            mockSupabaseQuery.eq.mockResolvedValue({ error: null });

            const result = await voucherService.delete('voucher-1');

            expect(mockSupabaseQuery.delete).toHaveBeenCalled();
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'voucher-1');
            expect(result).toBeUndefined();
        });

        test('should throw error on deletion failure', async () => {
            const dbError = { message: 'Cannot delete voucher' };
            mockSupabaseQuery.eq.mockResolvedValue({ error: dbError });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            await expect(voucherService.delete('voucher-1')).rejects.toThrow('Cannot delete voucher');
            consoleSpy.mockRestore();
        });
    });
});
