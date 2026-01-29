import { supabase } from '@/lib/supabase';

export interface SystemSettings {
    id?: number;
    low_stock_alert: boolean;
    donation_reminder: boolean;
    emergency_broadcast: boolean;
    ai_sensitivity: number;
    min_hemoglobin: number;
    min_weight: number;
    question_version: string;
    points_per_donation: number;
    referral_bonus: number;
    exchange_rate: number;
    points_expiry: boolean;
    two_factor_auth: string;
}

export const settingService = {
    async getSettings(): Promise<SystemSettings> {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.warn("Could not load settings from DB, using defaults or LocalStorage fallback", error);
            // Default object matches DB defaults
            return {
                low_stock_alert: false,
                donation_reminder: true,
                emergency_broadcast: false,
                ai_sensitivity: 7,
                min_hemoglobin: 12.5,
                min_weight: 50,
                question_version: 'V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)',
                points_per_donation: 1000,
                referral_bonus: 250,
                exchange_rate: 500,
                points_expiry: true,
                two_factor_auth: 'Bắt buộc cho tất cả Quản trị viên'
            };
        }
        return data;
    },

    async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
        const { error } = await supabase
            .from('system_settings')
            .update({
                ...settings,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) throw error;
    }
};
