import { supabase } from "@/lib/supabase";
import { Voucher } from "@/lib/database.types";

export const voucherService = {
    async getAll() {
        const { data, error } = await supabase
            .from("vouchers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error('Voucher getAll error:', error);
            throw new Error(error.message || 'Không thể tải danh sách voucher');
        }

        return data as Voucher[];
    },

    async create(voucher: Partial<Voucher>) {
        console.log('Creating voucher with data:', voucher);

        const { data, error } = await supabase
            .from("vouchers")
            .insert(voucher)
            .select()
            .single();

        if (error) {
            console.error('Voucher create error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(error.message || error.hint || 'Không thể tạo voucher. Vui lòng kiểm tra quyền truy cập.');
        }

        if (!data) {
            throw new Error('Không nhận được dữ liệu sau khi tạo voucher');
        }

        return data as Voucher;
    },

    async update(id: string, updates: Partial<Voucher>) {
        console.log('Updating voucher:', id, 'with data:', updates);

        const { data, error } = await supabase
            .from("vouchers")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error('Voucher update error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(error.message || error.hint || 'Không thể cập nhật voucher. Vui lòng kiểm tra quyền truy cập.');
        }

        if (!data) {
            throw new Error('Không nhận được dữ liệu sau khi cập nhật voucher');
        }

        return data as Voucher;
    },

    async delete(id: string) {
        const { error } = await supabase.from("vouchers").delete().eq("id", id);

        if (error) {
            console.error('Voucher delete error:', error);
            throw new Error(error.message || 'Không thể xóa voucher');
        }
    },
};
