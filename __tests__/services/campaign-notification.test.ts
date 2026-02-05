import { campaignService } from '@/services/campaign.service';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('@/services/notification.service', () => ({
    notificationService: {
        sendCampaignNotification: jest.fn().mockResolvedValue({ success: true }),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Campaign Automated Notification System', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSupabaseQuery = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

        // Mặc định fetch trả về thành công
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    test('Tính năng 1: Gửi email mời (invitation) khi tạo chiến dịch thành công', async () => {
        const campaignId = 'test-id-123';
        const campaignData = {
            name: 'Chiến dịch Tết Đoàn Viên',
            city: 'Hà Nội',
            hospital_id: 'hospital-abc'
        };

        mockSupabaseQuery.single.mockResolvedValue({
            data: { id: campaignId, ...campaignData },
            error: null,
        });

        // 1. Thực hiện tạo chiến dịch
        await campaignService.createCampaign(campaignData);

        // Đợi một chút vì triggerCampaignEmail chạy background (không await)
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Kiểm tra xem fetch có được gọi tới endpoint gửi thông báo không
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/campaign/send-announcement',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(String)
            })
        );

        // 3. Kiểm tra nội dung body gửi đi
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);

        expect(body).toEqual({
            campaignId: campaignId,
            message: expect.stringContaining('chiến dịch hiến máu mới'),
            notificationType: 'new_campaign_invite'
        });
    });

    test('Tính năng 2: Không gửi email nếu tạo chiến dịch thất bại (Lỗi DB)', async () => {
        mockSupabaseQuery.single.mockResolvedValue({
            data: null,
            error: { message: 'Database failure' },
        });

        const campaignData = { name: 'Fail Campaign' };

        // 1. Thực hiện tạo chiến dịch và bắt lỗi
        try {
            await campaignService.createCampaign(campaignData);
        } catch (e) {
            // Mong đợi lỗi xảy ra
        }

        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Kiểm tra fetch không được gọi
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('Tính năng 3: Đảm bảo email được gửi với nội dung mặc định tiếng Việt', async () => {
        const campaignId = 'vn-id-456';
        mockSupabaseQuery.single.mockResolvedValue({
            data: { id: campaignId, name: 'VN Campaign' },
            error: null,
        });

        await campaignService.createCampaign({ name: 'VN Campaign' });
        await new Promise(resolve => setTimeout(resolve, 50));

        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);

        // Kiểm tra ngôn ngữ và nội dung cốt lõi
        expect(body.message).toContain('Chúng tôi vừa tổ chức chiến dịch hiến máu mới');
        expect(body.message).toContain('cứu sống nhiều mảnh đời');
    });

    test('Tính năng 4: Hệ thống vẫn hoạt động dù API Mail gặp sự cố (Fail-safe)', async () => {
        mockSupabaseQuery.single.mockResolvedValue({
            data: { id: 'failsafe-id', name: 'Safe Campaign' },
            error: null,
        });

        // Giả lập API Mail trả về lỗi hoặc timeout
        (global.fetch as jest.Mock).mockRejectedValue(new Error('SMTP Timeout'));

        // Kiểm tra xem createCampaign vẫn trả về dữ liệu bình thường, không crash app
        const result = await campaignService.createCampaign({ name: 'Safe Campaign' });

        expect(result).toBeDefined();
        expect(result.id).toBe('failsafe-id');

        // Đảm bảo fetch vẫn được gọi nhưng lỗi đã được catch âm thầm trong service
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(global.fetch).toHaveBeenCalled();
    });
});
