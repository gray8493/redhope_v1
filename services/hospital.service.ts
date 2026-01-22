import { supabase } from '@/lib/supabase';
import { Hospital, InsertHospital, UpdateHospital } from '@/lib/database.types';

export const hospitalService = {
    async getAll(): Promise<Hospital[]> {
        const { data, error } = await supabase
            .from('hospitals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Hospital | null> {
        const { data, error } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    async create(hospital: InsertHospital): Promise<Hospital> {
        const { data, error } = await supabase
            .from('hospitals')
            .insert(hospital)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: UpdateHospital): Promise<Hospital> {
        const { data, error } = await supabase
            .from('hospitals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('hospitals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
