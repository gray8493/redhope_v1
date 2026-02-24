import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import RegisterPage from '@/app/(auth)/register/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    Mail: () => <div data-testid="mail" />,
    Lock: () => <div data-testid="lock" />,
    Eye: () => <div data-testid="eye" />,
    EyeOff: () => <div data-testid="eye-off" />,
    User: () => <div data-testid="user" />,
    CheckCircle2: () => <div data-testid="check-circle" />,
    ChevronLeft: () => <div data-testid="chevron-left" />,
    AlertCircle: () => <div data-testid="alert-circle" />,
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
    Alert: ({ children, variant }: any) => <div role="alert" data-variant={variant}>{children}</div>,
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

// Mock supabase client is already handled in jest.setup.ts
let mockSignUp: jest.Mock;

// Mock fetch globally
global.fetch = jest.fn();

describe('RegisterPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        mockSignUp = supabase.auth.signUp as jest.Mock;
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    it('nên đăng ký thành công vai trò Donor', async () => {
        mockSignUp.mockResolvedValue({
            data: { user: { id: 'new-donor-id' } },
            error: null,
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), {
            target: { value: 'Test Donor' },
        });
        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'donor@test.com' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
            target: { value: 'password123' },
        });

        // Check the checkbox
        const checkbox = screen.getByLabelText(/Tôi đồng ý với Điều khoản & Chính sách/i);
        fireEvent.click(checkbox);

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
                email: 'donor@test.com',
                options: expect.objectContaining({
                    data: expect.objectContaining({
                        role: 'donor'
                    })
                })
            }));
            expect(global.fetch).toHaveBeenCalledWith('/api/auth/register-profile', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    userId: 'new-donor-id',
                    email: 'donor@test.com',
                    fullName: 'Test Donor',
                    role: 'donor',
                }),
            }));
            expect(screen.getByText(/Đăng ký thành công!/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('nên đăng ký thành công vai trò Hospital', async () => {
        mockSignUp.mockResolvedValue({
            data: { user: { id: 'new-hospital-id' } },
            error: null,
        });

        render(<RegisterPage />);

        // Select hospital role
        fireEvent.click(screen.getByText(/Bệnh viện/i));

        fireEvent.change(screen.getByPlaceholderText(/Tên bệnh viện của bạn/i), {
            target: { value: 'Test Hospital' },
        });
        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'hospital@test.com' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByLabelText(/Tôi đồng ý với Điều khoản & Chính sách/i));

        fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
                email: 'hospital@test.com',
                options: expect.objectContaining({
                    data: expect.objectContaining({
                        role: 'hospital'
                    })
                })
            }));
            expect(global.fetch).toHaveBeenCalledWith('/api/auth/register-profile', expect.objectContaining({
                body: expect.stringContaining('"role":"hospital"'),
            }));
            expect(screen.getByText(/Đăng ký thành công!/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('nên hiển thị lỗi khi mật khẩu không khớp', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), {
            target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
            target: { value: 'wrongpass' },
        });

        fireEvent.click(screen.getByLabelText(/Tôi đồng ý với Điều khoản & Chính sách/i));

        fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

        await waitFor(() => {
            expect(screen.getByText(/Mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
        });
        expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('nên hiển thị lỗi khi email đã tồn tại', async () => {
        mockSignUp.mockResolvedValue({
            data: { user: null },
            error: { message: 'User already registered' },
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), { target: { value: 'existing@test.com' } });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'password123' } });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'password123' } });
        fireEvent.click(screen.getByLabelText(/Tôi đồng ý với Điều khoản & Chính sách/i));

        fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

        await waitFor(() => {
            expect(screen.getByText(/Email này đã được đăng ký/i)).toBeInTheDocument();
        });
    });
});
