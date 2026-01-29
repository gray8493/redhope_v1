import { supabase } from '@/lib/supabase';

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
    }
};
