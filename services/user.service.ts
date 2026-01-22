// User Service - CRUD operations for users table
import { supabase } from '@/lib/supabase';
import { User, InsertUser, UpdateUser } from '@/lib/database.types';

export const userService = {
    // Get all users
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get user by ID
    async getById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get user by email
    async getByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Create new user
    async create(user: InsertUser): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update user
    async update(id: string, updates: UpdateUser): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete user
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get users by blood group
    async getByBloodGroup(bloodGroup: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('blood_group', bloodGroup)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get users by city
    async getByCity(city: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('city', city)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Update user points
    async addPoints(id: string, points: number): Promise<User> {
        // First get current points
        const user = await this.getById(id);
        if (!user) throw new Error('User not found');

        const newPoints = (user.current_points || 0) + points;

        return this.update(id, { current_points: newPoints });
    },

    // Search users
    async search(query: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
