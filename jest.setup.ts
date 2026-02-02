import '@testing-library/jest-dom';
import React from 'react';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn(),
            single: jest.fn(),
        })),
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
            getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
    },
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    })),
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => React.createElement('img', props),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
    Loader2: () => null,
    Mail: () => null,
    Lock: () => null,
    Eye: () => null,
    EyeOff: () => null,
    User: () => null,
    CheckCircle2: () => null,
}));
