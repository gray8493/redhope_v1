/**
 * Test Suite cho Notification Service
 * 
 * Mục đích: Kiểm tra các chức năng gửi thông báo từ hospital đến user
 */

import { notificationService } from '@/services/notification.service';
import { supabase } from '@/lib/supabase';

// Mock supabase
jest.mock('@/lib/supabase');

describe('NotificationService - Hospital gửi thông báo cho User', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Gửi thông báo chiến dịch mới
     * Kịch bản: Hospital tạo chiến dịch mới, hệ thống tự động gửi thông báo đến donors phù hợp
     */
    describe('🩸 Gửi thông báo chiến dịch mới', () => {
        it.skip('✅ Nên gửi thông báo đến donors cùng thành phố', async () => {
            // Arrange - Chuẩn bị dữ liệu
            const mockCampaign = {
                id: 'campaign-123',
                name: 'Chiến dịch hiến máu Xuân 2026',
                city: 'Hồ Chí Minh',
                district: 'Quận 1',
                hospital: { hospital_name: 'Bệnh viện Chợ Rẫy' },
            };

            const mockDonors = [
                { id: 'donor-1', full_name: 'Nguyễn Văn A', blood_group: 'O+' },
                { id: 'donor-2', full_name: 'Trần Thị B', blood_group: 'A+' },
            ];

            // Mock Supabase
            (supabase.from as jest.Mock) = jest.fn((table: string) => {
                const chain = {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    single: jest.fn(),
                    insert: jest.fn(),
                };

                if (table === 'campaigns') {
                    chain.single.mockResolvedValue({ data: mockCampaign, error: null });
                } else if (table === 'users') {
                    chain.eq = jest.fn().mockResolvedValue({ data: mockDonors, error: null });
                } else if (table === 'notifications') {
                    chain.insert.mockResolvedValue({ data: null, error: null });
                }

                return chain;
            });

            // Act - Thực hiện
            await notificationService.sendCampaignNotification('campaign-123');

            // Assert - Kiểm tra
            expect(supabase.from).toHaveBeenCalledWith('campaigns');
            expect(supabase.from).toHaveBeenCalledWith('users');
            expect(supabase.from).toHaveBeenCalledWith('notifications');
        });
    });

    /**
     * Test 2: Thông báo khi có người đăng ký
     * Kịch bản: Donor đăng ký chiến dịch, hospital nhận thông báo
     */
    describe('👤 Thông báo hospital khi có người đăng ký', () => {
        it('✅ Nên gửi thông báo cho hospital khi có đăng ký mới', async () => {
            // Arrange
            const mockCampaign = {
                hospital_id: 'hospital-123',
                name: 'Chiến dịch test',
            };

            (supabase.from as jest.Mock) = jest.fn((table: string) => {
                const chain = {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn(),
                    insert: jest.fn().mockReturnThis(),
                };

                if (table === 'campaigns') {
                    chain.single.mockResolvedValue({ data: mockCampaign, error: null });
                }

                return chain;
            });

            // Mock RPC for notification creation
            (supabase.rpc as jest.Mock) = jest.fn().mockResolvedValue({
                data: { id: 'notif-123', user_id: 'hospital-123', title: '👤 Có người đăng ký mới!' },
                error: null,
            });

            // Act
            await notificationService.notifyHospitalNewRegistration(
                'campaign-123',
                'Nguyễn Văn A'
            );

            // Assert
            expect(supabase.from).toHaveBeenCalledWith('campaigns');
            expect(supabase.rpc).toHaveBeenCalledWith('create_notification_secure', expect.any(Object));
        });
    });

    /**
     * Test 3: Xác nhận đăng ký cho donor
     * Kịch bản: Sau khi đăng ký thành công, donor nhận thông báo xác nhận
     */
    describe('✅ Xác nhận đăng ký cho donor', () => {
        it('✅ Nên gửi thông báo xác nhận cho donor', async () => {
            // Mock RPC for notification creation
            (supabase.rpc as jest.Mock) = jest.fn().mockResolvedValue({
                data: { id: 'notif-456', user_id: 'donor-123', title: '✅ Đăng ký thành công!' },
                error: null,
            });

            // Act
            await notificationService.notifyDonorRegistrationSuccess(
                'donor-123',
                'appointment-789',
                'Chiến dịch Xuân 2026'
            );

            // Assert
            expect(supabase.rpc).toHaveBeenCalledWith('create_notification_secure', expect.any(Object));
        });
    });

    /**
     * Test 4: Tạo thông báo đơn lẻ
     */
    describe('📝 Tạo thông báo đơn lẻ', () => {
        it('✅ Nên tạo thông báo thành công', async () => {
            // Arrange
            const notificationData = {
                user_id: 'user-123',
                title: 'Test Notification',
                content: 'Test content',
            };

            // Mock RPC for notification creation
            (supabase.rpc as jest.Mock) = jest.fn().mockResolvedValue({
                data: { id: 'notif-new', ...notificationData, is_read: false },
                error: null,
            });

            // Act
            const result = await notificationService.createNotification(notificationData);

            // Assert
            expect(result).toBeDefined();
            expect(result.user_id).toBe('user-123');
            expect(supabase.rpc).toHaveBeenCalledWith('create_notification_secure', expect.objectContaining({
                p_user_id: 'user-123',
                p_title: 'Test Notification',
                p_content: 'Test content',
            }));
        });
    });

    /**
     * Test 5: Tạo thông báo hàng loạt
     */
    describe('📢 Tạo thông báo hàng loạt', () => {
        it('✅ Nên gửi thông báo cho nhiều users', async () => {
            // Arrange
            const userIds = ['user-1', 'user-2', 'user-3'];
            const data = {
                title: 'Bulk Notification',
                content: 'Sent to multiple users',
            };

            (supabase.from as jest.Mock) = jest.fn(() => ({
                insert: jest.fn().mockResolvedValue({ data: null, error: null }),
            }));

            // Act
            await notificationService.createBulkNotifications(userIds, data);

            // Assert
            expect(supabase.from).toHaveBeenCalledWith('notifications');
        });
    });

    /**
     * Test 6: Lấy danh sách thông báo
     */
    describe('📋 Lấy danh sách thông báo', () => {
        it('✅ Nên lấy được thông báo của user', async () => {
            // Arrange
            const mockNotifications = [
                { id: 'notif-1', title: 'Notification 1', is_read: false },
                { id: 'notif-2', title: 'Notification 2', is_read: true },
            ];

            (supabase.from as jest.Mock) = jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({ data: mockNotifications, error: null }),
            }));

            // Act
            const result = await notificationService.getNotifications('user-123');

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Notification 1');
        });
    });

    /**
     * Test 7: Đánh dấu đã đọc
     */
    describe('✓ Đánh dấu thông báo đã đọc', () => {
        it('✅ Nên cập nhật trạng thái is_read', async () => {
            // Arrange
            (supabase.from as jest.Mock) = jest.fn(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }));

            // Act
            await notificationService.markAsRead('notif-123');

            // Assert
            expect(supabase.from).toHaveBeenCalledWith('notifications');
        });
    });

    /**
     * Test 8: Đánh dấu tất cả đã đọc
     */
    describe('✓✓ Đánh dấu tất cả đã đọc', () => {
        it('✅ Nên cập nhật tất cả thông báo chưa đọc', async () => {
            // Arrange
            (supabase.from as jest.Mock) = jest.fn(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
            }));

            // Act
            await notificationService.markAllAsRead('user-123');

            // Assert
            expect(supabase.from).toHaveBeenCalledWith('notifications');
        });
    });
});
