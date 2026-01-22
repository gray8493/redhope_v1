// Database Types for Supabase
// Auto-generated based on database schema

export interface User {
    id: string;                    // uuid - Primary Key
    full_name: string;             // varchar - NOT NULL
    email: string;                 // varchar - NOT NULL
    password_hash: string | null;  // varchar
    blood_group: string | null;    // varchar (A+, A-, B+, B-, O+, O-, AB+, AB-)
    city: string | null;           // varchar
    district: string | null;       // varchar
    current_points: number | null; // int
    created_at: string;            // timestamp
}

// Type for inserting new user (without id and created_at)
export interface InsertUser {
    full_name: string;
    email: string;
    password_hash?: string;
    blood_group?: string;
    city?: string;
    district?: string;
    current_points?: number;
}

// Type for updating user
export interface UpdateUser {
    full_name?: string;
    email?: string;
    password_hash?: string;
    blood_group?: string;
    city?: string;
    district?: string;
    current_points?: number;
}

// Blood group options
export const BLOOD_GROUPS = [
    'A+', 'A-',
    'B+', 'B-',
    'O+', 'O-',
    'AB+', 'AB-'
] as const;

export type BloodGroup = typeof BLOOD_GROUPS[number];

export interface Hospital {
    id: string;
    user_id: string | null;
    name: string | null;
    license_number: string | null;
    address: string | null;
    is_verified: boolean | null;
    created_at?: string;
}

export interface InsertHospital {
    user_id?: string;
    name?: string;
    license_number?: string;
    address?: string;
    is_verified?: boolean;
}

export interface UpdateHospital {
    user_id?: string;
    name?: string;
    license_number?: string;
    address?: string;
    is_verified?: boolean;
}

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
