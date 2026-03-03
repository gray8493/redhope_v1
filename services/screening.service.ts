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
     * Kiểm tra cooldown 3 tháng (84 ngày) kể từ lần hiến máu hoàn thành gần nhất.
     * Trả về { onCooldown, nextEligibleDate, daysSinceLast }
     */
    async checkDonationCooldown(userId: string): Promise<{
        onCooldown: boolean;
        nextEligibleDate: Date | null;
        daysSinceLast: number | null;
        daysRemaining: number | null;
    }> {
        const COOLDOWN_DAYS = 84; // 3 tháng = 84 ngày

        const { data, error } = await supabase
            .from('donation_records')
            .select('verified_at')
            .eq('donor_id', userId)
            .order('verified_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[ScreeningService] Error checking donation cooldown:', error);
            return { onCooldown: false, nextEligibleDate: null, daysSinceLast: null, daysRemaining: null };
        }

        if (!data?.verified_at) {
            return { onCooldown: false, nextEligibleDate: null, daysSinceLast: null, daysRemaining: null };
        }

        const lastDonation = new Date(data.verified_at);
        const now = new Date();
        const diffMs = now.getTime() - lastDonation.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < COOLDOWN_DAYS) {
            const nextDate = new Date(lastDonation);
            nextDate.setDate(nextDate.getDate() + COOLDOWN_DAYS);
            return {
                onCooldown: true,
                nextEligibleDate: nextDate,
                daysSinceLast: diffDays,
                daysRemaining: COOLDOWN_DAYS - diffDays
            };
        }

        return { onCooldown: false, nextEligibleDate: null, daysSinceLast: diffDays, daysRemaining: null };
    },

    /**
     * Check xem user có đủ điều kiện đăng ký không
     * Kiểm tra cả AI screening + cooldown 3 tháng
     * Returns: { eligible: boolean, reason: string, status: string }
     */
    async checkEligibility(userId: string): Promise<{ eligible: boolean; reason: string; status: string }> {
        // 1. Check cooldown 3 tháng trước
        const cooldown = await this.checkDonationCooldown(userId);
        if (cooldown.onCooldown && cooldown.nextEligibleDate) {
            const nextDateStr = cooldown.nextEligibleDate.toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            return {
                eligible: false,
                reason: `Bạn vừa hiến máu ${cooldown.daysSinceLast} ngày trước. Cần đợi đủ 3 tháng (84 ngày) mới được đăng ký lại. Ngày đủ điều kiện: ${nextDateStr} (còn ${cooldown.daysRemaining} ngày).`,
                status: 'cooldown'
            };
        }

        // 2. Check AI screening status
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
