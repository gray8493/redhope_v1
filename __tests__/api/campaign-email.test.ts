import { NextRequest } from 'next/server';
import sgMail from '@sendgrid/mail';

// Mock Next.js server components
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data: any, init?: { status?: number }) => ({
            json: async () => data,
            status: init?.status || 200,
        })),
    },
    NextRequest: class {
        constructor(public url: string, public init: any) { }
        async json() {
            return JSON.parse(this.init.body);
        }
    }
}));

jest.mock('@react-email/render', () => ({
    render: jest.fn(() => Promise.resolve('<html>Mock Email</html>')),
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: (jest.fn() as any).mockResolvedValue([{ statusCode: 202 }, {}]),
}));

// Mock Supabase
const createMockQuery = () => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
});

const mockSupabaseAdmin = {
    from: jest.fn().mockImplementation(() => createMockQuery()),
    single: jest.fn(), // If called directly on supabaseAdmin
};

jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: mockSupabaseAdmin,
}));

import { supabaseAdmin } from '@/lib/supabase-admin';

describe('Campaign Email API Test', () => {
    let POST: any;

    const mockCampaign = {
        id: 'campaign-123',
        name: 'Chiến dịch Test',
        city: 'Hà Nội',
        location_name: 'Bệnh viện Bạch Mai',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        target_blood_group: '["A+", "O+"]',
        hospital: { hospital_name: 'Bệnh viện Bạch Mai' }
    };

    const mockDonors = [
        { id: 'user-1', email: 'donor1@example.com', full_name: 'Donor 1', blood_group: 'A+' },
        { id: 'user-2', email: 'donor2@example.com', full_name: 'Donor 2', blood_group: 'O+' }
    ];

    beforeAll(() => {
        // Load the route handler dynamically to ensure mocks are in place
        const route = require('@/app/api/campaign/send-announcement/route');
        POST = route.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SENDGRID_API_KEY = 'SG.test_key';
    });

    it('should send invitations to matching donors (new_campaign_invite)', async () => {
        const campaignQuery = createMockQuery();
        const donorQuery = createMockQuery();

        (supabaseAdmin.from as jest.Mock)
            .mockReturnValueOnce(campaignQuery)
            .mockReturnValueOnce(donorQuery);

        campaignQuery.single.mockResolvedValue({ data: mockCampaign, error: null });
        donorQuery.in.mockResolvedValue({ data: mockDonors, error: null });

        const req = new NextRequest('http://localhost/api/campaign/send-announcement', {
            method: 'POST',
            body: JSON.stringify({
                campaignId: 'campaign-123',
                notificationType: 'new_campaign_invite',
                message: 'Mời bạn tham gia'
            }),
        });

        const response = await POST(req);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.summary.success).toBe(2);
        expect(sgMail.send).toHaveBeenCalledTimes(2);
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'donor1@example.com',
            subject: expect.stringContaining('Thư mời tham gia')
        }));
    });

    it('should send registration success email', async () => {
        const mockAppointment = [{ id: 'app-1', user_id: 'user-1', status: 'Booked', scheduled_time: mockCampaign.start_time }];
        const campaignQuery = createMockQuery();
        const appointmentQuery = createMockQuery();
        const donorQuery = createMockQuery();

        (supabaseAdmin.from as jest.Mock)
            .mockReturnValueOnce(campaignQuery)
            .mockReturnValueOnce(appointmentQuery)
            .mockReturnValueOnce(donorQuery);

        campaignQuery.single.mockResolvedValue({ data: mockCampaign, error: null });
        appointmentQuery.eq.mockResolvedValue({ data: mockAppointment, error: null });
        donorQuery.in.mockResolvedValue({ data: [mockDonors[0]], error: null });

        const req = new NextRequest('http://localhost/api/campaign/send-announcement', {
            method: 'POST',
            body: JSON.stringify({
                campaignId: 'campaign-123',
                notificationType: 'registration_success',
                message: 'Chào mừng'
            }),
        });

        const response = await POST(req);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.summary.success).toBe(1);
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'donor1@example.com',
            subject: expect.stringContaining('Dang ky thanh cong')
        }));
    });

    it('should send reminders (reminder_8h)', async () => {
        const mockAppointment = [{ id: 'app-1', user_id: 'user-1', status: 'Booked' }];
        const campaignQuery = createMockQuery();
        const appointmentQuery = createMockQuery();
        const donorQuery = createMockQuery();

        (supabaseAdmin.from as jest.Mock)
            .mockReturnValueOnce(campaignQuery)
            .mockReturnValueOnce(appointmentQuery)
            .mockReturnValueOnce(donorQuery);

        campaignQuery.single.mockResolvedValue({ data: mockCampaign, error: null });
        appointmentQuery.eq.mockResolvedValue({ data: mockAppointment, error: null });
        donorQuery.in.mockResolvedValue({ data: [mockDonors[0]], error: null });

        const req = new NextRequest('http://localhost/api/campaign/send-announcement', {
            method: 'POST',
            body: JSON.stringify({
                campaignId: 'campaign-123',
                notificationType: 'reminder_8h',
            }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
            subject: expect.stringContaining('Nhac nho (8h)')
        }));
    });

    it('should return error if SendGrid API Key is missing', async () => {
        delete process.env.SENDGRID_API_KEY;

        const req = new NextRequest('http://localhost/api/campaign/send-announcement', {
            method: 'POST',
            body: JSON.stringify({ campaignId: '123' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(500);
        expect(await response.json()).toHaveProperty('error');
    });
});
