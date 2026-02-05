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
        sendCampaignNotification: jest.fn(),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('campaignService.createCampaign', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Supabase query chain
        mockSupabaseQuery = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

        // Mock fetch
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should create campaign and automatically send email invitation', async () => {
        const campaignData = {
            name: 'Hiến Máu Xuân 2026',
            hospital_id: 'hospital-123',
            city: 'TP. Hồ Chí Minh',
            target_blood_group: ['A+', 'O+'],
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
            location_name: 'Bệnh viện Chợ Rẫy',
            status: 'active',
        };

        const createdCampaign = {
            id: 'campaign-123',
            ...campaignData,
        };

        // Mock successful campaign creation
        mockSupabaseQuery.single.mockResolvedValue({
            data: createdCampaign,
            error: null,
        });

        // Execute
        const result = await campaignService.createCampaign(campaignData);

        // Assertions
        expect(result).toEqual(createdCampaign);
        expect(supabase.from).toHaveBeenCalledWith('campaigns');
        expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(campaignData);

        // Wait for async fetch to be called
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify email API was called with correct parameters
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/campaign/send-announcement',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('new_campaign_invite'),
            })
        );

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const bodyData = JSON.parse(fetchCall[1].body);
        expect(bodyData.campaignId).toBe('campaign-123');
        expect(bodyData.notificationType).toBe('new_campaign_invite');
        expect(bodyData.message).toContain('chiến dịch hiến máu mới');
    });

    test('should still create campaign even if email sending fails', async () => {
        const campaignData = {
            name: 'Test Campaign',
            hospital_id: 'hospital-123',
            city: 'Hà Nội',
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
        };

        const createdCampaign = {
            id: 'campaign-456',
            ...campaignData,
        };

        mockSupabaseQuery.single.mockResolvedValue({
            data: createdCampaign,
            error: null,
        });

        // Mock fetch to fail
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Email API failed'));

        // Execute
        const result = await campaignService.createCampaign(campaignData);

        // Campaign should still be created successfully
        expect(result).toEqual(createdCampaign);
        expect(result.id).toBe('campaign-456');
    });

    test('should throw error when campaign creation fails', async () => {
        const campaignData = {
            name: 'Test Campaign',
            hospital_id: 'invalid-hospital',
        };

        const dbError = { message: 'Hospital not found', code: 'PGRST116' };

        mockSupabaseQuery.single.mockResolvedValue({
            data: null,
            error: dbError,
        });

        // Execute and expect error
        await expect(campaignService.createCampaign(campaignData)).rejects.toEqual(dbError);

        // Wait a bit and verify email not called
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should send correct default message in email', async () => {
        const campaignData = {
            name: 'Test Campaign',
            hospital_id: 'hospital-123',
            city: 'Đà Nẵng',
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
        };

        const createdCampaign = {
            id: 'campaign-789',
            ...campaignData,
        };

        mockSupabaseQuery.single.mockResolvedValue({
            data: createdCampaign,
            error: null,
        });

        // Execute
        await campaignService.createCampaign(campaignData);

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify default message content
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const bodyData = JSON.parse(fetchCall[1].body);
        expect(bodyData.message).toContain('chiến dịch hiến máu mới');
        expect(bodyData.message).toContain('khu vực của bạn');
        expect(bodyData.message).toContain('cứu sống');
    });

    test('should call notificationService.sendCampaignNotification for in-app notifications', async () => {
        const notificationService = require('@/services/notification.service').notificationService;

        const campaignData = {
            name: 'Test Campaign',
            hospital_id: 'hospital-123',
            city: 'TP. Hồ Chí Minh',
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
        };

        const createdCampaign = {
            id: 'campaign-999',
            ...campaignData,
        };

        mockSupabaseQuery.single.mockResolvedValue({
            data: createdCampaign,
            error: null,
        });

        // Execute
        await campaignService.createCampaign(campaignData);

        // Verify in-app notification was sent
        expect(notificationService.sendCampaignNotification).toHaveBeenCalledWith('campaign-999');
    });

    test('should continue even if in-app notification fails', async () => {
        const notificationService = require('@/services/notification.service').notificationService;
        notificationService.sendCampaignNotification.mockRejectedValue(new Error('Notification failed'));

        const campaignData = {
            name: 'Test Campaign',
            hospital_id: 'hospital-123',
            city: 'TP. Hồ Chí Minh',
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
        };

        const createdCampaign = {
            id: 'campaign-888',
            ...campaignData,
        };

        mockSupabaseQuery.single.mockResolvedValue({
            data: createdCampaign,
            error: null,
        });

        // Execute - should not throw
        const result = await campaignService.createCampaign(campaignData);

        // Campaign should still be created
        expect(result).toEqual(createdCampaign);

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Email should still be sent
        expect(global.fetch).toHaveBeenCalled();
    });
});
