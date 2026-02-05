/**
 * Test Suite for Campaign Email Auto-Send Feature
 * 
 * Tests the automatic email invitation system when creating new campaigns:
 * - Filtering donors by city and blood group
 * - Sending emails to matching donors
 * - Error handling and edge cases
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

// Mock Next.js server components before any imports
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data: any, init?: { status?: number }) => ({
            json: async () => data,
            status: init?.status || 200,
        })),
    },
}));

// Mock dependencies
jest.mock('@/lib/supabase-admin');
jest.mock('resend');
jest.mock('@react-email/render', () => ({
    render: jest.fn(() => Promise.resolve('<html>Mock Email</html>')),
}));

describe('Campaign Email Auto-Send Feature', () => {
    let mockResendInstance: any;
    let mockSupabaseFrom: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Resend instance
        mockResendInstance = {
            emails: {
                send: jest.fn().mockResolvedValue({
                    data: { id: 'email-test-id' },
                    error: null,
                }),
            },
        };
        (Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => mockResendInstance);

        // Mock Supabase
        mockSupabaseFrom = supabaseAdmin.from as jest.Mock;

        // Set environment variable
        process.env.RESEND_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.RESEND_API_KEY;
    });

    describe('Donor Filtering Logic', () => {
        test('should filter donors by matching city', async () => {
            const campaign = {
                id: 'campaign-1',
                name: 'Test Campaign',
                city: 'TP. Hồ Chí Minh',
                target_blood_group: ['A+'],
                hospital: { hospital_name: 'Test Hospital' },
            };

            const donorsInHCM = [
                { id: '1', full_name: 'Donor HCM', email: 'hcm@test.com', blood_group: 'A+' },
            ];

            // Setup mock chain
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({ data: donorsInHCM, error: null }),
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            // The key assertion: verify city filter is applied
            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-1',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            await POST(mockRequest);

            // Verify .eq('city', 'TP. Hồ Chí Minh') was called
            expect(mockQuery.eq).toHaveBeenCalledWith('city', 'TP. Hồ Chí Minh');
        });

        test('should filter donors by blood group when specified', async () => {
            const campaign = {
                id: 'campaign-2',
                name: 'AB Blood Campaign',
                city: 'Hà Nội',
                target_blood_group: ['AB+', 'AB-'],
                hospital: { hospital_name: 'Test Hospital' },
            };

            const donorsWithAB = [
                { id: '1', full_name: 'Donor AB', email: 'ab@test.com', blood_group: 'AB+' },
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({ data: donorsWithAB, error: null }),
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-2',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            await POST(mockRequest);

            // Verify blood group filter
            expect(mockQuery.in).toHaveBeenCalledWith('blood_group', ['AB+', 'AB-']);
        });

        test('should NOT filter by blood group when target is empty or has all 8 groups', async () => {
            const campaign = {
                id: 'campaign-3',
                name: 'All Blood Groups Campaign',
                city: 'Đà Nẵng',
                target_blood_group: [], // Empty = all groups
                hospital: { hospital_name: 'Test Hospital' },
            };

            const allDonors = [
                { id: '1', full_name: 'Donor 1', email: 'd1@test.com', blood_group: 'A+' },
                { id: '2', full_name: 'Donor 2', email: 'd2@test.com', blood_group: 'B-' },
            ];

            // Mock for campaign query
            const mockCampaignQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            // Mock for donors query
            const mockDonorsQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: allDonors, error: null }),
                in: jest.fn().mockResolvedValue({ data: allDonors, error: null }),
            };

            // Return different mocks based on table name
            mockSupabaseFrom.mockImplementation((table: string) => {
                if (table === 'campaigns') return mockCampaignQuery;
                if (table === 'users') return mockDonorsQuery;
                return mockCampaignQuery;
            });

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-3',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            await POST(mockRequest);

            // Verify city filter was applied to donors query
            expect(mockDonorsQuery.eq).toHaveBeenCalled();
            // Since target_blood_group is empty, .in() should NOT be called
            expect(mockDonorsQuery.in).not.toHaveBeenCalled();
        });
    });

    describe('Email Sending', () => {
        test('should send email with correct subject for new campaign invite', async () => {
            const campaign = {
                id: 'campaign-4',
                name: 'Spring Blood Drive',
                city: 'TP. Hồ Chí Minh',
                target_blood_group: ['O+'],
                start_time: '2026-03-01T08:00:00Z',
                end_time: '2026-03-01T17:00:00Z',
                location_name: 'Central Hospital',
                hospital: { hospital_name: 'Central Hospital' },
            };

            const donors = [
                { id: '1', full_name: 'John Doe', email: 'john@test.com', blood_group: 'O+' },
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({ data: donors, error: null }),
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-4',
                    message: 'Join our blood drive!',
                    notificationType: 'new_campaign_invite',
                }),
            };

            const response = await POST(mockRequest);
            const result = await response.json();

            // Verify email was sent
            expect(mockResendInstance.emails.send).toHaveBeenCalledTimes(1);

            // Verify email subject
            const emailCall = mockResendInstance.emails.send.mock.calls[0][0];
            expect(emailCall.subject).toBe('🩸 Chiến dịch hiến máu mới gần bạn!');
            expect(emailCall.to).toEqual(['john@test.com']);
        });

        test('should handle email sending failures gracefully', async () => {
            const campaign = {
                id: 'campaign-5',
                name: 'Test Campaign',
                city: 'Hà Nội',
                target_blood_group: ['A+'],
                hospital: { hospital_name: 'Test Hospital' },
            };

            const donors = [
                { id: '1', full_name: 'Donor 1', email: 'donor1@test.com', blood_group: 'A+' },
                { id: '2', full_name: 'Donor 2', email: 'donor2@test.com', blood_group: 'A+' },
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({ data: donors, error: null }),
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            // First email succeeds, second fails
            mockResendInstance.emails.send
                .mockResolvedValueOnce({ data: { id: 'success' }, error: null })
                .mockResolvedValueOnce({ data: null, error: { message: 'Failed' } });

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-5',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            const response = await POST(mockRequest);
            const result = await response.json();

            // Should still return success response with summary
            expect(response.status).toBe(200);
            expect(result.summary.total).toBe(2);
            expect(result.summary.success).toBe(1);
            expect(result.summary.failed).toBe(1);
        });

        test('should return 0 emails sent when no matching donors found', async () => {
            const campaign = {
                id: 'campaign-6',
                name: 'Rare Blood Campaign',
                city: 'Cần Thơ',
                target_blood_group: ['AB-'],
                hospital: { hospital_name: 'Test Hospital' },
            };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({ data: [], error: null }), // No donors
                single: jest.fn().mockResolvedValue({ data: campaign, error: null }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'campaign-6',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            const response = await POST(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.summary.total).toBe(0);
            expect(mockResendInstance.emails.send).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should return 404 when campaign not found', async () => {
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            };

            mockSupabaseFrom.mockReturnValue(mockQuery);

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'non-existent',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            const response = await POST(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(404);
            expect(result.error).toBe('Campaign not found');
        });

        test('should return 500 when RESEND_API_KEY is missing', async () => {
            delete process.env.RESEND_API_KEY;

            const { POST } = require('@/app/api/campaign/send-announcement/route');

            const mockRequest = {
                json: async () => ({
                    campaignId: 'test',
                    message: 'Test',
                    notificationType: 'new_campaign_invite',
                }),
            };

            const response = await POST(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.error).toContain('RESEND_API_KEY');
        });
    });
});
