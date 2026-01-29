import { supabase } from '@/lib/supabase';
import { Voucher, InsertVoucher, UpdateVoucher } from '@/lib/database.types';

export const pointService = {
    async getAll(): Promise<Voucher[]> {
        const { data, error } = await supabase
            .from('vouchers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Voucher | null> {
        const { data, error } = await supabase
            .from('vouchers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    async create(voucher: InsertVoucher): Promise<Voucher> {
        const { data, error } = await supabase
            .from('vouchers')
            .insert(voucher)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: UpdateVoucher): Promise<Voucher> {
        const { data, error } = await supabase
            .from('vouchers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { data, error } = await supabase
            .from('vouchers')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error('Voucher not found or already deleted');
        }
    },

    async calculatePoints(donationData: any) {
        // Logic for calculating points
        console.log("Calculating points for unit...", donationData);
        return 100;
    },

    async redeemVoucher(userId: string, voucherId: string) {
        try {
            // 1. Lấy thông tin voucher và người dùng
            const [{ data: voucher }, { data: user }] = await Promise.all([
                supabase.from('vouchers').select('*').eq('id', voucherId).single(),
                supabase.from('users').select('current_points').eq('id', userId).single()
            ]);

            if (!voucher || !user) throw new Error('Dữ liệu không hợp lệ');

            // 2. Kiểm tra điều kiện
            if (user.current_points < voucher.point_cost) {
                throw new Error('Bạn không đủ điểm để đổi voucher này');
            }
            if (voucher.stock_quantity <= 0) {
                throw new Error('Voucher đã hết lượt đổi');
            }

            // 3. Thực hiện giao dịch (Trừ điểm & Tạo bản ghi đổi quà)
            // Lưu ý: Trong thực tế nên dùng RPC hoặc Database Transaction
            const { error: updateError } = await supabase
                .from('users')
                .update({ current_points: user.current_points - voucher.point_cost })
                .eq('id', userId);

            if (updateError) throw updateError;

            const { data: redemption, error: redeemError } = await supabase
                .from('user_redemptions')
                .insert({
                    user_id: userId,
                    voucher_id: voucherId,
                    status: 'Redeemed'
                })
                .select()
                .single();

            if (redeemError) throw redeemError;

            // 4. Giảm số lượng voucher trong kho
            await supabase
                .from('vouchers')
                .update({ stock_quantity: voucher.stock_quantity - 1 })
                .eq('id', voucherId);

            return { success: true, redemption };
        } catch (error: any) {
            console.error('[PointService] Error redeeming voucher:', error);
            throw error;
        }
    },
    async getRedemptions(userId: string) {
        try {
            const { data, error } = await supabase
                .from('user_redemptions')
                .select(`
                    id,
                    status,
                    created_at,
                    vouchers (
                        partner_name,
                        point_cost
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[PointService] Error fetching redemptions:', error);
            throw error;
        }
    }
};
