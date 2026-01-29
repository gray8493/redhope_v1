import { supabase } from '@/lib/supabase';
import { notificationService } from './notification.service';

export const campaignService = {
    async getAll(hospitalId?: string) {
        let query = supabase
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name)')
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
            .select('*, hospital:users(full_name, hospital_name)')
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
            .order('urgency_level', { ascending: false });

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
    }
};
