export const MOCK_REGISTRATIONS = [
    {
        id: 'reg-1',
        user: { full_name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com', phone: '0901234567', blood_group: 'A+', address: 'Quận 1, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'A+', blood_volume: 350, created_at: '2026-02-01T08:00:00'
    },
    {
        id: 'reg-2',
        user: { full_name: 'Trần Thị Bình', email: 'tranthibinh@gmail.com', phone: '0912345678', blood_group: 'O+', address: 'Quận 3, Hồ Chí Minh' },
        status: 'Completed', blood_type: 'O+', blood_volume: 250, created_at: '2026-02-01T08:30:00', completed_at: '2026-02-01T09:15:00'
    },
    {
        id: 'reg-3',
        user: { full_name: 'Lê Văn Cường', email: 'levancuong@gmail.com', phone: '0923456789', blood_group: 'B+', address: 'Quận 5, Hồ Chí Minh' },
        status: 'Deferred', blood_type: 'B+', blood_volume: 450, created_at: '2026-02-01T09:00:00', defer_reason: 'Huyết áp thấp'
    },
    {
        id: 'reg-4',
        user: { full_name: 'Phạm Thị Dung', email: 'phamthidung@gmail.com', phone: '0934567890', blood_group: 'AB+', address: 'Quận 10, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'AB+', blood_volume: 350, created_at: '2026-02-01T09:30:00'
    },
    {
        id: 'reg-5',
        user: { full_name: 'Hoàng Văn Em', email: 'hoangvanem@gmail.com', phone: '0945678901', blood_group: 'O-', address: 'Quận Bình Thạnh, Hồ Chí Minh' },
        status: 'Completed', blood_type: 'O-', blood_volume: 450, created_at: '2026-02-01T10:00:00', completed_at: '2026-02-01T10:45:00'
    },
    {
        id: 'reg-6',
        user: { full_name: 'Vũ Thị Fương', email: 'vuthifuong@gmail.com', phone: '0956789012', blood_group: 'A-', address: 'Quận Gò Vấp, Hồ Chí Minh' },
        status: 'Cancelled', blood_type: 'A-', blood_volume: 350, created_at: '2026-02-01T10:30:00'
    },
    {
        id: 'reg-7',
        user: { full_name: 'Ngô Văn Giang', email: 'ngovangiang@gmail.com', phone: '0967890123', blood_group: 'B-', address: 'Quận Phú Nhuận, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'B-', blood_volume: 250, created_at: '2026-02-01T11:00:00'
    },
    {
        id: 'reg-8',
        user: { full_name: 'Đặng Thị Hoa', email: 'dangthihoa@gmail.com', phone: '0978901234', blood_group: 'AB-', address: 'Quận Tân Bình, Hồ Chí Minh' },
        status: 'Deferred', blood_type: 'AB-', blood_volume: 350, created_at: '2026-02-01T13:30:00', defer_reason: 'Hemoglobin thấp'
    },
    {
        id: 'reg-9',
        user: { full_name: 'Bùi Văn Hùng', email: 'buivanhung@gmail.com', phone: '0989012345', blood_group: 'O+', address: 'Thành phố Thủ Đức, Hồ Chí Minh' },
        status: 'Completed', blood_type: 'O+', blood_volume: 350, created_at: '2026-02-01T14:00:00', completed_at: '2026-02-01T14:45:00'
    },
    {
        id: 'reg-10',
        user: { full_name: 'Đỗ Thị Lan', email: 'dothilan@gmail.com', phone: '0990123456', blood_group: 'A+', address: 'Quận 7, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'A+', blood_volume: 450, created_at: '2026-02-01T14:30:00'
    },
    {
        id: 'reg-11',
        user: { full_name: 'Trương Văn Minh', email: 'truongvanminh@gmail.com', phone: '0901122334', blood_group: 'B+', address: 'Quận 4, Hồ Chí Minh' },
        status: 'Completed', blood_type: 'B+', blood_volume: 350, created_at: '2026-02-01T15:00:00', completed_at: '2026-02-01T15:40:00'
    },
    {
        id: 'reg-12',
        user: { full_name: 'Lý Thị Ngọc', email: 'lythingoc@gmail.com', phone: '0912233445', blood_group: 'AB+', address: 'Quận 8, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'AB+', blood_volume: 250, created_at: '2026-02-01T15:30:00'
    },
    {
        id: 'reg-13',
        user: { full_name: 'Dương Văn Oanh', email: 'duongvanoanh@gmail.com', phone: '0923344556', blood_group: 'O-', address: 'Quận 6, Hồ Chí Minh' },
        status: 'Deferred', blood_type: 'O-', blood_volume: 350, created_at: '2026-02-01T16:00:00', defer_reason: 'Sốt nhẹ'
    },
    {
        id: 'reg-14',
        user: { full_name: 'Hồ Thị Phương', email: 'hothiphuong@gmail.com', phone: '0934455667', blood_group: 'A-', address: 'Quận 11, Hồ Chí Minh' },
        status: 'Completed', blood_type: 'A-', blood_volume: 450, created_at: '2026-02-01T16:30:00', completed_at: '2026-02-01T17:15:00'
    },
    {
        id: 'reg-15',
        user: { full_name: 'Võ Văn Quang', email: 'vovanquang@gmail.com', phone: '0945566778', blood_group: 'B-', address: 'Huyện Bình Chánh, Hồ Chí Minh' },
        status: 'Booked', blood_type: 'B-', blood_volume: 350, created_at: '2026-02-01T17:00:00'
    }
];
