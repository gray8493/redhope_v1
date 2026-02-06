import { hospitalService } from '@/services/hospital.service';
import { userService } from '@/services/user.service';

// Mock userService
jest.mock('@/services/user.service', () => ({
    userService: {
        getAll: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('hospitalService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        test('should return only users with role hospital', async () => {
            const mockUsers = [
                { id: '1', full_name: 'Hospital A', role: 'hospital' },
                { id: '2', full_name: 'Donor B', role: 'donor' },
                { id: '3', full_name: 'Hospital C', role: 'hospital' },
                { id: '4', full_name: 'Admin D', role: 'admin' },
            ];

            (userService.getAll as jest.Mock).mockResolvedValue(mockUsers);

            const result = await hospitalService.getAll();

            expect(userService.getAll).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].role).toBe('hospital');
            expect(result[1].role).toBe('hospital');
            expect(result.map(h => h.id)).toEqual(['1', '3']);
        });

        test('should return empty array when no hospitals', async () => {
            const mockUsers = [
                { id: '1', full_name: 'Donor A', role: 'donor' },
            ];

            (userService.getAll as jest.Mock).mockResolvedValue(mockUsers);

            const result = await hospitalService.getAll();

            expect(result).toEqual([]);
        });

        test('should handle empty user list', async () => {
            (userService.getAll as jest.Mock).mockResolvedValue([]);

            const result = await hospitalService.getAll();

            expect(result).toEqual([]);
        });
    });

    describe('getCount', () => {
        test('should return count of hospitals', async () => {
            const mockUsers = [
                { id: '1', role: 'hospital' },
                { id: '2', role: 'donor' },
                { id: '3', role: 'hospital' },
                { id: '4', role: 'hospital' },
            ];

            (userService.getAll as jest.Mock).mockResolvedValue(mockUsers);

            const result = await hospitalService.getCount();

            expect(result).toBe(3);
        });

        test('should return 0 when no hospitals', async () => {
            (userService.getAll as jest.Mock).mockResolvedValue([
                { id: '1', role: 'donor' },
            ]);

            const result = await hospitalService.getCount();

            expect(result).toBe(0);
        });
    });

    describe('getById', () => {
        test('should return hospital when user is hospital', async () => {
            const mockHospital = {
                id: 'hospital-1',
                full_name: 'Hospital A',
                role: 'hospital'
            };

            (userService.getById as jest.Mock).mockResolvedValue(mockHospital);

            const result = await hospitalService.getById('hospital-1');

            expect(userService.getById).toHaveBeenCalledWith('hospital-1');
            expect(result).toEqual(mockHospital);
        });

        test('should return null when user is not hospital', async () => {
            const mockDonor = {
                id: 'donor-1',
                full_name: 'Donor A',
                role: 'donor'
            };

            (userService.getById as jest.Mock).mockResolvedValue(mockDonor);

            const result = await hospitalService.getById('donor-1');

            expect(result).toBeNull();
        });

        test('should return null when user not found', async () => {
            (userService.getById as jest.Mock).mockResolvedValue(null);

            const result = await hospitalService.getById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create hospital with correct data', async () => {
            const hospitalData = {
                hospital_name: 'New Hospital',
                hospital_address: '123 Street',
                license_number: 'LIC123',
                is_verified: true,
            };

            const createdUser = {
                id: 'new-id',
                full_name: 'New Hospital',
                role: 'hospital',
                ...hospitalData,
            };

            (userService.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await hospitalService.create(hospitalData);

            expect(userService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    full_name: 'New Hospital',
                    role: 'hospital',
                    hospital_name: 'New Hospital',
                    hospital_address: '123 Street',
                    license_number: 'LIC123',
                    is_verified: true,
                })
            );
            expect(result).toEqual(createdUser);
        });

        test('should use default values when not provided', async () => {
            const hospitalData = {
                hospital_name: 'Hospital X',
            };

            const createdUser = {
                id: 'new-id',
                full_name: 'Hospital X',
                role: 'hospital',
            };

            (userService.create as jest.Mock).mockResolvedValue(createdUser);

            await hospitalService.create(hospitalData);

            const createCall = (userService.create as jest.Mock).mock.calls[0][0];
            expect(createCall.full_name).toBe('Hospital X');
            expect(createCall.role).toBe('hospital');
            expect(createCall.is_verified).toBe(false);
        });

        test('should generate placeholder email', async () => {
            const hospitalData = {
                hospital_name: 'Test Hospital',
            };

            (userService.create as jest.Mock).mockResolvedValue({ id: 'new-id' });

            await hospitalService.create(hospitalData);

            const createCall = (userService.create as jest.Mock).mock.calls[0][0];
            expect(createCall.email).toContain('hospital_');
            expect(createCall.email).toContain('@redhope.vn');
        });

        test('should use "Hospital" as default full_name', async () => {
            const hospitalData = {};

            (userService.create as jest.Mock).mockResolvedValue({ id: 'new-id' });

            await hospitalService.create(hospitalData);

            const createCall = (userService.create as jest.Mock).mock.calls[0][0];
            expect(createCall.full_name).toBe('Hospital');
        });
    });

    describe('update', () => {
        test('should update hospital data', async () => {
            const updates = {
                hospital_name: 'Updated Hospital',
                is_verified: true,
            };

            const updatedUser = {
                id: 'hospital-1',
                ...updates,
            };

            (userService.update as jest.Mock).mockResolvedValue(updatedUser);

            const result = await hospitalService.update('hospital-1', updates);

            expect(userService.update).toHaveBeenCalledWith('hospital-1', updates);
            expect(result).toEqual(updatedUser);
        });

        test('should pass through update errors', async () => {
            (userService.update as jest.Mock).mockRejectedValue(
                new Error('Update failed')
            );

            await expect(
                hospitalService.update('hospital-1', {})
            ).rejects.toThrow('Update failed');
        });
    });

    describe('delete', () => {
        test('should delete hospital', async () => {
            (userService.delete as jest.Mock).mockResolvedValue(undefined);

            await hospitalService.delete('hospital-1');

            expect(userService.delete).toHaveBeenCalledWith('hospital-1');
        });

        test('should pass through delete errors', async () => {
            (userService.delete as jest.Mock).mockRejectedValue(
                new Error('Delete failed')
            );

            await expect(
                hospitalService.delete('hospital-1')
            ).rejects.toThrow('Delete failed');
        });
    });
});
