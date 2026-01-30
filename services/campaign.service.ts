import { supabase } from '@/lib/supabase';
import { notificationService } from './notification.service';

export const campaignService = {
    async getAll(hospitalId?: string) {
        let query = supabase
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name), appointments(*)')
            .order('start_time', { ascending: false });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getActive(hospitalId?: string) {
        let query = supabase
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name), appointments(*)')
            .eq('status', 'active')
            .order('start_time', { ascending: true });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getRequests(hospitalId?: string) {
        let query = supabase
            .from('blood_requests')
            .select('*, hospital:users(full_name, hospital_name, city, district)')
            .eq('status', 'Open')
            .order('created_at', { ascending: false });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createCampaign(campaignData: any) {
        const { data, error } = await supabase
            .from('campaigns')
            .insert(campaignData)
            .select()
            .single();

        if (error) throw error;

        // Gửi thông báo đến donors phù hợp (cùng tỉnh/thành)
        try {
            await notificationService.sendCampaignNotification(data.id);
        } catch (notifError) {
            console.error('Failed to send campaign notifications:', notifError);
            // Không throw error để không ảnh hưởng đến việc tạo chiến dịch
        }

        return data;
    },

    async getCampaignRegistrations(campaignId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                user:users(
                    id,
                    full_name,
                    email,
                    phone,
                    blood_group,
                    city,
                    district,
                    address
                )
            `)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateCampaign(id: string, campaignData: any) {
        const { data, error } = await supabase
            .from('campaigns')
            .update(campaignData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createBloodRequest(requestData: any) {
        const { data, error } = await supabase
            .from('blood_requests')
            .insert(requestData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async registerToBloodRequest(userId: string, requestId: string) {
        // 1. Tạo bản ghi đăng ký trong appointments
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                user_id: userId,
                blood_request_id: requestId,
                status: 'Booked',
                scheduled_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Lấy thông tin yêu cầu để gửi thông báo cho bệnh viện
        const { data: request } = await supabase
            .from('blood_requests')
            .select('hospital_id, required_blood_group')
            .eq('id', requestId)
            .single();

        if (request) {
            // Lấy tên donor
            const { data: donor } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', userId)
                .single();

            // Gửi thông báo cho bệnh viện
            console.log('Attempting to notify hospital:', request.hospital_id, 'for donor:', donor?.full_name);
            try {
                await notificationService.createNotification({
                    user_id: request.hospital_id,
                    title: '👤 Đăng ký hiến máu mới',
                    content: `Người hiến máu ${donor?.full_name || 'ẩn danh'} đã đăng ký tham gia hỗ trợ yêu cầu khẩn cấp (Nhóm ${request.required_blood_group}).`,
                    action_type: 'view_request',
                    action_url: `/hospital-requests`
                });
            } catch (notifError: any) {
                console.error('Failed to send notification to hospital but appointment was created:', notifError);
                // Không throw lại lỗi để tránh làm hỏng luồng đăng ký chính
            }
        }

        return data;
    },

    async getRequestRegistrations(requestId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                user:users(
                    id,
                    full_name,
                    email,
                    phone,
                    blood_group,
                    city,
                    district,
                    address
                )
            `)
            .eq('blood_request_id', requestId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getHospitalRequests(hospitalId: string) {
        const { data, error } = await supabase
            .from('blood_requests')
            .select('*, appointments(*)')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
