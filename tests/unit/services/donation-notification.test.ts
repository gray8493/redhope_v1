import { bloodService } from '@/services/blood.service';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Donation Completion Notification System', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSupabaseQuery = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    test('Xác nhận: Gửi email chúc mừng khi hiến máu thành công', async () => {
        const appointmentId = 'app-123';
        const donorId = 'donor-456';
        const hospitalId = 'hosp-789';
        const volumeMl = 350;

        // Mock chèn dữ liệu vào donation_records thành công
        mockSupabaseQuery.single.mockResolvedValue({
            data: { id: 'rec-1', donor_id: donorId },
            error: null,
        });

        // 1. Thực hiện hoàn thành hiến máu
        await bloodService.completeDonation(appointmentId, donorId, hospitalId, volumeMl);

        // Đợi background fetch
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Kiểm tra xem fetch có được gọi tới endpoint thông báo hiến máu không
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/donation/complete-notification',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining(donorId),
            })
        );

        // 3. Kiểm tra các tham số quan trọng trong body
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);

        expect(body).toEqual({
            donorId: donorId,
            hospitalId: hospitalId,
            volumeMl: volumeMl
        });
    });

    test('Đảm bảo: Hệ thống không bị treo nếu API mail thất bại', async () => {
        mockSupabaseQuery.single.mockResolvedValue({
            data: { id: 'rec-2' },
            error: null,
        });

        // Giả lập API mail bị lỗi
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

        // Hàm này sẽ không throw error vì fetch được bọc trong .catch()
        const result = await bloodService.completeDonation('a', 'b', 'c', 450);

        expect(result.success).toBe(true);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(global.fetch).toHaveBeenCalled();
    });
});
