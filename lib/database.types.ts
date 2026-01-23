// Database Types for Supabase
// Auto-generated based on database schema (Unified Tables)

export type UserRole = 'donor' | 'hospital' | 'admin';

export interface User {
    id: string;                    // uuid - Primary Key
    full_name: string;             // varchar - NOT NULL
    email: string;                 // varchar - NOT NULL
    password_hash: string | null;  // varchar
    role: UserRole;                // role indicator

    // Donor specific fields
    blood_group: string | null;    // varchar (A+, A-, B+, B-, O+, O-, AB+, AB-)
    city: string | null;           // varchar
    district: string | null;       // varchar
    current_points: number | null; // int

    // Hospital specific fields
    hospital_name: string | null;
    license_number: string | null;
    hospital_address: string | null;
    is_verified: boolean | null;

    created_at: string;            // timestamp
}

// Type for inserting new user
export interface InsertUser {
    id?: string;                   // Explicitly allow providing ID (matching Auth UI)
    full_name: string;
    email: string;
    password_hash?: string;
    role?: UserRole;

    blood_group?: string;
    city?: string;
    district?: string;
    current_points?: number;

    hospital_name?: string;
    license_number?: string;
    hospital_address?: string;
    is_verified?: boolean;
}

// Type for updating user
export interface UpdateUser {
    full_name?: string;
    email?: string;
    password_hash?: string;
    role?: UserRole;

    blood_group?: string;
    city?: string;
    district?: string;
    current_points?: number;

    hospital_name?: string;
    license_number?: string;
    hospital_address?: string;
    is_verified?: boolean;
}

// Blood group options
export const BLOOD_GROUPS = [
    'A+', 'A-',
    'B+', 'B-',
    'O+', 'O-',
    'AB+', 'AB-'
] as const;

export type BloodGroup = typeof BLOOD_GROUPS[number];

export interface Voucher {
    id: string;
    code: string | null;
    partner_name: string | null;
    point_cost: number | null;
    imported_by: string | null;
    status: string | null;
    created_at?: string;
}

export interface InsertVoucher {
    code?: string;
    partner_name?: string;
    point_cost?: number;
    imported_by?: string;
    status?: string;
}

export interface UpdateVoucher {
    code?: string;
    partner_name?: string;
    point_cost?: number;
    imported_by?: string;
    status?: string;
}
