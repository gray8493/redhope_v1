import { supabase } from '@/lib/supabase';
import { notificationService } from './notification.service';

export const campaignService = {
    async getAll(hospitalId?: string) {
        try {
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
        } catch (error: any) {
            console.error('[CampaignService] Error in getAll:', error.message || error.details || error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*, hospital:users(full_name, hospital_name, city, district), appointments(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in getById:', error.message || error.details || error);
            throw error;
        }
    },

    async getActive(hospitalId?: string) {
        let query = supabase
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name, city, district, address), appointments(*)')
            .eq('status', 'active')
            .order('start_time', { ascending: true });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },
    ư
    async getRequests(hospitalId?: string) {
        let query = supabase
            .from('blood_requests')
            .select('*, hospital:users(full_name, hospital_name, city, district, address)')
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
        // 1. Check if already registered
        const { data: existing } = await supabase
            .from('appointments')
            .select('id')
            .eq('user_id', userId)
            .eq('blood_request_id', requestId)
            .maybeSingle();

        if (existing) throw new Error("Bạn đã đăng ký hỗ trợ yêu cầu này rồi.");

        // 2. Tạo bản ghi đăng ký trong appointments
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

        // 3. Lấy thông tin yêu cầu để gửi thông báo cho bệnh viện
        const { data: request } = await supabase
            .from('blood_requests')
            .select('hospital_id, required_blood_group')
            .eq('id', requestId)
            .single();

        if (request) {
            const { data: donor } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', userId)
                .single();

            try {
                await notificationService.createNotification({
                    user_id: request.hospital_id,
                    title: '👤 Đăng ký hiến máu mới',
                    content: `Người hiến máu ${donor?.full_name || 'ẩn danh'} đã đăng ký tham gia hỗ trợ yêu cầu khẩn cấp (Nhóm ${request.required_blood_group}).`,
                    action_type: 'view_request',
                    action_url: `/hospital-requests`
                });
            } catch (notifError: any) {
                console.error('Failed to send notification to hospital:', notifError);
            }
        }

        return data;
    },

    async registerToCampaign(userId: string, campaignId: string) {
        // 1. Check if already registered
        const { data: existing } = await supabase
            .from('appointments')
            .select('id')
            .eq('user_id', userId)
            .eq('campaign_id', campaignId)
            .maybeSingle();

        if (existing) throw new Error("Bạn đã đăng ký tham gia chiến dịch này rồi.");

        // 2. Tạo bản ghi đăng ký
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                user_id: userId,
                campaign_id: campaignId,
                status: 'Booked',
                scheduled_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Thông báo cho bệnh viện
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('hospital_id, name')
            .eq('id', campaignId)
            .single();

        if (campaign) {
            const { data: donor } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', userId)
                .single();

            try {
                await notificationService.createNotification({
                    user_id: campaign.hospital_id,
                    title: '📅 Đăng ký chiến dịch mới',
                    content: `Người hiến máu ${donor?.full_name || 'ẩn danh'} đã đăng ký tham gia chiến dịch "${campaign.name}".`,
                    action_type: 'view_registrations',
                    action_url: `/hospital-campaign/${campaignId}`
                });
            } catch (notifError: any) {
                console.error('Failed to send notification to hospital:', notifError);
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
    },

    async getUserAppointments(userId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                campaign:campaigns(
                    id,
                    name,
                    start_time,
                    end_time,
                    location_name,
                    hospital:users(hospital_name, address)
                ),
                blood_request:blood_requests(
                    id,
                    created_at,
                    required_blood_group,
                    hospital:users(hospital_name, address, district, city)
                )
            `)
            .eq('user_id', userId)
            .order('scheduled_time', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async sendAnnouncement(campaignId: string, message: string) {
        try {
            const response = await fetch('/api/campaign/send-announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, message }),
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to send announcement');
                return result;
            } else {
                const text = await response.text();
                console.error('[CampaignService] Non-JSON response:', text);
                throw new Error(`Server error: Received HTML instead of JSON. Status: ${response.status}`);
            }
        } catch (error: any) {
            console.error('[CampaignService] sendAnnouncement error:', error);
            throw error;
        }
    },

    // Update registration status (Booked -> Completed, Deferred, Cancelled)
    async updateRegistrationStatus(registrationId: string, status: string) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', registrationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in updateRegistrationStatus:', error.message || error);
            throw error;
        }
    },

    // Update registration details (blood_type, blood_volume, etc.)
    async updateRegistration(registrationId: string, updateData: { blood_type?: string; blood_volume?: number }) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update(updateData)
                .eq('id', registrationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in updateRegistration:', error.message || error);
            throw error;
        }
    }
};
