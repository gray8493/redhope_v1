import { supabase } from '@/lib/supabase';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_read: boolean;
    action_type?: string;
    action_url?: string;
    metadata?: any;
    created_at: string;
}

export interface CreateNotificationData {
    user_id: string;
    title: string;
    content: string;
    action_type?: string;
    action_url?: string;
    metadata?: any;
}

/**
 * Lấy danh sách thông báo của user
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

/**
 * Đếm số thông báo chưa đọc
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        return 0;
    }
}

/**
 * Đánh dấu một thông báo đã đọc
 */
export async function markAsRead(notificationId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 */
export async function markAllAsRead(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Xóa một thông báo
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

/**
 * Tạo một thông báo đơn lẻ
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.user_id,
                title: data.title,
                content: data.content,
                action_type: data.action_type,
                action_url: data.action_url,
                metadata: data.metadata,
                is_read: false,
            })
            .select()
            .single();

        if (error) throw error;
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

/**
 * Tạo thông báo hàng loạt cho nhiều users
 */
export async function createBulkNotifications(
    userIds: string[],
    data: Omit<CreateNotificationData, 'user_id'>
): Promise<void> {
    try {
        const notifications = userIds.map(userId => ({
            user_id: userId,
            title: data.title,
            content: data.content,
            action_type: data.action_type,
            action_url: data.action_url,
            metadata: data.metadata,
            is_read: false,
        }));

        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) throw error;
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
}

/**
 * Gửi thông báo chiến dịch mới đến donors phù hợp
 * (cùng nhóm máu và cùng tỉnh/thành)
 */
export async function sendCampaignNotification(campaignId: string): Promise<void> {
    try {
        // 1. Lấy thông tin chiến dịch
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*, hospital:users!campaigns_hospital_id_fkey(hospital_name)')
            .eq('id', campaignId)
            .single();

        if (campaignError) throw campaignError;
        if (!campaign) throw new Error('Campaign not found');

        // 2. Query donors phù hợp (cùng tỉnh/thành)
        // Note: Nếu campaign có yêu cầu nhóm máu cụ thể, có thể filter thêm
        const { data: donors, error: donorsError } = await supabase
            .from('users')
            .select('id, full_name, blood_group')
            .eq('role', 'donor')
            .eq('city', campaign.city);

        if (donorsError) throw donorsError;
        if (!donors || donors.length === 0) {
            console.log('No matching donors found for campaign notification');
            return;
        }

        // 3. Tạo thông báo hàng loạt
        const hospitalName = campaign.hospital?.hospital_name || 'Bệnh viện';
        await createBulkNotifications(
            donors.map(d => d.id),
            {
                title: '🩸 Chiến dịch hiến máu mới gần bạn!',
                content: `${hospitalName} tổ chức chiến dịch "${campaign.name}" tại ${campaign.district}, ${campaign.city}. Hãy đăng ký ngay!`,
                action_type: 'view_campaign',
                action_url: `/campaigns/${campaignId}`,
                metadata: {
                    campaign_id: campaignId,
                    campaign_name: campaign.name,
                    hospital_name: hospitalName,
                },
            }
        );

        console.log(`✅ Sent campaign notification to ${donors.length} donors`);
    } catch (error) {
        console.error('Error sending campaign notification:', error);
        throw error;
    }
}

/**
 * Thông báo cho hospital khi có người đăng ký chiến dịch
 */
export async function notifyHospitalNewRegistration(
    campaignId: string,
    donorName: string
): Promise<void> {
    try {
        // 1. Lấy thông tin chiến dịch và hospital_id
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('hospital_id, name')
            .eq('id', campaignId)
            .single();

        if (campaignError) throw campaignError;
        if (!campaign) throw new Error('Campaign not found');

        // 2. Tạo thông báo cho hospital
        await createNotification({
            user_id: campaign.hospital_id,
            title: '👤 Có người đăng ký mới!',
            content: `${donorName} vừa đăng ký tham gia chiến dịch "${campaign.name}". Nhấn để xem danh sách.`,
            action_type: 'view_registrations',
            action_url: `/hospital-campaign/${campaignId}?tab=registrations`,
            metadata: {
                campaign_id: campaignId,
                campaign_name: campaign.name,
                donor_name: donorName,
            },
        });

        console.log(`✅ Notified hospital about new registration: ${donorName}`);
    } catch (error) {
        console.error('Error notifying hospital:', error);
        throw error;
    }
}

/**
 * Thông báo cho donor sau khi đăng ký thành công
 */
export async function notifyDonorRegistrationSuccess(
    userId: string,
    appointmentId: string,
    campaignName: string
): Promise<void> {
    try {
        await createNotification({
            user_id: userId,
            title: '✅ Đăng ký thành công!',
            content: `Bạn đã đăng ký tham gia chiến dịch "${campaignName}" thành công. Vui lòng đến đúng giờ!`,
            action_type: 'view_appointment',
            action_url: `/appointments/${appointmentId}`,
            metadata: {
                appointment_id: appointmentId,
                campaign_name: campaignName,
            },
        });

        console.log(`✅ Notified donor about successful registration`);
    } catch (error) {
        console.error('Error notifying donor:', error);
        throw error;
    }
}

/**
 * Thông báo khi admin duyệt chiến dịch
 */
export async function notifyHospitalCampaignApproved(
    hospitalId: string,
    campaignId: string,
    campaignName: string
): Promise<void> {
    try {
        await createNotification({
            user_id: hospitalId,
            title: '✅ Chiến dịch đã được duyệt!',
            content: `Chiến dịch "${campaignName}" của bạn đã được admin phê duyệt. Chiến dịch đã được công khai.`,
            action_type: 'view_campaign',
            action_url: `/hospital-campaign/${campaignId}`,
            metadata: {
                campaign_id: campaignId,
                campaign_name: campaignName,
            },
        });
    } catch (error) {
        console.error('Error notifying hospital about approval:', error);
        throw error;
    }
}

/**
 * Thông báo khi admin từ chối chiến dịch
 */
export async function notifyHospitalCampaignRejected(
    hospitalId: string,
    campaignId: string,
    campaignName: string,
    reason?: string
): Promise<void> {
    try {
        await createNotification({
            user_id: hospitalId,
            title: '❌ Chiến dịch bị từ chối',
            content: `Chiến dịch "${campaignName}" không được phê duyệt. ${reason ? `Lý do: ${reason}` : 'Vui lòng liên hệ admin để biết thêm chi tiết.'}`,
            action_type: 'view_campaign',
            action_url: `/hospital-campaign/${campaignId}`,
            metadata: {
                campaign_id: campaignId,
                campaign_name: campaignName,
                rejection_reason: reason,
            },
        });
    } catch (error) {
        console.error('Error notifying hospital about rejection:', error);
        throw error;
    }
}

export const notificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    createBulkNotifications,
    sendCampaignNotification,
    notifyHospitalNewRegistration,
    notifyDonorRegistrationSuccess,
    notifyHospitalCampaignApproved,
    notifyHospitalCampaignRejected,
};
