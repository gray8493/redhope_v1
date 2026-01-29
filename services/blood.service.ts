import { supabase } from '@/lib/supabase';
import { userService } from './user.service';

export const bloodService = {
    /**
     * Xác nhận hiến máu thành công và cộng điểm cho người hiến
     * @param donationId ID của bản ghi hiến máu
     * @param donorId ID của người hiến máu (user_id)
     * @param points Số điểm được cộng (mặc định là 100)
     */
    completeDonation: async (donationId: string, donorId: string, points: number = 100) => {
        try {
            // 1. Cập nhật trạng thái bản ghi hiến máu thành 'completed'
            const { error: donationError } = await supabase
                .from('donations')
                .update({
                    status: 'completed',
                    points_earned: points
                })
                .eq('id', donationId);

            if (donationError) throw donationError;

            // 2. Cộng điểm cho người hiến máu thông qua userService
            await userService.addPoints(donorId, points);

            // 3. (Tùy chọn) Có thể thêm thông báo tự động ở đây
            await supabase.from('notifications').insert({
                user_id: donorId,
                title: 'Hiến máu thành công!',
                message: `Cảm ơn bạn đã hiến máu cứu người. Bạn vừa được cộng ${points} điểm vào tài khoản.`,
                type: 'reward'
            });

            return { success: true };
        } catch (error: any) {
            console.error('[BloodService] Error completing donation:', error);
            throw error;
        }
    },

    getBloodAvailability: async () => {
        const { data, error } = await supabase
            .from('blood_inventory')
            .select('*');
        if (error) return [];
        return data;
    }
};
