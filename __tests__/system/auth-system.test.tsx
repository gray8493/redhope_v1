import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            resetPasswordForEmail: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn(),
        })),
    },
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: null,
        loading: false,
        refreshUser: jest.fn().mockResolvedValue(undefined),
    })),
    AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, id, onCheckedChange, ...props }: any) => (
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} {...props} role="checkbox" />
    ),
}));

jest.mock('@/components/ui/alert', () => ({
    Alert: ({ children }: any) => <div role="alert">{children}</div>,
    AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <header>{children}</header>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <section>{children}</section>,
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    Mail: () => <div data-testid="mail" />,
    Lock: () => <div data-testid="lock" />,
    User: () => <div data-testid="user-icon" />,
    Eye: () => <div data-testid="eye" />,
    EyeOff: () => <div data-testid="eye-off" />,
    CheckCircle2: () => <div data-testid="check-circle" />,
    ChevronLeft: () => <div data-testid="chevron-left" />,
    AlertCircle: () => <div data-testid="alert-circle" />,
    ArrowLeft: () => <div data-testid="arrow-left" />,
}));

describe('Hệ thống Xác thực (Authentication System)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Quy trình Đăng ký (Registration Flow)', () => {
        it('nên cho phép người dùng chọn vai trò và điền form đăng ký', async () => {
            render(<RegisterPage />);

            // Kiểm tra giao diện ban đầu
            expect(screen.getByText(/Tạo tài khoản/i)).toBeInTheDocument();

            // Giả lập chọn vai trò Bệnh viện
            const hospitalBtn = screen.getByRole('button', { name: /Bệnh viện/i });
            fireEvent.click(hospitalBtn);

            // Điền thông tin
            fireEvent.change(screen.getByPlaceholderText(/Tên bệnh viện của bạn/i), { target: { value: 'Test Hospital' } });
            fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), { target: { value: 'hospital@test.com' } });

            const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
            fireEvent.change(passwordInputs[0], { target: { value: 'Password123!' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'Password123!' } });

            // Chấp nhận điều khoản
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            // Mock API thành công
            (supabase.auth.signUp as jest.Mock).mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
                error: null,
            });

            // Mock Fetch API cho register-profile
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            } as Response);

            // Submit
            fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

            await waitFor(() => {
                expect(screen.getByText(/Đăng ký thành công/i)).toBeInTheDocument();
            });
        });
    });

    describe('Quy trình Đăng nhập (Login Flow)', () => {
        it('nên chuyển hướng đúng theo vai trò khi đăng nhập thành công', async () => {
            render(<LoginPage />);

            // Mock đăng nhập thành công cho Admin
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: {
                    user: { id: 'admin-id', user_metadata: { role: 'admin' } },
                    session: { access_token: 'valid-token' }
                },
                error: null,
            });

            // Mock check role in DB
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: { role: 'admin' },
                error: null,
            });
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: mockMaybeSingle,
            });

            fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), { target: { value: 'admin@test.com' } });
            fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'admin123' } });

            fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/admin-dashboard');
            });
        });
    });

    describe('Quy trình Quên mật khẩu (Forgot Password Flow)', () => {
        it('nên hiển thị thông báo thành công khi gửi email khôi phục', async () => {
            (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
                data: {},
                error: null,
            });

            render(<ForgotPasswordPage />);

            fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: 'user@test.com' } });

            // Giả lập gửi link khôi phục
            fireEvent.click(screen.getByRole('button', { name: /Gửi link khôi phục/i }));

            await waitFor(() => {
                expect(screen.getByText(/Kiểm tra email của bạn/i)).toBeInTheDocument();
            });
        });
    });
});
