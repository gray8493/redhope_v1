import { supabase } from "@/lib/supabase";
import { Voucher } from "@/lib/database.types";

export const voucherService = {
    async getAll() {
        const { data, error } = await supabase
            .from("vouchers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        return data as Voucher[];
    },

    async create(voucher: Partial<Voucher>) {
        const { data, error } = await supabase
            .from("vouchers")
            .insert(voucher)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Voucher;
    },

    async update(id: string, updates: Partial<Voucher>) {
        const { data, error } = await supabase
            .from("vouchers")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Voucher;
    },

    async delete(id: string) {
        const { error } = await supabase.from("vouchers").delete().eq("id", id);

        if (error) {
            throw error;
        }
    },
};
