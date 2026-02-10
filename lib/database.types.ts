// Database Types for Supabase
// Auto-generated based on database schema (Unified Tables - Comprehensive)

export type UserRole = 'donor' | 'hospital' | 'admin';

export interface Hospital {
    id: string;
    hospital_name: string | null;
    license_number: string | null;
    hospital_address: string | null;
    is_verified: boolean | null;
    role: 'hospital';
    created_at?: string;
    email?: string;
    phone?: string | null;
}

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
    weight: number | null;
    last_donation_date: string | null;
    health_history: string | null;
    avatar_url?: string | null;
    cover_image?: string | null;
    email_notifications?: boolean | null;
    emergency_notifications?: boolean | null;
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
    avatar_url?: string | null;
    cover_image?: string | null;
    email_notifications?: boolean | null;
    emergency_notifications?: boolean | null;
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
    avatar_url?: string | null;
    cover_image?: string | null;
    email_notifications?: boolean | null;
    emergency_notifications?: boolean | null;
}

// Blood group options
export const BLOOD_GROUPS = [
    'A+', 'A-',
    'B+', 'B-',
    'O+', 'O-',
    'AB+', 'AB-'
] as const;

export type BloodGroup = typeof BLOOD_GROUPS[number];

// Voucher status options (must match database constraint)
export const VOUCHER_STATUSES = ['Active', 'Inactive'] as const;
export type VoucherStatus = typeof VOUCHER_STATUSES[number];

export interface Voucher {
    id: string;
    title: string; // NOT NULL in database
    description?: string | null;
    code: string | null;
    partner_name: string | null;
    image_url?: string | null;
    point_cost: number | null;
    stock_quantity?: number | null;
    status: VoucherStatus | null;
    expires_at?: string | null;
    created_at?: string;
}

export interface InsertVoucher {
    title: string; // Required
    description?: string;
    code?: string;
    partner_name?: string;
    image_url?: string;
    point_cost?: number;
    stock_quantity?: number;
    status?: VoucherStatus;
    expires_at?: string;
}

export interface UpdateVoucher {
    title?: string;
    description?: string;
    code?: string;
    partner_name?: string;
    image_url?: string;
    point_cost?: number;
    stock_quantity?: number;
    status?: VoucherStatus;
    expires_at?: string;
}

// Notification types
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    action_type: string | null;
    action_url: string | null;
    is_read: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface InsertNotification {
    user_id: string;
    title: string;
    content: string;
    action_type?: string | null;
    action_url?: string | null;
    is_read?: boolean;
    metadata?: Record<string, any>;
}

export interface UpdateNotification {
    title?: string;
    content?: string;
    action_type?: string | null;
    action_url?: string | null;
    is_read?: boolean;
    metadata?: Record<string, any>;
}

export type NotificationActionType =
    | 'view_campaign'
    | 'view_appointment'
    | 'view_registrations'
    | null;
