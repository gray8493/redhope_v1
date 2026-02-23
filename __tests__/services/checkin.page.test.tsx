import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckinPage from '@/app/checkin/page';

// Mock modules
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
    useSearchParams: () => mockSearchParams,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) =>
        React.createElement('a', { href, ...props }, children),
}));

// Mock AuthContext
const mockUser = { id: 'donor-123', role: 'donor', full_name: 'Test User' };
let mockAuthLoading = false;
let mockAuthUser: any = null;

jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        user: mockAuthUser,
        loading: mockAuthLoading,
    }),
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

describe('CheckinPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthUser = null;
        mockAuthLoading = false;
        // Reset search params
        mockSearchParams.delete('campaignId');
    });

    test('hiển thị thông báo đăng nhập khi chưa login', async () => {
        mockSearchParams.set('campaignId', 'campaign-1');
        mockAuthUser = null;

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Vui lòng đăng nhập')).toBeInTheDocument();
        });

        // Kiểm tra link đăng nhập
        const loginLink = screen.getByText('Đăng nhập ngay');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href',
            expect.stringContaining('/auth/login')
        );
    });

    test('hiển thị lỗi khi không có campaignId', async () => {
        mockAuthUser = mockUser;
        // Không set campaignId

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Không tìm thấy chiến dịch')).toBeInTheDocument();
        });
    });

    test('hiển thị lỗi khi campaign không tồn tại', async () => {
        mockAuthUser = mockUser;
        mockSearchParams.set('campaignId', 'nonexistent-campaign');
        mockGetById.mockResolvedValue(null);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Không tìm thấy chiến dịch')).toBeInTheDocument();
        });
    });

    test('hiển thị lỗi khi campaign không active', async () => {
        mockAuthUser = mockUser;
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

    test('hiển thị lỗi khi donor chưa đăng ký chiến dịch', async () => {
        mockAuthUser = mockUser;
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        // Trả về registrations rỗng - donor chưa đăng ký
        mockGetCampaignRegistrations.mockResolvedValue([]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Chưa đăng ký')).toBeInTheDocument();
        });

        expect(screen.getByText(/Vui lòng đăng ký trước khi check-in/)).toBeInTheDocument();
    });

    test('hiển thị thông báo đã check-in khi quét lại', async () => {
        mockAuthUser = mockUser;
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-1',
                user_id: 'donor-123', // same as mockUser.id
                campaign_id: 'campaign-1',
                status: 'Checked-in',
                queue_number: 3,
                check_in_time: '2026-02-23T09:00:00Z',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Bạn đã check-in rồi!')).toBeInTheDocument();
        });

        // Hiển thị STT
        expect(screen.getByText('#03')).toBeInTheDocument();
    });

    test('check-in thành công cho donor đã đăng ký', async () => {
        mockAuthUser = mockUser;
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
                user_id: 'donor-123', // same as mockUser.id
                campaign_id: 'campaign-1',
                status: 'Booked',
                queue_number: null,
            },
        ]);
        mockCheckInRegistration.mockResolvedValue({
            id: 'apt-1',
            status: 'Checked-in',
            queue_number: 5,
            check_in_time: '2026-02-23T09:15:00Z',
        });

        render(React.createElement(CheckinPage));

        // Chờ check-in thành công
        await waitFor(() => {
            expect(screen.getByText('Check-in thành công!')).toBeInTheDocument();
        });

        // Hiển thị STT
        expect(screen.getByText('#05')).toBeInTheDocument();

        // Hiển thị bước tiếp theo
        expect(screen.getByText(/phòng khám sàng lọc/)).toBeInTheDocument();

        // Verify checkInRegistration được gọi đúng tham số
        expect(mockCheckInRegistration).toHaveBeenCalledWith('apt-1', 'campaign-1');
    });

    test('hiển thị lỗi khi appointment đã bị hủy', async () => {
        mockAuthUser = mockUser;
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
                campaign_id: 'campaign-1',
                status: 'Cancelled',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Đã hủy')).toBeInTheDocument();
        });
    });

    test('hiển thị thông báo khi đã hoàn thành hiến máu', async () => {
        mockAuthUser = mockUser;
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
                campaign_id: 'campaign-1',
                status: 'Completed',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
        });

        expect(screen.getByText(/Cảm ơn bạn/)).toBeInTheDocument();
    });

    test('hiển thị lỗi khi service check-in throw error', async () => {
        mockAuthUser = mockUser;
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
                campaign_id: 'campaign-1',
                status: 'Booked',
            },
        ]);
        mockCheckInRegistration.mockRejectedValue(new Error('Database connection failed'));

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Lỗi')).toBeInTheDocument();
        });

        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    test('không gọi checkIn cho người dùng khác (chỉ user đã login)', async () => {
        mockAuthUser = mockUser; // donor-123
        mockSearchParams.set('campaignId', 'campaign-1');
        mockGetById.mockResolvedValue({
            id: 'campaign-1',
            name: 'Hiến Máu Xuân',
            status: 'active',
        });
        // Chỉ có donor khác đăng ký, không có donor-123
        mockGetCampaignRegistrations.mockResolvedValue([
            {
                id: 'apt-other',
                user_id: 'other-donor', // Người khác
                campaign_id: 'campaign-1',
                status: 'Booked',
            },
        ]);

        render(React.createElement(CheckinPage));

        await waitFor(() => {
            expect(screen.getByText('Chưa đăng ký')).toBeInTheDocument();
        });

        // checkInRegistration KHÔNG được gọi
        expect(mockCheckInRegistration).not.toHaveBeenCalled();
    });
});
