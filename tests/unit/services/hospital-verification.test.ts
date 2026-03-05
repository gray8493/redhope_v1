import { hospitalService } from '@/services/hospital.service';
import { userService } from '@/services/user.service';
import { supabase } from '@/lib/supabase';

// Mock userService
jest.mock('@/services/user.service', () => ({
    userService: {
        getAll: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

// Mock supabase (for direct supabase calls in the new verification methods)
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('Hospital Verification Flow', () => {
    let mockSupabaseQuery: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabaseQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
        };
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
    });

    // ========================================================
    // 1. getByVerificationStatus
    // ========================================================
    describe('getByVerificationStatus', () => {
        test('nên trả về danh sách BV có status "pending"', async () => {
            const mockPendingHospitals = [
                { id: 'h1', hospital_name: 'BV Chợ Rẫy', role: 'hospital', verification_status: 'pending' },
                { id: 'h2', hospital_name: 'BV Đại học Y', role: 'hospital', verification_status: 'pending' },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockPendingHospitals, error: null });

            const result = await hospitalService.getByVerificationStatus('pending');

            expect(supabase.from).toHaveBeenCalledWith('users');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('role', 'hospital');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('verification_status', 'pending');
            expect(result).toHaveLength(2);
            expect(result[0].verification_status).toBe('pending');
        });

        test('nên trả về danh sách BV có status "approved"', async () => {
            const mockApproved = [
                { id: 'h3', hospital_name: 'BV Bạch Mai', role: 'hospital', verification_status: 'approved' },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockApproved, error: null });

            const result = await hospitalService.getByVerificationStatus('approved');

            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('verification_status', 'approved');
            expect(result).toHaveLength(1);
        });

        test('nên trả về mảng rỗng khi không có BV nào', async () => {
            mockSupabaseQuery.order.mockResolvedValue({ data: [], error: null });

            const result = await hospitalService.getByVerificationStatus('rejected');

            expect(result).toEqual([]);
        });

        test('nên trả về mảng rỗng khi data là null', async () => {
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: null });

            const result = await hospitalService.getByVerificationStatus('pending');

            expect(result).toEqual([]);
        });

        test('nên throw lỗi khi DB lỗi', async () => {
            const dbError = { message: 'Connection timeout' };
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: dbError });

            await expect(hospitalService.getByVerificationStatus('pending')).rejects.toEqual(dbError);
        });
    });

    // ========================================================
    // 2. getPendingHospitals
    // ========================================================
    describe('getPendingHospitals', () => {
        test('nên trả về BV có status "pending" hoặc "in_review"', async () => {
            const mockPending = [
                { id: 'h1', hospital_name: 'BV A', verification_status: 'pending' },
                { id: 'h2', hospital_name: 'BV B', verification_status: 'in_review' },
            ];

            mockSupabaseQuery.order.mockResolvedValue({ data: mockPending, error: null });

            const result = await hospitalService.getPendingHospitals();

            expect(supabase.from).toHaveBeenCalledWith('users');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('role', 'hospital');
            expect(mockSupabaseQuery.in).toHaveBeenCalledWith('verification_status', ['pending', 'in_review']);
            expect(result).toHaveLength(2);
        });

        test('nên trả về mảng rỗng khi tất cả BV đã được duyệt', async () => {
            mockSupabaseQuery.order.mockResolvedValue({ data: [], error: null });

            const result = await hospitalService.getPendingHospitals();

            expect(result).toEqual([]);
        });

        test('nên throw lỗi khi truy vấn thất bại', async () => {
            const dbError = { message: 'Query failed' };
            mockSupabaseQuery.order.mockResolvedValue({ data: null, error: dbError });

            await expect(hospitalService.getPendingHospitals()).rejects.toEqual(dbError);
        });
    });

    // ========================================================
    // 3. updateVerificationStatus - APPROVE
    // ========================================================
    describe('updateVerificationStatus - approve', () => {
        test('nên cập nhật BV thành "approved" với is_verified=true và timestamp', async () => {
            const updatedHospital = {
                id: 'h1',
                verification_status: 'approved',
                is_verified: true,
                verified_by: 'admin-1',
            };

            (userService.update as jest.Mock).mockResolvedValue(updatedHospital);

            const result = await hospitalService.updateVerificationStatus('h1', 'approved', 'admin-1', 'Đủ giấy tờ');

            expect(userService.update).toHaveBeenCalledWith('h1', expect.objectContaining({
                verification_status: 'approved',
                verification_note: 'Đủ giấy tờ',
                is_verified: true,
                verified_by: 'admin-1',
            }));
            // verified_at should be set (ISO string)
            const callArgs = (userService.update as jest.Mock).mock.calls[0][1];
            expect(callArgs.verified_at).toBeTruthy();
            expect(new Date(callArgs.verified_at).getTime()).not.toBeNaN();

            expect(result).toEqual(updatedHospital);
        });

        test('nên hoạt động khi không có ghi chú', async () => {
            (userService.update as jest.Mock).mockResolvedValue({ id: 'h1', verification_status: 'approved' });

            await hospitalService.updateVerificationStatus('h1', 'approved', 'admin-1');

            const callArgs = (userService.update as jest.Mock).mock.calls[0][1];
            expect(callArgs.verification_note).toBeNull();
            expect(callArgs.is_verified).toBe(true);
        });
    });

    // ========================================================
    // 4. updateVerificationStatus - REJECT
    // ========================================================
    describe('updateVerificationStatus - reject', () => {
        test('nên cập nhật BV thành "rejected" với lý do và is_verified=false', async () => {
            const updatedHospital = {
                id: 'h2',
                verification_status: 'rejected',
                is_verified: false,
            };

            (userService.update as jest.Mock).mockResolvedValue(updatedHospital);

            await hospitalService.updateVerificationStatus('h2', 'rejected', 'admin-1', 'Thiếu giấy phép hoạt động');

            expect(userService.update).toHaveBeenCalledWith('h2', expect.objectContaining({
                verification_status: 'rejected',
                verification_note: 'Thiếu giấy phép hoạt động',
                is_verified: false,
                verified_at: null,
                verified_by: 'admin-1',
            }));
        });

        test('nên ghi lại admin ID khi từ chối', async () => {
            (userService.update as jest.Mock).mockResolvedValue({ id: 'h2' });

            await hospitalService.updateVerificationStatus('h2', 'rejected', 'admin-99', 'Không hợp lệ');

            const callArgs = (userService.update as jest.Mock).mock.calls[0][1];
            expect(callArgs.verified_by).toBe('admin-99');
        });
    });

    // ========================================================
    // 5. updateVerificationStatus - IN_REVIEW
    // ========================================================
    describe('updateVerificationStatus - in_review', () => {
        test('nên chuyển BV sang trạng thái "đang xem xét" với admin ID', async () => {
            (userService.update as jest.Mock).mockResolvedValue({
                id: 'h3',
                verification_status: 'in_review',
            });

            await hospitalService.updateVerificationStatus('h3', 'in_review', 'admin-1', 'Đã gọi Zalo ngày 12/02');

            expect(userService.update).toHaveBeenCalledWith('h3', expect.objectContaining({
                verification_status: 'in_review',
                verification_note: 'Đã gọi Zalo ngày 12/02',
                verified_by: 'admin-1',
            }));
        });

        test('nên KHÔNG set is_verified khi chuyển sang in_review', async () => {
            (userService.update as jest.Mock).mockResolvedValue({ id: 'h3' });

            await hospitalService.updateVerificationStatus('h3', 'in_review', 'admin-1');

            const callArgs = (userService.update as jest.Mock).mock.calls[0][1];
            // is_verified should NOT be set for in_review
            expect(callArgs.is_verified).toBeUndefined();
        });
    });

    // ========================================================
    // 6. updateVerificationStatus - Error handling
    // ========================================================
    describe('updateVerificationStatus - error handling', () => {
        test('nên throw lỗi khi userService.update thất bại', async () => {
            (userService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

            await expect(
                hospitalService.updateVerificationStatus('h1', 'approved', 'admin-1')
            ).rejects.toThrow('Update failed');
        });
    });

    // ========================================================
    // 7. create - verification_status mặc định là "pending"
    // ========================================================
    describe('create - default verification_status', () => {
        test('BV mới tạo nên có verification_status = "pending"', async () => {
            const hospitalData = {
                hospital_name: 'BV Mới',
                hospital_address: '123 Đường ABC',
            };

            (userService.create as jest.Mock).mockResolvedValue({
                id: 'new-id',
                ...hospitalData,
                role: 'hospital',
                verification_status: 'pending',
            });

            await hospitalService.create(hospitalData);

            const createCall = (userService.create as jest.Mock).mock.calls[0][0];
            expect(createCall.verification_status).toBe('pending');
            expect(createCall.role).toBe('hospital');
        });

        test('BV mới tạo nên có is_verified = false', async () => {
            (userService.create as jest.Mock).mockResolvedValue({ id: 'x' });

            await hospitalService.create({ hospital_name: 'Test' });

            const createCall = (userService.create as jest.Mock).mock.calls[0][0];
            expect(createCall.is_verified).toBe(false);
        });
    });

    // ========================================================
    // 8. Luồng nghiệp vụ hoàn chỉnh (Integration-style unit test)
    // ========================================================
    describe('Luồng nghiệp vụ: pending → in_review → approved', () => {
        test('nên thực hiện đúng thứ tự trạng thái', async () => {
            const hospitalId = 'hospital-flow-1';
            const adminId = 'admin-flow-1';

            // Step 1: Tạo BV mới → pending
            (userService.create as jest.Mock).mockResolvedValue({
                id: hospitalId,
                verification_status: 'pending',
                is_verified: false,
            });

            const created = await hospitalService.create({ hospital_name: 'BV Test Flow' });
            expect(created.verification_status).toBe('pending');

            // Step 2: Admin đánh dấu đang xem xét → in_review
            (userService.update as jest.Mock).mockResolvedValue({
                id: hospitalId,
                verification_status: 'in_review',
            });

            await hospitalService.updateVerificationStatus(hospitalId, 'in_review', adminId, 'Đang liên hệ Zalo');
            let updateCall = (userService.update as jest.Mock).mock.calls[0][1];
            expect(updateCall.verification_status).toBe('in_review');

            // Step 3: Admin duyệt → approved
            (userService.update as jest.Mock).mockClear();
            (userService.update as jest.Mock).mockResolvedValue({
                id: hospitalId,
                verification_status: 'approved',
                is_verified: true,
            });

            const approved = await hospitalService.updateVerificationStatus(hospitalId, 'approved', adminId, 'Đã xác minh qua Zalo');
            updateCall = (userService.update as jest.Mock).mock.calls[0][1];
            expect(updateCall.verification_status).toBe('approved');
            expect(updateCall.is_verified).toBe(true);
            expect(updateCall.verified_at).toBeTruthy();
            expect(approved.is_verified).toBe(true);
        });
    });

    describe('Luồng nghiệp vụ: pending → rejected → cập nhật → pending', () => {
        test('BV bị từ chối có thể gửi lại sau khi cập nhật', async () => {
            const hospitalId = 'hospital-reject-1';
            const adminId = 'admin-reject-1';

            // Step 1: BV bị từ chối
            (userService.update as jest.Mock).mockResolvedValue({
                id: hospitalId,
                verification_status: 'rejected',
                is_verified: false,
                verification_note: 'Thiếu giấy phép',
            });

            const rejected = await hospitalService.updateVerificationStatus(hospitalId, 'rejected', adminId, 'Thiếu giấy phép');
            expect(rejected.verification_status).toBe('rejected');
            expect(rejected.verification_note).toBe('Thiếu giấy phép');

            // Step 2: BV cập nhật hồ sơ và gửi lại (Admin reset status về pending)
            (userService.update as jest.Mock).mockClear();
            (userService.update as jest.Mock).mockResolvedValue({
                id: hospitalId,
                verification_status: 'pending',
                verification_note: null,
            });

            // Simulating admin or system resetting status
            await hospitalService.update(hospitalId, {
                verification_status: 'pending',
                verification_note: null,
            });

            const resetCall = (userService.update as jest.Mock).mock.calls[0][1];
            expect(resetCall.verification_status).toBe('pending');
            expect(resetCall.verification_note).toBeNull();
        });
    });
});
