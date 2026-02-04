import { supabase } from "@/lib/supabase";

export interface ScreeningData {
    status: 'not_done' | 'passed' | 'failed';
    verified_at: string | null;
}

export const screeningService = {
    /**
     * Lấy trạng thái screening của user từ user_metadata
     */
    async getScreeningStatus(userId: string): Promise<ScreeningData> {
        // Lấy user mới nhất để có metadata update
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user || user.id !== userId) {
            console.error('[ScreeningService] Error fetching user metadata:', error);
            // Fallback: Check localStorage if user fetch fails? No, stick to secure source.
            return { status: 'not_done', verified_at: null };
        }

        const metadata = user.user_metadata || {};
        const status = metadata.screening_status;
        const verifiedAt = metadata.screening_verified_at;

        // Check if passed screening is still valid (within 24 hours)
        if (status === 'passed' && verifiedAt) {
            const verifiedTime = new Date(verifiedAt).getTime();
            const now = Date.now();
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;

            if (now - verifiedTime > ONE_DAY_MS) {
                // Expired, auto-update to not_done
                await this.updateScreeningStatus(userId, 'not_done');
                return { status: 'not_done', verified_at: null };
            }
        }

        return {
            status: (status as 'not_done' | 'passed' | 'failed') || 'not_done',
            verified_at: verifiedAt || null
        };
    },

    /**
     * Cập nhật trạng thái screening vào user_metadata
     */
    async updateScreeningStatus(
        userId: string,
        status: 'not_done' | 'passed' | 'failed'
    ): Promise<boolean> {

        const updateData: any = {
            screening_status: status
        };

        // Chỉ set verified_at khi passed
        if (status === 'passed') {
            updateData.screening_verified_at = new Date().toISOString();
        } else {
            updateData.screening_verified_at = null;
        }

        const { error } = await supabase.auth.updateUser({
            data: updateData
        });

        if (error) {
            console.error('[ScreeningService] Error updating metadata:', error);
            return false;
        }

        return true;
    },

    /**
     * Check xem user có đủ điều kiện đăng ký không
     * Returns: { eligible: boolean, reason: string }
     */
    async checkEligibility(userId: string): Promise<{ eligible: boolean; reason: string; status: string }> {
        const screening = await this.getScreeningStatus(userId);

        if (screening.status === 'passed') {
            return {
                eligible: true,
                reason: 'Bạn đã đủ điều kiện sức khỏe để hiến máu.',
                status: 'passed'
            };
        }

        if (screening.status === 'failed') {
            return {
                eligible: false,
                reason: 'Bạn chưa đủ điều kiện sức khỏe. Vui lòng cải thiện và làm lại bài test.',
                status: 'failed'
            };
        }

        return {
            eligible: false,
            reason: 'Bạn chưa thực hiện sàng lọc sức khỏe. Vui lòng hoàn thành bài test.',
            status: 'not_done'
        };
    }
};
