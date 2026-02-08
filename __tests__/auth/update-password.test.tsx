import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import UpdatePasswordPage from '@/app/(auth)/update-password/page';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

// Mock dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@/services/auth.service', () => ({
    authService: {
        updatePassword: jest.fn(),
    },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    Lock: () => <div data-testid="lock" />,
    ShieldCheck: () => <div data-testid="shield-check" />,
}));

describe('UpdatePasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('nên render trang cập nhật mật khẩu thành công', () => {
        render(<UpdatePasswordPage />);
        expect(screen.getByRole('heading', { name: /Mật khẩu mới/i })).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
    });

    it('nên cập nhật mật khẩu thành công và điều hướng về trang login', async () => {
        (authService.updatePassword as jest.Mock).mockResolvedValue(undefined);

        render(<UpdatePasswordPage />);

        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInputs[0], { target: { value: 'newpassword123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'newpassword123' } });

        fireEvent.click(screen.getByRole('button', { name: /Cập nhật mật khẩu/i }));

        await waitFor(() => {
            expect(authService.updatePassword).toHaveBeenCalledWith('newpassword123');
            expect(screen.getByText(/Thành công!/i)).toBeInTheDocument();
        });

        // Test auto-redirect
        jest.advanceTimersByTime(3000);
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('nên hiển thị lỗi khi mật khẩu xác nhận không khớp', async () => {
        render(<UpdatePasswordPage />);

        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'wrongconfirm' } });

        fireEvent.click(screen.getByRole('button', { name: /Cập nhật mật khẩu/i }));

        expect(screen.getByText(/Mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
        expect(authService.updatePassword).not.toHaveBeenCalled();
    });

    it('nên hiển thị lỗi khi mật khẩu quá ngắn', async () => {
        render(<UpdatePasswordPage />);

        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInputs[0], { target: { value: '123' } });
        fireEvent.change(passwordInputs[1], { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: /Cập nhật mật khẩu/i }));

        expect(screen.getByText(/Mật khẩu phải có ít nhất 6 ký tự/i)).toBeInTheDocument();
        expect(authService.updatePassword).not.toHaveBeenCalled();
    });

    it('nên hiển thị lỗi từ service khi cập nhật thất bại', async () => {
        (authService.updatePassword as jest.Mock).mockRejectedValue(new Error('Update failed'));

        render(<UpdatePasswordPage />);

        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        fireEvent.change(passwordInputs[0], { target: { value: 'newpassword123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'newpassword123' } });

        fireEvent.click(screen.getByRole('button', { name: /Cập nhật mật khẩu/i }));

        await waitFor(() => {
            expect(screen.getByText(/Không thể cập nhật mật khẩu/i)).toBeInTheDocument();
        });
    });
});
