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
    Loader2: () => React.createElement('div', { 'data-testid': 'loader' }),
    Mail: () => React.createElement('div', { 'data-testid': 'mail' }),
    Lock: () => React.createElement('div', { 'data-testid': 'lock' }),
    Eye: () => React.createElement('div', { 'data-testid': 'eye' }),
    EyeOff: () => React.createElement('div', { 'data-testid': 'eye-off' }),
    User: () => React.createElement('div', { 'data-testid': 'user' }),
    CheckCircle2: () => React.createElement('div', { 'data-testid': 'check-circle' }),
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
        fireEvent.click(screen.getByRole('checkbox'));

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

        fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), {
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

        fireEvent.click(screen.getByRole('checkbox'));

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

        fireEvent.click(screen.getByRole('checkbox'));

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
        fireEvent.click(screen.getByRole('checkbox'));

        fireEvent.click(screen.getByRole('button', { name: /Đăng ký ngay/i }));

        await waitFor(() => {
            expect(screen.getByText(/Email này đã được đăng ký/i)).toBeInTheDocument();
        });
    });
});
