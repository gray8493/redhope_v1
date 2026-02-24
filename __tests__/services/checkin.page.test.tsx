import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckinPage from '@/app/checkin/page';

// Mock modules
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
    useSearchParams: () => mockSearchParams,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) =>
        React.createElement('a', { href, ...props }, children),
}));

// Mock campaignService
const mockGetById = jest.fn();
const mockGetCampaignRegistrations = jest.fn();
const mockCheckInRegistration = jest.fn();

jest.mock('@/services', () => ({
    campaignService: {
        getById: (...args: any[]) => mockGetById(...args),
        getCampaignRegistrations: (...args: any[]) => mockGetCampaignRegistrations(...args),
        checkInRegistration: (...args: any[]) => mockCheckInRegistration(...args),
    },
}));

// Helper: fill the identifier input and submit
const submitIdentifier = (value: string) => {
    const input = screen.getByPlaceholderText(/0912345678/);
    fireEvent.change(input, { target: { value } });
    const btn = screen.getByText('Check-in ngay');
    fireEvent.click(btn);
};

describe('CheckinPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('campaignId');
    });

    test('hiển thị lỗi khi không có campaignId', async () => {
        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Không tìm thấy chiến dịch')).toBeInTheDocument();
        });
    });

    test('hiển thị lỗi khi campaign không tồn tại', async () => {
        mockSearchParams.set('campaignId', 'nonexistent');
        mockGetById.mockResolvedValue(null);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Không tìm thấy chiến dịch')).toBeInTheDocument();
        });
    });

    test('hiển thị lỗi khi campaign không active', async () => {
        mockSearchParams.set('campaignId', 'campaign-ended');
        mockGetById.mockResolvedValue({
            id: 'campaign-ended',
            name: 'Chiến dịch đã kết thúc',
            status: 'cancelled',
        });

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Chiến dịch chưa hoạt động')).toBeInTheDocument();
        });
    });

    test('hiển thị form nhập SĐT/Email khi campaign active', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in Hiến Máu')).toBeInTheDocument();
        });

        expect(screen.getByText('Hiến Máu Xuân')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/0912345678/)).toBeInTheDocument();
        expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
    });

    test('hiển thị lỗi khi submit form rỗng', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        // Submit empty
        fireEvent.click(screen.getByText('Check-in ngay'));

        await waitFor(() => {
            expect(screen.getByText(/Vui lòng nhập số điện thoại hoặc email/)).toBeInTheDocument();
        });
    });

    test('hiển thị lỗi khi không tìm thấy đăng ký với SĐT/Email', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                status: 'Booked',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0999999999');

        await waitFor(() => {
            expect(screen.getByText(/Không tìm thấy đăng ký nào/)).toBeInTheDocument();
        });
    });

    test('check-in thành công bằng SĐT', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
            location_name: 'Bệnh viện Chợ Rẫy',
            start_time: '2026-03-01T08:00:00Z',
            end_time: '2026-03-01T17:00:00Z',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Booked',
            },
        ]);
        mockCheckInRegistration.mockResolvedValue({
            id: 'apt-1',
            status: 'Checked-in',
            queue_number: 5,
            check_in_time: '2026-02-23T09:15:00Z',
        });

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0912345678');

        await waitFor(() => {
            expect(screen.getByText('Check-in thành công!')).toBeInTheDocument();
        });

        expect(screen.getByText('#05')).toBeInTheDocument();
        expect(screen.getByText(/phòng khám sàng lọc/)).toBeInTheDocument();
        expect(mockCheckInRegistration).toHaveBeenCalledWith('apt-1', 'campaign-1');
    });

    test('check-in thành công bằng email', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Booked',
            },
        ]);
        mockCheckInRegistration.mockResolvedValue({
            id: 'apt-1',
            status: 'Checked-in',
            queue_number: 1,
            check_in_time: '2026-02-23T09:15:00Z',
        });

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('donor@test.com');

        await waitFor(() => {
            expect(screen.getByText('Check-in thành công!')).toBeInTheDocument();
        });

        expect(mockCheckInRegistration).toHaveBeenCalledWith('apt-1', 'campaign-1');
    });

    test('hiển thị thông báo đã check-in khi quét lại', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Checked-in',
                queue_number: 3,
                check_in_time: '2026-02-23T09:00:00Z',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0912345678');

        await waitFor(() => {
            expect(screen.getByText('Đã check-in rồi!')).toBeInTheDocument();
        });

        expect(screen.getByText('#03')).toBeInTheDocument();
    });

    test('hiển thị lỗi khi appointment đã bị hủy', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Cancelled',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0912345678');

        await waitFor(() => {
            expect(screen.getByText('Đã hủy')).toBeInTheDocument();
        });
    });

    test('hiển thị thông báo khi đã hoàn thành hiến máu', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Completed',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0912345678');

        await waitFor(() => {
            expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
        });

        expect(screen.getByText(/Cảm ơn bạn/)).toBeInTheDocument();
    });

    test('hiển thị lỗi khi service throw error', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123',
                user: { phone: '0912345678', email: 'donor@test.com' },
                campaign_id: 'campaign-1',
                status: 'Booked',
            },
        ]);
        mockCheckInRegistration.mockRejectedValue(new Error('Database connection failed'));

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Check-in ngay')).toBeInTheDocument();
        });

        submitIdentifier('0912345678');

        await waitFor(() => {
            expect(screen.getByText('Lỗi')).toBeInTheDocument();
        });

        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
});
