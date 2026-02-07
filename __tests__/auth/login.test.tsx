import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/(auth)/login/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

// Global mock functions
const mockPush = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);
const mockSignInWithPassword = jest.fn();
const mockFrom = jest.fn();
const mockMaybeSingle = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
        },
        from: (table: string) => mockFrom(table),
    },
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        refreshUser: mockRefreshUser,
    })),
    AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('js-cookie', () => ({
    set: jest.fn(),
    get: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    Mail: () => <div data-testid="mail" />,
    Lock: () => <div data-testid="lock" />,
    Eye: () => <div data-testid="eye" />,
    EyeOff: () => <div data-testid="eye-off" />,
    AlertCircle: () => <div data-testid="alert-circle" />,
    ChevronLeft: () => <div data-testid="chevron-left" />,
    CheckCircle2: () => <div data-testid="check-circle" />,
}));

// Mock UI components simply
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, type, ...props }: any) => (
        <button type={type} disabled={disabled} {...props}>{children}</button>
    ),
}));
jest.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));
jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}));
jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, id, onCheckedChange, ...props }: any) => (
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} {...props} />
    ),
}));
jest.mock('@/components/ui/alert', () => ({
    Alert: ({ children }: any) => <div role="alert">{children}</div>,
    AlertTitle: ({ children }: any) => <strong>{children}</strong>,
    AlertDescription: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <header>{children}</header>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <section>{children}</section>,
    CardFooter: ({ children }: any) => <footer>{children}</footer>,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mocks
        mockFrom.mockReturnValue({
            select: mockSelect.mockReturnThis(),
            eq: mockEq.mockReturnThis(),
            maybeSingle: mockMaybeSingle.mockResolvedValue({ data: null, error: null }),
        });
    });

    it('nên render trang login thành công', () => {
        render(<LoginPage />);
        expect(screen.getByText(/Chào mừng trở lại/i)).toBeInTheDocument();
    });

    it('nên redirect khi đăng nhập thành công', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: { id: 'donor-id', user_metadata: { role: 'donor' } },
                session: { access_token: 'fake-token' }
            },
            error: null,
        });

        mockMaybeSingle.mockResolvedValue({
            data: { role: 'donor' },
            error: null,
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'donor@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/requests');
            expect(mockRefreshUser).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it.skip('nên hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
        });

        render(<LoginPage />);
        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        const alert = await screen.findByRole('alert');
        expect(alert).toBeInTheDocument();
    });
});
