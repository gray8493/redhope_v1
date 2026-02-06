import { supabase } from '@/lib/supabase';

export interface FinancialDonation {
    id: string;
    donor_id: string | null;
    donor_name: string;
    amount: number;
    payment_method: 'momo' | 'bank_transfer';
    status: 'pending' | 'completed' | 'failed';
    transaction_code: string;
    is_anonymous: boolean;
    message?: string;
    created_at: string;
}

export const donationService = {
    /**
     * Lấy thống kê tổng quan về quyên góp
     */
    async getStats() {
        try {
            const { data, error } = await supabase
                .from('financial_donations')
                .select('amount, donor_id')
                .eq('status', 'completed');

            if (error) throw error;

            const totalAmount = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
            const uniqueDonors = new Set(data?.map(d => d.donor_id).filter(Boolean)).size;
            const anonymousDonations = data?.filter(d => !d.donor_id).length || 0;

            return {
                totalAmount,
                totalDonors: uniqueDonors + anonymousDonations,
                totalTransactions: data?.length || 0
            };
        } catch (error) {
            console.error('[DonationService] Error getting stats:', error);
            return { totalAmount: 0, totalDonors: 0, totalTransactions: 0 };
        }
    },

    /**
     * Lấy danh sách hoạt động quyên góp gần đây
     */
    async getRecentDonations(limit: number = 5) {
        try {
            const { data, error } = await supabase
                .from('financial_donations')
                .select('*')
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[DonationService] Error getting recent donations:', error);
            return [];
        }
    },

    /**
     * Lấy bảng xếp hạng top nhà hảo tâm
     */
    async getLeaderboard(limit: number = 10) {
        try {
            // Lấy tất cả donations đã hoàn thành (không ẩn danh)
            const { data, error } = await supabase
                .from('financial_donations')
                .select(`
                    donor_id,
                    donor_name,
                    amount
                `)
                .eq('status', 'completed')
                .eq('is_anonymous', false);

            if (error) throw error;

            // Tổng hợp theo donor_name (cho phép donor_id null)
            const donorTotals: Record<string, { id: string | null; total: number; count: number }> = {};

            data?.forEach(d => {
                const name = d.donor_name;
                if (name && name !== 'Ẩn danh') {
                    if (!donorTotals[name]) {
                        donorTotals[name] = { id: d.donor_id, total: 0, count: 0 };
                    }
                    donorTotals[name].total += d.amount || 0;
                    donorTotals[name].count += 1;
                }
            });

            // Chuyển thành mảng và sắp xếp
            const leaderboard = Object.entries(donorTotals)
                .map(([name, info]) => ({
                    donor_id: info.id || name,
                    donor_name: name,
                    total_amount: info.total,
                    donation_count: info.count
                }))
                .sort((a, b) => b.total_amount - a.total_amount)
                .slice(0, limit);

            return leaderboard;
        } catch (error) {
            console.error('[DonationService] Error getting leaderboard:', error);
            return [];
        }
    },

    /**
     * Tạo giao dịch quyên góp mới
     */
    async createDonation(data: {
        donorId?: string;
        donorName: string;
        amount: number;
        paymentMethod: 'momo' | 'bank_transfer';
        isAnonymous: boolean;
        message?: string;
    }) {
        try {
            const transactionCode = `RH${Date.now()}${Math.floor(Math.random() * 1000)}`;

            const { data: donation, error } = await supabase
                .from('financial_donations')
                .insert({
                    donor_id: data.donorId || null,
                    donor_name: data.isAnonymous ? 'Ẩn danh' : data.donorName,
                    amount: data.amount,
                    payment_method: data.paymentMethod,
                    status: 'pending',
                    transaction_code: transactionCode,
                    is_anonymous: data.isAnonymous,
                    message: data.message
                })
                .select()
                .single();

            if (error) throw error;
            return donation;
        } catch (error) {
            console.error('[DonationService] Error creating donation:', error);
            throw error;
        }
    },

    /**
     * Xác nhận thanh toán hoàn tất
     */
    async confirmPayment(donationId: string) {
        try {
            const { data, error } = await supabase
                .from('financial_donations')
                .update({ status: 'completed' })
                .eq('id', donationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[DonationService] Error confirming payment:', error);
            throw error;
        }
    }
};
