import { userService } from '@/services/user.service';
import { supabase } from '@/lib/supabase';
import { User, UpdateUser, VerificationStatus } from '@/lib/database.types';

export const hospitalService = {
    async getAll(): Promise<User[]> {
        const users = await userService.getAll();
        return (users.filter(u => u.role === 'hospital')) as User[];
    },

    async getCount(): Promise<number> {
        const users = await userService.getAll();
        return users.filter(u => u.role === 'hospital').length;
    },

    async getById(id: string): Promise<User | null> {
        const user = await userService.getById(id);
        return user?.role === 'hospital' ? user : null;
    },

    // Get hospitals by verification status
    async getByVerificationStatus(status: VerificationStatus): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'hospital')
            .eq('verification_status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as User[];
    },

    // Get pending + in_review hospitals for admin
    async getPendingHospitals(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'hospital')
            .in('verification_status', ['pending', 'in_review'])
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as User[];
    },

    // Update verification status (admin action)
    async updateVerificationStatus(
        hospitalId: string,
        status: VerificationStatus,
        adminId: string,
        note?: string
    ): Promise<User> {
        const updates: UpdateUser = {
            verification_status: status,
            verification_note: note || null,
        };

        if (status === 'approved') {
            updates.is_verified = true;
            updates.verified_at = new Date().toISOString();
            updates.verified_by = adminId;
        } else if (status === 'rejected') {
            updates.is_verified = false;
            updates.verified_at = null;
            updates.verified_by = adminId;
        } else if (status === 'in_review') {
            updates.verified_by = adminId;
        }

        return userService.update(hospitalId, updates);
    },

    // Note: Creating a hospital now means creating a user with 'hospital' role
    async create(hospitalData: Partial<User>): Promise<User> {
        return userService.create({
            full_name: hospitalData.hospital_name || 'Hospital',
            email: `hospital_${Date.now()}@redhope.vn`,
            role: 'hospital',
            hospital_name: hospitalData.hospital_name,
            hospital_address: hospitalData.hospital_address,
            license_number: hospitalData.license_number,
            is_verified: hospitalData.is_verified || false,
            verification_status: 'pending'
        } as any);
    },

    async update(id: string, updates: UpdateUser): Promise<User> {
        return userService.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        return userService.delete(id);
    }
};
