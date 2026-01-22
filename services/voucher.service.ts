import { supabase } from '@/lib/supabase';
import { Voucher, InsertVoucher, UpdateVoucher } from '@/lib/database.types';

export const voucherService = {
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
    }
};
