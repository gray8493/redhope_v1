// Database Types for Supabase
// Auto-generated based on database schema (Unified Tables - Comprehensive)

export type UserRole = 'donor' | 'hospital' | 'admin';

export interface User {
    id: string;                    // uuid - Primary Key
    full_name: string;             // varchar - NOT NULL
    email: string;                 // varchar - NOT NULL
    role: UserRole;                // role indicator
    phone: string | null;

    // Common profile fields
    city: string | null;
    district: string | null;
    address: string | null;

    // Donor specific fields
    blood_group: string | null;    // varchar (A+, A-, B+, B-, O+, O-, AB+, AB-)
    citizen_id: string | null;     // varchar - CCCD
    dob: string | null;            // date
    gender: string | null;         // varchar
    current_points: number | null; // int

    // Hospital specific fields
    hospital_name: string | null;
    license_number: string | null;
    hospital_address: string | null;
    is_verified: boolean | null;

    // Health & Verification (Step 2)
    weight?: number | null;
    last_donation_date?: string | null;
    health_history?: string | null;

    created_at: string;            // timestamp
}

// Type for inserting new user
export interface InsertUser {
    id?: string;
    full_name: string;
    email: string;
    role?: UserRole;
    phone?: string | null;

    city?: string | null;
    district?: string | null;
    address?: string | null;

    blood_group?: string | null;
    citizen_id?: string | null;
    dob?: string | null;
    gender?: string | null;
    current_points?: number | null;

    hospital_name?: string | null;
    license_number?: string | null;
    hospital_address?: string | null;
    is_verified?: boolean | null;

    weight?: number | null;
    last_donation_date?: string | null;
    health_history?: string | null;
}

// Type for updating user
export interface UpdateUser {
    full_name?: string;
    email?: string;
    role?: UserRole;
    phone?: string | null;

    city?: string | null;
    district?: string | null;
    address?: string | null;

    blood_group?: string | null;
    citizen_id?: string | null;
    dob?: string | null;
    gender?: string | null;
    current_points?: number | null;

    hospital_name?: string | null;
    license_number?: string | null;
    hospital_address?: string | null;
    is_verified?: boolean | null;

    weight?: number | null;
    last_donation_date?: string | null;
    health_history?: string | null;
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
