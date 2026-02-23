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
        createNotification: jest.fn(),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('campaignService.checkInRegistration', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Giá trị mặc định cho mock chain
        mockSupabaseQuery = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn(),
            single: jest.fn(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('check-in thành công với STT = 1 khi chưa có ai check-in', async () => {
        // Arrange: Chưa có ai check-in (maxQueue = null)
        const callCount = { count: 0 };

        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'appointments') {
                callCount.count++;
                // Lần 1: query max queue_number
                if (callCount.count === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                not: jest.fn().mockReturnValue({
                                    order: jest.fn().mockReturnValue({
                                        limit: jest.fn().mockReturnValue({
                                            maybeSingle: jest.fn().mockResolvedValue({
                                                data: null, // Chưa có ai check-in
                                                error: null,
                                            }),
                                        }),
                                    }),
                                }),
                            }),
                        }),
                    };
                }
                // Lần 2: update status
                if (callCount.count === 2) {
                    return {
                        update: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                select: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({
                                        data: {
                                            id: 'appointment-1',
                                            status: 'Checked-in',
                                            queue_number: 1,
                                            check_in_time: '2026-02-23T09:00:00Z',
                                        },
                                        error: null,
                                    }),
                                }),
                            }),
                        }),
                    };
                }
            }
            return mockSupabaseQuery;
        });

        // Act
        const result = await campaignService.checkInRegistration('appointment-1', 'campaign-1');

        // Assert
        expect(result).toBeDefined();
        expect(result.status).toBe('Checked-in');
        expect(result.queue_number).toBe(1);
        expect(result.check_in_time).toBeDefined();
    });

    test('check-in thành công với STT tăng dần khi đã có người check-in trước', async () => {
        const callCount = { count: 0 };

        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'appointments') {
                callCount.count++;
                if (callCount.count === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                not: jest.fn().mockReturnValue({
                                    order: jest.fn().mockReturnValue({
                                        limit: jest.fn().mockReturnValue({
                                            maybeSingle: jest.fn().mockResolvedValue({
                                                data: { queue_number: 5 }, // Đã có 5 người check-in
                                                error: null,
                                            }),
                                        }),
                                    }),
                                }),
                            }),
                        }),
                    };
                }
                if (callCount.count === 2) {
                    return {
                        update: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                select: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({
                                        data: {
                                            id: 'appointment-6',
                                            status: 'Checked-in',
                                            queue_number: 6, // STT tiếp theo
                                            check_in_time: '2026-02-23T09:05:00Z',
                                        },
                                        error: null,
                                    }),
                                }),
                            }),
                        }),
                    };
                }
            }
            return mockSupabaseQuery;
        });

        const result = await campaignService.checkInRegistration('appointment-6', 'campaign-1');

        expect(result.queue_number).toBe(6);
        expect(result.status).toBe('Checked-in');
    });

    test('ném lỗi khi update DB thất bại', async () => {
        const callCount = { count: 0 };

        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'appointments') {
                callCount.count++;
                if (callCount.count === 1) {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                not: jest.fn().mockReturnValue({
                                    order: jest.fn().mockReturnValue({
                                        limit: jest.fn().mockReturnValue({
                                            maybeSingle: jest.fn().mockResolvedValue({
                                                data: null,
                                                error: null,
                                            }),
                                        }),
                                    }),
                                }),
                            }),
                        }),
                    };
                }
                if (callCount.count === 2) {
                    return {
                        update: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                select: jest.fn().mockReturnValue({
                                    single: jest.fn().mockResolvedValue({
                                        data: null,
                                        error: { message: 'Constraint violation', code: '23514' },
                                    }),
                                }),
                            }),
                        }),
                    };
                }
            }
            return mockSupabaseQuery;
        });

        await expect(
            campaignService.checkInRegistration('invalid-appointment', 'campaign-1')
        ).rejects.toEqual(
            expect.objectContaining({ message: 'Constraint violation' })
        );
    });

    test('gọi đúng bảng appointments và truyền đúng tham số', async () => {
        const updateMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: {
                            id: 'apt-test',
                            status: 'Checked-in',
                            queue_number: 1,
                            check_in_time: '2026-02-23T09:00:00Z',
                        },
                        error: null,
                    }),
                }),
            }),
        });

        const callCount = { count: 0 };
        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            callCount.count++;
            if (callCount.count === 1) {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            not: jest.fn().mockReturnValue({
                                order: jest.fn().mockReturnValue({
                                    limit: jest.fn().mockReturnValue({
                                        maybeSingle: jest.fn().mockResolvedValue({
                                            data: null,
                                            error: null,
                                        }),
                                    }),
                                }),
                            }),
                        }),
                    }),
                };
            }
            return { update: updateMock };
        });

        await campaignService.checkInRegistration('apt-test', 'campaign-xyz');

        // Verify gọi bảng appointments
        expect(supabase.from).toHaveBeenCalledWith('appointments');

        // Verify update được gọi với đúng data
        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'Checked-in',
                queue_number: 1,
            })
        );

        // Verify check_in_time là ISO string hợp lệ
        const updateArgs = updateMock.mock.calls[0][0];
        expect(updateArgs.check_in_time).toBeDefined();
        expect(new Date(updateArgs.check_in_time).toISOString()).toBe(updateArgs.check_in_time);
    });
});

describe('campaignService.getCampaignRegistrations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('trả về danh sách đăng ký bao gồm cả người đã check-in', async () => {
        const mockRegistrations = [
            {
                id: 'apt-1',
                user_id: 'user-1',
                campaign_id: 'campaign-1',
                status: 'Booked',
                queue_number: null,
                check_in_time: null,
                user: { id: 'user-1', full_name: 'Nguyễn Văn A', email: 'a@test.com' },
            },
            {
                id: 'apt-2',
                user_id: 'user-2',
                campaign_id: 'campaign-1',
                status: 'Checked-in',
                queue_number: 1,
                check_in_time: '2026-02-23T09:00:00Z',
                user: { id: 'user-2', full_name: 'Trần Văn B', email: 'b@test.com' },
            },
        ];

        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: mockRegistrations,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await campaignService.getCampaignRegistrations('campaign-1');

        expect(result).toHaveLength(2);

        // Người check-in có queue_number
        const checkedIn = result.find((r: any) => r.status === 'Checked-in');
        expect(checkedIn).toBeDefined();
        expect(checkedIn.queue_number).toBe(1);
        expect(checkedIn.check_in_time).toBeDefined();

        // Người chưa check-in không có queue_number
        const booked = result.find((r: any) => r.status === 'Booked');
        expect(booked).toBeDefined();
        expect(booked.queue_number).toBeNull();
    });

    test('trả về mảng rỗng khi không có đăng ký', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await campaignService.getCampaignRegistrations('campaign-empty');
        expect(result).toEqual([]);
    });
});

describe('campaignService.updateRegistrationStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cập nhật trạng thái thành công', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: { id: 'apt-1', status: 'Completed' },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await campaignService.updateRegistrationStatus('apt-1', 'Completed');
        expect(result.status).toBe('Completed');
    });

    test('ném lỗi khi không tìm thấy bản ghi', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        await expect(
            campaignService.updateRegistrationStatus('nonexistent', 'Completed')
        ).rejects.toThrow('Không tìm thấy bản ghi');
    });
});
