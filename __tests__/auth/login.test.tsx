import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/(auth)/login/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Loader2: () => React.createElement('div', { 'data-testid': 'loader' }),
    Mail: () => React.createElement('div', { 'data-testid': 'mail' }),
    Lock: () => React.createElement('div', { 'data-testid': 'lock' }),
    Eye: () => React.createElement('div', { 'data-testid': 'eye' }),
    EyeOff: () => React.createElement('div', { 'data-testid': 'eye-off' }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock js-cookie
jest.mock('js-cookie', () => ({
    set: jest.fn(),
}));

// We will get mocks inside describe to ensure they are ready
let mockSignInWithPassword: jest.Mock;
let mockFrom: jest.Mock;
let mockMaybeSingle: jest.Mock;
let mockEq: jest.Mock;
let mockSelect: jest.Mock;

describe('LoginPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
        mockFrom = supabase.from as jest.Mock;
        mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
        mockEq = jest.fn().mockReturnThis();
        mockSelect = jest.fn().mockReturnThis();

        mockFrom.mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            maybeSingle: mockMaybeSingle,
        });
    });

    it('nên render mà không bị lỗi', () => {
        render(<LoginPage />);
        expect(screen.getByText(/Chào mừng trở lại/i)).toBeInTheDocument();
    });

    it('nên chuyển hướng tới /admin-dashboard khi admin đăng nhập thành công', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: { id: 'admin-id', user_metadata: { role: 'admin' } },
                session: { access_token: 'fake-token' }
            },
            error: null,
        });

        mockMaybeSingle.mockResolvedValue({
            data: { role: 'admin' },
            error: null,
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'admin@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/admin-dashboard');
            expect(Cookies.set).toHaveBeenCalledWith('user-role', 'admin', expect.any(Object));
        });
    });

    it('nên chuyển hướng tới /hospital-dashboard khi hospital đăng nhập thành công', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: { id: 'hospital-id', user_metadata: { role: 'hospital' } },
                session: { access_token: 'fake-token' }
            },
            error: null,
        });

        mockMaybeSingle.mockResolvedValue({
            data: { role: 'hospital' },
            error: null,
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'hospital@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/hospital-dashboard');
            expect(Cookies.set).toHaveBeenCalledWith('user-role', 'hospital', expect.any(Object));
        });
    });

    it('nên chuyển hướng tới /requests khi donor đăng nhập thành công', async () => {
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
            expect(Cookies.set).toHaveBeenCalledWith('user-role', 'donor', expect.any(Object));
        });
    });

    it('nên hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), {
            target: { value: 'wrong@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'wrongpass' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        await waitFor(() => {
            expect(screen.getByText(/Email hoặc mật khẩu không đúng/i)).toBeInTheDocument();
        });
    });
});
