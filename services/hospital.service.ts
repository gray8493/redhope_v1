import { userService } from '@/services/user.service';
import { User, UpdateUser } from '@/lib/database.types';

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

    // Note: Creating a hospital now means creating a user with 'hospital' role
    // This usually happens through registration or admin invite.
    async create(hospitalData: Partial<User>): Promise<User> {
        return userService.create({
            full_name: hospitalData.hospital_name || 'Hospital',
            email: `hospital_${Date.now()}@redhope.vn`, // Placeholder email
            role: 'hospital',
            hospital_name: hospitalData.hospital_name,
            hospital_address: hospitalData.hospital_address,
            license_number: hospitalData.license_number,
            is_verified: hospitalData.is_verified || false
        } as any);
    },

    async update(id: string, updates: UpdateUser): Promise<User> {
        return userService.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        return userService.delete(id);
    }
};
