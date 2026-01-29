import { supabase } from '@/lib/supabase';
import { userService } from './user.service';

export const bloodService = {
    /**
     * Xác nhận hiến máu thành công. 
     * DB Trigger sẽ tự động cộng điểm và cập nhật trạng thái appointment.
     */
    completeDonation: async (appointmentId: string, donorId: string, hospitalId: string, volumeMl: number) => {
        try {
            const { data, error } = await supabase
                .from('donation_records')
                .insert({
                    appointment_id: appointmentId,
                    donor_id: donorId,
                    hospital_id: hospitalId,
                    volume_ml: volumeMl,
                    verified_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Trigger on_donation_verified sẽ tự động:
            // 1. Cập nhật appointments.status = 'Completed'
            // 2. Cộng 100 điểm cho users.current_points

            return { success: true, data };
        } catch (error: any) {
            console.error('[BloodService] Error completing donation:', error);
            throw error;
        }
    },

    async getHospitalStats(hospitalId: string) {
        try {
            const { data, error } = await supabase
                .from('donation_records')
                .select('volume_ml, blood_group_confirmed')
                .eq('hospital_id', hospitalId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[BloodService] Error getting hospital stats:', error);
            throw error;
        }
    },

    async getDonorStats(donorId: string) {
        try {
            const { data, error } = await supabase
                .from('donation_records')
                .select('volume_ml')
                .eq('donor_id', donorId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[BloodService] Error getting donor stats:', error);
            throw error;
        }
    },

    async getDonations(donorId: string) {
        try {
            const { data, error } = await supabase
                .from('donation_records')
                .select(`
                    *,
                    hospital:hospital_id (
                        hospital_name,
                        city,
                        district
                    )
                `)
                .eq('donor_id', donorId)
                .order('verified_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[BloodService] Error fetching donations:', error);
            throw error;
        }
    }
};
