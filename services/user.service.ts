// User Service - CRUD operations for users table
import { supabase } from '@/lib/supabase';
import { User, InsertUser, UpdateUser } from '@/lib/database.types';
import { error } from 'console';

export const userService = {
    // Get all users
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as User[];
    },

    // Get only donors
    async getDonors(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'donor')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as User[];
    },

    // Get donor count
    async getCount(): Promise<number> {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'donor');

        if (error) throw error;
        return count || 0;
    },

    // Get recent users
    async getRecent(limit: number = 5): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('id', id)
            .maybeSingle(); // Better for handling non-existent rows

        if (error) throw error;
        if (!data) throw new Error("User record not found to update.");
        return data;
    },

    // Get user by email
    async getByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) throw error;
        return (data || null) as User | null;
    },

    // Upsert user (Update or Create)
    async upsert(id: string, data: InsertUser): Promise<User> {
        // Defensive check: Ensure full_name is never null/empty if it's being inserted/upserted
        const finalData = {
            ...data,
            id,
            full_name: data.full_name || (data as any).hospital_name || data.email?.split('@')[0] || `User_${id.slice(0, 8)}`
        };

        const { data: result, error } = await supabase
            .from('users')
            .upsert(
                finalData,
                { onConflict: 'id' } // Upsert based on primary ID to prevent cross-account overwrites
            )
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!result) throw new Error("Failed to upsert user record.");
        return result;
    },

    // Create user
    async create(data: InsertUser): Promise<User> {
        const { data: result, error } = await supabase
            .from('users')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    // Update user
    async update(id: string, data: UpdateUser): Promise<User> {
        const { data: result, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    // Delete user
    async delete(id: string): Promise<void> {
        const response = await fetch(`/api/manage-users/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detailedMsg = errorData.message || errorData.details || errorData.error || response.statusText;
            throw new Error(`Lỗi khi xóa người dùng: ${detailedMsg}`);
        }
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
        // Use atomic RPC call to avoid race conditions
        const { data, error } = await supabase.rpc('increment_points', {
            row_id: id,
            count: points
        });

        if (error) throw error;


        // RPC returns void, so allow refetching the updated record to return valid User object
        const updatedUser = await this.getById(id);
        if (!updatedUser) {
            throw new Error('User not found after updating points');
        }
        return updatedUser;
    },

    // Search users
    async search(query: string): Promise<User[]> {
        if (!query) return [];
        const sanitizedQuery = query.replace(/[%\(\)\.\,\*\\\\]/g, '').trim();
        if (!sanitizedQuery) return [];

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Search only donors
    async searchDonors(query: string): Promise<User[]> {
        if (!query) return [];
        const sanitizedQuery = query.replace(/[%\(\)\.\,\*\\\\]/g, '').trim();
        if (!sanitizedQuery) return [];

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'donor')
            .or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Upload image (avatar or cover)
    async uploadImage(file: File, folder: string = 'avatars'): Promise<string> {
        // SECURITY: Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)');
        }

        // SECURITY: Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File ảnh không được vượt quá 5MB');
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!fileExt || !allowedExts.includes(fileExt)) {
            throw new Error('Phần mở rộng file không hợp lệ');
        }

        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(folder)
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from(folder).getPublicUrl(filePath);
        return data.publicUrl;
    },

    // Legacy support or specific avatar wrapper
    async uploadAvatar(file: File): Promise<string> {
        return this.uploadImage(file, 'avatars');
    }
};
